import {
  MSG_SESSAO_EXPIRADA,
  MSG_SERVIDOR,
  tokenExpirado,
  traduzirErro,
} from '../apiErrors';

function tokenComExpiracao(exp: number): string {
  return `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}

describe('traduzirErro', () => {
  it('traduz erro 401 de credenciais', () => {
    expect(traduzirErro(401, 'Invalid credentials')).toBe('E-mail ou senha incorretos.');
  });

  it('substitui mensagens de erro 5xx por mensagem amigável', () => {
    expect(traduzirErro(503, 'Internal server error')).toBe(MSG_SERVIDOR);
  });

  it('mantém mensagens em português do backend', () => {
    expect(traduzirErro(400, 'O bairro informado não existe.')).toBe('O bairro informado não existe.');
  });
});

describe('tokenExpirado', () => {
  const agora = 1_800_000_000_000;

  it('identifica um token vencido', () => {
    expect(tokenExpirado(tokenComExpiracao(agora / 1000 - 1), agora)).toBe(true);
  });

  it('não expira um token ainda válido', () => {
    expect(tokenExpirado(tokenComExpiracao(agora / 1000 + 60), agora)).toBe(false);
  });

  it('trata token malformado como não expirado', () => {
    expect(tokenExpirado('lixo')).toBe(false);
  });
});
