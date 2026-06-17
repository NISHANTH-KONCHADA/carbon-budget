process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../server');

describe('GET /api/health', () => {
  test('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Validation on auth routes', () => {
  test('rejects registration with an invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'not-an-email',
      password: 'longenoughpassword',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
  });

  test('rejects registration with a short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });
});

describe('Auth guard on protected routes', () => {
  test('rejects activity creation without a token', async () => {
    const res = await request(app).post('/api/activities').send({
      category: 'transport',
      type: 'car_petrol',
      quantity: 10,
    });
    expect(res.status).toBe(401);
  });

  test('rejects requests with a malformed token', async () => {
    const res = await request(app)
      .get('/api/activities')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('Unknown routes', () => {
  test('returns 404 for an undefined route', async () => {
    const res = await request(app).get('/api/this-does-not-exist');
    expect(res.status).toBe(404);
  });
});
