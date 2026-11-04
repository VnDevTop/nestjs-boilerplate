import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';

/**
 * Admin module foundation.
 *
 * Provides administrative endpoints for user management, system
 * configuration, and operational tasks. All routes are protected
 * by JWT authentication and require the ADMIN role.
 *
 * @module AdminModule
 */
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}