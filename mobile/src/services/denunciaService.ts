import { apiRequest } from './api';
import { apiCall } from '@/services/http';
import type { Denuncia, DenunciaFiltros, NovaDenunciaInput, PaginatedResponse } from '@/types';

/**
 * Service: só conhece o endpoint /denuncias.
 */
export const DenunciaService = {
  async criar(dados: NovaDenunciaInput): Promise<Denuncia> {
    return apiRequest<Denuncia>('/denuncias', {
      method: 'POST',
      body: dados,
    });
  },

  async listarMinhas(): Promise<Denuncia[]> {
    return apiRequest<Denuncia[]>('/denuncias');
  },
};

export const denunciasAPI = {
  list: async (page = 1, limit = 50, filtros: DenunciaFiltros = {}) => {
    const params = new URLSearchParams({ _page: String(page), _limit: String(limit), _meta: '1' });
    (Object.keys(filtros) as (keyof DenunciaFiltros)[]).forEach((key) => {
      const value = filtros[key];
      if (value) params.append(key, value);
    });
    return apiCall<PaginatedResponse<Denuncia>>(`/denuncias?${params.toString()}`);
  },

  getById: async (id: number) => apiCall<Denuncia>(`/denuncias/${id}`),

  create: async (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiCall<Denuncia>('/denuncias', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),

  update: async (id: number, data: Partial<Denuncia>) =>
    apiCall<Denuncia>(`/denuncias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: async (id: number) => apiCall<void>(`/denuncias/${id}`, {
    method: 'DELETE',
  }),
};
