import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Contract that every OIDC provider must implement.
 *
 * Providers are registered in the `OidcProviderRegistry` and can be
 * enabled/disabled via configuration. Multiple providers can be active
 * simultaneously.
 *
 * @interface IOidcProvider
 */
export interface IOidcProvider {
  /** Provider identifier. */
  readonly name: string;

  /** Whether this provider is configured and enabled. */
  readonly isEnabled: boolean;

  /** Provider configuration. */
  readonly config: OidcProviderConfig;

  /**
   * Builds the authorization URL to redirect the user to the provider.
   *
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL.
   * @returns The full authorization URL.
   */
  getAuthorizationUrl(state: string, redirectUri?: string): string;

  /**
   * Exchanges an authorization code for tokens and fetches the user profile.
   *
   * @param code - Authorization code from the callback.
   * @param state - CSRF state parameter (for verification).
   * @param redirectUri - Callback URL used in the authorization request.
   * @returns OIDC claims for the authenticated user.
   */
  handleCallback(code: string, state: string, redirectUri?: string): Promise<OidcClaims>;

  /**
   * Fetches the user profile using an access token.
   *
   * @param accessToken - OAuth2 access token.
   * @returns OIDC claims for the user.
   */
  getUserProfile(accessToken: string): Promise<OidcClaims>;
}