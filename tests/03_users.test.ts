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

describe('SUT API Tests - Módulo 03: Gestão de Usuários (/users)', () => {
  beforeEach(() => {
    resetMockDb();
  });

  describe('POST /users - Criação de Novos Usuários', () => {
    it('CT-USR-01: Deve criar usuário denunciante com perfil default e senha protegida por hash', async () => {
      const payload = {
        email: 'novo.cidadao@recife.pe.gov.br',
        name: 'Novo Cidadão',
        password: 'senha_segura_123',
      };

      const response = await request(app)
        .post('/users')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(payload.email);
      expect(response.body.name).toBe(payload.name);
      expect(response.body.role).toBe('DENUNCIANTE');
      expect(response.body).not.toHaveProperty('password');
    });

    it('CT-USR-02: Deve permitir a criação explícita de usuário com perfil GESTOR', async () => {
      const payload = {
        email: 'gestor.sec.obras@recife.pe.gov.br',
        name: 'Coordenador de Zeladoria',
        password: 'gestor_forte_2026',
        role: 'GESTOR',
      };

      const response = await request(app)
        .post('/users')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('GESTOR');
      expect(response.body.email).toBe(payload.email);
    });

    it('CT-USR-03: Deve rejeitar criação com email duplicado e responder status 400 amigável', async () => {
      const payload = {
        email: 'denunciante@sos.com',
        name: 'Usuário Duplicado',
        password: 'senha_segura_123',
      };

      const response = await request(app)
        .post('/users')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Este email já está cadastrado.',
      });
    });

    it.each([undefined, '12345'])('Deve rejeitar senha ausente ou com menos de 6 caracteres', async (password) => {
      const response = await request(app)
        .post('/users')
        .send({
          email: 'senha.invalida@sos.com',
          name: 'Senha Inválida',
          password,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'A senha deve ter no mínimo 6 caracteres.',
      });
    });
  });

  describe('GET /users - Listagem e Filtro por Perfil', () => {
    it('CT-USR-04: Deve listar usuários filtrados por perfil DENUNCIANTE', async () => {
      const response = await request(app)
        .get('/users?role=DENUNCIANTE');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((u: any) => {
        expect(u.role).toBe('DENUNCIANTE');
        expect(u).not.toHaveProperty('password');
      });
    });

    it('CT-USR-05: Deve listar usuários filtrados por perfil GESTOR', async () => {
      const response = await request(app)
        .get('/users?role=GESTOR');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((u: any) => {
        expect(u.role).toBe('GESTOR');
        expect(u).not.toHaveProperty('password');
      });
    });

    it('CT-USR-06: Deve retornar array vazio quando nenhum parâmetro de role é informado', async () => {
      const response = await request(app)
        .get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /users/:id - Remoção de Usuário', () => {
    it('CT-USR-07: Deve remover usuário existente quando fornecido ID numérico válido', async () => {
      const response = await request(app)
        .delete('/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    });

    it('CT-USR-08: Deve rejeitar requisição de exclusão quando o ID não for numérico com status 400', async () => {
      const response = await request(app)
        .delete('/users/abc_invalido');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'ID inválido',
      });
    });

    it('CT-USR-09: Deve responder com status 500 ao tentar excluir usuário inexistente no banco', async () => {
      const response = await request(app)
        .delete('/users/99999');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Erro interno no servidor',
      });
    });
  });
});
