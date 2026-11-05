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

  for (const provider of Object.values(OidcProvider)) {
    const prefix = `OIDC_${provider}`;
    const clientId = process.env[`${prefix}_CLIENT_ID`];
    const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];

    if (clientId && clientSecret) {
      providers[provider] = {
        name: provider,
        enabled: true,
        clientId,
        clientSecret,
        callbackUrl: process.env[`${prefix}_CALLBACK_URL`] ?? `http://localhost:3000/auth/oidc/${provider.toLowerCase()}/callback`,
        scopes: process.env[`${prefix}_SCOPES`]?.split(',') ?? ['openid', 'profile', 'email'],
      };
    }
  }

  return {
    providers,
    enabledProviders: Object.keys(providers),
  };
});