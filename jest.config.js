module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  rootDir: 'src',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageReporters: ['text', 'text-summary', 'html'],
  testEnvironment: 'node',
};
