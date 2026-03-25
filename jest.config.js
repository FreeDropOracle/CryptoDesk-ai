/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.test.tsx',
    '<rootDir>/tests/integration/**/*.test.ts'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@shared/public/(.*)$': '<rootDir>/src/shared/public/$1',
    '^@shared/internal/(.*)$': '<rootDir>/src/shared/internal/$1'
  },
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/e2e/', '/tests/chaos/']
};
