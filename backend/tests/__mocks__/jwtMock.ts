/**
 * Centralized JWT mock for tests
 * Import this file in test files that need to mock JWT functionality
 */

// Setup for jest.mock('jsonwebtoken')
export const jwtMock = {
  sign: jest.fn().mockReturnValue("mocked-token"),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === "valid-refresh-token" || token === "valid-reset-token") {
      return {
        userId: "test-user-id",
        email: "test@example.com",
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
      };
    }
    throw new Error("Invalid token");
  }),
};

/**
 * Configure the JWT mock for a specific test case
 * @param options Custom behavior for the JWT mock
 */
export const configureJwtMock = (options?: {
  signReturnValue?: string;
  verifyImplementation?: (token: string, secret: string) => any;
}) => {
  if (options?.signReturnValue) {
    jwtMock.sign.mockReturnValue(options.signReturnValue);
  }

  if (options?.verifyImplementation) {
    jwtMock.verify.mockImplementation(options.verifyImplementation);
  }
};

/**
 * Reset the JWT mock to its default behavior
 */
export const resetJwtMock = () => {
  jwtMock.sign.mockReturnValue("mocked-token");
  jwtMock.verify.mockImplementation((token, secret) => {
    if (token === "valid-refresh-token" || token === "valid-reset-token") {
      return {
        userId: "test-user-id",
        email: "test@example.com",
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
      };
    }
    throw new Error("Invalid token");
  });
};

// Export for jest.mock setup
export default jwtMock;
