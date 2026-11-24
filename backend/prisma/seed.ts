import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { encrypt } from '../src/lib/crypto';

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

const denuncianteTeste = {
  name: 'Denunciante Teste',
  email: 'denunciante.teste@soscidade.com',
  password: 'Teste@123',
};

const denunciasTeste = [
  {
    tipoDenuncia: 'Buraco na Via',
    bairroOcorrencia: 'Boa Viagem',
    descricaoOcorrencia: 'DADO DE TESTE: buraco sinalizado para validar a listagem do gestor.',
    dataOcorrencia: '2026-11-18',
    protocolo: 'SOS-2026-TEST0001',
    situacao: 'Em Andamento',
    identificacao: false,
  },
  {
    tipoDenuncia: 'Iluminação Pública',
    bairroOcorrencia: 'Espinheiro',
    descricaoOcorrencia: 'DADO DE TESTE: luminária apagada para validar filtros e mapa.',
    dataOcorrencia: '2026-11-17',
    protocolo: 'SOS-2026-TEST0002',
    situacao: 'Em Andamento',
    identificacao: false,
  },
  {
    tipoDenuncia: 'Descarte Irregular de Lixo',
    bairroOcorrencia: 'Várzea',
    descricaoOcorrencia: 'DADO DE TESTE: descarte irregular para validar o histórico.',
    dataOcorrencia: '2026-11-16',
    protocolo: 'SOS-2026-TEST0003',
    situacao: 'Finalizada',
    identificacao: true,
  },
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

  const consentimentoData = new Date();
  const senhaDenunciante = await bcrypt.hash(denuncianteTeste.password, 10);
  const denunciante = await prisma.user.upsert({
    where: { email: denuncianteTeste.email },
    update: {
      name: denuncianteTeste.name,
      password: senhaDenunciante,
      role: 'DENUNCIANTE',
      termsAcceptedAt: consentimentoData,
      privacyAcceptedAt: consentimentoData,
      termsVersion: '1.0',
      privacyVersion: '1.0',
    },
    create: {
      name: denuncianteTeste.name,
      email: denuncianteTeste.email,
      password: senhaDenunciante,
      role: 'DENUNCIANTE',
      termsAcceptedAt: consentimentoData,
      privacyAcceptedAt: consentimentoData,
      termsVersion: '1.0',
      privacyVersion: '1.0',
    },
  });

  for (const denuncia of denunciasTeste) {
    await prisma.denuncia.upsert({
      where: { protocolo: denuncia.protocolo },
      update: {},
      create: {
        ...denuncia,
        nomeDenunciante: denuncia.identificacao ? encrypt(denunciante.name) : '',
        descricaoOcorrencia: encrypt(denuncia.descricaoOcorrencia),
        user: { connect: { id: denunciante.id } },
      },
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