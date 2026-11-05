import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Default Apple OIDC endpoints.
 */
const APPLE_AUTHORIZATION_URL = 'https://appleid.apple.com/auth/authorize';
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
const APPLE_ISSUER = 'https://appleid.apple.com';

/**
 * Apple OIDC provider.
 *
 * Implements the OpenID Connect flow for Sign in with Apple.
 *
 * Note: Apple does NOT provide a userinfo endpoint. User profile data
 * (name, email) is returned in the ID token (JWT) and only on the
 * first authorization. Subsequent logins only return the `sub` claim.
 *
 * Apple also requires the client_secret to be a JWT signed with the
 * developer's private key. In this implementation, the client_secret
 * should be set to the pre-generated JWT (client secret JWT).
 *
 * Environment variables:
 * - OIDC_APPLE_CLIENT_ID: Apple Service ID (client ID)
 * - OIDC_APPLE_CLIENT_SECRET: Apple client secret JWT (signed with private key)
 * - OIDC_APPLE_CALLBACK_URL: Callback URL (optional, defaults to localhost)
 * - OIDC_APPLE_SCOPES: Comma-separated scopes (optional, defaults to openid,name,email)
 *
 * @class AppleOidcProvider
 */
export class AppleOidcProvider extends BaseOidcProvider implements IOidcProvider {
  constructor(config: OidcProviderConfig) {
    super({
      ...config,
      name: OidcProvider.APPLE,
      authorizationUrl: config.authorizationUrl ?? APPLE_AUTHORIZATION_URL,
      tokenUrl: config.tokenUrl ?? APPLE_TOKEN_URL,
      userInfoUrl: config.userInfoUrl ?? '', // Apple has no userinfo endpoint
      issuer: config.issuer ?? APPLE_ISSUER,
      scopes: config.scopes?.length ? config.scopes : ['openid', 'name', 'email'],
    });
  }

  /**
   * Exchanges an authorization code for tokens and extracts user claims
   * from the ID token (Apple does not have a userinfo endpoint).
   *
   * @param code - Authorization code from the callback.
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL used in the authorization request.
   * @returns OIDC claims for the authenticated user.
   */
  async handleCallback(code: string, state: string, redirectUri?: string): Promise<OidcClaims> {
    const tokens = await this.exchangeCodeForTokens(code, redirectUri);

    // Apple returns user info in the ID token (JWT)
    if (tokens.id_token) {
      const claims = this.decodeIdToken(tokens.id_token);
      return claims;
    }

    // Fallback: try userinfo endpoint (shouldn't happen for Apple)
    if (tokens.access_token && this.config.userInfoUrl) {
      return this.getUserProfile(tokens.access_token);
    }

    throw new Error('Apple did not return an ID token');
  }

  /**
   * Apple does not have a userinfo endpoint. Profile data comes from
   * the ID token.
   *
   * @param accessToken - OAuth2 access token.
   * @returns OIDC claims (empty if no ID token available).
   */
  async getUserProfile(_accessToken: string): Promise<OidcClaims> {
    // Apple doesn't have a userinfo endpoint
    // This method is kept for interface compliance
    throw new Error('Apple does not support a userinfo endpoint. Use handleCallback instead.');
  }

  /**
   * Decodes the ID token (JWT) to extract OIDC claims.
   *
   * Apple's ID token contains: sub, email, email_verified, name, etc.
   * Note: Apple only returns name on first authorization.
   *
   * @param idToken - The ID token JWT string.
   * @returns OIDC claims extracted from the ID token.
   */
  private decodeIdToken(idToken: string): OidcClaims {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid ID token format');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name?.firstName && payload.name?.lastName
        ? `${payload.name.firstName} ${payload.name.lastName}`
        : payload.name,
      given_name: payload.name?.firstName,
      family_name: payload.name?.lastName,
      picture: undefined, // Apple doesn't provide profile pictures
      locale: undefined,
      iss: payload.iss ?? APPLE_ISSUER,
      aud: payload.aud,
      exp: payload.exp,
      iat: payload.iat,
    };
  }

  /**
   * Maps Apple's profile to standard OIDC claims.
   *
   * @param profile - Raw profile data.
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
      iss: this.config.issuer ?? APPLE_ISSUER,
    };
  }
}

/**
 * Factory function to create an Apple OIDC provider from config.
 *
 * @param config - Provider configuration.
 * @returns A new AppleOidcProvider instance.
 */
export function createAppleOidcProvider(config: OidcProviderConfig): AppleOidcProvider {
  return new AppleOidcProvider(config);
}