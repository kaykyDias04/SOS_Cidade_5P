import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export interface DenunciaFiltros {
  tipoDenuncia?: string | string[];
  bairroOcorrencia?: string | string[];
  situacao?: string | string[];
}

function buildWhere(userId?: number, filtros: DenunciaFiltros = {}): Prisma.DenunciaWhereInput {
  const filtroPrisma = (value: string | string[] | undefined) =>
    Array.isArray(value) ? { in: value } : value;

  return {
    ...(userId === undefined ? {} : { userId }),
    ...(filtros.tipoDenuncia === undefined ? {} : { tipoDenuncia: filtroPrisma(filtros.tipoDenuncia) }),
    ...(filtros.bairroOcorrencia === undefined ? {} : { bairroOcorrencia: filtroPrisma(filtros.bairroOcorrencia) }),
    ...(filtros.situacao === undefined ? {} : { situacao: filtroPrisma(filtros.situacao) }),
  };
}

export class DenunciaRepository {
  async findAll(skip: number, take: number, userId?: number, filtros: DenunciaFiltros = {}) {
    return prisma.denuncia.findMany({
      where: buildWhere(userId, filtros),
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async count(userId?: number, filtros: DenunciaFiltros = {}) {
    return prisma.denuncia.count({
      where: buildWhere(userId, filtros)
    });
  }

  async findById(id: number) {
    return prisma.denuncia.findUnique({ where: { id } });
  }

  async create(data: Prisma.DenunciaCreateInput) {
    return prisma.denuncia.create({ data });
  }

  async update(id: number, data: Prisma.DenunciaUpdateInput) {
    return prisma.denuncia.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.denuncia.delete({ where: { id } });
  }
}
