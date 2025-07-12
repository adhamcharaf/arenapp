const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customConfig = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  passWithNoTests: true,
}

module.exports = createJestConfig(customConfig)