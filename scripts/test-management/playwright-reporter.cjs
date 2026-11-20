const path = require('node:path');
const { root, idOf, relative, save } = require('./common.cjs');
class Reporter {
  records = [];
  onTestEnd(test, result) {
    this.records.push({ framework: 'playwright', file: relative(test.location.file), name: test.titlePath().join(' '), id: idOf(test.title), status: result.status, expectedStatus: test.expectedStatus, durationMs: result.duration, attempt: result.retry + 1, error: result.errors.map(e => e.message ?? String(e)).join('\n') });
  }
  onError(error) {
    this.records.push({ framework: 'playwright', file: '', name: '<runner>', id: null, status: 'environment-error', durationMs: 0, attempt: 1, error: error.message });
  }
  onEnd(result) {
    save(path.join(process.env.TEST_REPORT_DIR ?? path.join(root, 'resultados/gestao/direct-e2e'), 'attempt.json'), { records: this.records, status: result.status });
  }
}
module.exports = Reporter;
