import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export interface DenunciaFiltros {
  tipoDenuncia?: string;
  bairroOcorrencia?: string;
  situacao?: string;
}

function buildWhere(userId?: number, filtros: DenunciaFiltros = {}): Prisma.DenunciaWhereInput {
  return {
    ...(userId === undefined ? {} : { userId }),
    ...(filtros.tipoDenuncia === undefined ? {} : { tipoDenuncia: filtros.tipoDenuncia }),
    ...(filtros.bairroOcorrencia === undefined ? {} : { bairroOcorrencia: filtros.bairroOcorrencia }),
    ...(filtros.situacao === undefined ? {} : { situacao: filtros.situacao }),
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
