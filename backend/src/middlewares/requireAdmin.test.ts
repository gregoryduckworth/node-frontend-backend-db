import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { requireAdmin } from './requireAdmin';
import { getJwtSecrets } from '@/utils/jwtSecrets';

const { accessTokenSecret } = getJwtSecrets();

const app = express();
app.get('/admin-only', requireAdmin, (req, res) => res.status(200).json({ message: 'OK' }));

function getToken(payload: object) {
  return jwt.sign(payload, accessTokenSecret, { expiresIn: '1h' });
}

describe('requireAdmin middleware', () => {
  it('allows access for admin users', async () => {
    const token = getToken({ id: 1, isAdmin: true });
    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('OK');
  });

  it('denies access for non-admin users', async () => {
    const token = getToken({ id: 2, isAdmin: false });
    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Admins only/);
  });

  it('denies access with no token', async () => {
    const res = await request(app).get('/admin-only');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/No token provided/);
  });

  it('denies access with invalid token', async () => {
    const res = await request(app).get('/admin-only').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid token/);
  });
});
