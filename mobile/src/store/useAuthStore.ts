import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { authAPI } from '@/services/authService';
import { setSessionExpiredHandler } from '@/services/http';
import { limparCache } from '@/services/cacheService';
import * as secureStorage from '@/services/secureStorage';
import { AUTH_TOKEN_KEY, USER_ROLE_KEY } from '@/constants/config';
import { MSG_SESSAO_EXPIRADA, tokenExpirado } from '@/utils/apiErrors';
import type { AuthUser } from '@/types';

export type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    acceptedLegal: boolean,
  ) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => Promise<void>;
  /** Encerra a sessão localmente (token vencido ou recusado pela API) e avisa o usuário. */
  expireSession: () => Promise<void>;
  /** Confere se a sessão restaurada do AsyncStorage ainda tem um token válido. */
  checkSession: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

async function limparDadosLocais() {
  await secureStorage.deleteItemAsync(AUTH_TOKEN_KEY);
  await secureStorage.deleteItemAsync(USER_ROLE_KEY);
  // O cache guarda denúncias (dados pessoais) e não pode sobreviver ao logout.
  await limparCache();
}

let encerrandoSessao = false;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password, acceptedLegal) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password, acceptedLegal);

          if (response.success && response.data) {
            const rawRole = response.data.user.role;
            const mappedRole: 'DENUNCIANTE' | 'GESTOR' =
              rawRole === 'GESTOR' ? 'GESTOR' : 'DENUNCIANTE';

            const userData: AuthUser = {
              name: response.data.user.name,
              role: mappedRole,
              email: response.data.user.email,
              id: Number(response.data.user.id),
            };

            await secureStorage.setItemAsync(AUTH_TOKEN_KEY, response.data.token);
            await secureStorage.setItemAsync(USER_ROLE_KEY, mappedRole);

            set({ user: userData, isAuthenticated: true, isLoading: false });
            return { success: true, role: mappedRole };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error || 'Login falhou' };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Erro de login';
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout API error:', error);
        }
        await limparDadosLocais();
        set({ user: null, isAuthenticated: false });
      },

      expireSession: async () => {
        if (!get().isAuthenticated || encerrandoSessao) return;
        encerrandoSessao = true;
        try {
          await limparDadosLocais();
          set({ user: null, isAuthenticated: false });
          Toast.show({ type: 'info', text1: 'Sessão expirada', text2: MSG_SESSAO_EXPIRADA });
        } finally {
          encerrandoSessao = false;
        }
      },

      checkSession: async () => {
        if (!get().isAuthenticated) return;
        const token = await secureStorage.getItemAsync(AUTH_TOKEN_KEY);
        if (!token || tokenExpirado(token)) {
          await get().expireSession();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Quando qualquer chamada à API descobre que a sessão não vale mais, volta para o login.
setSessionExpiredHandler(() => {
  void useAuthStore.getState().expireSession();
});
