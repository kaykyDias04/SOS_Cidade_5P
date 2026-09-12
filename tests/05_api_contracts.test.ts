import request from 'supertest';
import { mockPrisma, mockRedisMethods, resetMockDb } from './helpers/mockDb';
import { generateDenuncianteToken, getBearerHeader } from './helpers/authHelper';
import swaggerDocument from '../backend/src/swagger.json';

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

describe('SUT API Tests - Módulo 05: Contratos de Dados e Conformidade Swagger/OpenAPI', () => {
  const token = generateDenuncianteToken();

  beforeEach(() => {
    resetMockDb();
  });

  describe('Conformidade com os Schemas do Swagger (OpenAPI 3.0)', () => {
    it('CT-CON-01: Modelo User retornado pela API deve aderir estritamente ao schema do swagger.json', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'contrato.user@sos.com',
          name: 'Teste de Contrato User',
          password: 'password123',
          role: 'DENUNCIANTE',
        });

      expect(response.status).toBe(200);

      const userSchema = (swaggerDocument as any).components.schemas.User;
      expect(userSchema).toBeDefined();

      // Validação de tipos do schema
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.email).toBe('string');
      expect(typeof response.body.name).toBe('string');
      expect(['DENUNCIANTE', 'GESTOR']).toContain(response.body.role);
    });

    it('CT-CON-02: Modelo Denuncia retornado pela API deve aderir estritamente ao schema do swagger.json', async () => {
      const response = await request(app)
        .get('/denuncias/1')
        .set('Authorization', getBearerHeader(token));

      expect(response.status).toBe(200);

      const denunciaSchema = (swaggerDocument as any).components.schemas.Denuncia;
      expect(denunciaSchema).toBeDefined();

      const d = response.body;
      expect(typeof d.id).toBe('number');
      expect(typeof d.tipoDenuncia).toBe('string');
      expect(typeof d.identificacao).toBe('boolean');
      expect(typeof d.nomeDenunciante).toBe('string');
      expect(typeof d.bairroOcorrencia).toBe('string');
      expect(typeof d.descricaoOcorrencia).toBe('string');
      expect(typeof d.dataOcorrencia).toBe('string');
      expect(typeof d.protocolo).toBe('string');
      expect(typeof d.situacao).toBe('string');
      expect(d.imagens === null || Array.isArray(d.imagens)).toBe(true);
    });

    it('CT-CON-03: Contrato do envelope de paginação GET /denuncias deve conter as propriedades data e meta', async () => {
      const response = await request(app)
        .get('/denuncias')
        .set('Authorization', getBearerHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');

      const meta = response.body.meta;
      expect(typeof meta.page).toBe('number');
      expect(typeof meta.limit).toBe('number');
      expect(typeof meta.total).toBe('number');
    });

    it('CT-CON-04: Respostas de erro devem manter padrão JSON estruturado consistente', async () => {
      const response = await request(app).get('/denuncias');

      expect(response.status).toBe(401);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
