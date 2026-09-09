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

describe('SUT API Tests - Módulo 01: Infraestrutura, Roteamento e Segurança Base', () => {
  beforeEach(() => {
    resetMockDb();
  });

  describe('GET /health - Verificação de Liveness da API', () => {
    it('CT-INF-01: Deve responder com status 200 e corpo OK confirmando que a API está operacional', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /api-docs - Documentação OpenAPI/Swagger', () => {
    it('CT-INF-02: Deve servir a interface interativa do Swagger com status 200/301', async () => {
      const response = await request(app).get('/api-docs/');

      expect([200, 301, 302]).toContain(response.status);
      if (response.status === 200) {
        expect(response.text).toContain('swagger-ui');
      }
    });
  });

  describe('Roteamento e Tratamento de Recursos Inexistentes (404 Not Found)', () => {
    it('CT-INF-03: Deve responder com status 404 ao requisitar endpoint não registrado', async () => {
      const response = await request(app).get('/rota-inexistente-xyz');

      expect(response.status).toBe(404);
    });

    it('CT-INF-04: Deve responder com status 404 ao utilizar método não suportado em endpoint específico', async () => {
      const response = await request(app).put('/health');

      expect(response.status).toBe(404);
    });
  });

  describe('Políticas de CORS e Cabeçalhos HTTP', () => {
    it('CT-INF-05: Deve conceder cabeçalhos CORS e credentials para origem permitida (localhost:3000)', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('CT-INF-06: Requisição OPTIONS pre-flight deve responder com status 200 e métodos permitidos', async () => {
      const response = await request(app)
        .options('/denuncias')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect([200, 204]).toContain(response.status);
      if (response.headers['access-control-allow-methods']) {
        expect(response.headers['access-control-allow-methods']).toMatch(/POST/);
      }
    });
  });
});
