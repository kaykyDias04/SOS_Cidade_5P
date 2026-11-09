import request from 'supertest';
import { mockPrisma, mockRedisMethods, resetMockDb } from './helpers/mockDb';

jest.mock('../backend/src/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// `redis: {}` não tem incr/ttl/etc.: força o caminho de fallback em memória.
jest.mock('../backend/src/lib/redis', () => ({
  redis: {},
  redisGet: mockRedisMethods.redisGet,
  redisSet: mockRedisMethods.redisSet,
  redisDel: mockRedisMethods.redisDel,
  redisKeys: mockRedisMethods.redisKeys,
}));

import app from '../backend/src/app';
import { __resetLoginAttemptsMemoria, hashEmail } from '../backend/src/lib/loginAttempts';

// Cada requisição vem de um IP diferente (X-Forwarded-For, que o trust proxy = 1 respeita):
// assim o limite por IP, testado no módulo 07, não interfere no bloqueio por conta.
let contador = 0;
const login = (email: string, password: string) =>
  request(app)
    .post('/auth/login')
    .set('X-Forwarded-For', `10.0.${Math.floor(++contador / 250)}.${contador % 250}`)
    .send({ email, password });

describe('SUT API Tests - Módulo 06: Bloqueio de login por conta (força bruta)', () => {
  let aviso: jest.SpyInstance;

  beforeEach(() => {
    resetMockDb();
    __resetLoginAttemptsMemoria();
    aviso = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => aviso.mockRestore());

  it('CT-BLQ-01: DENUNCIANTE é bloqueado na 5ª falha; a 6ª tentativa, mesmo com a senha certa, recebe 429 com Retry-After', async () => {
    for (let i = 0; i < 5; i++) {
      const falha = await login('denunciante@sos.com', 'errada');
      expect(falha.status).toBe(401);
    }

    const bloqueada = await login('denunciante@sos.com', 'senha123');

    expect(bloqueada.status).toBe(429);
    expect(bloqueada.body).toEqual({
      success: false,
      error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    });
    expect(Number(bloqueada.headers['retry-after'])).toBeGreaterThan(0);
    expect(Number(bloqueada.headers['retry-after'])).toBeLessThanOrEqual(15 * 60);
  });

  it('CT-BLQ-02: GESTOR é bloqueado já na 3ª falha, por 30 minutos', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await login('gestor@sos.com', 'errada')).status).toBe(401);
    }

    const bloqueada = await login('gestor@sos.com', 'senha123');

    expect(bloqueada.status).toBe(429);
    expect(Number(bloqueada.headers['retry-after'])).toBeGreaterThan(15 * 60);
    expect(Number(bloqueada.headers['retry-after'])).toBeLessThanOrEqual(30 * 60);
  });

  it('CT-BLQ-03: e-mail inexistente também é contado e bloqueado, com a mesma mensagem de credenciais inválidas', async () => {
    const primeira = await login('fantasma@sos.com', 'qualquer');
    expect(primeira.status).toBe(401);
    expect(primeira.body).toEqual({ success: false, error: 'Credenciais inválidas' });

    for (let i = 0; i < 4; i++) await login('fantasma@sos.com', 'qualquer');

    expect((await login('fantasma@sos.com', 'qualquer')).status).toBe(429);
  });

  it('CT-BLQ-04: login com sucesso zera as falhas anteriores', async () => {
    for (let i = 0; i < 4; i++) await login('denunciante@sos.com', 'errada');
    expect((await login('denunciante@sos.com', 'senha123')).status).toBe(200);

    for (let i = 0; i < 4; i++) {
      expect((await login('denunciante@sos.com', 'errada')).status).toBe(401);
    }
  });

  it('CT-BLQ-05: o e-mail é normalizado (maiúsculas e espaços contam para a mesma conta)', async () => {
    for (let i = 0; i < 5; i++) await login('  DENUNCIANTE@sos.com ', 'errada');

    expect((await login('denunciante@sos.com', 'senha123')).status).toBe(429);
  });

  it('CT-BLQ-06: o bloqueio de uma conta não afeta as outras', async () => {
    for (let i = 0; i < 3; i++) await login('gestor@sos.com', 'errada');

    expect((await login('denunciante@sos.com', 'senha123')).status).toBe(200);
  });

  it('CT-BLQ-07: o log de segurança traz só o hash do e-mail e o perfil, nunca e-mail, senha ou token', async () => {
    for (let i = 0; i < 3; i++) await login('gestor@sos.com', 'SenhaSecreta!');

    expect(aviso).toHaveBeenCalledWith('[SECURITY] login bloqueado', {
      emailHash: hashEmail('gestor@sos.com'),
      role: 'GESTOR',
    });
    const registrado = JSON.stringify(aviso.mock.calls);
    expect(registrado).not.toContain('gestor@sos.com');
    expect(registrado).not.toContain('SenhaSecreta!');
  });
});
