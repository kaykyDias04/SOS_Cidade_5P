import request from 'supertest';
import { mockPrisma, mockRedisMethods, resetMockDb } from './helpers/mockDb';
import {
  generateDenuncianteToken,
  generateGestorToken,
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

describe('SUT API Tests - Módulo 04: Gestão de Denúncias e Ocorrências Urbanas (/denuncias)', () => {
  const tokenDenunciante = generateDenuncianteToken();
  const tokenGestor = generateGestorToken();

  beforeEach(() => {
    resetMockDb();
    jest.clearAllMocks();
  });

  describe('POST /denuncias - Registro de Ocorrências', () => {
    it('CT-DEN-01: Deve registrar denúncia identificada com protocolo gerado automaticamente e status Em Andamento', async () => {
      const payload = {
        tipoDenuncia: 'Vazamento de Esgoto',
        identificacao: true,
        bairroOcorrencia: 'Afogados',
        descricaoOcorrencia: 'Esgoto transbordando na via pública próximo ao mercado público',
        dataOcorrencia: '2026-09-08',
      };

      const response = await request(app)
        .post('/denuncias')
        .set('Authorization', getBearerHeader(tokenDenunciante))
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.tipoDenuncia).toBe(payload.tipoDenuncia);
      expect(response.body.bairroOcorrencia).toBe(payload.bairroOcorrencia);
      expect(response.body.situacao).toBe('Em Andamento');
      expect(response.body.identificacao).toBe(true);
      expect(response.body.userId).toBe(1);
      // Validação do padrão do protocolo SOS-YYYY-XXXXXXXX
      expect(response.body.protocolo).toMatch(/^SOS-\d{4}-[A-Z0-9]{8}$/);
    });

    it('CT-DEN-02: Deve registrar denúncia anônima ocultando a identidade com nome Anônimo', async () => {
      const payload = {
        tipoDenuncia: 'Foco de Dengue / Entulho',
        identificacao: false,
        bairroOcorrencia: 'Espinheiro',
        descricaoOcorrencia: 'Água parada em terreno baldio com pneus acumulados',
        dataOcorrencia: '2026-09-08',
      };

      const response = await request(app)
        .post('/denuncias')
        .set('Authorization', getBearerHeader(tokenDenunciante))
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.identificacao).toBe(false);
      expect(response.body.nomeDenunciante).toBe('Anônimo');

      const storedDenuncia = mockPrisma.denuncia.create.mock.calls[0][0].data;
      expect(storedDenuncia.nomeDenunciante).not.toBe('Anônimo');
    });

    it('CT-DEN-03: Deve aceitar imagens em base64 e retornar o campo desserializado como array', async () => {
      const payload = {
        tipoDenuncia: 'Calçada Destruída',
        identificacao: true,
        bairroOcorrencia: 'Derby',
        descricaoOcorrencia: 'Calçada totalmente intransitável com risco a pedestres e cadeirantes',
        dataOcorrencia: '2026-09-09',
        imagens: [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        ],
      };

      const response = await request(app)
        .post('/denuncias')
        .set('Authorization', getBearerHeader(tokenDenunciante))
        .send(payload);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.imagens)).toBe(true);
      expect(response.body.imagens.length).toBe(1);
      expect(response.body.imagens[0]).toContain('data:image/png;base64');
    });

    it('CT-DEN-04: Deve rejeitar criação de denúncia sem autenticação e responder status 401', async () => {
      const response = await request(app)
        .post('/denuncias')
        .send({
          tipoDenuncia: 'Buraco',
          identificacao: true,
          bairroOcorrencia: 'Madalena',
          descricaoOcorrencia: 'Buraco na rua',
          dataOcorrencia: '2026-09-09',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /denuncias - Listagem e Paginação', () => {
    it('CT-DEN-05: Deve listar denúncias com paginação padrão (página 1, limite 50) e metadados', async () => {
      const response = await request(app)
        .get('/denuncias')
        .set('Authorization', getBearerHeader(tokenGestor));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 50,
        total: expect.any(Number),
      });
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('CT-DEN-06: Deve respeitar parâmetros customizados de paginação _page e _limit', async () => {
      const response = await request(app)
        .get('/denuncias?_page=2&_limit=1')
        .set('Authorization', getBearerHeader(tokenGestor));

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(1);
    });

    it('CT-DEN-07: Deve recuperar dados do cache Redis quando disponíveis para otimizar tempo de resposta', async () => {
      const fakeCache = {
        data: [{ id: 999, tipoDenuncia: 'Denúncia de Cache', protocolo: 'SOS-CACHE-1' }],
        meta: { total: 1, page: 1, limit: 50 },
      };

      mockRedisMethods.redisGet.mockResolvedValueOnce(JSON.stringify(fakeCache));

      const response = await request(app)
        .get('/denuncias?_page=1&_limit=50')
        .set('Authorization', getBearerHeader(tokenGestor));

      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBe(999);
      expect(mockRedisMethods.redisGet).toHaveBeenCalledWith('denuncias:1:50');
    });

    it('CT-DEN-08: Deve rejeitar listagem sem token e retornar status 401', async () => {
      const response = await request(app).get('/denuncias');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /denuncias/:id - Detalhamento de Denúncia', () => {
    it('CT-DEN-09: Deve retornar os detalhes completos de uma denúncia existente com status 200', async () => {
      const response = await request(app)
        .get('/denuncias/1')
        .set('Authorization', getBearerHeader(tokenDenunciante));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.tipoDenuncia).toBe('Buraco na Via');
      expect(response.body.bairroOcorrencia).toBe('Boa Viagem');
      expect(Array.isArray(response.body.imagens)).toBe(true);
    });

    it('CT-DEN-10: Deve retornar status 404 quando a denúncia não for localizada', async () => {
      const response = await request(app)
        .get('/denuncias/99999')
        .set('Authorization', getBearerHeader(tokenDenunciante));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'Not found',
      });
    });

    it('CT-DEN-11: Deve rejeitar consulta por ID sem token de autenticação com status 401', async () => {
      const response = await request(app).get('/denuncias/1');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /denuncias/:id - Atualização de Ocorrências', () => {
    it('CT-DEN-12: Gestor deve conseguir atualizar a situação de uma ocorrência para Finalizada', async () => {
      const response = await request(app)
        .patch('/denuncias/1')
        .set('Authorization', getBearerHeader(tokenGestor))
        .send({ situacao: 'Finalizada' });

      expect(response.status).toBe(200);
      expect(response.body.situacao).toBe('Finalizada');
    });

    it('CT-DEN-13: Deve atualizar fotos/imagens anexadas na denúncia', async () => {
      const novasImagens = [
        'data:image/png;base64,nova_foto_1',
        'data:image/png;base64,nova_foto_2',
      ];

      const response = await request(app)
        .patch('/denuncias/1')
        .set('Authorization', getBearerHeader(tokenGestor))
        .send({ imagens: novasImagens });

      expect(response.status).toBe(200);
      expect(response.body.imagens).toEqual(novasImagens);
    });

    it('CT-DEN-14: Deve rejeitar atualização sem autenticação com status 401', async () => {
      const response = await request(app)
        .patch('/denuncias/1')
        .send({ situacao: 'Finalizada' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /denuncias/:id - Exclusão de Ocorrências', () => {
    it('CT-DEN-15: Deve remover a denúncia existente e responder com status 200 { success: true }', async () => {
      const response = await request(app)
        .delete('/denuncias/2')
        .set('Authorization', getBearerHeader(tokenGestor));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      const verify = await request(app)
        .get('/denuncias/2')
        .set('Authorization', getBearerHeader(tokenGestor));

      expect(verify.status).toBe(404);
    });

    it('CT-DEN-16: Deve rejeitar exclusão sem autenticação com status 401', async () => {
      const response = await request(app).delete('/denuncias/1');

      expect(response.status).toBe(401);
    });
  });

  describe('Invalidação de Cache no Redis', () => {
    it('CT-DEN-17: Operações de escrita (POST, PATCH, DELETE) devem invalidar o cache de listagem', async () => {
      mockRedisMethods.redisKeys.mockResolvedValueOnce(['denuncias:1:50', 'denuncias:2:10']);

      await request(app)
        .patch('/denuncias/1')
        .set('Authorization', getBearerHeader(tokenGestor))
        .send({ situacao: 'Finalizada' });

      expect(mockRedisMethods.redisKeys).toHaveBeenCalledWith('denuncias:*');
      expect(mockRedisMethods.redisDel).toHaveBeenCalledWith('denuncias:1:50', 'denuncias:2:10');
    });
  });
});
