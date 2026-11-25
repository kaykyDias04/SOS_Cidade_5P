import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '@/constants/config';
import { authAPI } from '@/services/authService';
import { denunciasAPI } from '@/services/denunciaService';
import { usersAPI } from '@/services/userService';
import type { Denuncia, User } from '@/types';

const emailDenunciante = process.env.MOBILE_TEST_DENUNCIANTE_EMAIL;
const senhaDenunciante = process.env.MOBILE_TEST_DENUNCIANTE_PASSWORD;
const emailGestor = process.env.MOBILE_TEST_GESTOR_EMAIL;
const senhaGestor = process.env.MOBILE_TEST_GESTOR_PASSWORD;

let tokenArmazenado: string | null = null;
const usuariosCriados: number[] = [];
const denunciasCriadas: number[] = [];

function identificador(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function autenticar(email: string | undefined, senha: string | undefined): Promise<User> {
  if (!email || !senha) {
    throw new Error('Defina as credenciais de integração do Mobile no ambiente de teste.');
  }

  const response = await authAPI.login(email, senha, true);
  if (!response.success || !response.data?.token) {
    throw new Error(`Falha no login de integração: ${response.error ?? 'resposta sem token'}`);
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.data.token);
  return response.data.user;
}

function novaDenuncia(protocolo: string): Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    tipoDenuncia: 'Buraco na Via',
    identificacao: false,
    nomeDenunciante: 'Não deve ser exposto',
    bairroOcorrencia: 'Boa Viagem',
    descricaoOcorrencia: `MOBILE_INTEGRATION_${protocolo}`,
    dataOcorrencia: new Date().toISOString().slice(0, 10),
    protocolo,
    situacao: 'Em Andamento',
    imagens: [],
  };
}

beforeAll(() => {
  if (process.env.MOBILE_INTEGRATION_TESTS !== '1') {
    throw new Error('Defina MOBILE_INTEGRATION_TESTS=1 para habilitar testes que gravam na API.');
  }

  const apiUrl = new URL(API_BASE_URL);
  if (!['localhost', '127.0.0.1'].includes(apiUrl.hostname)) {
    throw new Error('Os testes Mobile + Backend aceitam somente uma API local descartável.');
  }
});

beforeEach(() => {
  tokenArmazenado = null;
  jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) =>
    key === AUTH_TOKEN_KEY ? tokenArmazenado : null
  );
  jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => {
    if (key === AUTH_TOKEN_KEY) tokenArmazenado = value;
  });
  jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => {
    if (key === AUTH_TOKEN_KEY) tokenArmazenado = null;
  });
});

afterAll(async () => {
  if (usuariosCriados.length === 0 && denunciasCriadas.length === 0) return;

  await autenticar(emailGestor, senhaGestor);
  for (const id of denunciasCriadas) {
    const response = await denunciasAPI.delete(id);
    if (!response.success) {
      throw new Error(`Não foi possível remover a denúncia de integração ${id}: ${response.error}`);
    }
  }
  for (const id of usuariosCriados) {
    const response = await usersAPI.delete(id);
    if (!response.success) {
      throw new Error(`Não foi possível remover o usuário de integração ${id}: ${response.error}`);
    }
  }
});

describe('Integração dos serviços Mobile com o Backend real', () => {
  it('autentica um denunciante usando o serviço de login do Mobile', async () => {
    const user = await autenticar(emailDenunciante, senhaDenunciante);

    expect(user.role).toBe('DENUNCIANTE');
    expect(tokenArmazenado).toBeTruthy();
  });

  it('cria denúncia anônima e recebe a resposta anonimizada do Backend', async () => {
    await autenticar(emailDenunciante, senhaDenunciante);
    const protocolo = `MOB-${identificador()}`;
    const response = await denunciasAPI.create(novaDenuncia(protocolo));

    expect(response.success).toBe(true);
    expect(response.data).toMatchObject({
      protocolo,
      identificacao: false,
      nomeDenunciante: 'Anônimo',
      descricaoOcorrencia: expect.stringContaining('MOBILE_INTEGRATION_'),
    });
    expect(response.data).not.toHaveProperty('userId');
    denunciasCriadas.push(response.data!.id);
  });

  it('lista as próprias denúncias usando filtros múltiplos de tipo e bairro', async () => {
    const user = await autenticar(emailDenunciante, senhaDenunciante);
    const protocolo = `MOB-${identificador()}`;
    const created = await denunciasAPI.create(novaDenuncia(protocolo));
    expect(created.success).toBe(true);
    denunciasCriadas.push(created.data!.id);

    const response = await denunciasAPI.listarMinhas(1, 50, {
      tipoDenuncia: ['Buraco na Via', 'Iluminação Pública'],
      bairroOcorrencia: ['Boa Viagem', 'Espinheiro'],
      situacao: 'Em Andamento',
    });

    expect(response.success).toBe(true);
    expect(response.data?.data.some((item) => item.protocolo === protocolo)).toBe(true);
    expect(response.data?.data.every((item) => item.userId === user.id || item.identificacao === false)).toBe(true);
  });

  it('lista denúncias de gestor com filtros múltiplos encaminhados pelo cliente Mobile', async () => {
    const user = await autenticar(emailGestor, senhaGestor);
    expect(user.role).toBe('GESTOR');

    const response = await denunciasAPI.listarTodas(1, 50, {
      tipoDenuncia: ['Buraco na Via', 'Iluminação Pública'],
      bairroOcorrencia: ['Boa Viagem', 'Espinheiro'],
    });

    expect(response.success).toBe(true);
    expect(response.data?.data.length).toBeGreaterThan(0);
    expect(response.data?.data.every((item) =>
      ['Buraco na Via', 'Iluminação Pública'].includes(item.tipoDenuncia) &&
      ['Boa Viagem', 'Espinheiro'].includes(item.bairroOcorrencia)
    )).toBe(true);
  });

  it('impede o denunciante de acessar a listagem administrativa', async () => {
    await autenticar(emailDenunciante, senhaDenunciante);

    await expect(denunciasAPI.listarTodas()).resolves.toMatchObject({
      success: false,
      status: 403,
    });
  });

  it('impede o gestor de criar denúncias pela API', async () => {
    await autenticar(emailGestor, senhaGestor);

    await expect(denunciasAPI.create(novaDenuncia(`MOB-${identificador()}`))).resolves.toMatchObject({
      success: false,
      status: 403,
    });
  });

  it('mantém o cadastro público como DENUNCIANTE mesmo se o cliente enviar GESTOR', async () => {
    await autenticar(emailGestor, senhaGestor);
    const suffix = identificador();
    const response = await usersAPI.create({
      name: 'Usuário de integração',
      email: `mobile-public-${suffix}@example.com`,
      password: 'Integration@123',
      role: 'GESTOR',
      acceptedTerms: true,
      acceptedPrivacy: true,
    });

    expect(response.success).toBe(true);
    expect(response.data?.role).toBe('DENUNCIANTE');
    usuariosCriados.push(response.data!.id);
  });

  it('cria gestor somente pelo endpoint administrativo autenticado', async () => {
    await autenticar(emailGestor, senhaGestor);
    const suffix = identificador();
    const response = await usersAPI.createGestor({
      name: 'Gestor de integração',
      email: `mobile-manager-${suffix}@example.com`,
      password: 'Integration@123',
    });

    expect(response.success).toBe(true);
    expect(response.data?.role).toBe('GESTOR');
    usuariosCriados.push(response.data!.id);
  });

  it('responde 403 para denunciante no endpoint administrativo de criação', async () => {
    await autenticar(emailDenunciante, senhaDenunciante);

    await expect(usersAPI.createGestor({
      name: 'Tentativa não autorizada',
      email: `mobile-denied-${identificador()}@example.com`,
      password: 'Integration@123',
    })).resolves.toMatchObject({
      success: false,
      status: 403,
    });
  });

  it('responde 401 sem token e para token inválido', async () => {
    await expect(denunciasAPI.listarMinhas()).resolves.toMatchObject({
      success: false,
      status: 401,
    });

    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, 'token-invalido');
    await expect(denunciasAPI.listarMinhas()).resolves.toMatchObject({
      success: false,
      status: 401,
    });
  });
});
