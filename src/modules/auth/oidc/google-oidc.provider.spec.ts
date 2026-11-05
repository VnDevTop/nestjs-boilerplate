import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';

import { GoogleOidcProvider, createGoogleOidcProvider } from './google-oidc.provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

describe('GoogleOidcProvider', () => {
  const config: OidcProviderConfig = {
    name: OidcProvider.GOOGLE,
    enabled: true,
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [],
    authorizationUrl: undefined,
    tokenUrl: undefined,
    userInfoUrl: undefined,
  };

  it('should create provider with defaults', () => {
    const provider = new GoogleOidcProvider(config);
    expect(provider.name).toBe(OidcProvider.GOOGLE);
    expect(provider.isEnabled).toBe(true);
    expect(provider.config.authorizationUrl).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(provider.config.tokenUrl).toBe('https://oauth2.googleapis.com/token');
    expect(provider.config.userInfoUrl).toBe('https://www.googleapis.com/oauth2/v3/userinfo');
    expect(provider.config.scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('should use custom endpoints when provided', () => {
    const customConfig = { ...config, authorizationUrl: 'https://custom/auth', tokenUrl: 'https://custom/token', userInfoUrl: 'https://custom/userinfo' };
    const provider = new GoogleOidcProvider(customConfig);
    expect(provider.config.authorizationUrl).toBe('https://custom/auth');
    expect(provider.config.tokenUrl).toBe('https://custom/token');
    expect(provider.config.userInfoUrl).toBe('https://custom/userinfo');
  });

  it('should use factory function', () => {
    const provider = createGoogleOidcProvider(config);
    expect(provider).toBeInstanceOf(GoogleOidcProvider);
  });

  it('should map Google profile to OIDC claims', async () => {
    const provider = new GoogleOidcProvider(config);
    const mockProfile = {
      sub: 'google-sub-123',
      email: 'test@gmail.com',
      email_verified: true,
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://example.com/avatar.png',
      locale: 'en',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.sub).toBe('google-sub-123');
    expect(claims.email).toBe('test@gmail.com');
    expect(claims.email_verified).toBe(true);
    expect(claims.name).toBe('Test User');
    expect(claims.given_name).toBe('Test');
    expect(claims.family_name).toBe('User');
    expect(claims.picture).toBe('https://example.com/avatar.png');
    expect(claims.locale).toBe('en');
  });
});