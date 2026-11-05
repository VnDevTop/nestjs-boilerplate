import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { XOidcProvider, createXOidcProvider } from './x-oidc.provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

describe('XOidcProvider', () => {
  const config: OidcProviderConfig = {
    name: OidcProvider.X,
    enabled: true,
    clientId: 'x-client-id',
    clientSecret: 'x-client-secret',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [],
    authorizationUrl: undefined,
    tokenUrl: undefined,
    userInfoUrl: undefined,
  };

  it('should create provider with defaults', () => {
    const provider = new XOidcProvider(config);
    expect(provider.name).toBe(OidcProvider.X);
    expect(provider.config.authorizationUrl).toBe('https://twitter.com/i/oauth2/authorize');
    expect(provider.config.tokenUrl).toBe('https://api.twitter.com/2/oauth2/token');
    expect(provider.config.userInfoUrl).toBe('https://api.twitter.com/2/users/me');
    expect(provider.config.scopes).toEqual(['tweet.read', 'users.read', 'offline.access']);
  });

  it('should use factory function', () => {
    const provider = createXOidcProvider(config);
    expect(provider).toBeInstanceOf(XOidcProvider);
  });

  it('should use custom endpoints when provided', () => {
    const customConfig = { ...config, authorizationUrl: 'https://custom/auth', tokenUrl: 'https://custom/token', userInfoUrl: 'https://custom/userinfo' };
    const provider = new XOidcProvider(customConfig);
    expect(provider.config.authorizationUrl).toBe('https://custom/auth');
    expect(provider.config.tokenUrl).toBe('https://custom/token');
    expect(provider.config.userInfoUrl).toBe('https://custom/userinfo');
  });

  it('should throw when fetch fails', async () => {
    const provider = new XOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Unauthorized' });
    await expect(provider.getUserProfile('bad-token')).rejects.toThrow('Failed to fetch user profile');
  });

  it('should build authorization URL with PKCE params', () => {
    const provider = new XOidcProvider(config);
    const url = provider.getAuthorizationUrl('test-state');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('client_id=x-client-id');
  });

  it('should map X profile to OIDC claims', async () => {
    const provider = new XOidcProvider(config);
    const mockResponse = {
      data: {
        id: 'x-user-123',
        name: 'Test User',
        username: 'testuser',
        profile_image_url: 'https://pbs.twimg.com/profile_images/123/avatar.jpg',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.sub).toBe('x-user-123');
    expect(claims.name).toBe('Test User');
    expect(claims.picture).toBe('https://pbs.twimg.com/profile_images/123/avatar.jpg');
  });

  it('should use username as sub when id is missing', async () => {
    const provider = new XOidcProvider(config);
    const mockResponse = {
      data: {
        username: 'testuser',
        name: 'Test User',
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.sub).toBe('testuser');
    expect(claims.name).toBe('Test User');
  });
});