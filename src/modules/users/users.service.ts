import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { User } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { Role } from '../../common/enums/role.enum.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Creates a new user.
   *
   * @param data - Partial user data.
   * @returns The created user.
   */
  async create(data: Partial<User>): Promise<User> {
    this.logger.log(`Creating user with email: ${data.email}`);
    return this.userRepository.create(data);
  }

  /**
   * Finds a user by ID.
   *
   * @param id - User ID (subject identifier).
   * @returns The matching user or null.
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findBySub(id);
  }

  /**
   * Finds a user by email.
   *
   * @param email - User email.
   * @returns The matching user or null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Updates a user's profile.
   *
   * @param id - User ID.
   * @param data - Partial user data for profile update.
   * @returns The updated user or null.
   */
  async updateProfile(id: string, data: Partial<User>): Promise<User | null> {
    this.logger.log(`Updating profile for user ID: ${id}`);
    return this.userRepository.update(id, data);
  }

  /**
   * Changes a user's roles.
   *
   * @param id - User ID.
   * @param roleIds - Array of role IDs to assign.
   * @returns The updated user or null.
   */
  async changeRoles(id: string, roleIds: string[]): Promise<User | null> {
    const validRoles = Object.values(Role);
    const invalid = roleIds.filter((role) => !validRoles.includes(role as Role));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid roles: ${invalid.join(', ')}`);
    }

    this.logger.log(`Changing roles for user ID: ${id} to: ${roleIds}`);
    const updated = await this.userRepository.update(id, { roles: roleIds });
    if (updated) {
      this.logger.log(`Roles updated for user ID: ${id}`);
    }
    return updated;
  }

  /**
   * Deactivates a user account.
   *
   * @param id - User ID.
   * @returns The deactivated user or null.
   */
  async deactivate(id: string): Promise<User | null> {
    this.logger.log(`Deactivating user ID: ${id}`);
    const user = await this.userRepository.findBySub(id);
    if (!user) {
      return null;
    }
    await this.userRepository.softDelete(user.id);
    return user;
  }

  /**
   * Permanently removes users soft-deleted older than the retention period.
   *
   * @param retentionDays - Retention period in days.
   * @returns void
   */
  async cleanupDeletedUsers(retentionDays: number): Promise<void> {
    this.logger.log(`Cleaning up users soft-deleted older than ${retentionDays} days`);
    await this.userRepository.purgeSoftDeleted(retentionDays);
  }
}
