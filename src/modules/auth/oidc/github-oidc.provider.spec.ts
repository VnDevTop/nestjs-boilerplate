import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { GithubOidcProvider, createGithubOidcProvider } from './github-oidc.provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

describe('GithubOidcProvider', () => {
  const config: OidcProviderConfig = {
    name: OidcProvider.GITHUB,
    enabled: true,
    clientId: 'github-client-id',
    clientSecret: 'github-client-secret',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [],
    authorizationUrl: undefined,
    tokenUrl: undefined,
    userInfoUrl: undefined,
  };

  it('should create provider with defaults', () => {
    const provider = new GithubOidcProvider(config);
    expect(provider.name).toBe(OidcProvider.GITHUB);
    expect(provider.config.authorizationUrl).toBe('https://github.com/login/oauth/authorize');
    expect(provider.config.tokenUrl).toBe('https://github.com/login/oauth/access_token');
    expect(provider.config.userInfoUrl).toBe('https://api.github.com/user');
    expect(provider.config.scopes).toEqual(['read:user', 'user:email']);
  });

  it('should use factory function', () => {
    const provider = createGithubOidcProvider(config);
    expect(provider).toBeInstanceOf(GithubOidcProvider);
  });

  it('should use custom endpoints when provided', () => {
    const customConfig = { ...config, authorizationUrl: 'https://custom/auth', tokenUrl: 'https://custom/token', userInfoUrl: 'https://custom/userinfo' };
    const provider = new GithubOidcProvider(customConfig);
    expect(provider.config.authorizationUrl).toBe('https://custom/auth');
    expect(provider.config.tokenUrl).toBe('https://custom/token');
    expect(provider.config.userInfoUrl).toBe('https://custom/userinfo');
  });

  it('should throw when fetch fails for profile', async () => {
    const provider = new GithubOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Unauthorized' });
    await expect(provider.getUserProfile('bad-token')).rejects.toThrow('Failed to fetch user profile');
  });

  it('should return empty emails when fetch fails', async () => {
    const provider = new GithubOidcProvider(config);
    const mockProfile = { id: 12345, login: 'testuser', email: null };
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ access_token: 'access-token' }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockProfile) })
      .mockResolvedValueOnce({ ok: false, statusText: 'Unauthorized' });
    const claims = await provider.handleCallback('auth-code', 'state');
    expect(claims.sub).toBe('12345');
    expect(claims.email).toBeNull();
  });

  it('should throw when token exchange fails', async () => {
    const provider = new GithubOidcProvider(config);
    global.fetch = vi.fn().mockResolvedValue({ ok: false, statusText: 'Bad Request' });
    await expect(provider.handleCallback('bad-code', 'state')).rejects.toThrow('Token exchange failed');
  });

  it('should map GitHub profile to OIDC claims', async () => {
    const provider = new GithubOidcProvider(config);
    const mockProfile = {
      id: 12345,
      login: 'testuser',
      name: 'Test User',
      email: 'test@github.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.sub).toBe('12345');
    expect(claims.email).toBe('test@github.com');
    expect(claims.email_verified).toBe(true);
    expect(claims.name).toBe('Test User');
    expect(claims.picture).toBe('https://avatars.githubusercontent.com/u/12345');
  });

  it('should use login as name when name is missing', async () => {
    const provider = new GithubOidcProvider(config);
    const mockProfile = {
      id: 12345,
      login: 'testuser',
      email: null,
    };

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ access_token: 'access-token' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ email: 'test@github.com', primary: true, verified: true }]),
      });

    const claims = await provider.handleCallback('auth-code', 'state');
    expect(claims.sub).toBe('12345');
    expect(claims.name).toBe('testuser');
  });
});