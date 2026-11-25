module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '**/src/**/__tests__/*.test.ts',
    '**/src/**/__tests__/**/*.test.ts',
    '**/src/**/__tests__/*.test.tsx',
    '**/src/**/__tests__/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '../resultados',
        outputName: 'unit-mobile.xml',
        suiteName: 'unit-mobile',
      },
    ],
  ],
};
