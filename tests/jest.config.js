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
};
