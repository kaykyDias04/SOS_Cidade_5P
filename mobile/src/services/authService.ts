import { apiRequest, setToken, clearToken } from './api';
import { AuthSession } from '../models/User';

/**
 * Service: só conhece o endpoint /auth. Não sabe nada sobre
 * tela, formulário ou estado — isso é trabalho do ViewModel.
 */
export const AuthService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const session = await apiRequest<AuthSession>('/auth/login', {
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
