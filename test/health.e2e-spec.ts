import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('HealthController (e2e)', () => {
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

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app.getHttpServer()).get('/health').expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe('ok');
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready').expect(200);

      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe('ok');
    });
  });
});
