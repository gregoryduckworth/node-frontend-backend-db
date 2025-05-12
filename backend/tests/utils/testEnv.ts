/**
 * Test environment utilities for managing environment variables during tests
 */
import { resetJwtMock } from '../__mocks__/jwtMock';
import { resetBcryptMock } from '../__mocks__/bcryptMock';
import { resetPrismaMock, setupStandardUserMockImplementations } from '../__mocks__/prismaMock';

// Store the original environment for restoration
const originalEnv = process.env;

/**
 * Save the original environment variables and return a function to restore them
 */
export const setupTestEnv = () => {
  // Store original env before tests run
  process.env = { ...originalEnv };

  return () => {
    // Restore original env after tests complete
    process.env = originalEnv;
  };
};

/**
 * Mock JWT secrets environment variables
 */
export const mockJwtSecrets = (
  accessSecret = 'test-access-secret',
  refreshSecret = 'test-refresh-secret',
) => {
  process.env.ACCESS_TOKEN_SECRET = accessSecret;
  process.env.REFRESH_TOKEN_SECRET = refreshSecret;
};

/**
 * Remove JWT secrets from environment variables
 */
export const removeJwtSecrets = () => {
  delete process.env.ACCESS_TOKEN_SECRET;
  delete process.env.REFRESH_TOKEN_SECRET;
};

/**
 * Store original secrets and restore them when function is called
 */
export const withTemporaryJwtSecrets = (
  callback: () => void,
  accessSecret?: string,
  refreshSecret?: string,
) => {
  const originalAccessSecret = process.env.ACCESS_TOKEN_SECRET;
  const originalRefreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (accessSecret !== undefined) {
    process.env.ACCESS_TOKEN_SECRET = accessSecret;
  }

  if (refreshSecret !== undefined) {
    process.env.REFRESH_TOKEN_SECRET = refreshSecret;
  }

  try {
    callback();
  } finally {
    process.env.ACCESS_TOKEN_SECRET = originalAccessSecret;
    process.env.REFRESH_TOKEN_SECRET = originalRefreshSecret;
  }
};

/**
 * Mock other common environment variables used in tests
 */
export const mockCommonEnvVars = (vars: Record<string, string>) => {
  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

/**
 * Comprehensive test setup that configures all common mocks
 * Returns a cleanup function to be used in afterEach or afterAll
 */
export const setupTestSuite = () => {
  // Setup environment
  const restoreEnv = setupTestEnv();

  // Mock JWT secrets
  mockJwtSecrets();

  // Setup standard user mock implementations
  setupStandardUserMockImplementations();

  // Return cleanup function
  return () => {
    resetJwtMock();
    resetBcryptMock();
    resetPrismaMock();
    restoreEnv();
  };
};
