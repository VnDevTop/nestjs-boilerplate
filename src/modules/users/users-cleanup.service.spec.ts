import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { UsersCleanupService } from './users-cleanup.service.js';
import { UsersService } from './users.service.js';

describe('UsersCleanupService', () => {
  let service: UsersCleanupService;
  let usersService: UsersService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersCleanupService,
        {
          provide: UsersService,
          useValue: {
            cleanupDeletedUsers: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersCleanupService>(UsersCleanupService);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('handleCleanup', () => {
    it('should run cleanup with the default retention period when none is configured', async () => {
      vi.mocked(configService.get).mockReturnValue(undefined);

      await service.handleCleanup();

      expect(usersService.cleanupDeletedUsers).toHaveBeenCalledWith(30);
    });

    it('should run cleanup with the configured retention period', async () => {
      vi.mocked(configService.get).mockReturnValue(7);

      await service.handleCleanup();

      expect(usersService.cleanupDeletedUsers).toHaveBeenCalledWith(7);
    });
  });
});
