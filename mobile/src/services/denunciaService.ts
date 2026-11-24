import { apiRequest } from './http';
import type { Denuncia, DenunciaFiltros, PaginatedResponse } from '@/types';

function paginationQuery(page: number, limit: number, includeMeta = false): string {
  const params = new URLSearchParams({
    _page: String(page),
    _limit: String(limit),
  });
  if (includeMeta) params.set('_meta', '1');
  return params.toString();
}

export const denunciasAPI = {
  listarMinhas: async (page = 1, limit = 50) =>
    apiRequest<PaginatedResponse<Denuncia>>(
      `/denuncias/minhas?${paginationQuery(page, limit)}`
    ),

  listarTodas: async (page = 1, limit = 50, filtros: DenunciaFiltros = {}) => {
    const params = new URLSearchParams(paginationQuery(page, limit, true));
    (Object.keys(filtros) as (keyof DenunciaFiltros)[]).forEach((key) => {
      const value = filtros[key];
      if (value) params.append(key, value);
    });
    return apiRequest<PaginatedResponse<Denuncia>>(`/denuncias?${params.toString()}`);
  },

  getById: async (id: number) => apiRequest<Denuncia>(`/denuncias/${id}`),

  create: async (data: Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<Denuncia>('/denuncias', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),

  update: async (id: number, data: Partial<Denuncia>) =>
    apiRequest<Denuncia>(`/denuncias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: async (id: number) => apiRequest<void>(`/denuncias/${id}`, {
    method: 'DELETE',
  }),
};
