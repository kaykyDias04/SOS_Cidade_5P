import * as SecureStore from 'expo-secure-store';

/**
 * Cliente de API central. Toda chamada ao backend passa por aqui.
 *
 * Por que usar SecureStore em vez de guardar o token só em memória:
 * o app mobile não tem cookie do navegador — quem guarda a sessão
 * é o próprio app. SecureStore criptografa o dado no dispositivo,
 * então é o lugar certo pra guardar o token de autenticação
 * (não usar AsyncStorage puro para isso, ele não é criptografado).
 */

// Ajuste para o endereço do seu backend (IP da máquina rodando o
// docker compose, não "localhost" — no emulador/dispositivo físico
// "localhost" aponta pro próprio celular, não pro seu computador).
const API_BASE_URL = 'http://192.168.0.XX:8000';

const TOKEN_KEY = 'sos_cidade_auth_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, authenticated = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authenticated) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Erro na requisição');
  }

  return data as T;
}
