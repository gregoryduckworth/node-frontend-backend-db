import { jest } from '@jest/globals';

export const mockAdminUser = {
  id: 1,
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  password: 'hashed',
  refresh_token: 'refresh',
};

export const resetAllMocks = (jwt: any, prisma: any) => {
  jest.clearAllMocks();
  (jwt.sign as jest.Mock).mockReset();
  (jwt.verify as jest.Mock).mockReset();
  (jwt.decode as jest.Mock).mockReset();
  prisma.adminUser.findFirst.mockReset();
};
