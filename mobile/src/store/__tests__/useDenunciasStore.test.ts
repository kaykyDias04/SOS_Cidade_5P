import AsyncStorage from '@react-native-async-storage/async-storage';
import { denunciasAPI } from '@/services/denunciaService';
import { lerCache, salvarCache } from '@/services/cacheService';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '../useDenunciasStore';
import type { Denuncia } from '@/types';

jest.mock('@/services/denunciaService', () => ({
  denunciasAPI: {
    listarMinhas: jest.fn(),
    listarTodas: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/services/notifications', () => ({
  notificarMudancaStatus: jest.fn(),
}));

const usuario = { name: 'Ana', role: 'GESTOR' as const, email: 'ana@example.com', id: 42 };
const denuncia: Denuncia = {
  id: 1,
  tipoDenuncia: 'Buraco',
  identificacao: true,
  nomeDenunciante: 'Ana',
  userId: 42,
  bairroOcorrencia: 'Boa Vista',
  descricaoOcorrencia: 'Buraco grande na via.',
  dataOcorrencia: '2026-01-02T03:04:05.000Z',
  protocolo: 'REC-0001',
  situacao: 'PENDENTE',
  createdAt: '2026-01-02T03:04:05.000Z',
  updatedAt: '2026-01-02T03:04:05.000Z',
};
const chaveCache = 'denuncias:GESTOR:42:1:50:{}';

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  useAuthStore.setState({ user: usuario, isAuthenticated: true });
  useDenunciasStore.setState({
    denuncias: [],
    loading: false,
    error: null,
    offline: false,
    cachedAt: null,
    page: 1,
    limit: 50,
    total: undefined,
    filtros: {},
    opcoes: { tipos: [], bairros: [] },
  });
});

describe('useDenunciasStore', () => {
  it('grava em cache uma lista carregada online', async () => {
    jest.mocked(denunciasAPI.listarTodas).mockResolvedValue({
      success: true,
      data: { data: [denuncia], meta: { total: 1, page: 1, limit: 50 } },
    });

    await useDenunciasStore.getState().fetchDenuncias();

    expect(useDenunciasStore.getState().denuncias).toEqual([denuncia]);
    expect(await lerCache(chaveCache)).toMatchObject({
      dados: { items: [denuncia], total: 1 },
    });
  });

  it('mostra lista em cache offline com offline e cachedAt', async () => {
    await salvarCache(chaveCache, { items: [denuncia], total: 1 });
    jest.mocked(denunciasAPI.listarTodas).mockResolvedValue({
      success: false,
      offline: true,
      error: 'Sem conexão',
    });

    await useDenunciasStore.getState().fetchDenuncias();

    expect(useDenunciasStore.getState()).toMatchObject({
      denuncias: [denuncia],
      offline: true,
      cachedAt: expect.any(Number),
      error: null,
    });
  });

  it('mostra erro quando fica offline sem cache', async () => {
    jest.mocked(denunciasAPI.listarTodas).mockResolvedValue({
      success: false,
      offline: true,
      error: 'Sem conexão',
    });

    await useDenunciasStore.getState().fetchDenuncias();

    expect(useDenunciasStore.getState()).toMatchObject({
      denuncias: [],
      offline: true,
      cachedAt: null,
      error: 'Sem conexão',
    });
  });

  it('limpa a lista quando a sessão do usuário é encerrada', () => {
    useDenunciasStore.setState({ denuncias: [denuncia], offline: true, cachedAt: 123 });

    useAuthStore.setState({ user: null, isAuthenticated: false });

    expect(useDenunciasStore.getState()).toMatchObject({
      denuncias: [],
      offline: false,
      cachedAt: null,
      error: null,
    });
  });
});
