import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)', '**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controller/(.*)$': '<rootDir>/src/controller/$1',
    '^@middlewares$': '<rootDir>/src/middlewares/index.ts',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@prismaClient/(.*)$': '<rootDir>/prisma/$1',
  },
  setupFiles: ['dotenv/config'],
};

export default config;
