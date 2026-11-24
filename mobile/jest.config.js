module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
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
