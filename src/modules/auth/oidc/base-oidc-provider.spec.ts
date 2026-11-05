import { describe, expect, it, vi, beforeEach } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

// Concrete implementation for testing
class TestProvider extends BaseOidcProvider {
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: profile.sub ?? profile.id,
      email: profile.email,
      name: profile.name,
    };
  }
}

describe('BaseOidcProvider', () => {
  let provider: TestProvider;
  const config: OidcProviderConfig = {
    name: OidcProvider.GOOGLE,
    enabled: true,
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: ['openid', 'profile', 'email'],
    authorizationUrl: 'https://auth.example.com/authorize',
    tokenUrl: 'https://auth.example.com/token',
    userInfoUrl: 'https://auth.example.com/userinfo',
    issuer: 'https://auth.example.com',
  };

  beforeEach(() => {
    provider = new TestProvider(config);
  });

  describe('properties', () => {
    it('should return name from config', () => {
      expect(provider.name).toBe(OidcProvider.GOOGLE);
    });

    it('should return isEnabled from config', () => {
      expect(provider.isEnabled).toBe(true);
    });

    it('should return config', () => {
      expect(provider.config).toBe(config);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should build authorization URL with all params', () => {
      const url = provider.getAuthorizationUrl('test-state');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid+profile+email');
      expect(url).toContain('state=test-state');
    });

    it('should use custom redirect URI when provided', () => {
      const url = provider.getAuthorizationUrl('test-state', 'http://custom/callback');
      expect(url).toContain('redirect_uri=http%3A%2F%2Fcustom%2Fcallback');
    });
  });

  describe('getUserProfile', () => {
    it('should fetch and map user profile', async () => {
      const mockProfile = { sub: '123', email: 'test@example.com', name: 'Test User' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });

      const claims = await provider.getUserProfile('access-token');
      expect(claims.sub).toBe('123');
      expect(claims.email).toBe('test@example.com');
      expect(claims.name).toBe('Test User');
    });

    it('should throw when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(provider.getUserProfile('bad-token')).rejects.toThrow('Failed to fetch user profile');
    });

    it('should throw when token exchange fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(provider.handleCallback('bad-code', 'state')).rejects.toThrow('Token exchange failed');
    });
  });

  describe('handleCallback', () => {
    it('should exchange code and fetch profile', async () => {
      const mockTokens = { access_token: 'access-token-123' };
      const mockProfile = { sub: '123', email: 'test@example.com', name: 'Test User' };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProfile),
        });

      const claims = await provider.handleCallback('auth-code', 'state');
      expect(claims.sub).toBe('123');
      expect(claims.email).toBe('test@example.com');
    });
  });

  describe('mapProfileToClaims', () => {
    it('should map profile using the base implementation', () => {
      const baseProto = Object.getPrototypeOf(provider) as any;
      const baseMap = Object.getPrototypeOf(baseProto).mapProfileToClaims as any;
      const claims = baseMap.call(provider, {
        sub: 'base-sub',
        login: 'ignored-login',
        email: 'base@example.com',
        verified_email: true,
        first_name: 'First',
        last_name: 'Last',
        avatar_url: 'http://avatar',
        locale: 'en',
        name: 'Full Name',
      });

      expect(claims.sub).toBe('base-sub');
      expect(claims.email).toBe('base@example.com');
      expect(claims.email_verified).toBe(true);
      expect(claims.name).toBe('Full Name');
      expect(claims.given_name).toBe('First');
      expect(claims.family_name).toBe('Last');
      expect(claims.picture).toBe('http://avatar');
      expect(claims.locale).toBe('en');
      expect(claims.iss).toBe('https://auth.example.com');
    });
  });
});