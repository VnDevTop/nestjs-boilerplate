import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { OidcProviderRegistry } from './../src/modules/auth/oidc/oidc-provider-registry.js';
import { OidcService } from './../src/modules/auth/oidc/oidc.service.js';

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
      expect(location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
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
    it.each([
      ['google'],
      ['github'],
    ])('should reject callback with invalid state for %s provider', async (provider: string) => {
      const res = await request(app.getHttpServer())
        .get(`/auth/oidc/${provider}/callback`)
        .query({ code: 'invalid-code', state: 'invalid-state' })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /auth/oidc/:provider/callback with mocked provider (e2e)', () => {
    let appWithMockProvider: INestApplication<App>;
    let moduleFixtureWithMock: TestingModule;
    let mockOidcProvider: {
      name: string;
      isEnabled: boolean;
      getAuthorizationUrl: ReturnType<typeof vi.fn>;
      handleCallback: ReturnType<typeof vi.fn>;
      getUserProfile: ReturnType<typeof vi.fn>;
    };
    const mockOidcRegistry = {
      register: vi.fn(),
      registerFromConfigs: vi.fn(),
      get: vi.fn(),
      getEnabled: vi.fn(),
      isEnabled: vi.fn(),
    };

    beforeEach(async () => {
      mockOidcProvider = {
        name: 'GOOGLE',
        isEnabled: true,
        getAuthorizationUrl: vi.fn().mockReturnValue('https://auth.example.com/authorize'),
        handleCallback: vi.fn().mockResolvedValue({
          sub: 'google-sub-123',
          email: 'oidc-e2e@example.com',
          email_verified: true,
          name: 'Mock OIDC User',
        }),
        getUserProfile: vi.fn(),
      };
      mockOidcRegistry.get.mockReturnValue(mockOidcProvider);
      mockOidcRegistry.getEnabled.mockReturnValue([mockOidcProvider]);
      mockOidcRegistry.isEnabled.mockReturnValue(true);

      moduleFixtureWithMock = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(OidcProviderRegistry)
        .useValue(mockOidcRegistry)
        .compile();

      appWithMockProvider = moduleFixtureWithMock.createNestApplication();
      await appWithMockProvider.init();
    });

    afterEach(async () => {
      await appWithMockProvider.close();
    });

    it('should complete callback flow with mocked provider data', async () => {
      const oidcService = moduleFixtureWithMock.get<OidcService>(OidcService);

      const url = oidcService.getAuthorizationUrl('google', 'mock-state');
      expect(url).toBe('https://auth.example.com/authorize');

      const res = await request(appWithMockProvider.getHttpServer())
        .get('/auth/oidc/google/callback')
        .query({ code: 'mock-code', state: 'mock-state' })
        .expect(200);

      expect(mockOidcProvider.handleCallback).toHaveBeenCalledWith('mock-code', 'mock-state', undefined);
      expect(res.body).toHaveProperty('tokens');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
    });
  });
});
