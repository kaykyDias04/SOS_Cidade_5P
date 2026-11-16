const path = require('path');

// Testes unitários do backend: regra isolada, sem banco, sem Redis e sem servidor.
module.exports = {
  testEnvironment: 'node',
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
    [
      'jest-junit',
      {
        outputDirectory: path.resolve(__dirname, '../resultados'),
        outputName: 'unit-backend.xml',
        suiteName: 'unitarios-backend',
        addFileAttribute: 'true',
        reportTestSuiteErrors: 'true',
      },
    ],
  ],
};
