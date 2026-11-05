import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthResult } from '../../common/interfaces/auth-result.interface.js';
import { TokenPair } from '../../common/interfaces/token-pair.interface.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    refreshTokens: vi.fn(),
  };

  const mockAuthResult: AuthResult = {
    user: {
      sub: 'user-1',
      email: 'test@example.com',
      roles: ['USER'] as any,
      emailVerified: true,
      name: 'Test User',
    },
    tokens: {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    } as TokenPair,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return the auth result', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResult);

      const result = await controller.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual(mockAuthResult);
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });

    it('should register without a name when none is provided', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResult);

      await controller.register({ email: 'test@example.com', password: 'password123' });

      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123', undefined);
    });
  });

  describe('login', () => {
    it('should login and return the auth result', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResult);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockAuthResult);
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should propagate UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

      await expect(
        controller.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and return the new auth result', async () => {
      mockAuthService.refreshTokens.mockResolvedValue(mockAuthResult);

      const result = await controller.refresh({ refreshToken: 'valid-refresh-token' });

      expect(result).toEqual(mockAuthResult);
      expect(authService.refreshTokens).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should propagate UnauthorizedException when refresh fails', async () => {
      mockAuthService.refreshTokens.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh({ refreshToken: 'invalid-refresh-token' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
