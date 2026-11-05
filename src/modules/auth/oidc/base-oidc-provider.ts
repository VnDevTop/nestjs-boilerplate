import { Logger } from '@nestjs/common';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Abstract base class for OIDC providers.
 *
 * Provides common functionality for building authorization URLs,
 * exchanging codes for tokens, and fetching user profiles. Concrete
 * providers extend this class and override provider-specific behavior.
 *
 * @abstract
 * @class BaseOidcProvider
 */
export abstract class BaseOidcProvider implements IOidcProvider {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly providerConfig: OidcProviderConfig) {}

  get name(): string {
    return this.providerConfig.name;
  }

  get isEnabled(): boolean {
    return this.providerConfig.enabled;
  }

  get config(): OidcProviderConfig {
    return this.providerConfig;
  }

  /**
   * Builds the authorization URL to redirect the user to the provider.
   *
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL (defaults to config callbackUrl).
   * @returns The full authorization URL.
   */
  getAuthorizationUrl(state: string, redirectUri?: string): string {
    const url = new URL(this.providerConfig.authorizationUrl!);
    url.searchParams.set('client_id', this.providerConfig.clientId);
    url.searchParams.set('redirect_uri', redirectUri ?? this.providerConfig.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.providerConfig.scopes.join(' '));
    url.searchParams.set('state', state);
    return url.toString();
  }

  /**
   * Exchanges an authorization code for tokens and fetches the user profile.
   *
   * Default implementation uses standard OAuth2 token exchange. Providers
   * with non-standard flows should override this method.
   *
   * @param code - Authorization code from the callback.
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL used in the authorization request.
   * @returns OIDC claims for the authenticated user.
   */
  async handleCallback(code: string, state: string, redirectUri?: string): Promise<OidcClaims> {
    const tokens = await this.exchangeCodeForTokens(code, redirectUri);
    return this.getUserProfile(tokens.access_token);
  }

  /**
   * Fetches the user profile using an access token.
   *
   * Default implementation calls the userInfo endpoint. Providers with
   * non-standard profile endpoints should override this method.
   *
   * @param accessToken - OAuth2 access token.
   * @returns OIDC claims for the user.
   */
  async getUserProfile(accessToken: string): Promise<OidcClaims> {
    const response = await fetch(this.providerConfig.userInfoUrl!, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapProfileToClaims(data);
  }

  /**
   * Exchanges an authorization code for access/refresh tokens.
   *
   * @param code - Authorization code.
   * @param redirectUri - Callback URL.
   * @returns Token response.
   */
  protected async exchangeCodeForTokens(
    code: string,
    redirectUri?: string,
  ): Promise<{ access_token: string; id_token?: string; refresh_token?: string }> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri ?? this.providerConfig.callbackUrl,
      client_id: this.providerConfig.clientId,
      client_secret: this.providerConfig.clientSecret,
    });

    const response = await fetch(this.providerConfig.tokenUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Maps a provider-specific profile response to standard OIDC claims.
   *
   * Subclasses should override this to handle provider-specific field names.
   *
   * @param profile - Raw profile data from the provider.
   * @returns Standard OIDC claims.
   */
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: profile.sub ?? profile.id ?? profile.login,
      email: profile.email,
      email_verified: profile.email_verified ?? profile.verified_email,
      name: profile.name,
      given_name: profile.given_name ?? profile.first_name,
      family_name: profile.family_name ?? profile.last_name,
      picture: profile.picture ?? profile.avatar_url,
      locale: profile.locale,
      iss: this.providerConfig.issuer,
    };
  }
}