import { Injectable, Logger } from '@nestjs/common';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';

import { IOidcProvider } from './oidc-provider.interface.js';
import { OidcProviderConfig } from './oidc-provider-config.interface.js';

/**
 * Registry for OIDC providers.
 *
 * Manages the lifecycle of multiple OIDC providers, allowing them to
 * be enabled/disabled via configuration. Multiple providers can be
 * active simultaneously.
 *
 * @class OidcProviderRegistry
 */
@Injectable()
export class OidcProviderRegistry {
  private readonly logger = new Logger(OidcProviderRegistry.name);
  private readonly providers = new Map<OidcProvider, IOidcProvider>();

  /**
   * Registers a provider instance.
   *
   * @param provider - The OIDC provider to register.
   */
  register(provider: IOidcProvider): void {
    this.providers.set(provider.name as OidcProvider, provider);
    this.logger.log(`Registered OIDC provider: ${provider.name} (enabled: ${provider.isEnabled})`);
  }

  /**
   * Gets a provider by name.
   *
   * @param name - Provider name.
   * @returns The provider or undefined if not registered.
   */
  get(name: OidcProvider): IOidcProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Gets all registered providers.
   *
   * @returns Array of all registered providers.
   */
  getAll(): IOidcProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Gets all enabled providers.
   *
   * @returns Array of enabled providers.
   */
  getEnabled(): IOidcProvider[] {
    return this.getAll().filter((p) => p.isEnabled);
  }

  /**
   * Checks if a provider is registered and enabled.
   *
   * @param name - Provider name.
   * @returns True if the provider is enabled.
   */
  isEnabled(name: OidcProvider): boolean {
    return this.get(name)?.isEnabled ?? false;
  }

  /**
   * Creates and registers providers from configuration.
   *
   * @param configs - Array of provider configurations.
   * @param factory - Factory function to create provider instances.
   */
  registerFromConfigs(
    configs: OidcProviderConfig[],
    factory: (config: OidcProviderConfig) => IOidcProvider,
  ): void {
    for (const config of configs) {
      if (config.enabled) {
        const provider = factory(config);
        this.register(provider);
      }
    }
  }
}