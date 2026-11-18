const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const { root } = require('./common.cjs');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function context() {
  const git = args => cp.spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  const head = git(['rev-parse', 'HEAD']);
  const listing = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']);
  const digest = crypto.createHash('sha256');
  // Metadados de aprovação não alteram o código executado e não podem criar
  // autorreferência ao cadastrar o fingerprint em exitVerification.
  const files = listing.status === 0 ? [...new Set(listing.stdout.split('\0').filter(f => /\.(?:[cm]?js|tsx?|json|ya?ml|prisma|sql)$/.test(f) && f !== 'scripts/test-management/quarantine.json'))].sort() : [];
  for (const file of files) {
    digest.update(file + '\0');
    digest.update(fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n', '\n') : '<deleted>');
    digest.update('\0');
  }
  const version = pkg => {
    try { return JSON.parse(fs.readFileSync(path.join(root, pkg, 'package.json'))).version; } catch { return 'unavailable'; }
  };
  const environment = {
    platform: process.platform, arch: process.arch, node: process.version,
    jest: version('backend/node_modules/jest'), playwright: version('e2e/node_modules/@playwright/test'),
    profile: process.env.TEST_ENVIRONMENT_ID ?? 'unit-mocks-e2e-unverified',
  };
  return {
    commit: head.status === 0 ? head.stdout.trim() : null,
    sourceDigest: files.length ? digest.digest('hex') : null,
    environment, environmentKey: hash(JSON.stringify(environment)),
  };
}
function compatible(run, current) {
  return Boolean(current.commit && current.sourceDigest && current.environmentKey &&
    run.commit === current.commit && run.sourceDigest === current.sourceDigest && run.environmentKey === current.environmentKey);
}
module.exports = { context, compatible, hash };
