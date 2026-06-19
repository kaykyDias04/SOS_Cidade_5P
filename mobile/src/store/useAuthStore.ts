import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '@/lib/api';

export interface AuthUser {
  name: string;
  role: 'DENUNCIANTE' | 'GESTOR';
  email?: string;
  id?: number;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login(email, password);

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


            await SecureStore.setItemAsync('authToken', response.data.token);
            await SecureStore.setItemAsync('userRole', mappedRole);

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
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userRole');
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
