import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../../common/guards/roles.guard.js';
import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersController } from './users.controller.js';
import { UsersCleanupService } from './users-cleanup.service.js';
import { UsersService } from './users.service.js';

/**
 * Users module.
 *
 * @module UsersModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UserRepository, UsersService, RolesGuard, UsersCleanupService],
  exports: [UserRepository, UsersService, RolesGuard, UsersCleanupService],
})
export class UsersModule {}
