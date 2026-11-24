import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByRole(role: string) {
    return prisma.user.findMany({ 
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async recordLegalAcceptance(id: number, version: string) {
    const acceptedAt = new Date();
    return prisma.user.update({
      where: { id },
      data: {
        termsAcceptedAt: acceptedAt,
        privacyAcceptedAt: acceptedAt,
        termsVersion: version,
        privacyVersion: version,
      },
    });
  }

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
