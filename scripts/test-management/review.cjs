const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { root, policy, registry, save, validate } = require('./common.cjs');
const { context, compatible } = require('./context.cjs');
const { groupedMetrics, currentCoverage, exitCandidate, missingReportAudit } = require('./evidence.cjs');
const traceability = require('./traceability.json');
function summaries(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder, { recursive: true }).filter(f => f.endsWith('summary.json')).map(f => ({ path: path.join(folder, f), ...JSON.parse(fs.readFileSync(path.join(folder, f), 'utf8')) }));
}
function review() {
  const rows = validate();
  if (process.argv.includes('--validate')) { console.log(`Política válida: ${rows.filter(r => !r.group).length} testes, ${registry.length} em quarentena`); return; }
  const runs = [...summaries(path.join(root, 'resultados/gestao')), ...summaries(path.join(root, 'relatorios/quarentena')), ...summaries(path.join(root, 'history')).filter(r => !r.path.includes(`${path.sep}selftest${path.sep}`))];
  // Artefatos repetidos não podem inflar o número de amostras.
  const unique = [...new Map(runs.map(r => [`${r.runId ?? 'local'}:${r.suite}:${r.mode}:${r.time}`, r])).values()];
  const current = context();
  const metrics = groupedMetrics(unique);
  const audit = missingReportAudit(unique, current);
  const config = policy.review;
  const findings = [];
  for (const run of audit.filter(r => r.current)) findings.push({ type: 'execucao-atual-sem-relatorio', file: run.suite, action: 'Inspecionar stderr.log e código de saída; não contabilizar como execução aprovada.' });
  for (const m of metrics.filter(m => compatible(m, current))) {
    const observed = m.attempts.filter(a => !a.skipped && !['skipped', 'pending', 'todo'].includes(a.status));
    if (m.classification === 'intermittent-suspect') findings.push({ type: 'instabilidade-suspeita', file: m.file, name: m.name, action: 'Investigar timing, corrida, massa compartilhada, dependência externa; não aprovar automaticamente quarentena.' });
    if (observed.length >= config.minimumSamples && m.failureRate >= config.failureRate) findings.push({ type: 'frequencia-falhas', file: m.file, name: m.name, value: m.failureRate, action: 'Triar em 1 dia útil; falha reproduzível continua bloqueando.' });
    if (m.averageMs > config.averageMs || m.maximumMs > config.maximumMs) findings.push({ type: 'lentidao', file: m.file, name: m.name, averageMs: m.averageMs, maximumMs: m.maximumMs, action: 'Otimizar setup/asserts sem relaxar oráculos.' });
  }
  for (const e of registry) {
    const days = (Date.now() - Date.parse(e.since)) / 86400000;
    if (days >= config.quarantineDays) findings.push({ type: 'quarentena-antiga', id: e.id, owner: e.owner, days: Math.floor(days), action: 'Priorizar correção e reavaliar risco com QA.' });
    if (exitCandidate(e, unique, config)) findings.push({ type: 'candidato-saida-quarentena', id: e.id, action: 'Sequência da revisão corrigida e ambiente equivalente comprovada; retirada ainda exige aprovação humana.' });
  }
  const files = [...new Set(rows.map(r => r.file))];
  const blocks = new Map();
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const lines = source.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('//'));
    for (let i = 0; i <= lines.length - config.duplicateLines; i++) {
      const key = lines.slice(i, i + config.duplicateLines).join('\n');
      if (!blocks.has(key)) blocks.set(key, new Set());
      blocks.get(key).add(file);
    }
    const patterns = [/waitForTimeout\(/, /setTimeout\(/, /Date\.now\(/, /describe\.serial\(/, /\.catch\(\(\) => \{\}\)/];
    for (const p of patterns) if (p.test(source)) findings.push({ type: 'revisao-humana-de-causa', file, pattern: p.source, action: 'Inspecionar isolamento, relógio, dependências entre casos e erros ignorados; sinal estático não prova flaky.' });
    if (!traceability.some(t => t.file === file)) findings.push({ type: 'rastreabilidade-incompleta', file, action: 'Relacionar requisito e CA ou registrar como detalhe técnico/pressuposto; não inventar HU.' });
    const last = cp.spawnSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: root, encoding: 'utf8' });
    const age = (Date.now() - Date.parse(last.stdout.trim())) / 86400000;
    if (age > config.unmaintainedDays) findings.push({ type: 'sem-manutencao-recente', file, days: Math.floor(age), action: 'Conferir vigência do requisito; idade isolada não autoriza remoção.' });
  }
  const duplicates = [...new Set([...blocks.values()].filter(s => s.size > 1).map(s => [...s].sort().join(' | ')))];
  duplicates.forEach(files => findings.push({ type: 'duplicacao-candidata', files, action: `Trecho idêntico de ${config.duplicateLines} linhas; revisar extração de helper, sem remover cobertura.` }));
  const criticalRows = rows.filter(r => !r.group && (policy.criticalIds.includes(r.id) || policy.criticalFiles.includes(r.file)));
  const coverage = currentCoverage(criticalRows, unique, current, config);
  const coverageLabels = {
    'no-recent-evidence': ['teste-critico-sem-evidencia-recente', 'Não há execução recente compatível; isso não significa teste reprovado. Executar no contexto atual.'],
    failed: ['teste-critico-reprovado', 'Há resultado de falha na execução atual mais recente. Investigar o erro registrado.'],
    'execution-error': ['teste-critico-com-erro-de-execucao', 'Runner/carregamento falhou; não há comprovação de execução válida do caso.'],
    'not-executed': ['teste-critico-nao-executado', 'Caso sem resultado executado válido; conferir seleção ou desativação.'],
    disabled: ['teste-critico-desativado', 'Restaurar o caso protegido; não considerar cobertura aprovada.'],
  };
  for (const row of coverage.filter(r => !r.covered)) {
    const [type, action] = coverageLabels[row.evidenceStatus];
    findings.push({ type, evidenceStatus: row.evidenceStatus, id: row.id, file: row.file, name: row.name, action });
  }
  const result = { type: process.env.REVIEW_TYPE ?? 'local', current, historicalRunnerErrors: audit, coverage, time: new Date().toISOString(), sourceRuns: unique.map(r => ({ suite: r.suite, mode: r.mode, commit: r.commit, sourceDigest: r.sourceDigest ?? null, environmentKey: r.environmentKey ?? null, time: r.time, runId: r.runId })), limitations: ['Histórico restrito a artefatos ainda disponíveis, até 10 execuções por workflow da branch padrão.', 'Estabilidade observada não demonstra ausência de defeitos.', 'Duplicação é heurística textual. Obsolescência, equivalência de cobertura e aceitação de riscos exigem revisão humana.', 'Matriz por arquivo é referência ao plano, não validação semântica dos critérios de aceite.'], thresholds: config, inventory: rows, traceability, metrics, findings };
  save(path.join(root, 'relatorios/gestao/review.json'), result);
  const cell = s => String(s ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
  const auditText = audit.map(r => '- ' + r.status + ': ' + r.suite + ', ' + r.time + '. ' + r.interpretation).join('\n');
  const md = `# Revisão de gestão dos testes\n\nTipo: ${result.type}. Gerado: ${result.time}\n\nExecuções disponíveis: ${unique.length}. Testes com métricas: ${metrics.length}. Achados: ${findings.length}.\n\n## Métricas por revisão e ambiente\n\n| SHA / fonte / ambiente | ID / teste | Arquivo | Amostras | Falhas | Média ms | Máximo ms | Classificação |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${metrics.map(m => `| ${cell(m.commit?.slice(0,7))} / ${cell(m.sourceDigest?.slice(0,8) ?? "legado")} / ${cell(m.environmentKey?.slice(0,8) ?? "desconhecido")} | ${cell(m.id ?? m.name)} | ${cell(m.file)} | ${m.attempts.length} | ${m.failureRate === null ? 'n/a' : (m.failureRate * 100).toFixed(1) + '%'} | ${m.averageMs?.toFixed(1) ?? 'n/a'} | ${m.maximumMs ?? 'n/a'} | ${m.classification} |`).join('\n')}\n\n## Auditoria de erros antigos e atuais\n\n${auditText}\n\n## Ações propostas (não são aprovações)\n\n${findings.map(f => `- **${f.type}**: ${cell(f.id ?? f.file ?? f.files)}. ${f.action}`).join('\n')}\n\n## Limitações\n\n${result.limitations.map(l => '- ' + l).join('\n')}\n`;
  fs.mkdirSync(path.join(root, 'relatorios/gestao'), { recursive: true });
  fs.writeFileSync(path.join(root, 'relatorios/gestao/review.md'), md);
  console.log(`Relatório: relatorios/gestao/review.md (${findings.length} achados)`);
}
if (require.main === module) { try { review(); } catch (e) { console.error(e); process.exitCode = 1; } }
module.exports = { review };
