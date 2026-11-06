import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthResult } from '../../common/interfaces/auth-result.interface.js';
import { TokenPair } from '../../common/interfaces/token-pair.interface.js';
import type { RequestUser } from '../../common/interfaces/request-user.interface.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    refreshTokens: vi.fn(),
    setupMfa: vi.fn(),
    verifyMfa: vi.fn(),
    disableMfa: vi.fn(),
    verifyMfaWithToken: vi.fn(),
    requestMagicLink: vi.fn(),
    verifyMagicLink: vi.fn(),
    requestPasscode: vi.fn(),
    verifyPasscode: vi.fn(),
    requestDeviceCode: vi.fn(),
    approveDevice: vi.fn(),
    pollDevice: vi.fn(),
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

  describe('setupMfa', () => {
    it('should start totp setup and return secret, otpauth url and qr code', async () => {
      const result = {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUrl: 'otpauth://totp/NestJS%20Boilerplate:user%40example.com?secret=JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,abc',
      };
      mockAuthService.setupMfa.mockResolvedValue(result);

      const user = { sub: 'user-1', email: 'test@example.com' } as RequestUser;
      const resultFromController = await controller.setupMfa(user);

      expect(resultFromController).toEqual(result);
      expect(mockAuthService.setupMfa).toHaveBeenCalledWith('user-1', 'test@example.com');
    });
  });

  describe('verifyMfa', () => {
    it('should verify totp code and enable mfa', async () => {
      mockAuthService.verifyMfa.mockResolvedValue({ enabled: true });

      const user = { sub: 'user-1', email: 'test@example.com' } as RequestUser;
      const result = await controller.verifyMfa({ code: '123456' }, user);

      expect(result).toEqual({ enabled: true });
      expect(mockAuthService.verifyMfa).toHaveBeenCalledWith('user-1', 'test@example.com', '123456');
    });
  });

  describe('disableMfa', () => {
    it('should disable mfa after verifying totp code', async () => {
      mockAuthService.disableMfa.mockResolvedValue({ enabled: true });

      const user = { sub: 'user-1', email: 'test@example.com' } as RequestUser;
      const result = await controller.disableMfa({ code: '123456' }, user);

      expect(result).toEqual({ enabled: true });
      expect(mockAuthService.disableMfa).toHaveBeenCalledWith('user-1', 'test@example.com', '123456');
    });
  });

  describe('verifyLoginMfa', () => {
    it('should verify totp challenge from login and return tokens', async () => {
      mockAuthService.verifyMfaWithToken.mockResolvedValue({
        enabled: true,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          tokenType: 'Bearer',
        },
      });

      const result = await controller.verifyLoginMfa({ code: '123456', mfaToken: 'mfa-token' });

      expect(result).toEqual({
        enabled: true,
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          tokenType: 'Bearer',
        },
      });
      expect(mockAuthService.verifyMfaWithToken).toHaveBeenCalledWith('mfa-token', '123456');
    });
  });

  describe('requestMagicLink', () => {
    it('should request magic link and return the success response', async () => {
      mockAuthService.requestMagicLink.mockResolvedValue({ success: true });

      const result = await controller.requestMagicLink({ email: 'test@example.com' });

      expect(result).toEqual({ success: true });
      expect(mockAuthService.requestMagicLink).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('verifyMagicLink', () => {
    it('should verify magic link and return the auth result', async () => {
      mockAuthService.verifyMagicLink.mockResolvedValue({
        user: { sub: 'user-1', email: 'test@example.com' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', tokenType: 'Bearer' },
      });

      const result = await controller.verifyMagicLink({ token: 'magic-token' });

      expect(result).toEqual({
        user: { sub: 'user-1', email: 'test@example.com' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', tokenType: 'Bearer' },
      });
      expect(mockAuthService.verifyMagicLink).toHaveBeenCalledWith('magic-token');
    });
  });

  describe('requestPasscode', () => {
    it('should request passcode and return the success response', async () => {
      mockAuthService.requestPasscode.mockResolvedValue({ success: true });

      const result = await controller.requestPasscode({ email: 'test@example.com' });

      expect(result).toEqual({ success: true });
      expect(mockAuthService.requestPasscode).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('verifyPasscode', () => {
    it('should verify passcode and return the auth result', async () => {
      mockAuthService.verifyPasscode.mockResolvedValue({
        user: { sub: 'user-1', email: 'test@example.com' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', tokenType: 'Bearer' },
      });

      const result = await controller.verifyPasscode({ code: '123456' });

      expect(result).toEqual({
        user: { sub: 'user-1', email: 'test@example.com' },
        tokens: { accessToken: 'access-token', refreshToken: 'refresh-token', tokenType: 'Bearer' },
      });
      expect(mockAuthService.verifyPasscode).toHaveBeenCalledWith('123456');
    });
  });

  describe('requestDeviceCode', () => {
    it('should request a device authorization and return the response', async () => {
      mockAuthService.requestDeviceCode.mockResolvedValue({
        deviceCode: 'device-code-1',
        userCode: 'ABCD-EFGH',
        verificationUri: 'http://localhost:3000/auth/device/verify?user_code=ABCD-EFGH',
        verificationUriComplete: 'http://localhost:3000/auth/device/verify?user_code=ABCD-EFGH&client_id=nestjs-device-client',
        expiresIn: 900,
        interval: 5,
      });

      const result = await controller.requestDeviceCode({ clientId: 'nestjs-device-client', scopes: ['openid'] });

      expect(result.deviceCode).toBe('device-code-1');
      expect(mockAuthService.requestDeviceCode).toHaveBeenCalledWith('nestjs-device-client', ['openid']);
    });
  });

  describe('approveDevice', () => {
    it('should approve a device and return the status', async () => {
      mockAuthService.approveDevice.mockResolvedValue({ status: 'APPROVED' });

      const result = await controller.approveDevice({ userCode: 'ABCD-EFGH' }, { sub: 'user-1', mfaVerified: true } as RequestUser);

      expect(result).toEqual({ status: 'APPROVED' });
      expect(mockAuthService.approveDevice).toHaveBeenCalledWith('ABCD-EFGH', { sub: 'user-1', mfaVerified: true });
    });
  });

  describe('pollDevice', () => {
    it('should poll the device and return the poll response', async () => {
      mockAuthService.pollDevice.mockResolvedValue({ status: 'PENDING' });

      const result = await controller.pollDevice({ deviceCode: 'device-code-1' });

      expect(result).toEqual({ status: 'PENDING' });
      expect(mockAuthService.pollDevice).toHaveBeenCalledWith('device-code-1');
    });
  });
});
