import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { AppleOidcProvider, createAppleOidcProvider } from './apple-oidc.provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

describe('AppleOidcProvider', () => {
  const config: OidcProviderConfig = {
    name: OidcProvider.APPLE,
    enabled: true,
    clientId: 'com.example.app',
    clientSecret: 'apple-client-secret-jwt',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [],
    authorizationUrl: undefined,
    tokenUrl: undefined,
    userInfoUrl: '',
  };

  it('should create provider with defaults', () => {
    const provider = new AppleOidcProvider(config);
    expect(provider.name).toBe(OidcProvider.APPLE);
    expect(provider.config.authorizationUrl).toBe('https://appleid.apple.com/auth/authorize');
    expect(provider.config.tokenUrl).toBe('https://appleid.apple.com/auth/token');
    expect(provider.config.scopes).toEqual(['openid', 'name', 'email']);
  });

  it('should use factory function', () => {
    const provider = createAppleOidcProvider(config);
    expect(provider).toBeInstanceOf(AppleOidcProvider);
  });

  it('should use custom endpoints when provided', () => {
    const customConfig = { ...config, authorizationUrl: 'https://custom/auth', tokenUrl: 'https://custom/token' };
    const provider = new AppleOidcProvider(customConfig);
    expect(provider.config.authorizationUrl).toBe('https://custom/auth');
    expect(provider.config.tokenUrl).toBe('https://custom/token');
  });

  it('should throw when ID token format is invalid', async () => {
    const provider = new AppleOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'access-token', id_token: 'invalid-token' }),
    });
    await expect(provider.handleCallback('auth-code', 'state')).rejects.toThrow('Invalid ID token format');
  });

  it('should throw when no ID token returned', async () => {
    const provider = new AppleOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'access-token' }),
    });
    await expect(provider.handleCallback('auth-code', 'state')).rejects.toThrow('Apple did not return an ID token');
  });

  it('should throw when token exchange fails', async () => {
    const provider = new AppleOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad Request' });
    await expect(provider.handleCallback('auth-code', 'state')).rejects.toThrow('Token exchange failed');
  });

  it('should throw when calling getUserProfile', async () => {
    const provider = new AppleOidcProvider(config);
    await expect(provider.getUserProfile('access-token')).rejects.toThrow('Apple does not support a userinfo endpoint');
  });

  it('should decode ID token and return claims', async () => {
    const provider = new AppleOidcProvider(config);
    // Create a mock JWT with payload
    const payload = {
      sub: 'apple-sub-123',
      email: 'test@icloud.com',
      email_verified: true,
      name: { firstName: 'John', lastName: 'Doe' },
      iss: 'https://appleid.apple.com',
      aud: 'com.example.app',
      exp: 1234567890,
      iat: 1234567800,
    };
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const idToken = `${header}.${body}.signature`;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'access-token', id_token: idToken }),
    });

    const claims = await provider.handleCallback('auth-code', 'state');
    expect(claims.sub).toBe('apple-sub-123');
    expect(claims.email).toBe('test@icloud.com');
    expect(claims.email_verified).toBe(true);
    expect(claims.name).toBe('John Doe');
    expect(claims.given_name).toBe('John');
    expect(claims.family_name).toBe('Doe');
    expect(claims.iss).toBe('https://appleid.apple.com');
  });

  it('should fall back to userinfo endpoint when no ID token is returned', async () => {
    const fallbackConfig = { ...config, userInfoUrl: 'https://custom.userinfo.example.com' };
    const provider = new AppleOidcProvider(fallbackConfig);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'access-token' }),
    });

    await expect(provider.handleCallback('auth-code', 'state')).rejects.toThrow(
      'Apple does not support a userinfo endpoint',
    );
  });

  it('should map profile to standard OIDC claims', () => {
    const provider = new AppleOidcProvider(config);
    const mapProfileToClaims = (provider as any).mapProfileToClaims.bind(provider);

    const claims = mapProfileToClaims({
      sub: 'apple-sub-123',
      email: 'test@icloud.com',
      email_verified: true,
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      locale: 'en',
    });

    expect(claims.sub).toBe('apple-sub-123');
    expect(claims.email).toBe('test@icloud.com');
    expect(claims.email_verified).toBe(true);
    expect(claims.name).toBe('John Doe');
  });
});