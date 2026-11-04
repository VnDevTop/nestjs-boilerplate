import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { JwtStrategy } from './jwt.strategy.js';
import { UsersService } from '../../users/users.service.js';
import { Role } from '../../../common/enums/role.enum.js';
import { User } from '../../users/entities/user.entity.js';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('validate', () => {
    it('should return request user for valid payload', async () => {
      vi.mocked(usersService.findById).mockResolvedValue(mockUser);

      const result = await strategy.validate({
        sub: 'user-1',
        email: 'test@example.com',
        roles: [Role.USER],
      });

      expect(result.sub).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.roles).toEqual([Role.USER]);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException for refresh token', async () => {
      await expect(
        strategy.validate({
          sub: 'user-1',
          email: 'test@example.com',
          roles: [Role.USER],
          type: 'refresh',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      vi.mocked(usersService.findById).mockResolvedValue(null);

      await expect(
        strategy.validate({
          sub: 'non-existent',
          email: 'test@example.com',
          roles: [Role.USER],
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});