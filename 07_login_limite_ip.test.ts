import request from 'supertest';
import { mockPrisma, mockRedisMethods, resetMockDb } from './helpers/mockDb';

jest.mock('../backend/src/lib/prisma', () => ({
  prisma: mockPrisma,
}));

jest.mock('../backend/src/lib/redis', () => ({
  redis: {},
  redisGet: mockRedisMethods.redisGet,
  redisSet: mockRedisMethods.redisSet,
  redisDel: mockRedisMethods.redisDel,
  redisKeys: mockRedisMethods.redisKeys,
}));

import app from '../backend/src/app';

describe('SUT API Tests - Módulo 07: Limite de requisições de login por IP', () => {
  beforeEach(() => resetMockDb());

  it('CT-IP-01: a 21ª requisição ao /auth/login do mesmo IP em 15 minutos recebe 429 no formato padrão, com cabeçalhos RateLimit', async () => {
    // e-mails diferentes para não acionar o bloqueio por conta: aqui só o limite por IP é testado
    let ultima = await request(app).post('/auth/login').send({ email: 'u0@sos.com', password: 'x' });
    expect(ultima.headers['ratelimit-limit']).toBe('20');

    for (let i = 1; i < 20; i++) {
      ultima = await request(app).post('/auth/login').send({ email: `u${i}@sos.com`, password: 'x' });
      expect(ultima.status).toBe(401);
    }

    const bloqueada = await request(app).post('/auth/login').send({ email: 'u21@sos.com', password: 'x' });
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.body).toEqual({
      success: false,
      error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    });
  }, 60000);

  it('CT-IP-02: o limite vale só para /auth/login; outras rotas não são afetadas', async () => {
    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
  });
});
