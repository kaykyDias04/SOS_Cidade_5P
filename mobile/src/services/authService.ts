import { apiRequest } from './http';
import type { AuthLoginResponse, AuthLogoutResponse } from '@/types';

export const authAPI = {
  login: async (email: string, password: string, acceptedLegal: boolean) => apiRequest<AuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      acceptedTerms: acceptedLegal,
      acceptedPrivacy: acceptedLegal,
    }),
  }),

  logout: async () => apiRequest<AuthLogoutResponse>('/auth/logout', {
    method: 'POST',
  }),
};
