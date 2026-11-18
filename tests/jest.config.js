const path = require('path');

module.exports = {
  // A raiz do Jest é a do repositório, e não a pasta tests/, para a cobertura enxergar
  // o código em backend/src (o Jest só mede arquivos que estão dentro do rootDir).
  rootDir: path.resolve(__dirname, '..'),
  roots: ['<rootDir>/tests', '<rootDir>/backend/src'],
  testEnvironment: 'node',
  testNamePattern: process.env.TEST_MODE === 'quarantine' ? '(?:^|\\s)@flaky(?:\\s|$)' : '^(?!.*(?:^|\\s)@flaky(?:\\s|$)).*$',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
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
  // Cobertura do código do backend exercitado pelos testes de API (só liga com --coverage,
  // ou seja, com `npm run test:coverage`). Vai para resultados/cobertura/, que a pipeline
  // já guarda no artefato resultados-testes. Sem clover.xml de propósito: o script de
  // métricas lê *.xml e não deve confundir cobertura com resultado de teste.
  collectCoverageFrom: ['<rootDir>/backend/src/**/*.ts'],
  coverageDirectory: path.resolve(__dirname, '../resultados/cobertura'),
  coverageReporters: ['text-summary', 'lcov', 'json-summary'],
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
