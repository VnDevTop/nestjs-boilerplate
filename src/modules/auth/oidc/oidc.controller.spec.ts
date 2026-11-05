import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { OidcController } from './oidc.controller.js';
import { OidcService } from './oidc.service.js';

describe('OidcController', () => {
  let controller: OidcController;
  let oidcService: OidcService;

  const mockAuthResult = {
    user: {
      sub: 'user-1',
      email: 'test@example.com',
      roles: ['USER'],
      emailVerified: true,
      name: 'Test User',
    },
    tokens: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    },
  };

  const mockOidcService = {
    getEnabledProviders: vi.fn(),
    getAuthorizationUrl: vi.fn(),
    handleCallback: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcController],
      providers: [
        {
          provide: OidcService,
          useValue: mockOidcService,
        },
      ],
    }).compile();

    controller = module.get<OidcController>(OidcController);
    oidcService = module.get<OidcService>(OidcService);
  });

  describe('getProviders', () => {
    it('should return the list of enabled OIDC providers', () => {
      mockOidcService.getEnabledProviders.mockReturnValue([
        { name: 'Google', isEnabled: true },
        { name: 'GitHub', isEnabled: false },
      ]);

      const result = controller.getProviders();

      expect(result).toEqual([
        { name: 'Google', enabled: true },
        { name: 'GitHub', enabled: false },
      ]);
      expect(oidcService.getEnabledProviders).toHaveBeenCalled();
    });
  });

  describe('initiateOidc', () => {
    it('should redirect to the authorization url for the provider', () => {
      mockOidcService.getAuthorizationUrl.mockReturnValue('https://auth.example.com/authorize');

      const res = { redirect: vi.fn() };

      controller.initiateOidc('google', 'https://app.example.com/callback', res as any);

      expect(mockOidcService.getAuthorizationUrl).toHaveBeenCalledWith(
        'google',
        expect.any(String),
        'https://app.example.com/callback',
      );
      expect(res.redirect).toHaveBeenCalledWith('https://auth.example.com/authorize');
    });
  });

  describe('handleCallback', () => {
    it('should return the auth result from the OIDC callback', async () => {
      mockOidcService.handleCallback.mockResolvedValue(mockAuthResult);

      const result = await controller.handleCallback('google', 'auth-code', 'state', 'https://app.example.com/callback');

      expect(result).toEqual(mockAuthResult);
      expect(oidcService.handleCallback).toHaveBeenCalledWith('google', 'auth-code', 'state', 'https://app.example.com/callback');
    });
  });
});
