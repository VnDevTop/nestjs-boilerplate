import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Default Microsoft OIDC endpoints (multi-tenant / common).
 */
const MICROSOFT_AUTHORIZATION_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_USER_INFO_URL = 'https://graph.microsoft.com/v1.0/me';
const MICROSOFT_ISSUER = 'https://login.microsoftonline.com/common/v2.0';

/**
 * Microsoft OIDC provider.
 *
 * Implements the OpenID Connect flow for Microsoft (Azure AD / Entra ID)
 * authentication. Supports both personal and work/school accounts.
 *
 * Environment variables:
 * - OIDC_MICROSOFT_CLIENT_ID: Microsoft OAuth2 client ID (Application ID)
 * - OIDC_MICROSOFT_CLIENT_SECRET: Microsoft OAuth2 client secret (client secret value)
 * - OIDC_MICROSOFT_CALLBACK_URL: Callback URL (optional, defaults to localhost)
 * - OIDC_MICROSOFT_SCOPES: Comma-separated scopes (optional, defaults to openid,profile,email,User.Read)
 *
 * @class MicrosoftOidcProvider
 */
export class MicrosoftOidcProvider extends BaseOidcProvider implements IOidcProvider {
  constructor(config: OidcProviderConfig) {
    super({
      ...config,
      name: OidcProvider.MICROSOFT,
      authorizationUrl: config.authorizationUrl || MICROSOFT_AUTHORIZATION_URL,
      tokenUrl: config.tokenUrl || MICROSOFT_TOKEN_URL,
      userInfoUrl: config.userInfoUrl || MICROSOFT_USER_INFO_URL,
      issuer: config.issuer || MICROSOFT_ISSUER,
      scopes: config.scopes?.length ? config.scopes : ['openid', 'profile', 'email', 'User.Read'],
    });
  }

  /**
   * Exchanges an authorization code for tokens and fetches the user profile.
   *
   * Microsoft Graph returns the profile with different field names:
   * - id → sub
   * - mail / userPrincipalName → email
   * - displayName → name
   * - givenName → given_name
   * - surname → family_name
   *
   * @param code - Authorization code from the callback.
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL used in the authorization request.
   * @returns OIDC claims for the authenticated user.
   */
  async handleCallback(code: string, state: string, redirectUri?: string): Promise<OidcClaims> {
    const tokens = await this.exchangeCodeForTokens(code, redirectUri);
    const profile = await this.getUserProfile(tokens.access_token);
    return this.mapProfileToClaims(profile);
  }

  /**
   * Maps Microsoft Graph profile response to standard OIDC claims.
   *
   * Microsoft Graph returns: id, displayName, givenName, surname,
   * mail, userPrincipalName, preferredLanguage
   *
   * @param profile - Raw profile from Microsoft Graph.
   * @returns Standard OIDC claims.
   */
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: profile.id ?? profile.sub,
      email: profile.mail ?? profile.userPrincipalName,
      email_verified: true, // Microsoft accounts are considered verified
      name: profile.displayName,
      given_name: profile.givenName,
      family_name: profile.surname,
      picture: undefined, // Microsoft Graph requires separate photo endpoint
      locale: profile.preferredLanguage,
      iss: this.config.issuer ?? MICROSOFT_ISSUER,
    };
  }
}

/**
 * Factory function to create a Microsoft OIDC provider from config.
 *
 * @param config - Provider configuration.
 * @returns A new MicrosoftOidcProvider instance.
 */
export function createMicrosoftOidcProvider(config: OidcProviderConfig): MicrosoftOidcProvider {
  return new MicrosoftOidcProvider(config);
}