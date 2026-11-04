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
  });

  describe('GET /users/me', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should return 401 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(401);
    });
  });
});