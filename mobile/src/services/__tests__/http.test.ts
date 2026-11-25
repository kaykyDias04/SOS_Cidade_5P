import * as SecureStore from 'expo-secure-store';
import { setSessionExpiredHandler, apiRequest } from '../http';
import {
  MSG_OFFLINE,
  MSG_SESSAO_EXPIRADA,
  MSG_SERVIDOR,
  MSG_TIMEOUT,
} from '../../utils/apiErrors';

const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
let fetchMock: jest.Mock;

function resposta(status: number, dados: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(dados),
  } as unknown as Response;
}

function tokenComExpiracao(exp: number): string {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  fetchMock = jest.fn();
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    writable: true,
    value: fetchMock,
  });
});

afterEach(() => {
  setSessionExpiredHandler(null);
  jest.useRealTimers();
  if (fetchDescriptor) Object.defineProperty(globalThis, 'fetch', fetchDescriptor);
  else delete (globalThis as { fetch?: typeof fetch }).fetch;
});

describe('apiRequest', () => {
  it('retorna dados em uma resposta bem-sucedida', async () => {
    fetchMock.mockResolvedValue(resposta(200, { id: 7 }));

    await expect(apiRequest<{ id: number }>('/denuncias')).resolves.toMatchObject({
      success: true,
      status: 200,
      data: { id: 7 },
    });
  });

  it('401 chama o handler de sessão expirada', async () => {
    const handler = jest.fn();
    setSessionExpiredHandler(handler);
    fetchMock.mockResolvedValue(resposta(401, { message: 'Invalid credentials' }));

    await expect(apiRequest('/auth/me')).resolves.toMatchObject({
      success: false,
      status: 401,
      error: MSG_SESSAO_EXPIRADA,
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('403 com token vencido encerra a sessão', async () => {
    const handler = jest.fn();
    setSessionExpiredHandler(handler);
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(tokenComExpiracao(1));
    fetchMock.mockResolvedValue(resposta(403, { message: 'Forbidden' }));

    await expect(apiRequest('/auth/me')).resolves.toMatchObject({
      success: false,
      error: MSG_SESSAO_EXPIRADA,
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('403 com token válido não encerra a sessão', async () => {
    const handler = jest.fn();
    setSessionExpiredHandler(handler);
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(
      tokenComExpiracao(Math.floor(Date.now() / 1000) + 3600),
    );
    fetchMock.mockResolvedValue(resposta(403, { message: 'Forbidden' }));

    await expect(apiRequest('/admin')).resolves.toMatchObject({
      success: false,
      error: 'Você não tem permissão para esta ação.',
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('marca timeout como offline', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation((_url: string, options?: RequestInit) =>
      new Promise((_resolve, reject) => {
        const abort = () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }));
        if (options?.signal?.aborted) abort();
        else options?.signal?.addEventListener('abort', abort, { once: true });
      }),
    );
    const request = apiRequest('/denuncias');

    await jest.advanceTimersByTimeAsync(15_000);
    await expect(request).resolves.toMatchObject({
      success: false,
      offline: true,
      error: MSG_TIMEOUT,
    });
  });

  it('marca TypeError de rede como offline', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(apiRequest('/denuncias')).resolves.toMatchObject({
      success: false,
      offline: true,
      error: MSG_OFFLINE,
    });
  });

  it('retorna mensagem amigável para erro 5xx', async () => {
    fetchMock.mockResolvedValue(resposta(503, { message: 'Internal server error' }));

    await expect(apiRequest('/denuncias')).resolves.toMatchObject({
      success: false,
      status: 503,
      error: MSG_SERVIDOR,
    });
  });
});
