import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/constants/config';
import * as secureStorage from '@/services/secureStorage';
import type { ApiResponse } from '@/types';
import {
  MSG_OFFLINE,
  MSG_RESPOSTA_INVALIDA,
  MSG_SESSAO_EXPIRADA,
  MSG_TIMEOUT,
  tokenExpirado,
  traduzirErro,
} from '@/utils/apiErrors';

const TIMEOUT_MS = 15000;

type ApiRequestOptions = RequestInit & { authenticated?: boolean };

// A store de autenticação registra aqui o que fazer quando a sessão deixa de valer.
// Assim o cliente HTTP não importa a store (evita dependência circular).
let aoExpirarSessao: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  aoExpirarSessao = handler;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  const { authenticated = true, ...requestOptions } = options ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const token = authenticated ? await secureStorage.getItemAsync(AUTH_TOKEN_KEY) : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestOptions.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const bruto: string | undefined = errorData.error || errorData.message;

      // 401 = sem token ou token inválido. O backend também devolve 403 para token vencido,
      // então 403 só derruba a sessão quando o token realmente já venceu.
      const sessaoInvalida =
        authenticated &&
        (response.status === 401 ||
          (response.status === 403 && token !== null && tokenExpirado(token)));

      if (sessaoInvalida) {
        aoExpirarSessao?.();
        return { success: false, status: response.status, error: MSG_SESSAO_EXPIRADA };
      }

      return { success: false, status: response.status, error: traduzirErro(response.status, bruto) };
    }

    return {
      success: true,
      status: response.status,
      data: (await response.json()) as T,
    };
  } catch (error) {
    // Sem rede, servidor fora do ar ou tempo esgotado: o app pode cair para o cache local.
    if (
      controller.signal.aborted ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      return { success: false, offline: true, error: MSG_TIMEOUT };
    }

    console.error('API Error:', error);

    if (error instanceof TypeError) {
      return { success: false, offline: true, error: MSG_OFFLINE };
    }
    if (error instanceof SyntaxError) {
      return { success: false, error: MSG_RESPOSTA_INVALIDA };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado.',
    };
  } finally {
    clearTimeout(timer);
  }
}
