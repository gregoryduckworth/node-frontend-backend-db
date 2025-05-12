/**
 * Centralized bcrypt mock for tests
 * Import this file in test files that need to mock bcrypt functionality
 */

// Setup for jest.mock('bcrypt')
export const bcryptMock = {
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  hashSync: jest.fn().mockReturnValue('hashed-password'),
};

/**
 * Configure password verification to return a specific result
 * @param isMatch Whether the password should match
 */
export const setupPasswordComparison = (isMatch = true) => {
  bcryptMock.compare.mockResolvedValue(isMatch);
};

/**
 * Reset the bcrypt mock to its default behavior
 */
export const resetBcryptMock = () => {
  bcryptMock.genSalt.mockResolvedValue('salt');
  bcryptMock.hash.mockResolvedValue('hashed-password');
  bcryptMock.compare.mockResolvedValue(true);
  bcryptMock.hashSync.mockReturnValue('hashed-password');
};

// Export for jest.mock setup
export default bcryptMock;
