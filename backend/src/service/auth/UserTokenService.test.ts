import { UserTokenService } from './UserTokenService';
import jwt from 'jsonwebtoken';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('jsonwebtoken');

const { prisma } = require('@prismaClient/client');

const user = {
  id: 1,
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  dateOfBirth: new Date(),
  refresh_token: 'refresh',
};

describe('UserTokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should call jwt.sign with correct payload and secret', () => {
      (jwt.sign as jest.Mock).mockReturnValue('token');
      const secret = 'secret';
      const token = UserTokenService.generateAccessToken(user, secret);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dateOfBirth: user.dateOfBirth.toISOString(),
        }),
        secret,
        { expiresIn: '30m' },
      );
      expect(token).toBe('token');
    });
  });

  describe('refreshToken', () => {
    it('should return 204 if no refreshToken', async () => {
      // @ts-ignore: Testing undefined input for refreshToken
      const result = await UserTokenService.refreshToken(undefined);
      expect(result).toEqual({ status: 204 });
    });

    it('should return 403 if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const result = await UserTokenService.refreshToken('sometoken');
      expect(result).toEqual({ status: 403 });
    });

    it('should return 403 if jwt.verify throws', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await UserTokenService.refreshToken('badtoken');
      expect(result).toEqual({ status: 403 });
    });

    it('should return 200 and accessToken if valid', async () => {
      prisma.user.findFirst.mockResolvedValue(user);
      (jwt.verify as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('access-token');
      const result = await UserTokenService.refreshToken('goodtoken');
      expect(result).toEqual({ status: 200, accessToken: 'access-token' });
    });
  });
});
