import { refreshToken, generateAccessToken } from './refreshToken';
import { getJwtSecrets } from '@/utils/jwtSecrets';
import jwt from 'jsonwebtoken';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}));

const { prisma } = require('@prismaClient/client');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe('generateAccessToken', () => {
  it('should generate a JWT with user info', () => {
    const { accessTokenSecret } = getJwtSecrets();
    const user = {
      id: 1,
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      dateOfBirth: new Date(),
    };
    const token = generateAccessToken(user, accessTokenSecret);
    const decoded: any = jwt.verify(token, accessTokenSecret);
    expect(decoded.id).toBe(user.id);
    expect(decoded.email).toBe(user.email);
    expect(decoded.firstName).toBe(user.firstName);
    expect(decoded.lastName).toBe(user.lastName);
    expect(decoded.dateOfBirth).toBe(user.dateOfBirth.toISOString());
  });
});

describe('refreshToken', () => {
  const { refreshTokenSecret, accessTokenSecret } = getJwtSecrets();
  const user = {
    id: 1,
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.com',
    dateOfBirth: new Date(),
    refresh_token: 'valid-refresh-token',
  };
  const validRefreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, { expiresIn: '1h' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 204 if no refresh token cookie', async () => {
    const req: any = { cookies: {} };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 403 if user not found', async () => {
    const req: any = { cookies: { refreshToken: 'some-token' } };
    const res = mockRes();
    prisma.user.findFirst.mockResolvedValue(null);
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should return 403 if refresh token is invalid', async () => {
    const req: any = { cookies: { refreshToken: 'invalid-token' } };
    const res = mockRes();
    prisma.user.findFirst.mockResolvedValue(user);
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should return accessToken if refresh token is valid', async () => {
    const req: any = { cookies: { refreshToken: validRefreshToken } };
    const res = mockRes();
    prisma.user.findFirst.mockResolvedValue(user);
    await refreshToken(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: expect.any(String) }),
    );
  });

  it('should return 500 on unexpected error', async () => {
    const req: any = { cookies: { refreshToken: validRefreshToken } };
    const res = mockRes();
    prisma.user.findFirst.mockRejectedValue(new Error('DB error'));
    await refreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
});
