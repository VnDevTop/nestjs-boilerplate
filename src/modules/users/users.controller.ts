import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Role } from '../../common/enums/role.enum.js';
import { UsersService } from './users.service.js';
import { ChangeRolesDto } from './dto/change-roles.dto.js';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.js';

/**
 * Users controller exposing profile endpoints.
 *
 * @class UsersController
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Returns the authenticated user's profile.
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMe(@Req() req?: any) {
    const id = req?.user?.sub ?? req?.user?.id;
    if (!id) {
      return null;
    }
    return this.usersService.findById(id);
  }

  /**
   * Updates the authenticated user's profile.
   */
  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated user profile' })
  async updateMe(@Req() req?: any, @Body() dto?: UpdateUserProfileDto) {
    const id = req?.user?.sub ?? req?.user?.id;
    if (!id) {
      return null;
    }
    return this.usersService.updateProfile(id, dto ?? {});
  }

  /**
   * Returns a user by id (admin).
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'User profile' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Changes a user's roles (admin-only).
   */
  @Patch(':id/roles')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Change user roles' })
  @ApiResponse({ status: 200, description: 'Updated user roles' })
  async changeRoles(@Param('id') id: string, @Body() dto: ChangeRolesDto) {
    return this.usersService.changeRoles(id, dto.roles);
  }
}
