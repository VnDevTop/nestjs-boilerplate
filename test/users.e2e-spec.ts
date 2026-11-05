import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('UsersController (e2e)', () => {
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

  describe('GET /users/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/non-existent-id');

      expect(res.status).toBe(401);
    });

    it('should return the user profile with a valid token', async () => {
      const email = `e2e-user-by-id-${Date.now()}@example.com`;

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', name: 'E2E User' });

      const accessToken = registerRes.body.tokens.accessToken;
      const userId = registerRes.body.user.sub;

      const res = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email');
      expect(res.body.email).toBe(email);
    });
  });

  describe('GET /users/me', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me');

      expect(res.status).toBe(401);
    });

    it('should return the current user profile with a valid token', async () => {
      const email = `e2e-me-${Date.now()}@example.com`;

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', name: 'E2E User' });

      const accessToken = registerRes.body.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email');
      expect(res.body.email).toBe(email);
    });
  });

  describe('PATCH /users/me', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(401);
    });

    it('should update the current user profile with a valid token', async () => {
      const email = `e2e-update-me-${Date.now()}@example.com`;

      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', name: 'E2E User' });

      const accessToken = registerRes.body.tokens.accessToken;

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body.name).toBe('Updated Name');
    });
  });
});
