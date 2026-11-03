import { authorize } from '../../src/middlewares/authorize.middleware';
import { comoReq, comoRes, criarRes } from './helpers/http';

// TAS, backlog item 1: autorização por perfil (Denunciante x Gestor), 403 para perfil errado.
describe('authorize(perfil): autorização por perfil', () => {
  it('UN-PERFIL-01: GESTOR passa na rota exclusiva de GESTOR', () => {
    const res = criarRes();
    const next = jest.fn();

    authorize('GESTOR')(comoReq({ user: { id: 2, role: 'GESTOR' } }), comoRes(res), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UN-PERFIL-02: DENUNCIANTE na rota de GESTOR recebe 403 e a rota não executa', () => {
    const res = criarRes();
    const next = jest.fn();

    authorize('GESTOR')(comoReq({ user: { id: 1, role: 'DENUNCIANTE' } }), comoRes(res), next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('UN-PERFIL-03: requisição sem usuário autenticado recebe 403', () => {
    const res = criarRes();
    const next = jest.fn();

    authorize('GESTOR')(comoReq({}), comoRes(res), next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('UN-PERFIL-04: comparação de perfil é exata ("gestor" minúsculo não passa)', () => {
    const res = criarRes();
    const next = jest.fn();

    authorize('GESTOR')(comoReq({ user: { id: 2, role: 'gestor' } }), comoRes(res), next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
