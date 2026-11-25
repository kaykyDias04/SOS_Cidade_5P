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

function addFilters(params: URLSearchParams, filtros: DenunciaFiltros): void {
  (Object.keys(filtros) as (keyof DenunciaFiltros)[]).forEach((key) => {
    const values = filtros[key];
    if (Array.isArray(values)) {
      values.filter(Boolean).forEach((value) => params.append(key, value));
    } else if (values) {
      params.append(key, values);
    }
  });
}

export const denunciasAPI = {
  listarMinhas: async (page = 1, limit = 50, filtros: DenunciaFiltros = {}) => {
    const params = new URLSearchParams(paginationQuery(page, limit));
    addFilters(params, filtros);
    return apiRequest<PaginatedResponse<Denuncia>>(`/denuncias/minhas?${params.toString()}`);
  },

  listarTodas: async (page = 1, limit = 50, filtros: DenunciaFiltros = {}) => {
    const params = new URLSearchParams(paginationQuery(page, limit, true));
    addFilters(params, filtros);
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
