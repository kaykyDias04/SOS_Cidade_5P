const { summarize } = require('./run.cjs');
const { compatible } = require('./context.cjs');
function groupedMetrics(runs) {
  const groups = new Map();
  for (const run of runs) {
    // Evidência legada sem fingerprint não demonstra equivalência nem da árvore local.
    const key = run.sourceDigest && run.environmentKey ? `${run.commit}:${run.sourceDigest}:${run.environmentKey}` : `legacy:${run.path ?? run.time}:${run.suite}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(run);
  }
  return [...groups.entries()].flatMap(([contextKey, group]) => summarize(group.flatMap(r => (r.records ?? []).map(a => ({ ...a, runTime: r.time, runId: r.runId, source: r.path })))).map(m => ({ ...m, contextKey, commit: group[0].commit, sourceDigest: group[0].sourceDigest ?? null, environmentKey: group[0].environmentKey ?? null, environment: group[0].environment ?? null })));
}
function currentCoverage(rows, runs, current, config, now = Date.now()) {
  const recent = runs.filter(r => compatible(r, current) && now - Date.parse(r.time) <= config.evidenceMaxAgeHours * 3600000 && Date.parse(r.time) <= now);
  return rows.map(row => {
    const suite = row.file.startsWith('backend/') ? 'backend' : row.file.startsWith('frontend/') ? 'frontend' : row.file.startsWith('e2e/') ? 'e2e' : 'api';
    const runsForTest = recent.map(run => {
      const observations = (run.records ?? []).filter(a => a.file === row.file && (row.id ? a.id === row.id : a.name === row.name || a.name?.endsWith(row.title)));
      const suiteRelevant = run.suite === suite || (suite === 'e2e' && run.suite === 'smoke' && /@smoke/.test(row.title));
      const runnerFailed = suiteRelevant && run.attempts?.some(a => a.reportMissing);
      const fileFailed = (run.records ?? []).some(a => a.file === row.file && a.status === 'environment-error');
      if (runnerFailed || fileFailed) observations.push({ status: 'environment-error', error: 'A execução mais recente não comprovou este caso.' });
      return { run, observations };
    }).filter(r => r.observations.length).sort((a, b) => a.run.time.localeCompare(b.run.time));
    const latest = runsForTest.at(-1);
    const approved = latest?.observations.length && latest.observations.every(a => a.status === 'passed' && !a.skipped);
    const evidenceStatus = row.disabled ? 'disabled' : !latest ? 'no-recent-evidence' :
      latest.observations.some(a => ['failed', 'timedOut', 'interrupted'].includes(a.status)) ? 'failed' :
      latest.observations.some(a => a.status === 'environment-error') ? 'execution-error' :
      approved ? 'passed' : 'not-executed';
    return { ...row, covered: Boolean(!row.disabled && approved), evidenceStatus, latest: latest ? { time: latest.run.time, observations: latest.observations } : null };
  });
}
function exitCandidate(entry, runs, config) {
  const verification = entry.exitVerification;
  if (!verification?.commit || !verification.sourceDigest || !verification.environmentKey || !verification.fixedAt) return false;
  const selected = runs.filter(r => r.mode === 'quarantine' && compatible(r, verification) && Date.parse(r.time) >= Date.parse(verification.fixedAt)).sort((a, b) => a.time.localeCompare(b.time));
  const observations = selected.map(r => {
    const tests = (r.records ?? []).filter(a => a.id === entry.id && a.file === entry.file);
    return { status: tests.length && tests.some(a => a.attempt === 1) && tests.every(a => a.status === 'passed' && !a.skipped) && !r.attempts?.some(a => a.reportMissing) ? 'passed' : 'failed', attempt: 1, run: `${r.runId ?? 'local'}:${r.time}` };
  });
  const last = observations.slice(-config.exitConsecutivePasses);
  // Retries não são amostras de estabilidade. Exigir tentativas iniciais em execuções distintas.
  return last.length === config.exitConsecutivePasses && last.every(a => a.status === 'passed' && a.attempt === 1) && new Set(last.map(a => a.run)).size === config.exitConsecutivePasses;
}
function missingReportAudit(runs, current) {
  return runs.filter(r => r.attempts?.some(a => a.reportMissing)).map(run => ({
    suite: run.suite, time: run.time, commit: run.commit, source: run.path,
    current: compatible(run, current),
    status: compatible(run, current) ? 'current-runner-error' : 'historical-runner-error',
    interpretation: 'Erro de infraestrutura/configuração antes de relatório; não é evidência de defeito ou flaky do produto.',
  }));
}
module.exports = { groupedMetrics, currentCoverage, exitCandidate, missingReportAudit };
