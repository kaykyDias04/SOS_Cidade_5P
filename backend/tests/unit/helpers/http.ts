import { Request, Response } from 'express';

// Response falsa: status() e json() encadeiam como no Express e guardam as chamadas.
export function criarRes() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

export function comoReq(dados: object): Request {
  return dados as unknown as Request;
}

export function comoRes(res: ReturnType<typeof criarRes>): Response {
  return res as unknown as Response;
}
