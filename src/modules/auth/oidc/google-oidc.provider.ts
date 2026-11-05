import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Default Google OIDC endpoints.
 */
const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_ISSUER = 'https://accounts.google.com';

/**
 * Google OIDC provider.
 *
 * Implements the OpenID Connect flow for Google authentication.
 * Supports Google Workspace and personal Google accounts.
 *
 * Environment variables:
 * - OIDC_GOOGLE_CLIENT_ID: Google OAuth2 client ID
 * - OIDC_GOOGLE_CLIENT_SECRET: Google OAuth2 client secret
 * - OIDC_GOOGLE_CALLBACK_URL: Callback URL (optional, defaults to localhost)
 * - OIDC_GOOGLE_SCOPES: Comma-separated scopes (optional, defaults to openid,profile,email)
 *
 * @class GoogleOidcProvider
 */
export class GoogleOidcProvider extends BaseOidcProvider implements IOidcProvider {
  constructor(config: OidcProviderConfig) {
    super({
      ...config,
      name: OidcProvider.GOOGLE,
      authorizationUrl: config.authorizationUrl || GOOGLE_AUTHORIZATION_URL,
      tokenUrl: config.tokenUrl || GOOGLE_TOKEN_URL,
      userInfoUrl: config.userInfoUrl || GOOGLE_USER_INFO_URL,
      issuer: config.issuer || GOOGLE_ISSUER,
      scopes: config.scopes?.length ? config.scopes : ['openid', 'profile', 'email'],
    });
  }

  /**
   * Maps Google's user info response to standard OIDC claims.
   *
   * Google returns: sub, email, email_verified, name, given_name,
   * family_name, picture, locale
   *
   * @param profile - Raw profile from Google userinfo endpoint.
   * @returns Standard OIDC claims.
   */
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: profile.sub,
      email: profile.email,
      email_verified: profile.email_verified,
      name: profile.name,
      given_name: profile.given_name,
      family_name: profile.family_name,
      picture: profile.picture,
      locale: profile.locale,
      iss: this.config.issuer ?? GOOGLE_ISSUER,
    };
  }
}

/**
 * Factory function to create a Google OIDC provider from config.
 *
 * @param config - Provider configuration.
 * @returns A new GoogleOidcProvider instance.
 */
export function createGoogleOidcProvider(config: OidcProviderConfig): GoogleOidcProvider {
  return new GoogleOidcProvider(config);
}