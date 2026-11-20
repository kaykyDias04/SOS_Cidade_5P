// Somente histórico da branch padrão: nenhum script ou log baixado é executado.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { root, save } = require('./common.cjs');
function gh(args) {
  const r = spawnSync('gh', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (r.status !== 0) throw Error(r.stderr || 'GitHub CLI falhou');
  return r.stdout;
}
try {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) throw Error('GITHUB_REPOSITORY ausente/inválido');
  const branch = JSON.parse(gh(['api', `repos/${repo}`])).default_branch;
  const availability = [];
  for (const workflow of ['unit-api.yml', 'e2e-smoke.yml', 'regressao-completa.yml']) {
    const runs = JSON.parse(gh(['run', 'list', '--repo', repo, '--workflow', workflow, '--branch', branch, '--limit', '10', '--json', 'databaseId,status,event']));
    for (const run of runs.filter(r => r.status === 'completed' && ['push', 'schedule', 'workflow_dispatch'].includes(r.event))) {
      for (const artifact of ['resultados-testes', 'gestao-quarentena']) {
        const dir = path.join(root, 'history', String(run.databaseId), artifact);
        fs.mkdirSync(dir, { recursive: true });
        const r = spawnSync('gh', ['run', 'download', String(run.databaseId), '--repo', repo, '--name', artifact, '--dir', dir], { encoding: 'utf8' });
        availability.push({ workflow, runId: run.databaseId, artifact, available: r.status === 0 });
      }
    }
  }
  save(path.join(root, 'relatorios/gestao/history-availability.json'), availability);
  console.log(`Histórico: ${availability.filter(a => a.available).length}/${availability.length} artefatos disponíveis`);
} catch (e) { console.error(e.message); process.exitCode = 1; }
