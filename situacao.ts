// Fonte única dos valores de `situacao` de uma denúncia.
// Origem: tela do gestor no frontend (edit-status-cell: "Em andamento" / "Finalizada"),
// valor inicial do schema Prisma e fixtures dos testes ("Em Andamento" / "Finalizada").
export const SITUACAO_INICIAL = 'Em Andamento';
export const SITUACOES_VALIDAS = [SITUACAO_INICIAL, 'Finalizada'] as const;

export type Situacao = (typeof SITUACOES_VALIDAS)[number];

// Aceita variação de caixa (o frontend web envia "Em andamento") e devolve o valor canônico.
// Retorna null quando o valor não pertence à lista.
export function normalizarSituacao(valor: unknown): Situacao | null {
  if (typeof valor !== 'string') return null;
  const chave = valor.trim().toLowerCase();
  return SITUACOES_VALIDAS.find((s) => s.toLowerCase() === chave) ?? null;
}
