import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersService } from './users.service.js';
import { Role } from '../../common/enums/role.enum.js';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;

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
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            create: vi.fn(),
            findBySub: vi.fn(),
            findByEmail: vi.fn(),
            update: vi.fn(),
            softDelete: vi.fn(),
            purgeSoftDeleted: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData = { email: 'new@example.com', sub: 'sub-456' };
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);

      const result = await service.create(createData);

      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      vi.mocked(userRepository.findBySub).mockResolvedValue(mockUser);

      const result = await service.findById('sub-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findBySub).toHaveBeenCalledWith('sub-123');
    });

    it('should return null when user not found', async () => {
      vi.mocked(userRepository.findBySub).mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
      expect(userRepository.findBySub).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found by email', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.mocked(userRepository.update).mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith('user-1', updateData);
    });

    it('should return null when user not found for update', async () => {
      vi.mocked(userRepository.update).mockResolvedValue(null);

      const result = await service.updateProfile('non-existent', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('changeRoles', () => {
    it('should change user roles with valid roles', async () => {
      const updatedUser = { ...mockUser, roles: [Role.ADMIN] };
      vi.mocked(userRepository.update).mockResolvedValue(updatedUser);

      const result = await service.changeRoles('user-1', [Role.ADMIN]);

      expect(result).toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith('user-1', { roles: [Role.ADMIN] });
    });

    it('should throw BadRequestException for invalid roles', async () => {
      await expect(service.changeRoles('user-1', ['INVALID_ROLE'])).rejects.toThrow(BadRequestException);
      await expect(service.changeRoles('user-1', ['INVALID_ROLE'])).rejects.toThrow('Invalid roles: INVALID_ROLE');
    });

    it('should throw BadRequestException for multiple invalid roles', async () => {
      await expect(service.changeRoles('user-1', ['INVALID_ROLE', 'ANOTHER_INVALID'])).rejects.toThrow(BadRequestException);
      await expect(service.changeRoles('user-1', ['INVALID_ROLE', 'ANOTHER_INVALID'])).rejects.toThrow('Invalid roles: INVALID_ROLE, ANOTHER_INVALID');
    });

    it('should return null when user not found for role change', async () => {
      vi.mocked(userRepository.update).mockResolvedValue(null);

      const result = await service.changeRoles('user-1', [Role.ADMIN]);

      expect(result).toBeNull();
    });
  });

  describe('deactivate', () => {
    it('should deactivate an existing user', async () => {
      vi.mocked(userRepository.findBySub).mockResolvedValue(mockUser);
      vi.mocked(userRepository.softDelete).mockResolvedValue(undefined);

      const result = await service.deactivate('sub-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findBySub).toHaveBeenCalledWith('sub-123');
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-1');
    });

    it('should return null when user not found for deactivation', async () => {
      vi.mocked(userRepository.findBySub).mockResolvedValue(null);

      const result = await service.deactivate('non-existent');

      expect(result).toBeNull();
      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('cleanupDeletedUsers', () => {
    it('should purge soft-deleted users older than retention period', async () => {
      vi.mocked(userRepository.purgeSoftDeleted).mockResolvedValue(undefined);

      await service.cleanupDeletedUsers(30);

      expect(userRepository.purgeSoftDeleted).toHaveBeenCalledWith(30);
    });

    it('should handle different retention periods', async () => {
      vi.mocked(userRepository.purgeSoftDeleted).mockResolvedValue(undefined);

      await service.cleanupDeletedUsers(90);

      expect(userRepository.purgeSoftDeleted).toHaveBeenCalledWith(90);
    });
  });
});