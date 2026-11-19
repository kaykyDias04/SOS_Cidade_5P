const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { root, policy, registry, tag, save, integer, validate } = require('./common.cjs');
function quarantineEvidence(expected, records, initialAttempt = 1) {
  const validStatuses = new Set(['passed', 'failed', 'timedOut', 'interrupted']);
  const missing = expected.flatMap(test => {
    const matches = records.filter(r => r && r.id === test.id && r.file === test.file &&
      typeof r.name === 'string' && (r.name === test.name || r.name.endsWith(test.title)));
    const executed = matches.some(r => !r.skipped && validStatuses.has(r.status) &&
      Number.isInteger(r.attempt) && r.attempt === initialAttempt);
    return executed ? [] : [{ id: test.id, file: test.file, title: test.title,
      reason: matches.length ? 'sem resultado válido da tentativa inicial' : 'ausente do relatório' }];
  });
  return { expected: expected.length, executed: expected.length - missing.length, missing };
}
function summarize(records) {
  const groups = new Map();
  for (const r of records) {
    const key = `${r.file}:${r.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  return [...groups.values()].map(attempts => {
    const observed = attempts.filter(a => !a.skipped && !['pending', 'skipped', 'todo'].includes(a.status));
    const failures = observed.filter(a => a.status !== 'passed');
    const durations = observed.map(a => a.durationMs);
    return { file: attempts[0].file, name: attempts[0].name, id: attempts[0].id, attempts,
      classification: !observed.length ? 'not-executed' : attempts.some(a => a.status === 'environment-error') ? 'environment-investigation' : !failures.length ? 'stable-observed' : failures.length === observed.length && observed.length >= 2 ? 'reproducible-failure' : failures.length < observed.length ? 'intermittent-suspect' : 'single-failure-investigate',
      failureRate: observed.length ? failures.length / observed.length : null,
      averageMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
      maximumMs: durations.length ? Math.max(...durations) : null };
  });
}
function run(suite, mode) {
  const rows = validate();
  if (!['normal', 'quarantine', 'diagnostic'].includes(mode)) throw Error(`Modo inválido: ${mode}`);
  const folders = { backend: 'backend/tests/unit/', api: 'tests/', frontend: 'frontend/tests/', e2e: 'e2e/tests/', smoke: 'e2e/tests/' };
  if (!folders[suite]) throw Error(`Suíte inválida: ${suite}`);
  const quarantine = mode === 'quarantine';
  const expected = quarantine ? rows.filter(r => !r.group && r.file.startsWith(folders[suite]) &&
    tag.test(r.title) && (suite !== 'smoke' || /@smoke/.test(r.name))).map(r => {
      const entry = registry.find(e => e.id === r.id && e.file === r.file && e.title === r.title);
      // validate() já exige correspondência exata entre inventário e registro.
      if (!entry) throw Error(`Teste esperado sem registro: ${r.id}`);
      return { id: entry.id, file: entry.file, title: entry.title, name: r.name };
    }) : [];
  const retries = integer(process.env.QUARANTINE_RETRIES, policy.quarantineRetries);
  const repeats = mode === 'diagnostic' ? integer(process.env.DIAGNOSTIC_RUNS, policy.diagnosticRuns, 2) : quarantine && !['e2e', 'smoke'].includes(suite) ? retries + 1 : 1;
  const base = path.join(root, quarantine ? 'relatorios/quarentena' : 'resultados/gestao', mode, suite, `${Date.now()}-${process.pid}`);
  fs.mkdirSync(base, { recursive: true });
  const evidenceContext = require('./context.cjs').context();
  const summary = { suite, mode, time: new Date().toISOString(), ...evidenceContext, runId: process.env.GITHUB_RUN_ID ?? null, attempts: [], records: [], exitCode: 0 };
  if (quarantine) summary.expectedTests = expected;
  if (quarantine && !expected.length) {
    summary.emptyQuarantine = true;
    save(path.join(base, 'summary.json'), summary);
    console.log('Quarentena vazia: nenhum teste de produção marcado.');
    return 0;
  }
  for (let attempt = 1; attempt <= repeats; attempt++) {
    const dir = path.join(base, `attempt-${attempt}`);
    fs.mkdirSync(dir, { recursive: true });
    const env = { ...process.env, TEST_MODE: quarantine ? 'quarantine' : 'normal', TEST_REPORT_DIR: dir, TEST_ATTEMPT: String(attempt), QUARANTINE_RETRIES: String(retries) };
    let cwd = root;
    let args;
    if (['backend', 'api'].includes(suite)) {
      cwd = path.join(root, suite === 'backend' ? 'backend' : 'tests');
      args = [path.join(root, 'backend/node_modules/jest/bin/jest.js'), '--config', 'jest.config.js', '--runInBand'];
      // Cobertura do backend no artefato (resultados/cobertura/, ver tests/jest.config.js).
      if (suite === 'api' && !quarantine) args.push('--coverage');
    } else if (suite === 'frontend') {
      args = ['--test', quarantine ? '--test-name-pattern=(?:^|\\s)@flaky(?:\\s|$)' : '--test-skip-pattern=(?:^|\\s)@flaky(?:\\s|$)', '--test-reporter='+pathToFileURL(path.join(__dirname, 'frontend-reporter.mjs')).href, ...fs.readdirSync(path.join(root, 'frontend/tests')).filter(f => f.endsWith('.test.mjs')).map(f => path.join(root, 'frontend/tests', f))];
    } else {
      cwd = path.join(root, 'e2e');
      args = [path.join(cwd, 'node_modules/@playwright/test/cli.js'), 'test'];
      if (suite === 'smoke') args.push('--grep', '@smoke');
      if (process.env.E2E_HEADED === '1') args.push('--headed');
    }
    const start = Date.now();
    const result = cp.spawnSync(process.execPath, args, { cwd, env, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    fs.writeFileSync(path.join(dir, 'stdout.log'), result.stdout ?? '');
    fs.writeFileSync(path.join(dir, 'stderr.log'), result.stderr ?? String(result.error ?? ''));
    process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '');
    const reportPath = path.join(dir, 'attempt.json');
    const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath)) : { records: [{ framework: suite, file: '', name: '<runner sem relatório>', id: null, status: 'environment-error', durationMs: Date.now() - start, attempt, error: result.stderr || String(result.error ?? 'Nenhum relatório gerado') }] };
    let code = result.status ?? 1;
    if (report.records.some(r => ['failed', 'timedOut', 'interrupted', 'environment-error'].includes(r.status))) code = 1;
    if (!report.records.length && !quarantine) code = 1;
    const executionEvidence = quarantine ? quarantineEvidence(expected, report.records, ['e2e', 'smoke'].includes(suite) ? 1 : attempt) : undefined;
    if (executionEvidence?.missing.length) {
      code = 1;
      console.error('Quarentena sem execução comprovada:', JSON.stringify(executionEvidence.missing));
    }
    summary.attempts.push({ attempt, exitCode: code, durationMs: Date.now() - start, reportMissing: !fs.existsSync(reportPath), ...(quarantine ? { quarantineEvidence: executionEvidence } : {}) });
    summary.records.push(...report.records.map(r => ({ ...r, attempt: ['e2e', 'smoke'].includes(suite) ? (attempt - 1) * (retries + 1) + r.attempt : attempt })));
    if (code) summary.exitCode = 1; // Uma falha anterior nunca vira aprovação por repetição.
    save(path.join(base, 'summary.json'), { ...summary, tests: summarize(summary.records) });
  }
  console.log(`Evidências: ${base}`);
  return summary.exitCode;
}
module.exports = { run, summarize, quarantineEvidence };
if (require.main === module) {
  try { process.exitCode = run(process.argv[2], process.argv[3] ?? 'normal'); }
  catch (e) { console.error(e); process.exitCode = 1; }
}
