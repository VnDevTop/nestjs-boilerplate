import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('OIDC (e2e)', () => {
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

  describe('GET /auth/oidc/providers', () => {
    it('should list enabled OIDC providers', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/oidc/providers')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const providers: Array<{ name: string; enabled: boolean }> = res.body;
      const google = providers.find((p) => p.name === 'GOOGLE');
      const github = providers.find((p) => p.name === 'GITHUB');

      expect(google).toBeDefined();
      expect(google?.enabled).toBe(true);
      expect(github).toBeDefined();
      expect(github?.enabled).toBe(true);
    });
  });

  describe('GET /auth/oidc/:provider', () => {
    it('should redirect to the Google authorization URL', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/oidc/google')
        .expect(302);

      const location = res.headers.location as string;
      expect(location).toContain(
        'https://accounts.google.com/o/oauth2/v2/auth',
      );
      const url = new URL(location);
      expect(url.searchParams.get('client_id')).toBeTruthy();
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('state')).toBeTruthy();
      expect(url.searchParams.get('scope')).toContain('openid');
    });

    it('should redirect to the GitHub authorization URL', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/oidc/github')
        .expect(302);

      const location = res.headers.location as string;
      expect(location).toContain('https://github.com/login/oauth/authorize');
      const url = new URL(location);
      expect(url.searchParams.get('client_id')).toBeTruthy();
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('state')).toBeTruthy();
    });
  });

  describe('GET /auth/oidc/:provider/callback', () => {
    it.each([['google'], ['github']])(
      'should reject callback with invalid state for %s provider',
      async (provider: string) => {
        const res = await request(app.getHttpServer())
          .get(`/auth/oidc/${provider}/callback`)
          .query({ code: 'invalid-code', state: 'invalid-state' })
          .expect(401);

        expect(res.body).toHaveProperty('message');
      },
    );
  });
});
