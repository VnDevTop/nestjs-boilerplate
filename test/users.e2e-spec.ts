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
    it('should return null for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/non-existent-id');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /users/me', () => {
    it('should return null when no user is authenticated', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me');
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /users/me', () => {
    it('should return null when no user is authenticated', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
    });
  });
});