import { verifyToken } from './verifyToken';
import { getJwtSecrets } from '@/utils/jwtSecrets';
import jwt from 'jsonwebtoken';
import express from 'express';
import request from 'supertest';

const { accessTokenSecret } = getJwtSecrets();

// Helper to create a test app using the middleware
function createTestApp() {
  const app = express();
  app.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ auth: req.auth });
  });
  return app;
}

describe('verifyToken middleware', () => {
  it('should return 401 if no Authorization header', async () => {
    const app = createTestApp();
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('should return 401 if Authorization header is malformed', async () => {
    const app = createTestApp();
    const res = await request(app).get('/protected').set('Authorization', 'NotBearer token');
    expect(res.status).toBe(401);
  });

  it('should return 401 if token is invalid', async () => {
    const app = createTestApp();
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });

  it('should set req.auth and call next for valid token', async () => {
    const payload = { userId: '123', userEmail: 'a@b.com', userName: 'Test' };
    const token = jwt.sign(payload, accessTokenSecret, { expiresIn: '1h' });
    const app = createTestApp();
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.auth.userId).toBe('123');
    expect(res.body.auth.userEmail).toBe('a@b.com');
    expect(res.body.auth.userName).toBe('Test');
  });
});
