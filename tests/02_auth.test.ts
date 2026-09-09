import request from 'supertest';
import { mockPrisma, mockRedisMethods, resetMockDb } from './helpers/mockDb';
import {
  generateDenuncianteToken,
  generateInvalidToken,
  getAuthCookie,
  getBearerHeader,
} from './helpers/authHelper';

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

describe('SUT API Tests - Módulo 02: Autenticação, Sessão e Proteção de Rotas', () => {
  beforeEach(() => {
    resetMockDb();
  });

  describe('POST /auth/login - Autenticação de Usuário e Criação de Sessão', () => {
    it('CT-AUT-01: Deve autenticar usuário denunciante com credenciais válidas e retornar token e perfil', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'denunciante@sos.com',
          password: 'senha123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: 1,
        email: 'denunciante@sos.com',
        name: 'Cidadão Denunciante',
        role: 'DENUNCIANTE',
      });
      // Verifica que a senha nunca é vazada no response
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('CT-AUT-02: Deve injetar cookie seguro authToken com atributos HttpOnly na resposta do login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'denunciante@sos.com',
          password: 'senha123',
        });

      expect(response.status).toBe(200);
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const authCookie = cookies.find((c: string) => c.startsWith('authToken='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toMatch(/HttpOnly/i);
    });

    it('CT-AUT-03: Deve autenticar usuário gestor público com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'gestor@sos.com',
          password: 'senha123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('GESTOR');
      expect(response.body.user.name).toBe('Gestor Municipal');
    });

    it('CT-AUT-04: Deve rejeitar login com senha incorreta e retornar status 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'denunciante@sos.com',
          password: 'senha_completamente_errada',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('CT-AUT-05: Deve rejeitar login com email não cadastrado no SUT e retornar status 401', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'inexistente@naoexiste.com',
          password: 'qualquer_senha',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('CT-AUT-06: Deve rejeitar login com payload vazio ou dados ausentes', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout - Encerramento de Sessão', () => {
    it('CT-AUT-07: Deve responder com status 200 e limpar o cookie authToken', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies.find((c: string) => c.startsWith('authToken=;'));
      expect(clearedCookie).toBeDefined();
    });
  });

  describe('Middleware de Autenticação e Proteção de Endpoints Privados', () => {
    it('CT-AUT-08: Deve bloquear requisições sem token em rota protegida e retornar status 401 Unauthorized', async () => {
      const response = await request(app).get('/denuncias');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('CT-AUT-09: Deve bloquear requisições com token JWT forjado/inválido com status 403 Forbidden', async () => {
      const forgedToken = generateInvalidToken();

      const response = await request(app)
        .get('/denuncias')
        .set('Authorization', getBearerHeader(forgedToken));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        error: 'Forbidden',
      });
    });

    it('CT-AUT-10: Deve permitir acesso utilizando token trafegado via Cookie HttpOnly (authToken)', async () => {
      const validToken = generateDenuncianteToken();

      const response = await request(app)
        .get('/denuncias')
        .set('Cookie', getAuthCookie(validToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('CT-AUT-11: Deve permitir acesso utilizando token trafegado via cabeçalho Authorization Bearer', async () => {
      const validToken = generateDenuncianteToken();

      const response = await request(app)
        .get('/denuncias')
        .set('Authorization', getBearerHeader(validToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });
});
