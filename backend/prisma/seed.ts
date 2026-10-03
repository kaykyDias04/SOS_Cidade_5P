import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const gestores = [
  {
    name: 'Gestor Teste 1',
    email: 'gestor1.teste@soscidade.com',
    password: 'Teste@123'
  },
  {
    name: 'Gestor Teste 2',
    email: 'gestor2.teste@soscidade.com',
    password: 'Teste@123'
  }
];

async function main() {
  for (const gestor of gestores) {
    const password = await bcrypt.hash(gestor.password, 10);

    await prisma.user.upsert({
      where: { email: gestor.email },
      update: {
        name: gestor.name,
        password,
        role: 'GESTOR'
      },
      create: {
        name: gestor.name,
        email: gestor.email,
        password,
        role: 'GESTOR'
      }
    });
  }
}

main()
  .catch((error) => {
    console.error('Erro ao criar usuários gestores de teste:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });