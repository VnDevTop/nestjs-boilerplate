import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { OneTimeTokenService } from './one-time-token.service.js';
import { UsersService } from '../users/users.service.js';
import { Role } from '../../common/enums/role.enum.js';
import { AuthMethod } from '../../common/enums/auth-method.enum.js';
import { User } from '../users/entities/user.entity.js';

describe('OneTimeTokenService', () => {
  let service: OneTimeTokenService;
  let usersService: UsersService;

  const mockUser: User = {
    id: 'user-1',
    sub: 'sub-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    givenName: 'Test',
    familyName: 'User',
    picture: null,
    locale: 'en',
    roles: [Role.USER],
    status: 'active' as any,
    totpEnabled: false,
    loginTokenHash: 'hashed-token',
    loginTokenExpiresAt: new Date(Date.now() + 60 * 1000),
    loginTokenConsumed: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OneTimeTokenService,
        {
          provide: UsersService,
          useValue: {
            updateProfile: vi.fn(),
            findByLoginTokenHash: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OneTimeTokenService>(OneTimeTokenService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createToken', () => {
    it('should generate and persist a hashed magic link token', async () => {
      const { token, expiresAt } = await service.createToken('user-1', 'MAGIC_LINK');

      expect(token).toBeDefined();
      expect(expiresAt).toBeInstanceOf(Date);
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', {
        loginTokenHash: createHash('sha256').update(token).digest('hex'),
        loginTokenExpiresAt: expiresAt,
        loginTokenConsumed: false,
      });
    });

    it('should generate a numeric passcode for passcode token type', async () => {
      const { token } = await service.createToken('user-1', 'PASSCODE');

      expect(token).toMatch(/^\d{6}$/);
      expect(usersService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ loginTokenHash: createHash('sha256').update(token).digest('hex') }),
      );
    });
  });

  describe('verifyToken', () => {
    it('should resolve and consume a valid token', async () => {
      vi.mocked(usersService.findByLoginTokenHash).mockResolvedValue(mockUser);

      const result = await service.verifyToken('valid-token');

      expect(result.userId).toBe('user-1');
      expect(result.authMethod).toBe(AuthMethod.MAGIC_LINK);
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', { loginTokenConsumed: true });
    });

    it('should throw UnauthorizedException when token is unknown', async () => {
      vi.mocked(usersService.findByLoginTokenHash).mockResolvedValue(null);

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      vi.mocked(usersService.findByLoginTokenHash).mockResolvedValue({
        ...mockUser,
        loginTokenExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.verifyToken('expired-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is already consumed', async () => {
      vi.mocked(usersService.findByLoginTokenHash).mockResolvedValue({ ...mockUser, loginTokenConsumed: true });

      await expect(service.verifyToken('used-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
