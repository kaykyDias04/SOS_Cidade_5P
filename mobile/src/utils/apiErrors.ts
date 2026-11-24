/** Mensagens de erro de comunicação com a API, sempre em português e legíveis para o usuário. */

export const MSG_OFFLINE = 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
export const MSG_TIMEOUT = 'O servidor demorou para responder. Tente novamente.';
export const MSG_SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente.';
export const MSG_SERVIDOR = 'Erro no servidor. Tente novamente em instantes.';
export const MSG_RESPOSTA_INVALIDA = 'Resposta inválida do servidor.';

/** Textos que o backend devolve em inglês, traduzidos. Mensagens em português passam direto. */
const MENSAGENS_DO_BACKEND: Record<string, string> = {
  'Invalid credentials': 'E-mail ou senha incorretos.',
  Unauthorized: MSG_SESSAO_EXPIRADA,
  Forbidden: 'Você não tem permissão para esta ação.',
  'Not found': 'Item não encontrado.',
  'Internal server error': MSG_SERVIDOR,
  'Erro interno no servidor': MSG_SERVIDOR,
};

export function traduzirErro(status: number | undefined, mensagem?: string): string {
  if (status !== undefined && status >= 500) return MSG_SERVIDOR;
  if (mensagem && MENSAGENS_DO_BACKEND[mensagem]) return MENSAGENS_DO_BACKEND[mensagem];
  if (mensagem) return mensagem;
  return status ? `Erro inesperado (código ${status}).` : 'Erro inesperado.';
}

function decodificarBase64Url(valor: string): string | null {
  const atobGlobal = (globalThis as { atob?: (dados: string) => string }).atob;
  if (!atobGlobal) return null;
  const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
  const preenchido = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    return atobGlobal(preenchido);
  } catch {
    return null;
  }
}

/** Lê o campo `exp` (segundos) do JWT sem validar a assinatura. Só serve para saber se já venceu. */
export function tokenExpirado(token: string, agora: number = Date.now()): boolean {
  const partes = token.split('.');
  if (partes.length !== 3) return false;
  const json = decodificarBase64Url(partes[1]);
  if (!json) return false;
  try {
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' && exp * 1000 <= agora;
  } catch {
    return false;
  }
}
