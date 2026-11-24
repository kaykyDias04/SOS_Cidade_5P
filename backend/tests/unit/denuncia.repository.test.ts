jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    denuncia: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from '../../src/lib/prisma';
import { DenunciaRepository } from '../../src/repositories/denuncia.repository';

describe('DenunciaRepository: filtros', () => {
  const findMany = jest.spyOn(prisma.denuncia, 'findMany');
  const count = jest.spyOn(prisma.denuncia, 'count');

  beforeEach(() => {
    jest.clearAllMocks();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
  });

  it('aplica os mesmos filtros de gestor à listagem e à contagem', async () => {
    const repository = new DenunciaRepository();
    const filtros = {
      tipoDenuncia: 'Buraco na Via',
      bairroOcorrencia: 'Boa Viagem',
      situacao: 'Em Andamento',
    };

    await repository.findAll(0, 50, undefined, filtros);
    await repository.count(undefined, filtros);

    expect(findMany).toHaveBeenCalledWith({
      where: filtros,
      skip: 0,
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    expect(count).toHaveBeenCalledWith({ where: filtros });
  });

  it('combina o filtro do usuário com os filtros de denúncia', async () => {
    const repository = new DenunciaRepository();

    await repository.findAll(0, 50, 7, { situacao: 'Em Andamento' });

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 7, situacao: 'Em Andamento' },
      skip: 0,
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  });
});
