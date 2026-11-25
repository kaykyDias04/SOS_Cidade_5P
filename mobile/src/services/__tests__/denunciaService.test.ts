import { apiRequest } from '@/services/http';
import { denunciasAPI } from '@/services/denunciaService';
import type { Denuncia } from '@/types';

jest.mock('@/services/http', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = jest.mocked(apiRequest);
const denuncia = {
  tipoDenuncia: 'Foco de Dengue',
  identificacao: false,
  nomeDenunciante: 'Anônimo',
  bairroOcorrencia: 'Centro',
  descricaoOcorrencia: 'Água parada no terreno ao lado.',
  dataOcorrencia: '2026-01-15',
  protocolo: '',
  situacao: 'Em Andamento',
  imagens: null,
} satisfies Omit<Denuncia, 'id' | 'createdAt' | 'updatedAt'>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('denunciasAPI', () => {
  it('42 - listarMinhas usa paginação padrão', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: { data: [] } } as never);

    await denunciasAPI.listarMinhas();

    expect(mockedApiRequest).toHaveBeenCalledWith('/denuncias/minhas?_page=1&_limit=50');
  });

  it('43 - listarMinhas aceita página e limite personalizados', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: { data: [] } } as never);

    await denunciasAPI.listarMinhas(2, 10);

    expect(mockedApiRequest).toHaveBeenCalledWith('/denuncias/minhas?_page=2&_limit=10');
  });

  it('44 - listarTodas inclui metadados de paginação', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: { data: [], meta: {} } } as never);

    await denunciasAPI.listarTodas();

    expect(mockedApiRequest).toHaveBeenCalledWith('/denuncias?_page=1&_limit=50&_meta=1');
  });

  it('45 - listarTodas serializa filtros informados', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: { data: [] } } as never);

    await denunciasAPI.listarTodas(1, 20, {
      tipoDenuncia: 'Foco de Dengue',
      bairroOcorrencia: 'Centro',
      situacao: 'Em Andamento',
    });

    const url = String(mockedApiRequest.mock.calls[0][0]);
    expect(url).toContain('tipoDenuncia=Foco+de+Dengue');
    expect(url).toContain('bairroOcorrencia=Centro');
    expect(url).toContain('situacao=Em+Andamento');
  });

  it('serializa múltiplas categorias e regiões como valores de filtro repetidos', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: { data: [] } } as never);

    await denunciasAPI.listarMinhas(1, 50, {
      tipoDenuncia: ['Buraco na Via', 'Iluminação Pública'],
      bairroOcorrencia: ['Boa Viagem', 'Espinheiro'],
    });

    expect(mockedApiRequest).toHaveBeenCalledWith(
      '/denuncias/minhas?_page=1&_limit=50&tipoDenuncia=Buraco+na+Via&tipoDenuncia=Ilumina%C3%A7%C3%A3o+P%C3%BAblica&bairroOcorrencia=Boa+Viagem&bairroOcorrencia=Espinheiro',
    );
  });

  it('46 - getById consulta a denúncia pelo identificador', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: {} } as never);

    await denunciasAPI.getById(42);

    expect(mockedApiRequest).toHaveBeenCalledWith('/denuncias/42');
  });

  it('47 - create envia POST, preserva os campos e acrescenta timestamps', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 201, data: {} } as never);

    await denunciasAPI.create(denuncia);

    const [url, options] = mockedApiRequest.mock.calls[0];
    expect(url).toBe('/denuncias');
    expect(options).toEqual(expect.objectContaining({ method: 'POST' }));
    const body = JSON.parse(String(options?.body));
    expect(body).toEqual(expect.objectContaining(denuncia));
    expect(body.createdAt).toBeTruthy();
    expect(body.updatedAt).toBeTruthy();
  });

  it('48 - update envia PATCH para o identificador correto', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 200, data: {} } as never);

    await denunciasAPI.update(42, { situacao: 'Finalizada' });

    expect(mockedApiRequest).toHaveBeenCalledWith('/denuncias/42', {
      method: 'PATCH',
      body: JSON.stringify({ situacao: 'Finalizada' }),
    });
  });

  it('49 - delete envia DELETE para o identificador correto', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 204 } as never);

    await denunciasAPI.delete(42);

    expect(mockedApiRequest).toHaveBeenCalledWith('/denuncias/42', { method: 'DELETE' });
  });

  it('50 - create mantém imagens como lista quando anexadas', async () => {
    mockedApiRequest.mockResolvedValue({ success: true, status: 201, data: {} } as never);
    const payload = { ...denuncia, imagens: ['data:image/jpeg;base64,AAAA'] };

    await denunciasAPI.create(payload);

    const body = JSON.parse(String(mockedApiRequest.mock.calls[0][1]?.body));
    expect(body.imagens).toEqual(['data:image/jpeg;base64,AAAA']);
  });
});
