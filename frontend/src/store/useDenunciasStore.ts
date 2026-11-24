import { create } from 'zustand';
import { denunciasAPI, Denuncia, PaginatedResponse } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';

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
  updateDenunciaLocalmente: (protocolo: string, novaSituacao: string) => void;
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

  fetchDenuncias: async () => {
    const { page, limit } = get();
    set({ loading: true, error: null });
    try {
      const currentUser = useAuthStore.getState().user;
      const response = currentUser?.role === 'DENUNCIANTE'
        ? await denunciasAPI.listMinhas(page, limit)
        : await denunciasAPI.list(page, limit);

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
          loading: false
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

  updateDenunciaLocalmente: (protocolo, novaSituacao) => {
    set((state) => ({
      denuncias: state.denuncias.map((d) => 
        d.protocolo === protocolo ? { ...d, situacao: novaSituacao } : d
      )
    }));
  }
}));
