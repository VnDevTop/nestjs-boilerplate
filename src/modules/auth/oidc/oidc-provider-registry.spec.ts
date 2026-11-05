import { describe, expect, it, vi } from 'vitest';

import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcProviderRegistry } from './oidc-provider-registry.js';


describe('OidcProviderRegistry', () => {
  let registry: OidcProviderRegistry;

  beforeEach(() => {
    registry = new OidcProviderRegistry();
  });

  const createMockProvider = (name: OidcProvider, enabled: boolean) => {
    return {
      name,
      isEnabled: enabled,
      config: { name, enabled, clientId: 'id', clientSecret: 'secret', callbackUrl: 'http://localhost/callback', scopes: ['openid'], authorizationUrl: 'https://auth', tokenUrl: 'https://token', userInfoUrl: 'https://userinfo' },
      getAuthorizationUrl: vi.fn(),
      handleCallback: vi.fn(),
      getUserProfile: vi.fn(),
    } as any;
  };

  describe('register', () => {
    it('should register a provider', () => {
      const provider = createMockProvider(OidcProvider.GOOGLE, true);
      registry.register(provider);
      expect(registry.get(OidcProvider.GOOGLE)).toBe(provider);
    });
  });

  describe('get', () => {
    it('should return registered provider', () => {
      const provider = createMockProvider(OidcProvider.GOOGLE, true);
      registry.register(provider);
      expect(registry.get(OidcProvider.GOOGLE)).toBe(provider);
    });

    it('should return undefined for unregistered provider', () => {
      expect(registry.get(OidcProvider.GOOGLE)).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered providers', () => {
      const p1 = createMockProvider(OidcProvider.GOOGLE, true);
      const p2 = createMockProvider(OidcProvider.GITHUB, true);
      registry.register(p1);
      registry.register(p2);
      expect(registry.getAll()).toHaveLength(2);
    });

    it('should return empty array when no providers registered', () => {
      expect(registry.getAll()).toHaveLength(0);
    });
  });

  describe('getEnabled', () => {
    it('should return only enabled providers', () => {
      const enabled = createMockProvider(OidcProvider.GOOGLE, true);
      const disabled = createMockProvider(OidcProvider.GITHUB, false);
      registry.register(enabled);
      registry.register(disabled);
      const result = registry.getEnabled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(enabled);
    });
  });

  describe('isEnabled', () => {
    it('should return true for enabled provider', () => {
      const provider = createMockProvider(OidcProvider.GOOGLE, true);
      registry.register(provider);
      expect(registry.isEnabled(OidcProvider.GOOGLE)).toBe(true);
    });

    it('should return false for disabled provider', () => {
      const provider = createMockProvider(OidcProvider.GOOGLE, false);
      registry.register(provider);
      expect(registry.isEnabled(OidcProvider.GOOGLE)).toBe(false);
    });

    it('should return false for unregistered provider', () => {
      expect(registry.isEnabled(OidcProvider.GOOGLE)).toBe(false);
    });
  });

  describe('registerFromConfigs', () => {
    it('should register providers from configs', () => {
      const configs = [
        { name: OidcProvider.GOOGLE, enabled: true, clientId: 'id', clientSecret: 'secret', callbackUrl: 'http://localhost/cb', scopes: ['openid'], authorizationUrl: 'https://auth', tokenUrl: 'https://token', userInfoUrl: 'https://userinfo' },
      ];
      const factory = vi.fn().mockImplementation((config) => createMockProvider(config.name, config.enabled));
      registry.registerFromConfigs(configs as any, factory);
      expect(factory).toHaveBeenCalled();
      expect(registry.get(OidcProvider.GOOGLE)).toBeDefined();
    });

    it('should skip disabled providers', () => {
      const configs = [
        { name: OidcProvider.GOOGLE, enabled: false, clientId: 'id', clientSecret: 'secret', callbackUrl: 'http://localhost/cb', scopes: ['openid'], authorizationUrl: 'https://auth', tokenUrl: 'https://token', userInfoUrl: 'https://userinfo' },
      ];
      const factory = vi.fn().mockImplementation((config) => createMockProvider(config.name, config.enabled));
      registry.registerFromConfigs(configs as any, factory);
      expect(registry.get(OidcProvider.GOOGLE)).toBeUndefined();
    });
  });
});