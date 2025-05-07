/**
 * Centralized Prisma mock for tests
 * Import this file in test files that need to mock Prisma functionality
 */
import { testUsers } from "./testData";

// Base mock implementation
export const prismaMock = {
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

/**
 * Configure user finding behavior for different test scenarios
 */
export const setupUserMock = (
  user: any = null,
  options?: {
    implementationFn?: (params: any) => Promise<any>;
  }
) => {
  if (options?.implementationFn) {
    prismaMock.user.findFirst.mockImplementation(options.implementationFn);
    prismaMock.user.findUnique.mockImplementation(options.implementationFn);
    return;
  }

  // Default implementation
  prismaMock.user.findFirst.mockResolvedValue(user);
  prismaMock.user.findUnique.mockResolvedValue(user);
};

/**
 * Set up common user-finding behaviors for tests
 */
export const setupStandardUserMockImplementations = () => {
  const implementation = (params: any) => {
    // Find by ID
    if (params?.where?.id === testUsers.standard.id) {
      return Promise.resolve(testUsers.standard);
    }

    // Find by email
    if (params?.where?.email === testUsers.standard.email) {
      return Promise.resolve(testUsers.standard);
    }

    // Find by refresh token
    if (params?.where?.refresh_token === "valid-refresh-token") {
      return Promise.resolve({
        ...testUsers.standard,
        refresh_token: "valid-refresh-token",
      });
    }

    // Find by expired token
    if (params?.where?.refresh_token === "expired-token") {
      return Promise.resolve({
        id: testUsers.standard.id,
        refresh_token: "expired-token",
      });
    }

    // Find by reset token
    if (
      params?.where?.reset_token === "valid-reset-token" &&
      params?.where?.reset_token_expires?.gt
    ) {
      return Promise.resolve(testUsers.withResetToken);
    }

    // Error case
    if (params?.where?.refresh_token === "error-token") {
      throw new Error("Database error");
    }

    return Promise.resolve(null);
  };

  setupUserMock(null, { implementationFn: implementation });
};

/**
 * Configure user create behavior
 */
export const setupUserCreateMock = (userData: any = null) => {
  const defaultData = {
    id: "created-user-id",
    firstName: "Created",
    lastName: "User",
    email: "created@example.com",
  };

  prismaMock.user.create.mockResolvedValue(userData || defaultData);
};

/**
 * Configure user update behavior
 */
export const setupUserUpdateMock = (userData: any = null) => {
  const defaultData = {
    id: "test-user-id",
    firstName: "Updated",
    lastName: "User",
    email: "updated@example.com",
  };

  prismaMock.user.update.mockResolvedValue(userData || defaultData);
};

/**
 * Reset all Prisma mocks to their initial state
 */
export const resetPrismaMock = () => {
  prismaMock.user.findMany.mockResolvedValue([]);
  prismaMock.user.findFirst.mockReset();
  prismaMock.user.findUnique.mockReset();
  prismaMock.user.create.mockReset();
  prismaMock.user.update.mockReset();
  prismaMock.user.delete.mockReset();
};

// Export for jest.mock setup
export default prismaMock;
