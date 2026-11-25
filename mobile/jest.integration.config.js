module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: [
    '**/src/**/__integration__/*.integration.test.ts',
    '**/src/**/__integration__/**/*.integration.test.ts',
  ],
  transform: {
    '^.+\\.ts$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [require.resolve('@babel/preset-typescript')],
        plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/jest.integration.react-native.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/jest.integration.async-storage.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '../resultados',
        outputName: 'integration-mobile-backend.xml',
        suiteName: 'integration-mobile-backend',
      },
    ],
  ],
  testTimeout: 30000,
};
