import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireRoleOrPermission } from './RequireRoleOrPermission';
import { getJwtSecrets } from '@/utils/jwtSecrets';
import { prisma } from '@prismaClient/client';

jest.mock('@prismaClient/client', () => ({
  prisma: {
    adminUser: { findUnique: jest.fn() },
  },
}));

jest.mock('jsonwebtoken');

(jwt.sign as jest.Mock) = jest.fn();
(jwt.verify as jest.Mock) = jest.fn();

const { accessTokenSecret } = getJwtSecrets();

function createApp() {
  const app = express();
  app.use(express.json());
  // Dummy requireAdmin middleware to set req.user from JWT
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        req.user = jwt.verify(authHeader.split(' ')[1], accessTokenSecret);
      } catch (e) {}
    }
    next();
  });
  app.get('/protected', requireRoleOrPermission(['ADMIN', 'MANAGE_USERS']), (req, res) =>
    res.status(200).json({ message: 'OK' }),
  );
  return app;
}

function getToken(payload: object) {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: '1h' });
}

describe('requireRoleOrPermission middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = createApp();
    (prisma.adminUser.findUnique as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    (jwt.verify as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows access for admin with required role', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin1' });
    const token = getToken({ id: 'admin1' });
    (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({
      id: 'admin1',
      roles: [{ name: 'ADMIN', permissions: [] }],
    });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('OK');
  });

  it('allows access for admin with required permission', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin2' });
    const token = getToken({ id: 'admin2' });
    (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue({
      id: 'admin2',
      roles: [{ name: 'ADMIN', permissions: [{ name: 'MANAGE_USERS' }] }],
    });
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('OK');
  });

  it('denies access if not authenticated', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Not authenticated/);
  });

  it('denies access if admin not found', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin4' });
    const token = getToken({ id: 'admin4' });
    (prisma.adminUser.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Admin not found/);
  });
});
