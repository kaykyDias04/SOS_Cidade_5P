const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testNamePattern: process.env.TEST_MODE === 'quarantine' ? '(?:^|\\s)@flaky(?:\\s|$)' : '^(?!.*(?:^|\\s)@flaky(?:\\s|$)).*$',
  testMatch: ['<rootDir>/**/*.test.ts'],
  setupFiles: ['<rootDir>/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      path.resolve(__dirname, '../backend/node_modules/ts-jest'),
      {
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      },
    ],
  },
  moduleDirectories: ['node_modules', path.resolve(__dirname, '../backend/node_modules')],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  // Além da saída no terminal, grava o resultado em JUnit XML para a pipeline
  // (artefato e cálculo de métricas). Contrato: resultados/api.xml na raiz.
  // O jest-junit fica no node_modules do backend, como o ts-jest acima.
  reporters: [
    'default',
    path.resolve(__dirname, '../scripts/test-management/jest-reporter.cjs'),
    [
      path.resolve(__dirname, '../backend/node_modules/jest-junit'),
      {
        outputDirectory: process.env.TEST_MODE === 'quarantine' ? process.env.TEST_REPORT_DIR : path.resolve(__dirname, '../resultados'),
        outputName: 'api.xml',
        suiteName: 'api',
        addFileAttribute: 'true',
        reportTestSuiteErrors: 'true',
      },
    ],
  ],
};
