import { apiRequest, setToken, clearToken } from './api';
import { apiCall } from '@/services/http';
import type { AuthLoginResponse, AuthLogoutResponse } from '@/types';

/**
 * Service: só conhece o endpoint /auth. Não sabe nada sobre
 * tela, formulário ou estado — isso é trabalho do ViewModel.
 */
export const AuthService = {
  async login(email: string, password: string): Promise<AuthLoginResponse> {
    const session = await apiRequest<AuthLoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      authenticated: false, // ainda não tem token nessa etapa
    });
    await setToken(session.token);
    return session;
  },

  async logout(): Promise<void> {
    await clearToken();
  },
};

export const authAPI = {
  login: async (email: string, password: string) => apiCall<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  logout: async () => apiCall<AuthLogoutResponse>('/auth/logout', {
    method: 'POST',
  }),
};
