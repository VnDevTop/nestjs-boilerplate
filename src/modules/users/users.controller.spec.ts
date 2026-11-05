import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { ChangeRolesDto } from './dto/change-roles.dto.js';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.js';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 'user-1',
    sub: 'user-1',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
  };

  const mockUsersService = {
    findById: vi.fn(),
    updateProfile: vi.fn(),
    changeRoles: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getMe', () => {
    it('should return null when no user id is present', async () => {
      const result = await controller.getMe({} as any);

      expect(result).toBeNull();
      expect(usersService.findById).not.toHaveBeenCalled();
    });

    it('should return the current user profile', async () => {
      vi.mocked(usersService.findById).mockResolvedValue(mockUser as any);

      const result = await controller.getMe({ user: { sub: 'user-1' } } as any);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateMe', () => {
    it('should return null when no user id is present', async () => {
      const result = await controller.updateMe({} as any, {} as UpdateUserProfileDto);

      expect(result).toBeNull();
      expect(usersService.updateProfile).not.toHaveBeenCalled();
    });

    it('should update the current user profile', async () => {
      vi.mocked(usersService.updateProfile).mockResolvedValue(mockUser as any);

      const dto: UpdateUserProfileDto = { name: 'Updated Name' };
      const result = await controller.updateMe({ user: { sub: 'user-1' } } as any, dto);

      expect(result).toEqual(mockUser);
      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('getUserById', () => {
    it('should return the user by id', async () => {
      vi.mocked(usersService.findById).mockResolvedValue(mockUser as any);

      const result = await controller.getUserById('user-1');

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('changeRoles', () => {
    it('should change the user roles', async () => {
      vi.mocked(usersService.changeRoles).mockResolvedValue(mockUser as any);

      const dto: ChangeRolesDto = { roles: ['ADMIN'] as any };
      const result = await controller.changeRoles('user-1', dto);

      expect(result).toEqual(mockUser);
      expect(usersService.changeRoles).toHaveBeenCalledWith('user-1', ['ADMIN']);
    });
  });
});
