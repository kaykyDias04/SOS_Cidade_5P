jest.mock('../../src/lib/prisma', () => ({ prisma: {} }));
jest.mock('../../src/lib/redis', () => ({
  redisGet: jest.fn(async () => null),
  redisSet: jest.fn(async () => undefined),
  redisDel: jest.fn(async () => undefined),
  redisKeys: jest.fn(async () => []),
}));

import { decrypt, encrypt } from '../../src/lib/crypto';
import { redisGet } from '../../src/lib/redis';
import { DenunciaRepository } from '../../src/repositories/denuncia.repository';
import { DenunciaService } from '../../src/services/denuncia.service';

const criar = jest.spyOn(DenunciaRepository.prototype, 'create');
const listar = jest.spyOn(DenunciaRepository.prototype, 'findAll');
const contar = jest.spyOn(DenunciaRepository.prototype, 'count');

const base = {
  tipoDenuncia: 'Buraco na Via',
  bairroOcorrencia: 'Boa Viagem',
  descricaoOcorrencia: 'Buraco profundo na faixa direita da avenida',
  dataOcorrencia: '2026-10-14',
  userId: 1,
  userEmail: 'denunciante@sos.com',
};

const gravado = () => criar.mock.calls[0][0] as any;

describe('DenunciaService: privacidade da denúncia e histórico do cidadão', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    criar.mockImplementation(async (dados: any) => ({ id: 20, ...dados }) as any);
    listar.mockResolvedValue([]);
    contar.mockResolvedValue(0);
  });

  it('UN-DENUNCIA-01: denúncia anônima grava "Anônimo" cifrado, sem o e-mail do autor, e devolve "Anônimo"', async () => {
    const criada = await new DenunciaService().createDenuncia({ ...base, identificacao: false });

    expect(gravado().nomeDenunciante).toBe('');
    expect(JSON.stringify(gravado())).not.toContain('denunciante@sos.com');
    expect(criada.nomeDenunciante).toBe('Anônimo');
    expect(criada).not.toHaveProperty('userId');
  });

  it('UN-DENUNCIA-02: denúncia anônima ignora o nome enviado no corpo', async () => {
    await new DenunciaService().createDenuncia({
      ...base,
      identificacao: false,
      nomeDenunciante: 'Fulano de Tal',
    });

    expect(gravado().nomeDenunciante).toBe('');
  });

  it('oculta nome e vínculo em registros anônimos legados, mesmo que o banco contenha um nome', async () => {
    const descricao = 'Descrição anônima legada';
    listar.mockResolvedValue([{
      id: 21,
      identificacao: false,
      nomeDenunciante: 'nome-cifrado-antigo',
      userId: 7,
      descricaoOcorrencia: encrypt(descricao),
      imagens: null,
    }] as any);

    const result = await new DenunciaService().getDenuncias(1, 50, 7);

    expect(result.data[0].nomeDenunciante).toBe('Anônimo');
    expect(result.data[0]).not.toHaveProperty('userId');
    expect(result.data[0].descricaoOcorrencia).toBe(descricao);
  });

  it('UN-DENUNCIA-03: denúncia identificada sem nome usa o e-mail do usuário logado', async () => {
    const criada = await new DenunciaService().createDenuncia({ ...base, identificacao: true });

    expect(decrypt(gravado().nomeDenunciante)).toBe('denunciante@sos.com');
    expect(criada.nomeDenunciante).toBe('denunciante@sos.com');
  });

  it('UN-DENUNCIA-04: a descrição é gravada cifrada e devolvida em texto puro', async () => {
    const criada = await new DenunciaService().createDenuncia({ ...base, identificacao: true });

    expect(gravado().descricaoOcorrencia).not.toBe(base.descricaoOcorrencia);
    expect(criada.descricaoOcorrencia).toBe(base.descricaoOcorrencia);
  });

  it('UN-DENUNCIA-05: "minhas denúncias" filtra pelo usuário e usa chave de cache própria', async () => {
    await new DenunciaService().getDenuncias(1, 50, 7);

    expect(listar).toHaveBeenCalledWith(0, 50, 7, {});
    expect(contar).toHaveBeenCalledWith(7, {});
    expect(redisGet).toHaveBeenCalledWith('denuncias:v2:7:1:50');
  });

  it('aplica filtros à lista e à contagem, com uma chave de cache específica', async () => {
    const filtros = { tipoDenuncia: 'Buraco na Via', situacao: 'Em Andamento' };

    await new DenunciaService().getDenuncias(1, 50, undefined, filtros);

    expect(listar).toHaveBeenCalledWith(0, 50, undefined, filtros);
    expect(contar).toHaveBeenCalledWith(undefined, filtros);
    expect(redisGet).toHaveBeenCalledWith(
      'denuncias:v2:all:1:50:{"tipoDenuncia":"Buraco na Via","bairroOcorrencia":null,"situacao":"Em Andamento"}'
    );
  });
});
