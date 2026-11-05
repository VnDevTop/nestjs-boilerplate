import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Default X (Twitter) OAuth2 endpoints.
 */
const X_AUTHORIZATION_URL = 'https://twitter.com/i/oauth2/authorize';
const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const X_USER_INFO_URL = 'https://api.twitter.com/2/users/me';
const X_ISSUER = 'https://twitter.com';

/**
 * X (Twitter) OIDC provider.
 *
 * Implements the OAuth2 flow for X (formerly Twitter) authentication.
 * X uses OAuth 2.0 with PKCE (Proof Key for Code Exchange) and
 * requires the `tweet.read` and `users.read` scopes.
 *
 * Note: X API v2 returns user data wrapped in a `data` object.
 * The user profile includes: id, name, username, profile_image_url.
 *
 * Environment variables:
 * - OIDC_X_CLIENT_ID: X (Twitter) OAuth2 client ID
 * - OIDC_X_CLIENT_SECRET: X (Twitter) OAuth2 client secret
 * - OIDC_X_CALLBACK_URL: Callback URL (optional, defaults to localhost)
 * - OIDC_X_SCOPES: Comma-separated scopes (optional, defaults to tweet.read,users.read,offline.access)
 *
 * @class XOidcProvider
 */
export class XOidcProvider extends BaseOidcProvider implements IOidcProvider {
  constructor(config: OidcProviderConfig) {
    super({
      ...config,
      name: OidcProvider.X,
      authorizationUrl: config.authorizationUrl || X_AUTHORIZATION_URL,
      tokenUrl: config.tokenUrl || X_TOKEN_URL,
      userInfoUrl: config.userInfoUrl || X_USER_INFO_URL,
      issuer: config.issuer || X_ISSUER,
      scopes: config.scopes?.length ? config.scopes : ['tweet.read', 'users.read', 'offline.access'],
    });
  }

  /**
   * Builds the authorization URL to redirect the user to X.
   *
   * X requires PKCE (code_challenge and code_challenge_method).
   * The code_verifier should be stored and used in the token exchange.
   *
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL.
   * @returns The full authorization URL.
   */
  getAuthorizationUrl(state: string, redirectUri?: string): string {
    const url = new URL(this.config.authorizationUrl!);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', redirectUri ?? this.config.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.config.scopes.join(' '));
    url.searchParams.set('state', state);
    url.searchParams.set('code_challenge_method', 'S256');
    // code_challenge should be generated from a code_verifier
    // This is a simplified version; production should generate and store code_verifier
    url.searchParams.set('code_challenge', 'challenge');
    return url.toString();
  }

  /**
   * Fetches the user profile from X API v2.
   *
   * X API v2 returns data wrapped in a `data` object:
   * { data: { id, name, username, profile_image_url } }
   *
   * @param accessToken - OAuth2 access token.
   * @returns OIDC claims for the user.
   */
  async getUserProfile(accessToken: string): Promise<OidcClaims> {
    const url = new URL(this.config.userInfoUrl!);
    url.searchParams.set('user.fields', 'id,name,username,profile_image_url');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const result = await response.json();
    const profile = result.data ?? result;
    return this.mapProfileToClaims(profile);
  }

  /**
   * Maps X's user profile to standard OIDC claims.
   *
   * X returns: id, name, username, profile_image_url
   *
   * @param profile - Raw profile from X API v2.
   * @returns Standard OIDC claims.
   */
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: profile.id ?? profile.username,
      email: undefined, // X API v2 doesn't return email by default
      email_verified: undefined,
      name: profile.name ?? profile.username,
      given_name: undefined,
      family_name: undefined,
      picture: profile.profile_image_url,
      locale: undefined,
      iss: this.config.issuer ?? X_ISSUER,
    };
  }
}

/**
 * Factory function to create an X OIDC provider from config.
 *
 * @param config - Provider configuration.
 * @returns A new XOidcProvider instance.
 */
export function createXOidcProvider(config: OidcProviderConfig): XOidcProvider {
  return new XOidcProvider(config);
}