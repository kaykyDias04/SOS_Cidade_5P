import { apiRequest } from './api';
import { Denuncia, NovaDenunciaInput } from '../models/Denuncia';

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
