const path = require('node:path');
const { root, idOf, relative, save } = require('./common.cjs');
class Reporter {
  onRunComplete(_, result) {
    const records = result.testResults.flatMap(suite => {
      const tests = suite.testResults.map(t => ({
        framework: 'jest', file: relative(suite.testFilePath), name: t.fullName,
        id: idOf(t.fullName), status: t.status, durationMs: t.duration ?? 0,
        error: t.failureMessages.join('\n'), attempt: Number(process.env.TEST_ATTEMPT ?? 1),
      }));
      if (suite.testExecError) tests.push({ framework: 'jest', file: relative(suite.testFilePath), name: '<suite>', id: null, status: 'environment-error', durationMs: 0, error: suite.failureMessage, attempt: Number(process.env.TEST_ATTEMPT ?? 1) });
      return tests;
    });
    save(path.join(process.env.TEST_REPORT_DIR ?? path.join(root, 'resultados/gestao/direct-jest'), 'attempt.json'), { records, suiteErrors: result.numRuntimeErrorTestSuites });
  }
}
module.exports = Reporter;
