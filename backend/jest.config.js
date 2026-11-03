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
};
