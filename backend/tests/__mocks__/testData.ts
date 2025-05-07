/**
 * Centralized test data for use across all tests
 */

// Common test user data
export const testUsers = {
  standard: {
    id: "test-user-id",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "hashed-password", // The plain text would be "Password123"
    refresh_token: "valid-refresh-token",
    dateOfBirth: null,
  },
  withResetToken: {
    id: "test-user-id",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "hashed-password",
    reset_token: "valid-reset-token",
    reset_token_expires: new Date(Date.now() + 3600000), // 1 hour from now
    dateOfBirth: null,
  },
};

// Common auth credentials
export const credentials = {
  valid: {
    email: "test@example.com",
    password: "Password123",
    confirmPassword: "Password123",
  },
  invalid: {
    email: "nonexistent@example.com",
    password: "weak",
    wrongPassword: "WrongPassword123",
  },
};

// API endpoints
export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  users: {
    base: "/users",
    withId: (id: string) => `/users/${id}`,
  },
  token: "/token",
  health: "/health",
};
