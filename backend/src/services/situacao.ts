// Máquina de estados da situação da denúncia.
//
// O fluxo do SOS Cidade tem uma etapa só: a denúncia nasce "Em Andamento" e o
// gestor a encerra como "Finalizada". O app mobile chama o estado final de
// "Resolvido", por isso os dois nomes valem como estado final.
//
// Regras (plano de testes, HU-13 adaptada, R2-CT-53 a R2-CT-55):
// - estado final não volta para "Em Andamento" (não retrocede);
// - repetir o status atual não é transição;
// - status fora do fluxo é recusado.
// Qualquer violação responde 409 INVALID_STATUS_TRANSITION.

const EM_ANDAMENTO = 'em andamento';
const ESTADOS_FINAIS = new Set(['finalizada', 'resolvido']);
const ESTADOS_CONHECIDOS = new Set([EM_ANDAMENTO, ...ESTADOS_FINAIS]);

export class TransicaoInvalidaError extends Error {
  readonly status = 409;
  readonly code = 'INVALID_STATUS_TRANSITION';

  constructor(atual: string, nova: string) {
    super(`Transição de situação não permitida: "${atual}" para "${nova}"`);
    this.name = 'TransicaoInvalidaError';
  }
}

export class DenunciaNaoEncontradaError extends Error {
  readonly status = 404;
  readonly code = 'NOT_FOUND';

  constructor() {
    super('Denúncia não encontrada');
    this.name = 'DenunciaNaoEncontradaError';
  }
}

const normalizar = (s: unknown) => (typeof s === 'string' ? s.trim().toLowerCase() : '');

export function transicaoPermitida(atual: unknown, nova: unknown): boolean {
  const de = normalizar(atual);
  const para = normalizar(nova);

  if (!ESTADOS_CONHECIDOS.has(para)) return false; // status fora do fluxo
  if (de === para) return false; // repetição do status atual
  if (ESTADOS_FINAIS.has(de)) return false; // estado final não retrocede nem muda
  return true; // "Em Andamento" (ou valor legado desconhecido) para estado final
}

export function validarTransicao(atual: string, nova: string): void {
  if (!transicaoPermitida(atual, nova)) {
    throw new TransicaoInvalidaError(atual, nova);
  }
}
