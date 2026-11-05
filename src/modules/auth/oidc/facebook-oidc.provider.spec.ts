import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { FacebookOidcProvider, createFacebookOidcProvider } from './facebook-oidc.provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

describe('FacebookOidcProvider', () => {
  const config: OidcProviderConfig = {
    name: OidcProvider.FACEBOOK,
    enabled: true,
    clientId: 'fb-app-id',
    clientSecret: 'fb-app-secret',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [],
    authorizationUrl: undefined,
    tokenUrl: undefined,
    userInfoUrl: undefined,
  };

  it('should create provider with defaults', () => {
    const provider = new FacebookOidcProvider(config);
    expect(provider.name).toBe(OidcProvider.FACEBOOK);
    expect(provider.config.authorizationUrl).toBe('https://www.facebook.com/v18.0/dialog/oauth');
    expect(provider.config.tokenUrl).toBe('https://graph.facebook.com/v18.0/oauth/access_token');
    expect(provider.config.userInfoUrl).toBe('https://graph.facebook.com/v18.0/me');
    expect(provider.config.scopes).toEqual(['email', 'public_profile']);
  });

  it('should use factory function', () => {
    const provider = createFacebookOidcProvider(config);
    expect(provider).toBeInstanceOf(FacebookOidcProvider);
  });

  it('should use custom endpoints when provided', () => {
    const customConfig = { ...config, authorizationUrl: 'https://custom/auth', tokenUrl: 'https://custom/token', userInfoUrl: 'https://custom/userinfo' };
    const provider = new FacebookOidcProvider(customConfig);
    expect(provider.config.authorizationUrl).toBe('https://custom/auth');
    expect(provider.config.tokenUrl).toBe('https://custom/token');
    expect(provider.config.userInfoUrl).toBe('https://custom/userinfo');
  });

  it('should throw when fetch fails', async () => {
    const provider = new FacebookOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Unauthorized' });
    await expect(provider.getUserProfile('bad-token')).rejects.toThrow('Failed to fetch user profile');
  });

  it('should build authorization URL with comma-separated scopes', () => {
    const provider = new FacebookOidcProvider(config);
    const url = provider.getAuthorizationUrl('test-state');
    expect(url).toContain('scope=email%2Cpublic_profile');
  });

  it('should map Facebook profile to OIDC claims', async () => {
    const provider = new FacebookOidcProvider(config);
    const mockProfile = {
      id: 'fb-user-123',
      name: 'Test User',
      email: 'test@facebook.com',
      first_name: 'Test',
      last_name: 'User',
      picture: { data: { url: 'https://example.com/avatar.png', is_silhouette: false } },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.sub).toBe('fb-user-123');
    expect(claims.email).toBe('test@facebook.com');
    expect(claims.email_verified).toBe(true);
    expect(claims.name).toBe('Test User');
    expect(claims.given_name).toBe('Test');
    expect(claims.family_name).toBe('User');
    expect(claims.picture).toBe('https://example.com/avatar.png');
  });
});