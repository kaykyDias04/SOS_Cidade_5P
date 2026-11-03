import { create } from 'zustand';
import { denunciasAPI, Denuncia, PaginatedResponse } from '@/lib/api';

interface DenunciasState {
  denuncias: Denuncia[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total?: number;

  setPage: (page: number) => void;
  fetchDenuncias: () => Promise<void>;
  createDenuncia: (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Denuncia | null>;
  updateDenuncia: (id: number, data: Partial<Denuncia>) => Promise<void>;
  updateDenunciaLocalmente: (protocolo: string, novaSituacao: string) => void;
  deleteDenuncia: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useDenunciasStore = create<DenunciasState>((set, get) => ({
  denuncias: [],
  loading: false,
  error: null,
  page: 1,
  limit: 50,
  total: undefined,

  setPage: (page) => {
    set({ page });
    get().fetchDenuncias();
  },

  clearError: () => set({ error: null }),

  fetchDenuncias: async () => {
    const { page, limit } = get();
    set({ loading: true, error: null });
    try {
      const response = await denunciasAPI.list(page, limit);

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<Denuncia>;
        const items = Array.isArray(paginatedData)
          ? paginatedData
          : (paginatedData.data || []);

        set({
          denuncias: items,
          loading: false,
          total: !Array.isArray(paginatedData) && paginatedData.meta ? paginatedData.meta.total : undefined,
        });
      } else {
        set({
          error: response.error || 'Falha ao buscar denúncias',
          denuncias: [],
          loading: false,
        });
      }
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
        set((state) => ({
          denuncias: state.denuncias.map((d) => d.id === id ? { ...d, ...data } : d),
        }));
      }
    } catch (err) {
      console.error('Erro ao atualizar denúncia:', err);
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
