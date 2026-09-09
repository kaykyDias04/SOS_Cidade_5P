import bcrypt from 'bcryptjs';

export interface MockUser {
  id: number;
  email: string;
  name: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockDenuncia {
  id: number;
  tipoDenuncia: string;
  identificacao: boolean;
  nomeDenunciante: string;
  userId?: number | null;
  bairroOcorrencia: string;
  descricaoOcorrencia: string;
  dataOcorrencia: string;
  protocolo: string;
  situacao: string;
  imagens?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

let initialUsers: MockUser[] = [];
let initialDenuncias: MockDenuncia[] = [];

let users: MockUser[] = [];
let denuncias: MockDenuncia[] = [];
let redisStore = new Map<string, string>();

let nextUserId = 10;
let nextDenunciaId = 10;

export function initFixtures() {
  const hashedPassword = bcrypt.hashSync('senha123', 10);

  initialUsers = [
    {
      id: 1,
      email: 'denunciante@sos.com',
      name: 'Cidadão Denunciante',
      password: hashedPassword,
      role: 'DENUNCIANTE',
      createdAt: new Date('2026-08-01T10:00:00Z'),
      updatedAt: new Date('2026-08-01T10:00:00Z'),
    },
    {
      id: 2,
      email: 'gestor@sos.com',
      name: 'Gestor Municipal',
      password: hashedPassword,
      role: 'GESTOR',
      createdAt: new Date('2026-08-01T10:00:00Z'),
      updatedAt: new Date('2026-08-01T10:00:00Z'),
    },
  ];

  initialDenuncias = [
    {
      id: 1,
      tipoDenuncia: 'Buraco na Via',
      identificacao: true,
      nomeDenunciante: 'denunciante@sos.com',
      userId: 1,
      bairroOcorrencia: 'Boa Viagem',
      descricaoOcorrencia: 'Buraco profundo na faixa direita da Avenida Boa Viagem',
      dataOcorrencia: '2026-09-01',
      protocolo: 'SOS-2026-BV000001',
      situacao: 'Em Andamento',
      imagens: JSON.stringify(['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==']),
      createdAt: new Date('2026-09-01T09:00:00Z'),
      updatedAt: new Date('2026-09-01T09:00:00Z'),
    },
    {
      id: 2,
      tipoDenuncia: 'Iluminação Pública',
      identificacao: false,
      nomeDenunciante: 'Anônimo',
      userId: 1,
      bairroOcorrencia: 'Várzea',
      descricaoOcorrencia: 'Três postes sem lâmpada na Rua General Polidoro',
      dataOcorrencia: '2026-09-02',
      protocolo: 'SOS-2026-VZ000002',
      situacao: 'Finalizada',
      imagens: null,
      createdAt: new Date('2026-09-02T14:00:00Z'),
      updatedAt: new Date('2026-09-02T16:00:00Z'),
    },
    {
      id: 3,
      tipoDenuncia: 'Descarte Irregular de Lixo',
      identificacao: true,
      nomeDenunciante: 'Cidadão Consciente',
      userId: 1,
      bairroOcorrencia: 'Santo Amaro',
      descricaoOcorrencia: 'Entulho acumulado na calçada impedindo passagem de pedestres',
      dataOcorrencia: '2026-09-03',
      protocolo: 'SOS-2026-SA000003',
      situacao: 'Em Andamento',
      imagens: JSON.stringify(['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD']),
      createdAt: new Date('2026-09-03T11:00:00Z'),
      updatedAt: new Date('2026-09-03T11:00:00Z'),
    },
  ];
}

export function resetMockDb() {
  if (initialUsers.length === 0) {
    initFixtures();
  }
  users = JSON.parse(JSON.stringify(initialUsers)).map((u: any) => ({
    ...u,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  }));
  denuncias = JSON.parse(JSON.stringify(initialDenuncias)).map((d: any) => ({
    ...d,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
  }));
  redisStore.clear();
  nextUserId = 20;
  nextDenunciaId = 20;
}

export const mockPrisma = {
  user: {
    findUnique: jest.fn(async ({ where }: { where: { email?: string; id?: number } }) => {
      if (where.email) {
        return users.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
      }
      if (where.id) {
        return users.find((u) => u.id === where.id) || null;
      }
      return null;
    }),

    findMany: jest.fn(async ({ where }: { where?: { role?: string } } = {}) => {
      let result = [...users];
      if (where?.role) {
        result = result.filter((u) => u.role === where.role);
      }
      return result.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
    }),

    create: jest.fn(async ({ data }: { data: any }) => {
      const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        const err: any = new Error('Unique constraint failed on the fields: (`email`)');
        err.code = 'P2002';
        throw err;
      }

      const newUser: MockUser = {
        id: nextUserId++,
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || 'DENUNCIANTE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    }),

    delete: jest.fn(async ({ where }: { where: { id: number } }) => {
      const idx = users.findIndex((u) => u.id === where.id);
      if (idx === -1) {
        const err: any = new Error('Record to delete does not exist.');
        err.code = 'P2025';
        throw err;
      }
      const deleted = users.splice(idx, 1)[0];
      return deleted;
    }),
  },

  denuncia: {
    findAll: jest.fn(async (skip: number, take: number) => {
      const sorted = [...denuncias].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return sorted.slice(skip, skip + take);
    }),

    findMany: jest.fn(async ({ skip = 0, take = 50 }: { skip?: number; take?: number } = {}) => {
      const sorted = [...denuncias].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return sorted.slice(skip, skip + take);
    }),

    count: jest.fn(async () => denuncias.length),

    findById: jest.fn(async (id: number) => {
      return denuncias.find((d) => d.id === id) || null;
    }),

    findUnique: jest.fn(async ({ where }: { where: { id?: number; protocolo?: string } }) => {
      if (where.id) {
        return denuncias.find((d) => d.id === where.id) || null;
      }
      if (where.protocolo) {
        return denuncias.find((d) => d.protocolo === where.protocolo) || null;
      }
      return null;
    }),

    create: jest.fn(async ({ data }: { data: any }) => {
      const newDenuncia: MockDenuncia = {
        id: nextDenunciaId++,
        tipoDenuncia: data.tipoDenuncia,
        identificacao: data.identificacao,
        nomeDenunciante: data.nomeDenunciante,
        userId: data.user?.connect?.id || data.userId || null,
        bairroOcorrencia: data.bairroOcorrencia,
        descricaoOcorrencia: data.descricaoOcorrencia,
        dataOcorrencia: data.dataOcorrencia,
        protocolo: data.protocolo,
        situacao: data.situacao || 'Em Andamento',
        imagens: data.imagens || null,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
      };
      denuncias.push(newDenuncia);
      return newDenuncia;
    }),

    update: jest.fn(async ({ where, data }: { where: { id: number }; data: any }) => {
      const item = denuncias.find((d) => d.id === where.id);
      if (!item) {
        const err: any = new Error('Record to update does not exist.');
        err.code = 'P2025';
        throw err;
      }
      Object.assign(item, data, { updatedAt: new Date() });
      return item;
    }),

    delete: jest.fn(async ({ where }: { where: { id: number } }) => {
      const idx = denuncias.findIndex((d) => d.id === where.id);
      if (idx === -1) {
        const err: any = new Error('Record to delete does not exist.');
        err.code = 'P2025';
        throw err;
      }
      return denuncias.splice(idx, 1)[0];
    }),
  },
};

export const mockRedisMethods = {
  redisGet: jest.fn(async (key: string) => {
    return redisStore.get(key) || null;
  }),
  redisSet: jest.fn(async (key: string, value: string) => {
    redisStore.set(key, value);
  }),
  redisDel: jest.fn(async (...keys: string[]) => {
    for (const k of keys) {
      redisStore.delete(k);
    }
  }),
  redisKeys: jest.fn(async (pattern: string) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matched: string[] = [];
    for (const k of redisStore.keys()) {
      if (regex.test(k)) {
        matched.push(k);
      }
    }
    return matched;
  }),
  getRedisStore: () => redisStore,
};
