// Lê o formulário de manutenção (.github/ISSUE_TEMPLATE/manutencao.yml)
// e sincroniza as labels falha:*, prioridade:* e flaky da issue.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const GERENCIADAS = /^(falha:|prioridade:)/;

/** Texto da resposta logo abaixo de "### <titulo>" no corpo da issue. */
export function resposta(corpo, titulo) {
  const linhas = (corpo ?? '').replace(/\r\n/g, '\n').split('\n');
  const i = linhas.findIndex((l) => l.trim() === `### ${titulo}`);
  if (i < 0) return null;
  for (const l of linhas.slice(i + 1)) {
    if (l.startsWith('### ')) return null;
    if (l.trim()) return l.trim();
  }
  return null;
}

/** Decide quais labels entram e quais saem, a partir do corpo e das labels atuais. */
export function planejar(corpo, atuais) {
  const tipo = resposta(corpo, 'Tipo de falha');
  const prioridade = resposta(corpo, 'Prioridade');
  if (tipo === null && prioridade === null) return null; // não é issue do formulário

  const desejadas = new Set();
  for (const valor of [tipo, prioridade]) {
    const m = valor?.match(/\(((?:falha|prioridade):[a-z]+)\)\s*$/);
    if (m) desejadas.add(m[1]);
  }

  const instavel = resposta(corpo, 'O teste é instável?');
  const adicionar = [...desejadas].filter((l) => !atuais.includes(l));
  const remover = atuais.filter((l) => GERENCIADAS.test(l) && !desejadas.has(l));
  if (instavel === 'Sim' && !atuais.includes('flaky')) adicionar.push('flaky');
  if (instavel === 'Não' && atuais.includes('flaky')) remover.push('flaky');
  return { adicionar, remover };
}

async function api(metodo, caminho, corpo) {
  const r = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${caminho}`, {
    method: metodo,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (!r.ok && r.status !== 404) throw new Error(`${metodo} ${caminho}: HTTP ${r.status}`);
}

async function main() {
  const { issue } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const plano = planejar(issue.body, issue.labels.map((l) => l.name));
  if (!plano) return console.log('Issue fora do formulário de manutenção: nada a fazer.');

  const base = `/issues/${issue.number}/labels`;
  if (plano.adicionar.length) await api('POST', base, { labels: plano.adicionar });
  for (const l of plano.remover) await api('DELETE', `${base}/${encodeURIComponent(l)}`);
  console.log(`#${issue.number} adicionadas: ${plano.adicionar.join(', ') || 'nenhuma'}; removidas: ${plano.remover.join(', ') || 'nenhuma'}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
