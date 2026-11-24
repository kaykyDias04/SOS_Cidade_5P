import { create } from 'zustand';
import { denunciasAPI } from '@/services/denunciaService';
import { notificarMudancaStatus } from '@/services/notifications';
import { lerCache, salvarCache } from '@/services/cacheService';
import { useAuthStore } from '@/store/useAuthStore';
import type { ApiResponse, Denuncia, DenunciaFiltros, PaginatedResponse } from '@/types';

type ListaEmCache = { items: Denuncia[]; total?: number };

interface DenunciasState {
  denuncias: Denuncia[];
  loading: boolean;
  error: string | null;
  /** true quando a lista exibida veio do cache local porque a API não respondeu. */
  offline: boolean;
  /** Quando o cache exibido foi salvo (milissegundos). */
  cachedAt: number | null;
  page: number;
  limit: number;
  total?: number;
  filtros: DenunciaFiltros;
  opcoes: { tipos: string[]; bairros: string[] };

  setFiltros: (filtros: DenunciaFiltros) => void;
  limparFiltros: () => void;
  setPage: (page: number) => void;
  fetchDenuncias: () => Promise<void>;
  createDenuncia: (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Denuncia | null>;
  updateDenuncia: (id: number, data: Partial<Denuncia>) => Promise<ApiResponse<Denuncia>>;
  updateDenunciaLocalmente: (protocolo: string, novaSituacao: string) => void;
  deleteDenuncia: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useDenunciasStore = create<DenunciasState>((set, get) => ({
  denuncias: [],
  loading: false,
  error: null,
  offline: false,
  cachedAt: null,
  page: 1,
  limit: 50,
  total: undefined,
  filtros: {},
  opcoes: { tipos: [], bairros: [] },

  setFiltros: (novos) => {
    set((state) => ({ filtros: { ...state.filtros, ...novos }, page: 1 }));
    get().fetchDenuncias();
  },

  limparFiltros: () => {
    set({ filtros: {}, page: 1 });
    get().fetchDenuncias();
  },

  setPage: (page) => {
    set({ page });
    get().fetchDenuncias();
  },

  clearError: () => set({ error: null }),

  fetchDenuncias: async () => {
    const { page, limit, filtros } = get();
    set({ loading: true, error: null });
    try {
      const currentUser = useAuthStore.getState().user;
      const ehDenunciante = currentUser?.role === 'DENUNCIANTE';
      const chaveCache = `denuncias:${currentUser?.role ?? 'anonimo'}:${currentUser?.id ?? 0}:${page}:${limit}:${JSON.stringify(filtros)}`;

      const response = ehDenunciante
        ? await denunciasAPI.listarMinhas(page, limit)
        : await denunciasAPI.listarTodas(page, limit, filtros);

      // Junta as opções de filtro já vistas com as da lista atual.
      const unir = (a: string[], b: string[]) =>
        Array.from(new Set([...a, ...b.filter(Boolean)])).sort();
      const opcoesCom = (items: Denuncia[]) => ({
        tipos: unir(get().opcoes.tipos, items.map((d) => d.tipoDenuncia)),
        bairros: unir(get().opcoes.bairros, items.map((d) => d.bairroOcorrencia)),
      });

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<Denuncia>;
        const items = Array.isArray(paginatedData)
          ? paginatedData
          : (paginatedData.data || []);
        const total = !Array.isArray(paginatedData) && paginatedData.meta
          ? paginatedData.meta.total
          : undefined;

        // notifica o usuário quando a situação de uma denúncia dele mudou
        const anteriores = new Map(get().denuncias.map((d) => [d.id, d.situacao]));
        if (anteriores.size > 0 && ehDenunciante) {
          items.forEach((d) => {
            const antes = anteriores.get(d.id);
            if (antes && antes !== d.situacao) {
              notificarMudancaStatus(d.protocolo, d.tipoDenuncia, d.situacao);
            }
          });
        }

        set({ denuncias: items, opcoes: opcoesCom(items), loading: false, offline: false, cachedAt: null, total });
        void salvarCache<ListaEmCache>(chaveCache, { items, total });
        return;
      }

      // Sem conexão: mostra a última lista salva em vez de uma tela vazia.
      if (response.offline) {
        const cache = await lerCache<ListaEmCache>(chaveCache);
        if (cache) {
          set({
            denuncias: cache.dados.items,
            opcoes: opcoesCom(cache.dados.items),
            total: cache.dados.total,
            loading: false,
            offline: true,
            cachedAt: cache.salvoEm,
            error: null,
          });
          return;
        }
      }

      set({
        error: response.error || 'Falha ao buscar denúncias',
        denuncias: [],
        loading: false,
        offline: !!response.offline,
        cachedAt: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      set({ error: message, denuncias: [], loading: false });
    }
  },

  createDenuncia: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await denunciasAPI.create(data);
      if (response.success && response.data) {
        const newData = response.data as Denuncia;
        set((state) => ({ denuncias: [newData, ...state.denuncias], loading: false }));
        return newData;
      } else {
        set({ error: response.error || 'Falha ao criar denúncia', loading: false });
        return null;
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erro desconhecido', loading: false });
      return null;
    }
  },

  updateDenuncia: async (id, data) => {
    try {
      const response = await denunciasAPI.update(id, data);
      if (response.success && response.data) {
        const anterior = get().denuncias.find((denuncia) => denuncia.id === id);
        set((state) => ({
          denuncias: state.denuncias.map((d) => d.id === id ? { ...d, ...data } : d),
        }));
        if (data.situacao && anterior && data.situacao !== anterior.situacao) {
          notificarMudancaStatus(anterior.protocolo, anterior.tipoDenuncia, data.situacao);
        }
      }
      return response;
    } catch (err) {
      console.error('Erro ao atualizar denúncia:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      };
    }
  },

  updateDenunciaLocalmente: (protocolo, novaSituacao) => {
    set((state) => ({
      denuncias: state.denuncias.map((d) =>
        d.protocolo === protocolo ? { ...d, situacao: novaSituacao } : d
      ),
    }));
  },

  deleteDenuncia: async (id) => {
    try {
      await denunciasAPI.delete(id);
      set((state) => ({
        denuncias: state.denuncias.filter((d) => d.id !== id),
      }));
    } catch (err) {
      console.error('Erro ao deletar denúncia:', err);
    }
  },
}));

// Ao sair da conta (logout ou sessão expirada), a lista em memória não pode ficar para o próximo usuário.
useAuthStore.subscribe((state, anterior) => {
  if (anterior.user && !state.user) {
    useDenunciasStore.setState({
      denuncias: [],
      error: null,
      offline: false,
      cachedAt: null,
      total: undefined,
      filtros: {},
      opcoes: { tipos: [], bairros: [] },
      page: 1,
    });
  }
});
