const path = require('path');

module.exports = {
  testEnvironment: 'node',
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
  forceExit: true,
  clearMocks: true,
  // Além da saída no terminal, grava o resultado em JUnit XML para a pipeline
  // (artefato e cálculo de métricas). Contrato: resultados/api.xml na raiz.
  // O jest-junit fica no node_modules do backend, como o ts-jest acima.
  reporters: [
    'default',
    [
      path.resolve(__dirname, '../backend/node_modules/jest-junit'),
      {
        outputDirectory: path.resolve(__dirname, '../resultados'),
        outputName: 'api.xml',
        suiteName: 'api',
        addFileAttribute: 'true',
        reportTestSuiteErrors: 'true',
      },
    ],
  ],
};
