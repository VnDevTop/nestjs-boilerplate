import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { BaseOidcProvider } from './base-oidc-provider.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Default GitHub OAuth2 endpoints.
 */
const GITHUB_AUTHORIZATION_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_INFO_URL = 'https://api.github.com/user';
const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';

/**
 * GitHub OIDC provider.
 *
 * Implements the OAuth2 flow for GitHub authentication. GitHub is not
 * a full OIDC provider, so we use the OAuth2 user info endpoint and
 * map the response to standard OIDC claims.
 *
 * Note: GitHub may not return an email if the user's email is private.
 * In that case, we fetch emails from the separate `/user/emails` endpoint.
 *
 * Environment variables:
 * - OIDC_GITHUB_CLIENT_ID: GitHub OAuth App client ID
 * - OIDC_GITHUB_CLIENT_SECRET: GitHub OAuth App client secret
 * - OIDC_GITHUB_CALLBACK_URL: Callback URL (optional, defaults to localhost)
 * - OIDC_GITHUB_SCOPES: Comma-separated scopes (optional, defaults to read:user,user:email)
 *
 * @class GithubOidcProvider
 */
export class GithubOidcProvider extends BaseOidcProvider implements IOidcProvider {
  constructor(config: OidcProviderConfig) {
    super({
      ...config,
      name: OidcProvider.GITHUB,
      authorizationUrl: config.authorizationUrl || GITHUB_AUTHORIZATION_URL,
      tokenUrl: config.tokenUrl || GITHUB_TOKEN_URL,
      userInfoUrl: config.userInfoUrl || GITHUB_USER_INFO_URL,
      issuer: config.issuer || 'https://github.com',
      scopes: config.scopes?.length ? config.scopes : ['read:user', 'user:email'],
    });
  }

  /**
   * Exchanges an authorization code for tokens and fetches the user profile.
   *
   * GitHub returns the access token as JSON (with Accept: application/json).
   * We also fetch the user's primary email if not included in the profile.
   *
   * @param code - Authorization code from the callback.
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL used in the authorization request.
   * @returns OIDC claims for the authenticated user.
   */
  async handleCallback(code: string, state: string, redirectUri?: string): Promise<OidcClaims> {
    const tokens = await this.exchangeCodeForTokens(code, redirectUri);
    const profile = await this.fetchRawProfile(tokens.access_token);

    // GitHub may not include email in profile if it's private
    if (!profile.email) {
      const emails = await this.fetchUserEmails(tokens.access_token);
      const primaryEmail = emails.find((e: any) => e.primary) ?? emails[0];
      if (primaryEmail) {
        profile.email = primaryEmail.email;
        profile.email_verified = primaryEmail.verified;
      }
    }

    return this.mapProfileToClaims(profile);
  }

  /**
   * Fetches the raw user profile from GitHub (without mapping).
   *
   * @param accessToken - OAuth2 access token.
   * @returns Raw profile data.
   */
  private async fetchRawProfile(accessToken: string): Promise<Record<string, any>> {
    const response = await fetch(this.config.userInfoUrl!, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetches the user's emails from GitHub.
   *
   * @param accessToken - OAuth2 access token.
   * @returns Array of email objects.
   */
  private async fetchUserEmails(accessToken: string): Promise<any[]> {
    const response = await fetch(GITHUB_USER_EMAILS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  }

  /**
   * Exchanges an authorization code for access token.
   *
   * GitHub requires Accept: application/json header to get JSON response.
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
      redirect_uri: redirectUri ?? this.config.callbackUrl,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(this.config.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fetches the user profile from GitHub.
   *
   * @param accessToken - OAuth2 access token.
   * @returns Raw profile data.
   */
  async getUserProfile(accessToken: string): Promise<OidcClaims> {
    const profile = await this.fetchRawProfile(accessToken);
    return this.mapProfileToClaims(profile);
  }

  /**
   * Maps GitHub's user profile to standard OIDC claims.
   *
   * GitHub returns: id, login, name, email, avatar_url, bio, company, location
   *
   * @param profile - Raw profile from GitHub API.
   * @returns Standard OIDC claims.
   */
  protected mapProfileToClaims(profile: Record<string, any>): OidcClaims {
    return {
      sub: String(profile.id ?? profile.login),
      email: profile.email,
      email_verified: profile.email ? true : undefined,
      name: profile.name ?? profile.login,
      given_name: undefined,
      family_name: undefined,
      picture: profile.avatar_url,
      locale: undefined,
      iss: this.config.issuer ?? 'https://github.com',
    };
  }
}

/**
 * Factory function to create a GitHub OIDC provider from config.
 *
 * @param config - Provider configuration.
 * @returns A new GithubOidcProvider instance.
 */
export function createGithubOidcProvider(config: OidcProviderConfig): GithubOidcProvider {
  return new GithubOidcProvider(config);
}