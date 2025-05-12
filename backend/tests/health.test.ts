import request from 'supertest';
import app from '../src/app';

describe('Health Check Endpoint', () => {
  it('should return a 200 status and a message', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OK');
  });

  it('should return proper JSON content type', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should respond quickly (under 200ms)', async () => {
    const startTime = Date.now();
    await request(app).get('/health');
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(200);
  });

  it('should return 405 for POST requests', async () => {
    const response = await request(app).post('/health');
    expect(response.status).toBe(405);
    expect(response.body.error).toBe('Method not allowed');
  });

  it('should return 405 for PUT requests', async () => {
    const response = await request(app).put('/health');
    expect(response.status).toBe(405);
    expect(response.body.error).toBe('Method not allowed');
  });

  it('should return 405 for DELETE requests', async () => {
    const response = await request(app).delete('/health');
    expect(response.status).toBe(405);
    expect(response.body.error).toBe('Method not allowed');
  });

  it('should have the correct response structure', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toEqual({
      message: 'OK',
    });
    expect(Object.keys(response.body).length).toBe(1);
  });
});
