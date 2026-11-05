import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';

/**
 * Configuration for a single OIDC provider.
 *
 * @interface OidcProviderConfig
 */
export interface OidcProviderConfig {
  /** Provider identifier. */
  name: OidcProvider;
  /** Whether this provider is enabled (has valid credentials). */
  enabled: boolean;
  /** OAuth2 client ID. */
  clientId: string;
  /** OAuth2 client secret. */
  clientSecret: string;
  /** Callback URL registered with the provider. */
  callbackUrl: string;
  /** OAuth2 scopes to request. */
  scopes: string[];
  /** Authorization endpoint URL. */
  authorizationUrl?: string;
  /** Token endpoint URL. */
  tokenUrl?: string;
  /** User info endpoint URL. */
  userInfoUrl?: string;
  /** OIDC issuer URL (for discovery). */
  issuer?: string;
}