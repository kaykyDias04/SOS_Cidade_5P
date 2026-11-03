import jwt from 'jsonwebtoken';
import { authenticate } from '../../src/middlewares/auth.middleware';
import { comoReq, comoRes, criarRes } from './helpers/http';

const segredo = () => process.env.JWT_SECRET as string;
const denunciante = { id: 1, email: 'denunciante@sos.com', role: 'DENUNCIANTE' };

describe('authenticate: sessão por cookie authToken ou Authorization Bearer', () => {
  it('UN-SESSAO-01: sem token recebe 401 e a rota não executa', () => {
    const res = criarRes();
    const next = jest.fn();

    authenticate(comoReq({ cookies: {}, headers: {} }), comoRes(res), next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('UN-SESSAO-02: token assinado com outro segredo recebe 403', () => {
    const res = criarRes();
    const next = jest.fn();
    const forjado = jwt.sign({ ...denunciante, role: 'GESTOR' }, 'segredo-de-quem-ataca');

    authenticate(comoReq({ cookies: { authToken: forjado }, headers: {} }), comoRes(res), next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('UN-SESSAO-03: token expirado recebe 403', () => {
    const res = criarRes();
    const next = jest.fn();
    const expirado = jwt.sign({ ...denunciante, exp: Math.floor(Date.now() / 1000) - 60 }, segredo());

    authenticate(comoReq({ cookies: { authToken: expirado }, headers: {} }), comoRes(res), next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('UN-SESSAO-04: token válido no cookie authToken passa e expõe o usuário', () => {
    const res = criarRes();
    const next = jest.fn();
    const req = comoReq({ cookies: { authToken: jwt.sign(denunciante, segredo()) }, headers: {} });

    authenticate(req, comoRes(res), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user).toMatchObject(denunciante);
  });

  it('UN-SESSAO-05: token válido no cabeçalho Authorization Bearer passa', () => {
    const res = criarRes();
    const next = jest.fn();
    const token = jwt.sign(denunciante, segredo());
    const req = comoReq({ cookies: {}, headers: { authorization: `Bearer ${token}` } });

    authenticate(req, comoRes(res), next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req as any).user.id).toBe(1);
  });
});
