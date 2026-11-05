import { registerAs } from '@nestjs/config';

import { OidcProvider } from '../common/enums/oidc-provider.enum.js';

/**
 * OIDC (OpenID Connect) provider configuration namespace.
 *
 * Supports multiple providers simultaneously. Each provider is enabled
 * when its client ID and secret are provided via environment variables.
 *
 * Environment variables follow the pattern:
 * - OIDC_{PROVIDER}_CLIENT_ID
 * - OIDC_{PROVIDER}_CLIENT_SECRET
 * - OIDC_{PROVIDER}_CALLBACK_URL (optional, has defaults)
 *
 * Providers: GOOGLE, MICROSOFT, GITHUB, APPLE, FACEBOOK, X
 *
 * This config follows the same pattern as `database.config.ts` and `cache.config.ts`.
 */
export const oidcConfig = registerAs('oidc', () => {
  const providers: Record<string, any> = {};

  // Provider-specific endpoint defaults
  const PROVIDER_ENDPOINTS: Record<string, { authorizationUrl: string; tokenUrl: string; userInfoUrl: string; issuer: string }> = {
    GOOGLE: {
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
      issuer: 'https://accounts.google.com',
    },
    MICROSOFT: {
      authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      issuer: 'https://login.microsoftonline.com/common/v2.0',
    },
  };

  for (const provider of Object.values(OidcProvider)) {
    const prefix = `OIDC_${provider}`;
    const clientId = process.env[`${prefix}_CLIENT_ID`];
    const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];

    if (clientId && clientSecret) {
      const endpoints = PROVIDER_ENDPOINTS[provider] ?? {};
      providers[provider] = {
        name: provider,
        enabled: true,
        clientId,
        clientSecret,
        callbackUrl: process.env[`${prefix}_CALLBACK_URL`] ?? `http://localhost:3000/auth/oidc/${provider.toLowerCase()}/callback`,
        scopes: process.env[`${prefix}_SCOPES`]?.split(',') ?? ['openid', 'profile', 'email'],
        authorizationUrl: process.env[`${prefix}_AUTHORIZATION_URL`] ?? endpoints.authorizationUrl,
        tokenUrl: process.env[`${prefix}_TOKEN_URL`] ?? endpoints.tokenUrl,
        userInfoUrl: process.env[`${prefix}_USER_INFO_URL`] ?? endpoints.userInfoUrl,
        issuer: process.env[`${prefix}_ISSUER`] ?? endpoints.issuer,
      };
    }
  }

  return {
    providers,
    enabledProviders: Object.keys(providers),
  };
});