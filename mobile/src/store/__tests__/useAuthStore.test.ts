import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { authAPI } from '@/services/authService';
import { salvarCache } from '@/services/cacheService';
import { AUTH_TOKEN_KEY, USER_ROLE_KEY } from '@/constants/config';
import { useAuthStore } from '../useAuthStore';

jest.mock('@/services/authService', () => ({
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

const usuario = { name: 'Ana Silva', role: 'GESTOR' as const, email: 'ana@example.com', id: 42 };

function tokenComExpiracao(exp: number): string {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await useAuthStore.persist.clearStorage();
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
  jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});

describe('useAuthStore', () => {
  it('guarda o token e o perfil no login bem-sucedido', async () => {
    jest.mocked(authAPI.login).mockResolvedValue({
      success: true,
      data: {
        token: 'token-login',
        user: { id: 42, name: 'Ana Silva', email: 'ana@example.com', role: 'GESTOR' },
      },
    });

    await expect(useAuthStore.getState().login('ana@example.com', 'senha-segura', true)).resolves.toEqual({
      success: true,
      role: 'GESTOR',
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'token-login');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(USER_ROLE_KEY, 'GESTOR');
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, user: usuario });
  });

  it('logout apaga token e cache local', async () => {
    jest.mocked(authAPI.logout).mockResolvedValue({ success: true, data: { success: true } });
    useAuthStore.setState({ user: usuario, isAuthenticated: true });
    await salvarCache('denuncias:GESTOR:42:1:50:{}', { items: [] });

    await useAuthStore.getState().logout();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(USER_ROLE_KEY);
    expect((await AsyncStorage.getAllKeys()).some((key) => key.startsWith('cache:'))).toBe(false);
    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false });
  });

  it('avisa apenas uma vez quando chamadas concorrentes expiram a sessão', async () => {
    useAuthStore.setState({ user: usuario, isAuthenticated: true });

    await Promise.all([
      useAuthStore.getState().expireSession(),
      useAuthStore.getState().expireSession(),
    ]);

    expect(Toast.show).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false });
  });

  it('checkSession expira sessão com token vencido', async () => {
    useAuthStore.setState({ user: usuario, isAuthenticated: true });
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(tokenComExpiracao(1));

    await useAuthStore.getState().checkSession();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false });
    expect(Toast.show).toHaveBeenCalledTimes(1);
  });
});
