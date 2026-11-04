import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const email = `e2e-register-${Date.now()}@example.com`;
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'E2E User',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
      expect(res.body.tokens.tokenType).toBe('Bearer');
    });

    it('should reject duplicate registration', async () => {
      const email = `e2e-duplicate-${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123' });

      // Second registration with same email
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const email = `e2e-login-${Date.now()}@example.com`;

      // Register first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
    });

    it('should reject invalid password', async () => {
      const email = `e2e-invalid-pw-${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `nonexistent-${Date.now()}@example.com`,
          password: 'password123',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const email = `e2e-refresh-${Date.now()}@example.com`;

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123' });

      const refreshToken = registerRes.body.tokens.refreshToken;

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('should access protected route with valid token', async () => {
      const email = `e2e-protected-${Date.now()}@example.com`;

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123' });

      const accessToken = registerRes.body.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });

    it('should reject access without token', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me');

      expect(res.status).toBe(401);
    });

    it('should reject access with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});