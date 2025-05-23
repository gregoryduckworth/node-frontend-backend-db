import { adminRefreshToken, generateAdminAccessToken } from './RefreshToken';
import { getJwtSecrets } from '@/utils/jwtSecrets';
import jwt from 'jsonwebtoken';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    adminUser: {
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

describe('generateAdminAccessToken', () => {
  it('should generate a JWT with isAdmin true', () => {
    const { accessTokenSecret } = getJwtSecrets();
    const admin = { id: 1, firstName: 'A', lastName: 'B', email: 'a@b.com' };
    const token = generateAdminAccessToken(admin, accessTokenSecret);
    const decoded: any = jwt.verify(token, accessTokenSecret);
    expect(decoded.isAdmin).toBe(true);
    expect(decoded.id).toBe(admin.id);
    expect(decoded.email).toBe(admin.email);
  });
});

describe('adminRefreshToken', () => {
  const { refreshTokenSecret, accessTokenSecret } = getJwtSecrets();
  const admin = {
    id: 1,
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.com',
    refresh_token: 'valid-refresh-token',
  };
  const validRefreshToken = jwt.sign({ id: admin.id }, refreshTokenSecret, { expiresIn: '1h' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 204 if no refresh token cookie', async () => {
    const req: any = { cookies: {} };
    const res = mockRes();
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 403 if admin not found', async () => {
    const req: any = { cookies: { adminRefreshToken: 'some-token' } };
    const res = mockRes();
    prisma.adminUser.findFirst.mockResolvedValue(null);
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should return 403 if refresh token is invalid', async () => {
    const req: any = { cookies: { adminRefreshToken: 'invalid-token' } };
    const res = mockRes();
    prisma.adminUser.findFirst.mockResolvedValue(admin);
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });

  it('should return accessToken if refresh token is valid', async () => {
    const req: any = { cookies: { adminRefreshToken: validRefreshToken } };
    const res = mockRes();
    prisma.adminUser.findFirst.mockResolvedValue(admin);
    await adminRefreshToken(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: expect.any(String) }),
    );
  });

  it('should return 500 on unexpected error', async () => {
    const req: any = { cookies: { adminRefreshToken: validRefreshToken } };
    const res = mockRes();
    prisma.adminUser.findFirst.mockRejectedValue(new Error('DB error'));
    await adminRefreshToken(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
});
