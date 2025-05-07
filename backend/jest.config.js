// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@controller/(.*)$": "<rootDir>/src/controller/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
    "^@prismaClient/(.*)$": "<rootDir>/../shared/prisma/$1",
  },
  setupFiles: ["dotenv/config"],
};
