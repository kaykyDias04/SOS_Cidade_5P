const { run } = require('./run.cjs');
let failed = 0;
try {
  const suites = process.argv.slice(2);
  for (const suite of suites.length ? suites : ['frontend', 'backend', 'api']) failed |= run(suite, 'quarantine');
} catch (e) { console.error(e); failed = 1; }
process.exitCode = failed;
