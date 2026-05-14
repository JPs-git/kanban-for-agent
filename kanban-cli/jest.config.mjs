export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'mjs'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: ['src/**/*.js']
};