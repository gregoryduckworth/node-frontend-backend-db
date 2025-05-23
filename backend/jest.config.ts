import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/?(*.)+(test).[jt]s?(x)', // allow tests next to source files
    '**/tests/**/*.test.ts',     // keep support for central tests folder
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controller/(.*)$': '<rootDir>/src/controller/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@prismaClient/(.*)$': '<rootDir>/prisma/$1',
  },
  setupFiles: ['dotenv/config'],
};

export default config;
