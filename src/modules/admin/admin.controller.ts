import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { AdminService } from './admin.service.js';

/**
 * Admin controller exposing administrative endpoints.
 *
 * All routes require JWT authentication and the ADMIN role.
 *
 * @class AdminController
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Lists all users.
   */
  @Get('users')
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async listUsers() {
    return this.adminService.listUsers();
  }

  /**
   * Gets a user by ID.
   */
  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  /**
   * Deactivates a user account.
   */
  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (admin)' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  async deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  /**
   * Changes a user's roles.
   */
  @Patch('users/:id/roles')
  @ApiOperation({ summary: 'Change user roles (admin)' })
  @ApiResponse({ status: 200, description: 'Roles updated' })
  async changeUserRoles(@Param('id') id: string, @Body() body: { roles: string[] }) {
    return this.adminService.changeUserRoles(id, body.roles);
  }
}