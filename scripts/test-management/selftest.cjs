const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const os = require('node:os');
const { root, policy, validate, save } = require('./common.cjs');
const { summarize, quarantineEvidence } = require('./run.cjs');
const { groupedMetrics, currentCoverage, exitCandidate, missingReportAudit } = require('./evidence.cjs');

test('quarentena exige ID, arquivo e resultado da tentativa inicial de cada teste esperado', () => {
  const expected = [{ id: 'CT-DEMO-01', file: 'demo.test.ts', title: 'CT-DEMO-01 exemplo @flaky', name: 'CT-DEMO-01 exemplo @flaky' }];
  const result = { ...expected[0], status: 'passed', attempt: 1 };
  assert.equal(quarantineEvidence(expected, [result]).missing.length, 0);
  assert.equal(quarantineEvidence(expected, [{ ...result, attempt: 2 }], 2).executed, 1);
  for (const records of [[], [{ ...result, id: 'outro' }], [{ ...result, file: 'outro.ts' }],
    [{ ...result, skipped: true }], [{ ...result, attempt: 2 }],
    ...['pending', 'skipped', 'todo', 'environment-error', 'desconhecido'].map(status => [{ ...result, status }])]) {
    assert.equal(quarantineEvidence(expected, records).missing.length, 1);
  }
  assert.equal(quarantineEvidence(expected, [{ ...result, status: 'failed' }, { ...result, attempt: 2 }]).executed, 1);
  assert.deepEqual(quarantineEvidence([], []), { expected: 0, executed: 0, missing: [] });
});

test('histórico separa SHA, árvore local e ambiente; cobertura exige resultado atual', () => {
  const current = { commit: 'a'.repeat(40), sourceDigest: 'b'.repeat(64), environmentKey: 'c'.repeat(64) };
  const row = { id: 'CT-DEMO-01', file: 'demo.test.ts', name: 'demo', title: 'demo' };
  const record = status => ({ ...row, status, durationMs: 1, attempt: 1 });
  const now = Date.now();
  const run = (override = {}) => ({ ...current, time: new Date(now - 1000).toISOString(), mode: 'normal', suite: 'api', records: [record('passed')], ...override });
  const old = run({ commit: 'd'.repeat(40), records: [record('failed')] });
  const corrected = run();
  assert.deepEqual(groupedMetrics([old, corrected]).map(m => m.classification), ['single-failure-investigate', 'stable-observed']);
  assert.equal(groupedMetrics([old, corrected, run({ environmentKey: 'x' })]).length, 3);
  const coverage = data => currentCoverage([row], data, current, { evidenceMaxAgeHours: 24 }, now)[0].covered;
  assert.equal(coverage([old]), false);
  assert.equal(coverage([run({ sourceDigest: 'older-source' })]), false);
  assert.equal(coverage([run({ environmentKey: 'other-env' })]), false);
  assert.equal(coverage([run({ time: new Date(now - 48 * 3600000).toISOString() })]), false);
  assert.equal(coverage([corrected]), true);
  const state = data => currentCoverage([row], data, current, { evidenceMaxAgeHours: 24 }, now)[0].evidenceStatus;
  assert.equal(state([old]), 'no-recent-evidence');
  assert.equal(state([run({ records: [record('failed')] })]), 'failed');
  assert.equal(state([run({ records: [], attempts: [{ reportMissing: true }] })]), 'execution-error');
  assert.equal(coverage([run({ records: [record('failed'), { ...record('passed'), attempt: 2 }] })]), false);
  assert.equal(coverage([corrected, run({ time: new Date(now).toISOString(), records: [record('failed')] })]), false);
  assert.equal(coverage([corrected, run({ time: new Date(now).toISOString(), records: [], attempts: [{ reportMissing: true }] })]), false);
  assert.equal(missingReportAudit([run({ sourceDigest: undefined, attempts: [{ reportMissing: true }] })], current)[0].status, 'historical-runner-error');
});
test('saída exige revisão corrigida, ambiente e dez execuções independentes sem falha inicial', () => {
  const fixed = { commit: 'a'.repeat(40), sourceDigest: 'b'.repeat(64), environmentKey: 'c'.repeat(64), fixedAt: '2026-11-01T00:00:00Z' };
  const entry = { id: 'CT-DEMO-01', file: 'demo.test.ts', exitVerification: fixed };
  const records = [{ id: entry.id, file: entry.file, status: 'passed', attempt: 1 }];
  const runs = Array.from({ length: 10 }, (_, i) => ({ ...fixed, mode: 'quarantine', time: new Date(Date.parse(fixed.fixedAt) + i * 1000).toISOString(), records }));
  const config = { exitConsecutivePasses: 10 };
  assert.equal(exitCandidate(entry, runs, config), true);
  assert.equal(exitCandidate(entry, runs.slice(1), config), false);
  assert.equal(exitCandidate(entry, runs.map(r => ({ ...r, commit: 'old' })), config), false);
  assert.equal(exitCandidate(entry, runs.map(r => ({ ...r, environmentKey: 'other' })), config), false);
  assert.equal(exitCandidate(entry, runs.map(r => ({ ...r, records: [{ ...records[0], attempt: 2 }] })), config), false);
  assert.equal(exitCandidate(entry, [...runs.slice(0, 9), { ...runs[9], records: [{ ...records[0], status: 'failed' }, { ...records[0], attempt: 2 }] }], config), false);
  assert.equal(exitCandidate({ ...entry, exitVerification: undefined }, runs, config), false);
});

test('classificação não confirma flaky a partir de uma falha', () => {
  const r = status => ({ file: 'demo', name: 'demo', status, durationMs: 10 });
  assert.equal(summarize([r('failed')])[0].classification, 'single-failure-investigate');
  assert.equal(summarize([r('failed'), r('passed')])[0].classification, 'intermittent-suspect');
  assert.equal(summarize([r('failed'), r('failed')])[0].classification, 'reproducible-failure');
  assert.equal(summarize([r('environment-error')])[0].classification, 'environment-investigation');
});
test('tag sem registro e teste crítico são rejeitados', () => {
  assert.throws(() => validate([{ title: 'CT-DEMO-01 exemplo @flaky', id: 'CT-DEMO-01', file: 'tests/demo.test.ts', line: 1 }]), /Registro/);
  assert.throws(() => validate([{ title: 'CT-AUT-01 exemplo @flaky', id: 'CT-AUT-01', file: 'tests/demo.test.ts', line: 1 }]), /crítico/);
});
test('Jest, node:test e Playwright: seleção, retentativas e gate em ambiente isolado', { timeout: 120000 }, () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'sos-management-selftest-'));
  fs.cpSync(__dirname, path.join(sandbox, 'scripts/test-management'), { recursive: true });
  save(path.join(sandbox, 'scripts/test-management/policy.json'), { ...policy, criticalIds: [], criticalFiles: [], criticalTests: [] });
  for (const folder of ['backend/tests/unit', 'tests', 'frontend/tests', 'e2e/tests']) fs.mkdirSync(path.join(sandbox, folder), { recursive: true });
  for (const pkg of ['backend', 'e2e']) {
    fs.symlinkSync(path.join(root, pkg, 'node_modules'), path.join(sandbox, pkg, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  }
  fs.copyFileSync(path.join(root, 'e2e/playwright.config.ts'), path.join(sandbox, 'e2e/playwright.config.ts'));
  fs.mkdirSync(path.join(sandbox, 'e2e/reporters'), { recursive: true });
  fs.copyFileSync(path.join(root, 'e2e/reporters/flaky-reporter.ts'), path.join(sandbox, 'e2e/reporters/flaky-reporter.ts'));
  const jestConfig = `const path=require('path');module.exports={testEnvironment:'node',testMatch:['**/*.test.ts'],testNamePattern:process.env.TEST_MODE==='quarantine'?'(?:^|\\\\s)@flaky(?:\\\\s|$)':'^(?!.*(?:^|\\\\s)@flaky(?:\\\\s|$)).*$',reporters:['default',path.resolve(__dirname,'../scripts/test-management/jest-reporter.cjs')]};`;
  fs.writeFileSync(path.join(sandbox, 'backend/jest.config.js'), jestConfig);
  const title = 'CT-DEMO-01 exemplo @flaky';
  fs.writeFileSync(path.join(sandbox, 'backend/tests/unit/demo.test.ts'), `test('${title}',()=>{expect(Number(process.env.TEST_ATTEMPT)).toBeGreaterThan(1)});test('CT-DEMO-02 normal',()=>{expect(process.env.DEMO_FAIL_NORMAL==='1' && Number(process.env.TEST_ATTEMPT)===1).toBe(false)});`);
  fs.writeFileSync(path.join(sandbox, 'frontend/tests/demo.test.mjs'), `import {test} from 'node:test'; import assert from 'node:assert/strict';test('CT-DEMO-03 exemplo @flaky',()=>{assert.ok(Number(process.env.TEST_ATTEMPT)>1)});test('CT-DEMO-04 normal',()=>{assert.notEqual(process.env.DEMO_FAIL_NORMAL,'1')});`);
  fs.writeFileSync(path.join(sandbox, 'e2e/tests/demo.spec.ts'), `import {test,expect} from '@playwright/test';test('CT-DEMO-05 exemplo @flaky',async({},info)=>{expect(info.retry).toBeGreaterThan(0)});test('CT-DEMO-06 normal',async()=>{expect(process.env.DEMO_FAIL_NORMAL).not.toBe('1')});`);
  save(path.join(sandbox, 'scripts/test-management/quarantine.json'), [
    { id: 'CT-DEMO-01', file: 'backend/tests/unit/demo.test.ts', title },
    { id: 'CT-DEMO-03', file: 'frontend/tests/demo.test.mjs', title: 'CT-DEMO-03 exemplo @flaky' },
    { id: 'CT-DEMO-05', file: 'e2e/tests/demo.spec.ts', title: 'CT-DEMO-05 exemplo @flaky' },
  ].map(e => ({ ...e, reason: 'Demonstração sintética isolada', owner: 'selftest', approvedBy: 'selftest', since: new Date().toISOString().slice(0, 10), exitCondition: 'Nunca é teste de produção', evidence: 'Falha controlada por tentativa' })));
  function exec(suite, mode, extra = {}) {
    const env = { ...process.env, QUARANTINE_RETRIES: '1', DIAGNOSTIC_RUNS: '2', ...extra };
    delete env.NODE_TEST_CONTEXT;
    const r = cp.spawnSync(process.execPath, ['scripts/test-management/run.cjs', suite, mode], { cwd: sandbox, env, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    fs.appendFileSync(path.join(sandbox, 'execution.log'), `\n${suite} ${mode}: ${r.status}\n${r.stdout}\n${r.stderr}`);
    return r;
  }
  for (const suite of ['backend', 'frontend', 'e2e']) {
    const normal = exec(suite, 'normal');
    assert.equal(normal.status, 0, normal.stdout + normal.stderr);
    assert.doesNotMatch(normal.stderr, /MaxListenersExceededWarning/);
    assert.equal(exec(suite, 'normal', { DEMO_FAIL_NORMAL: '1' }).status, 1, 'Falha normal precisa bloquear');
    // Quarentena retorna falha para preservar evidência; só a etapa CI é tolerante.
    const quarantine = exec(suite, 'quarantine');
    // Playwright retorna 0 para flaky nativo; o wrapper ainda deve preservar a falha inicial.
    assert.equal(quarantine.status, 1, quarantine.stdout + quarantine.stderr);
  }
  assert.equal(exec('backend', 'diagnostic', { DEMO_FAIL_NORMAL: '1' }).status, 1, 'Passar na segunda rodada não apaga falha');
  // O framework retorna 0 ao executar somente o caso normal aprovado, deixando
  // o @flaky esperado como pending. O wrapper precisa reprovar essa ausência.
  fs.appendFileSync(path.join(sandbox, 'backend/jest.config.js'), "\nmodule.exports.testNamePattern = 'CT-DEMO-02 normal';\n");
  const unselected = exec('backend', 'quarantine');
  assert.equal(unselected.status, 1, unselected.stdout + unselected.stderr);
  assert.match(unselected.stderr, /Quarentena sem execução comprovada/);
  const reports = fs.readdirSync(sandbox, { recursive: true }).filter(f => f.endsWith('summary.json') && !f.includes('node_modules'));
  // readdir recursivo não segue junctions de dependências.
  const summaries = reports.map(f => JSON.parse(fs.readFileSync(path.join(sandbox, f), 'utf8')));
  for (const suite of ['backend', 'frontend', 'e2e']) {
    const q = summaries.find(s => s.suite === suite && s.mode === 'quarantine');
    assert.deepEqual(q.records.filter(r => /@flaky/.test(r.name)).map(r => r.status), ['failed', 'passed']);
    assert.ok(q.attempts.every(a => a.quarantineEvidence.missing.length === 0));
  }
  const absent = summaries.find(s => s.suite === 'backend' && s.attempts.some(a => a.quarantineEvidence?.missing.length));
  assert.ok(absent, 'A ausência deve constar no relatório, sem virar aprovação nem teste reprovado inventado');
  assert.ok(absent.attempts.every(a => a.exitCode === 1 && a.quarantineEvidence.executed === 0));
  const evidence = path.join(root, 'relatorios/selftest', path.basename(sandbox));
  for (const file of fs.readdirSync(sandbox, { recursive: true })) {
    if (file.includes('node_modules') || !/(?:summary\.json|attempt\.json|stdout\.log|stderr\.log|execution\.log)$/.test(file)) continue;
    fs.mkdirSync(path.dirname(path.join(evidence, file)), { recursive: true });
    fs.copyFileSync(path.join(sandbox, file), path.join(evidence, file));
  }
  console.log(`Evidência sintética (não é resultado do produto): ${evidence}`);
});
