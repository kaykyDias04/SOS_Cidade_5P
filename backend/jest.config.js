const path = require('path');

// Testes unitários do backend: regra isolada, sem banco, sem Redis e sem servidor.
module.exports = {
  testEnvironment: 'node',
  testNamePattern: process.env.TEST_MODE === 'quarantine' ? '(?:^|\\s)@flaky(?:\\s|$)' : '^(?!.*(?:^|\\s)@flaky(?:\\s|$)).*$',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/unit/setup.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tests/tsconfig.json' }],
  },
  clearMocks: true,
  // Além da saída no terminal, grava o resultado em JUnit XML para a pipeline
  // (artefato e cálculo de métricas). Contrato: resultados/unit-backend.xml na raiz.
  reporters: [
    'default',
    path.resolve(__dirname, '../scripts/test-management/jest-reporter.cjs'),
    [
      'jest-junit',
      {
        outputDirectory: process.env.TEST_MODE === 'quarantine' ? process.env.TEST_REPORT_DIR : path.resolve(__dirname, '../resultados'),
        outputName: 'unit-backend.xml',
        suiteName: 'unitarios-backend',
        addFileAttribute: 'true',
        reportTestSuiteErrors: 'true',
      },
    ],
  ],
};
