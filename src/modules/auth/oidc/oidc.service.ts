import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service.js';
import { AuthService } from '../auth.service.js';
import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';
import { AuthResult } from '../../../common/interfaces/auth-result.interface.js';
import { OidcProviderRegistry } from './oidc-provider-registry.js';
import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';
import { createGoogleOidcProvider } from './google-oidc.provider.js';
import { createMicrosoftOidcProvider } from './microsoft-oidc.provider.js';
import { createGithubOidcProvider } from './github-oidc.provider.js';
import { createAppleOidcProvider } from './apple-oidc.provider.js';
import { createFacebookOidcProvider } from './facebook-oidc.provider.js';
import { createXOidcProvider } from './x-oidc.provider.js';

/**
 * Factory mapping provider names to their constructor functions.
 */
const PROVIDER_FACTORIES: Record<string, (config: OidcProviderConfig) => any> = {
  [OidcProvider.GOOGLE]: createGoogleOidcProvider,
  [OidcProvider.MICROSOFT]: createMicrosoftOidcProvider,
  [OidcProvider.GITHUB]: createGithubOidcProvider,
  [OidcProvider.APPLE]: createAppleOidcProvider,
  [OidcProvider.FACEBOOK]: createFacebookOidcProvider,
  [OidcProvider.X]: createXOidcProvider,
};

/**
 * OIDC service managing provider registration and authentication flows.
 *
 * Registers all enabled providers from configuration at startup and
 * provides methods to initiate and handle OIDC callbacks.
 *
 * @class OidcService
 */
@Injectable()
export class OidcService {
  private readonly logger = new Logger(OidcService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly oidcRegistry: OidcProviderRegistry,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    this.registerProviders();
  }

  /**
   * Registers all enabled OIDC providers from configuration.
   */
  private registerProviders(): void {
    const oidcConfig = this.configService.get<any>('oidc');
    if (!oidcConfig?.providers) {
      this.logger.log('No OIDC providers configured');
      return;
    }

    const configs: OidcProviderConfig[] = Object.values(oidcConfig.providers);

    this.oidcRegistry.registerFromConfigs(configs, (config) => {
      const factory = PROVIDER_FACTORIES[config.name];
      if (!factory) {
        this.logger.warn(`No factory found for provider: ${config.name}`);
        return null as any;
      }
      return factory(config);
    });

    const enabled = this.oidcRegistry.getEnabled();
    this.logger.log(`Registered ${enabled.length} OIDC provider(s): ${enabled.map((p) => p.name).join(', ')}`);
  }

  /**
   * Gets a provider by name.
   *
   * @param providerName - Provider name (case-insensitive).
   * @returns The provider instance.
   * @throws NotFoundException if the provider is not registered or enabled.
   */
  getProvider(providerName: string): IOidcProvider {
    const name = providerName.toUpperCase() as OidcProvider;
    const provider = this.oidcRegistry.get(name);

    if (!provider || !provider.isEnabled) {
      throw new NotFoundException(`OIDC provider '${providerName}' is not available`);
    }

    return provider;
  }

  /**
   * Gets all enabled providers.
   *
   * @returns Array of enabled providers.
   */
  getEnabledProviders(): IOidcProvider[] {
    return this.oidcRegistry.getEnabled();
  }

  /**
   * Initiates the OIDC flow by generating an authorization URL.
   *
   * @param providerName - Provider name.
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL.
   * @returns The authorization URL to redirect the user to.
   */
  getAuthorizationUrl(providerName: string, state: string, redirectUri?: string): string {
    const provider = this.getProvider(providerName);
    return provider.getAuthorizationUrl(state, redirectUri);
  }

  /**
   * Handles the OIDC callback, exchanges the code for tokens,
   * fetches the user profile, creates/updates the user, and issues JWT tokens.
   *
   * @param providerName - Provider name.
   * @param code - Authorization code from the callback.
   * @param state - CSRF state parameter.
   * @param redirectUri - Callback URL.
   * @returns Authentication result with JWT tokens.
   */
  async handleCallback(providerName: string, code: string, state: string, redirectUri?: string): Promise<AuthResult> {
    const provider = this.getProvider(providerName);

    this.logger.log(`Handling OIDC callback for provider: ${provider.name}`);

    // Exchange code for tokens and fetch user profile
    const claims = await provider.handleCallback(code, state, redirectUri);

    if (!claims.sub) {
      throw new UnauthorizedException('OIDC provider did not return a subject identifier');
    }

    // Find or create user
    const user = await this.findOrCreateUser(claims, provider.name);

    // Issue JWT tokens
    const tokens = await this.authService.issueTokens({
      sub: user.id,
      email: user.email,
      roles: user.roles as any,
    });

    const requestUser = {
      sub: user.id,
      email: user.email,
      roles: user.roles as any,
      emailVerified: user.emailVerified,
      name: user.name ?? undefined,
    };

    return { user: requestUser, tokens };
  }

  /**
   * Finds an existing user by OIDC subject or creates a new one.
   *
   * @param claims - OIDC claims from the provider.
   * @param providerName - Provider name.
   * @returns The user entity.
   */
  private async findOrCreateUser(claims: OidcClaims, providerName: string): Promise<any> {
    // Try to find by sub (OIDC subject)
    let user = await this.usersService.findById(claims.sub);

    if (!user) {
      // Try to find by email
      if (claims.email) {
        user = await this.usersService.findByEmail(claims.email);
      }
    }

    if (user) {
      // Update profile with latest claims
      this.logger.log(`Updating existing user from ${providerName}: ${user.id}`);
      return this.usersService.updateProfile(user.id, {
        name: claims.name ?? user.name,
        givenName: claims.given_name ?? user.givenName,
        familyName: claims.family_name ?? user.familyName,
        picture: claims.picture ?? user.picture,
        locale: claims.locale ?? user.locale,
        emailVerified: claims.email_verified ?? user.emailVerified,
      });
    }

    // Create new user
    this.logger.log(`Creating new user from ${providerName}: ${claims.sub}`);
    return this.usersService.create({
      sub: claims.sub,
      email: claims.email ?? `${claims.sub}@${providerName.toLowerCase()}.oidc`,
      emailVerified: claims.email_verified ?? false,
      name: claims.name ?? null,
      givenName: claims.given_name ?? null,
      familyName: claims.family_name ?? null,
      picture: claims.picture ?? null,
      locale: claims.locale ?? null,
      roles: ['USER'],
      status: 'ACTIVE' as any,
    });
  }
}