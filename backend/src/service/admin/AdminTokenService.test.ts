import { AdminTokenService } from './AdminTokenService';
import jwt from 'jsonwebtoken';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    adminUser: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

const { prisma } = require('@prismaClient/client');

const admin = {
  id: 1,
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  password: 'hashed',
  refresh_token: 'refresh',
};

describe('AdminTokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.sign as jest.Mock).mockReset();
    (jwt.verify as jest.Mock).mockReset();
    (jwt.decode as jest.Mock).mockReset();
  });

  describe('generateAdminAccessToken', () => {
    it('should call jwt.sign with correct payload and secret', () => {
      (jwt.sign as jest.Mock).mockReturnValue('token');
      const secret = 'secret';
      const token = AdminTokenService.generateAdminAccessToken(admin, secret);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          isAdmin: true,
        }),
        secret,
        { expiresIn: '30m' },
      );
      expect(token).toBe('token');
    });
  });

  describe('refreshAdminToken', () => {
    it('should return 204 if no refreshToken', async () => {
      // @ts-ignore: Testing undefined input for refreshToken
      const result = await AdminTokenService.refreshAdminToken(undefined);
      expect(result).toEqual({ status: 204 });
    });

    it('should return 403 if admin not found', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(null);
      const result = await AdminTokenService.refreshAdminToken('sometoken');
      expect(result).toEqual({ status: 403 });
    });

    it('should return 403 if jwt.verify throws', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await AdminTokenService.refreshAdminToken('badtoken');
      expect(result).toEqual({ status: 403 });
    });

    it('should return 200 and accessToken if valid', async () => {
      prisma.adminUser.findFirst.mockResolvedValue(admin);
      (jwt.verify as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('access-token');
      const result = await AdminTokenService.refreshAdminToken('goodtoken');
      expect(result).toEqual({ status: 200, accessToken: 'access-token' });
    });
  });
});
