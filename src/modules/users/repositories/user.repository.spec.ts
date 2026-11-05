import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Repository } from 'typeorm';
import { LessThan } from 'typeorm';

import { User } from '../entities/user.entity.js';
import { UserRepository } from './user.repository.js';
import { Role } from '../../../common/enums/role.enum.js';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockRepository: Repository<User>;

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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            softDelete: vi.fn(),
            delete: vi.fn(),
            createQueryBuilder: vi.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    mockRepository = module.get(getRepositoryToken(User));
  });

  describe('findBySub', () => {
    it('should find user by sub identifier', async () => {
      vi.mocked(mockRepository.findOne).mockResolvedValue(mockUser);

      const result = await repository.findBySub('sub-123');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { sub: 'sub-123' } });
    });

    it('should return null when user not found by sub', async () => {
      vi.mocked(mockRepository.findOne).mockResolvedValue(null);

      const result = await repository.findBySub('non-existent');

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { sub: 'non-existent' } });
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      vi.mocked(mockRepository.findOne).mockResolvedValue(mockUser);

      const result = await repository.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should return null when user not found by id', async () => {
      vi.mocked(mockRepository.findOne).mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent' } });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      vi.mocked(mockRepository.findOne).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should return null when user not found by email', async () => {
      vi.mocked(mockRepository.findOne).mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should find user by email including password hash', async () => {
      const userWithPassword = { ...mockUser, passwordHash: 'hashed-password' };
      const mockQueryBuilder = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(userWithPassword),
      };
      vi.mocked(mockRepository.createQueryBuilder).mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findByEmailWithPassword('test@example.com');

      expect(result).toEqual(userWithPassword);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.passwordHash');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email: 'test@example.com' });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });

    it('should return null when user not found by email with password', async () => {
      const mockQueryBuilder = {
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getOne: vi.fn().mockResolvedValue(null),
      };
      vi.mocked(mockRepository.createQueryBuilder).mockReturnValue(mockQueryBuilder as any);

      const result = await repository.findByEmailWithPassword('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const createData = { email: 'new@example.com', sub: 'sub-456' } as Partial<User>;
      const createdUser = { ...mockUser, ...createData };
      vi.mocked(mockRepository.create).mockReturnValue(createdUser as User);
      vi.mocked(mockRepository.save).mockResolvedValue(createdUser);

      const result = await repository.create(createData);

      expect(result).toEqual(createdUser);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    });
  });

  describe('update', () => {
    it('should update user and return updated entity', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.mocked(mockRepository.update).mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      vi.mocked(mockRepository.findOne).mockResolvedValue(updatedUser);

      const result = await repository.update('user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith('user-1', updateData);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should return null when user not found after update', async () => {
      vi.mocked(mockRepository.update).mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });
      vi.mocked(mockRepository.findOne).mockResolvedValue(null);

      const result = await repository.update('non-existent', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user by id', async () => {
      vi.mocked(mockRepository.softDelete).mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await repository.softDelete('user-1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('user-1');
    });
  });

  describe('purgeSoftDeleted', () => {
    it('should permanently delete users older than retention period', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue({ affected: 2, raw: {} });

      await repository.purgeSoftDeleted(30);

      expect(mockRepository.delete).toHaveBeenCalledWith({
        deletedAt: LessThan(expect.any(Date)),
      });
    });

    it('should handle different retention periods', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue({ affected: 0, raw: {} });

      await repository.purgeSoftDeleted(90);

      expect(mockRepository.delete).toHaveBeenCalledWith({
        deletedAt: LessThan(expect.any(Date)),
      });
    });
  });
});