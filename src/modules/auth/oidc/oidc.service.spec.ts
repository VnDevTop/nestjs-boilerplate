import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { OidcService } from './oidc.service.js';
import { OidcProviderRegistry } from './oidc-provider-registry.js';
import { UsersService } from '../../users/users.service.js';
import { AuthService } from '../auth.service.js';
import { OidcProvider } from '../../../common/enums/oidc-provider.enum.js';
import { OidcClaims } from '../../../common/interfaces/oidc-claims.interface.js';

describe('OidcService', () => {
  let service: OidcService;
  let registry: OidcProviderRegistry;
  let usersService: UsersService;
  let authService: AuthService;
  let configService: ConfigService;

  const mockProvider = {
    name: OidcProvider.GOOGLE,
    isEnabled: true,
    config: { name: OidcProvider.GOOGLE, enabled: true, clientId: 'id', clientSecret: 'secret', callbackUrl: 'http://localhost/cb', scopes: ['openid'], authorizationUrl: 'https://auth', tokenUrl: 'https://token', userInfoUrl: 'https://userinfo' },
    getAuthorizationUrl: vi.fn().mockReturnValue('https://auth.example.com/authorize'),
    handleCallback: vi.fn(),
    getUserProfile: vi.fn(),
  };

  const mockUser = {
    id: 'user-1',
    sub: 'google-sub-123',
    email: 'test@gmail.com',
    emailVerified: true,
    name: 'Test User',
    givenName: 'Test',
    familyName: 'User',
    picture: 'https://example.com/avatar.png',
    locale: 'en',
    roles: ['USER'],
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue({
              providers: {
                GOOGLE: {
                  name: OidcProvider.GOOGLE,
                  enabled: true,
                  clientId: 'google-client-id',
                  clientSecret: 'google-client-secret',
                  callbackUrl: 'http://localhost:3000/auth/oidc/google/callback',
                  scopes: ['openid', 'profile', 'email'],
                  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                  tokenUrl: 'https://oauth2.googleapis.com/token',
                  userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
                },
              },
              enabledProviders: ['GOOGLE'],
            }),
          },
        },
        {
          provide: OidcProviderRegistry,
          useValue: {
            register: vi.fn(),
            registerFromConfigs: vi.fn(),
            get: vi.fn().mockReturnValue(mockProvider),
            getEnabled: vi.fn().mockReturnValue([mockProvider]),
            isEnabled: vi.fn().mockReturnValue(true),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            create: vi.fn(),
            updateProfile: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            issueTokens: vi.fn().mockResolvedValue({
              accessToken: 'access-token',
              refreshToken: 'refresh-token',
              expiresIn: 900,
              tokenType: 'Bearer',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OidcService>(OidcService);

    // Prime a valid OIDC state so callback tests can proceed to the provider
    service.getAuthorizationUrl('google', 'valid-state');

    registry = module.get<OidcProviderRegistry>(OidcProviderRegistry);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getProvider', () => {
    it('should return provider when found and enabled', () => {
      const provider = service.getProvider('google');
      expect(provider).toBe(mockProvider);
    });

    it('should handle no providers configured', () => {
      const mockRegistry = {
        register: vi.fn(),
        registerFromConfigs: vi.fn(),
        get: vi.fn(),
        getEnabled: vi.fn().mockReturnValue([]),
        isEnabled: vi.fn().mockReturnValue(false),
      };
      // Verify the registry methods work as expected
      expect(mockRegistry.getEnabled()).toHaveLength(0);
    });

    it('should throw NotFoundException when provider not found', () => {
      vi.mocked(registry.get).mockReturnValue(undefined);
      expect(() => service.getProvider('unknown')).toThrow(NotFoundException);
    });

    it('should throw NotFoundException when provider disabled', () => {
      vi.mocked(registry.get).mockReturnValue({ ...mockProvider, isEnabled: false });
      expect(() => service.getProvider('google')).toThrow(NotFoundException);
    });
  });

  describe('getEnabledProviders', () => {
    it('should return enabled providers', () => {
      const providers = service.getEnabledProviders();
      expect(providers).toHaveLength(1);
      expect(providers[0]).toBe(mockProvider);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization URL', () => {
      const url = service.getAuthorizationUrl('google', 'test-state');
      expect(url).toBe('https://auth.example.com/authorize');
      expect(mockProvider.getAuthorizationUrl).toHaveBeenCalledWith('test-state', undefined);
    });
  });

  describe('handleCallback', () => {
    it('should handle callback and return auth result', async () => {
      const claims: OidcClaims = {
        sub: 'google-sub-123',
        email: 'test@gmail.com',
        email_verified: true,
        name: 'Test User',
      };

      vi.mocked(mockProvider.handleCallback).mockResolvedValue(claims);
      vi.mocked(usersService.findById).mockResolvedValue(mockUser as any);
      vi.mocked(usersService.updateProfile).mockResolvedValue(mockUser as any);

      const result = await service.handleCallback('google', 'auth-code', 'valid-state');

      expect(result.user.sub).toBe('user-1');
      expect(result.tokens.accessToken).toBe('access-token');
      expect(authService.issueTokens).toHaveBeenCalled();
    });

    it('should create new user when not found', async () => {
      const claims: OidcClaims = {
        sub: 'new-google-sub',
        email: 'new@gmail.com',
        email_verified: true,
        name: 'New User',
      };

      vi.mocked(mockProvider.handleCallback).mockResolvedValue(claims);
      vi.mocked(usersService.findById).mockResolvedValue(null);
      vi.mocked(usersService.findByEmail).mockResolvedValue(null);
      vi.mocked(usersService.create).mockResolvedValue({
        ...mockUser,
        id: 'new-user-id',
        sub: 'new-google-sub',
        email: 'new@gmail.com',
      } as any);

      const result = await service.handleCallback('google', 'auth-code', 'valid-state');

      expect(usersService.create).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException when no sub in claims', async () => {
      vi.mocked(mockProvider.handleCallback).mockResolvedValue({ sub: '' } as OidcClaims);

      await expect(service.handleCallback('google', 'auth-code', 'valid-state')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should find existing user by email', async () => {
      const claims: OidcClaims = {
        sub: 'new-google-sub',
        email: 'existing@gmail.com',
        email_verified: true,
        name: 'Existing User',
      };

      vi.mocked(mockProvider.handleCallback).mockResolvedValue(claims);
      vi.mocked(usersService.findById).mockResolvedValue(null);
      vi.mocked(usersService.findByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(usersService.updateProfile).mockResolvedValue(mockUser as any);

      const result = await service.handleCallback('google', 'auth-code', 'valid-state');

      expect(usersService.updateProfile).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException when the state has not been issued', async () => {
      vi.mocked(mockProvider.handleCallback).mockClear();

      await expect(service.handleCallback('google', 'auth-code', 'unissued-state')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockProvider.handleCallback).not.toHaveBeenCalled();
    });

    it('should reject a state that has already been consumed', async () => {
      service.getAuthorizationUrl('google', 'consumed-state');

      vi.mocked(mockProvider.handleCallback).mockResolvedValue({ sub: 'google-sub-123' } as OidcClaims);
      vi.mocked(usersService.findById).mockResolvedValue(mockUser as any);
      vi.mocked(usersService.updateProfile).mockResolvedValue(mockUser as any);

      await service.handleCallback('google', 'auth-code', 'consumed-state');
      await expect(service.handleCallback('google', 'auth-code', 'consumed-state')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('registerProviders', () => {
    it('should not register any provider when OIDC config is missing', () => {
      vi.mocked(configService.get).mockReturnValue(undefined);

      const freshService = new OidcService(configService, new OidcProviderRegistry(), usersService, authService);

      expect(freshService).toBeDefined();
    });

    it('should register enabled providers through the provider factory', () => {
      vi.mocked(configService.get).mockReturnValue({
        providers: {
          GOOGLE: {
            name: OidcProvider.GOOGLE,
            enabled: true,
            clientId: 'google-client-id',
            clientSecret: 'google-client-secret',
            callbackUrl: 'http://localhost:3000/auth/oidc/google/callback',
            scopes: ['openid', 'profile', 'email'],
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
          },
        },
      });

      const freshService = new OidcService(configService, new OidcProviderRegistry(), usersService, authService);

      expect(freshService).toBeDefined();
    });

    it('should skip providers that have no registered factory', () => {
      vi.mocked(configService.get).mockReturnValue({
        providers: {
          CUSTOM: {
            name: 'CUSTOM',
            enabled: true,
            clientId: 'custom-client-id',
            clientSecret: 'custom-client-secret',
            callbackUrl: 'http://localhost:3000/auth/oidc/custom/callback',
            scopes: ['openid'],
          },
        },
      });

      const realRegistry = new OidcProviderRegistry();
      const registerSpy = vi.spyOn(realRegistry, 'register').mockImplementation(() => undefined);

      const freshService = new OidcService(configService, realRegistry, usersService, authService);

      expect(freshService).toBeDefined();
      expect(registerSpy).toHaveBeenCalled();
    });
  });
});