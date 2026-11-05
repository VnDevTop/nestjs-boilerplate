import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Default Facebook OAuth2 endpoints.
 */
const FACEBOOK_AUTHORIZATION_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
const FACEBOOK_USER_INFO_URL = 'https://graph.facebook.com/v18.0/me';
const FACEBOOK_ISSUER = 'https://www.facebook.com';

/**
 * Facebook OIDC provider.
 *
 * Implements the OAuth2 flow for Facebook authentication. Facebook is not
 * a full OIDC provider, so we use the Graph API user endpoint and map
 * the response to standard OIDC claims.
 *
 * Note: Facebook requires the `fields` parameter in the userinfo request
 * to specify which profile fields to return.
 *
 * Environment variables:
 * - OIDC_FACEBOOK_CLIENT_ID: Facebook App ID
 * - OIDC_FACEBOOK_CLIENT_SECRET: Facebook App Secret
 * - OIDC_FACEBOOK_CALLBACK_URL: Callback URL (optional, defaults to localhost)
 * - OIDC_FACEBOOK_SCOPES: Comma-separated scopes (optional, defaults to email,public_profile)
 *
 * @class FacebookOidcProvider
 */
export class FacebookOidcProvider extends BaseOidcProvider implements IOidcProvider {
  constructor(config: OidcProviderConfig) {
    super({
      ...config,
      name: OidcProvider.FACEBOOK,
      authorizationUrl: config.authorizationUrl || FACEBOOK_AUTHORIZATION_URL,
      tokenUrl: config.tokenUrl || FACEBOOK_TOKEN_URL,
      userInfoUrl: config.userInfoUrl || FACEBOOK_USER_INFO_URL,
      issuer: config.issuer || FACEBOOK_ISSUER,
      scopes: config.scopes?.length ? config.scopes : ['email', 'public_profile'],
    });
  }

  /**
   * Builds the authorization URL to redirect the user to Facebook.
   *
   * Facebook requires the `scope` parameter for permissions.
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
    url.searchParams.set('scope', this.config.scopes.join(','));
    url.searchParams.set('state', state);
    return url.toString();
  }

  /**
   * Fetches the user profile from Facebook Graph API.
   *
   * Facebook requires the `fields` parameter to specify which
   * profile fields to return.
   *
   * @param accessToken - OAuth2 access token.
   * @returns OIDC claims for the user.
   */
  async getUserProfile(accessToken: string): Promise<OidcClaims> {
    const url = new URL(this.config.userInfoUrl!);
    url.searchParams.set('fields', 'id,name,email,first_name,last_name,picture');
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const profile = await response.json();
    return this.mapProfileToClaims(profile);
  }

  /**
   * Maps Facebook's user profile to standard OIDC claims.
   *
   * Facebook returns: id, name, email, first_name, last_name,
   * picture: { data: { url, is_silhouette } }
   *
   * @param profile - Raw profile from Facebook Graph API.
   * @returns Standard OIDC claims.
   */
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: profile.id,
      email: profile.email,
      email_verified: profile.email ? true : undefined,
      name: profile.name,
      given_name: profile.first_name,
      family_name: profile.last_name,
      picture: profile.picture?.data?.url,
      locale: undefined,
      iss: this.config.issuer ?? FACEBOOK_ISSUER,
    };
  }
}

/**
 * Factory function to create a Facebook OIDC provider from config.
 *
 * @param config - Provider configuration.
 * @returns A new FacebookOidcProvider instance.
 */
export function createFacebookOidcProvider(config: OidcProviderConfig): FacebookOidcProvider {
  return new FacebookOidcProvider(config);
}