import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { Role } from '../src/common/enums/role.enum.js';
import { seedUser, cleanupUser } from './helpers/seed.js';

describe('AdminController (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;
  let adminUserId: string;
  let adminAccessToken: string;
  let userId: string;
  let userEmail: string;
  let userAccessToken: string;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const suffix = Date.now();

    const adminSeed = await seedUser(moduleFixture, {
      email: `e2e-admin-${suffix}@example.com`,
      password: 'password123',
      name: 'E2E Admin',
    }, [Role.ADMIN]);

    adminUserId = adminSeed.userId;
    adminAccessToken = adminSeed.tokens.accessToken;

    const userSeed = await seedUser(moduleFixture, {
      email: `e2e-user-${suffix}@example.com`,
      password: 'password123',
      name: 'E2E User',
    }, []);

    userId = userSeed.userId;
    userEmail = `e2e-user-${suffix}@example.com`;
    userAccessToken = userSeed.tokens.accessToken;
  });

  afterAll(async () => {
    await cleanupUser(moduleFixture, userId);
    await cleanupUser(moduleFixture, adminUserId);
    await app.close();
  });

  describe('GET /admin/users', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/admin/users');

      expect(res.status).toBe(401);
    });

    it('should return 403 with a non-admin user token', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 200 with an admin token', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer()).get(`/admin/users/${userId}`);

      expect(res.status).toBe(401);
    });

    it('should return 403 with a non-admin user token', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/users/${userId}`)
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(res.status).toBe(403);
    });

    it('should return the user profile with an admin token', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email');
      expect(res.body.email).toBe(userEmail);
    });
  });

  describe('PATCH /admin/users/:id/roles', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${userId}/roles`)
        .send({ roles: [Role.ADMIN] });

      expect(res.status).toBe(401);
    });

    it('should return 403 with a non-admin user token', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${userId}/roles`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ roles: [Role.ADMIN] });

      expect(res.status).toBe(403);
    });

    it('should assign the admin role to the user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${userId}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ roles: [Role.ADMIN] })
        .expect(200);

      expect(res.body).toHaveProperty('roles');
      expect(Array.isArray(res.body.roles)).toBe(true);

      // The promoted user must now be able to access admin endpoints.
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userEmail, password: 'password123' })
        .expect(200);

      const accessToken = loginRes.body.tokens.accessToken;

      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 400 when the provided role is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${userId}/roles`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ roles: ['INVALID_ROLE'] });

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /admin/users/:id/deactivate', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/users/${userId}/deactivate`);

      expect(res.status).toBe(401);
    });

    it('should return 200 with an admin token', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });
  });
});
