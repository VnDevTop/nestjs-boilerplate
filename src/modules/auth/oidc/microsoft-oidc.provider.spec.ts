import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { MicrosoftOidcProvider, createMicrosoftOidcProvider } from './microsoft-oidc.provider.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

describe('MicrosoftOidcProvider', () => {
  const config: OidcProviderConfig = {
    name: OidcProvider.MICROSOFT,
    enabled: true,
    clientId: 'ms-client-id',
    clientSecret: 'ms-client-secret',
    callbackUrl: 'http://localhost:3000/callback',
    scopes: [],
    authorizationUrl: undefined,
    tokenUrl: undefined,
    userInfoUrl: undefined,
  };

  it('should create provider with defaults', () => {
    const provider = new MicrosoftOidcProvider(config);
    expect(provider.name).toBe(OidcProvider.MICROSOFT);
    expect(provider.config.tokenUrl).toBe('https://login.microsoftonline.com/common/oauth2/v2.0/token');
    expect(provider.config.userInfoUrl).toBe('https://graph.microsoft.com/v1.0/me');
    expect(provider.config.scopes).toEqual(['openid', 'profile', 'email', 'User.Read']);
  });

  it('should use factory function', () => {
    const provider = createMicrosoftOidcProvider(config);
    expect(provider).toBeInstanceOf(MicrosoftOidcProvider);
  });

  it('should use custom endpoints when provided', () => {
    const customConfig = { ...config, authorizationUrl: 'https://custom/auth', tokenUrl: 'https://custom/token', userInfoUrl: 'https://custom/userinfo' };
    const provider = new MicrosoftOidcProvider(customConfig);
    expect(provider.config.authorizationUrl).toBe('https://custom/auth');
    expect(provider.config.tokenUrl).toBe('https://custom/token');
    expect(provider.config.userInfoUrl).toBe('https://custom/userinfo');
  });

  it('should map Microsoft profile to OIDC claims', async () => {
    const provider = new MicrosoftOidcProvider(config);
    const mockProfile = {
      id: 'ms-user-123',
      mail: 'test@outlook.com',
      displayName: 'Test User',
      givenName: 'Test',
      surname: 'User',
      preferredLanguage: 'en',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.sub).toBe('ms-user-123');
    expect(claims.email).toBe('test@outlook.com');
    expect(claims.email_verified).toBe(true);
    expect(claims.name).toBe('Test User');
    expect(claims.given_name).toBe('Test');
    expect(claims.family_name).toBe('User');
    expect(claims.locale).toBe('en');
  });

  it('should use userPrincipalName when mail is missing', async () => {
    const provider = new MicrosoftOidcProvider(config);
    const mockProfile = {
      id: 'ms-user-123',
      userPrincipalName: 'test@contoso.com',
      displayName: 'Test User',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const claims = await provider.getUserProfile('access-token');
    expect(claims.email).toBe('test@contoso.com');
  });

  it('should handle callback and return mapped claims', async () => {
    const provider = new MicrosoftOidcProvider(config);
    global.fetch = vi.fn().mockImplementation(async (url: any) => {
      if (String(url).includes('token')) {
        return { ok: true, json: async () => ({ access_token: 'ms-access-token', id_token: 'ms-id-token' }) };
      }
      return {
        ok: true,
        json: async () => ({
          id: 'ms-user-123',
          mail: 'test@outlook.com',
          displayName: 'Test User',
          givenName: 'Test',
          surname: 'User',
          preferredLanguage: 'en',
        }),
      };
    });

    const claims = await provider.handleCallback('auth-code', 'state', config.callbackUrl);

    expect(claims.sub).toBe('ms-user-123');
    expect(claims.email_verified).toBe(true);
  });
});