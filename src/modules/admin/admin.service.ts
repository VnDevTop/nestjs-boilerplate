import { Injectable, Logger } from '@nestjs/common';

import { UsersService } from '../users/users.service.js';

/**
 * Admin service providing administrative operations.
 *
 * Delegates user management to `UsersService` and provides
 * higher-level admin workflows (bulk operations, reporting, etc.).
 *
 * @class AdminService
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Lists all users (admin view).
   *
   * @returns Array of all users.
   */
  async listUsers() {
    this.logger.log('Listing all users (admin)');
    // TODO: implement pagination and filtering
    return [];
  }

  /**
   * Gets a user by ID (admin view).
   *
   * @param id - User ID.
   * @returns The matching user or null.
   */
  async getUserById(id: string) {
    this.logger.log(`Getting user by ID (admin): ${id}`);
    return this.usersService.findById(id);
  }

  /**
   * Deactivates a user account (admin action).
   *
   * @param id - User ID.
   * @returns The deactivated user or null.
   */
  async deactivateUser(id: string) {
    this.logger.log(`Deactivating user (admin): ${id}`);
    return this.usersService.deactivate(id);
  }

  /**
   * Changes a user's roles (admin action).
   *
   * @param id - User ID.
   * @param roleIds - Array of role IDs to assign.
   * @returns The updated user or null.
   */
  async changeUserRoles(id: string, roleIds: string[]) {
    this.logger.log(`Changing roles for user (admin): ${id}`);
    return this.usersService.changeRoles(id, roleIds);
  }
}