import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { User } from '../entities/user.entity.js';

/**
 * Repository for `User` entities providing data access operations.
 * Handles CRUD operations and user lookup by unique identifiers.
 *
 * @class UserRepository
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  /**
   * Finds a user by subject identifier (OIDC `sub` claim).
   *
   * @param sub - Subject identifier from the identity provider.
   * @returns The matching user or null if not found.
   */
  async findBySub(sub: string): Promise<User | null> {
    return this.repository.findOne({ where: { sub } });
  }

  /**
   * Finds a user by primary key ID.
   *
   * @param id - User primary key ID.
   * @returns The matching user or null if not found.
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Finds a user by ID including the TOTP secret.
   *
   * Used for MFA verification flows where the TOTP secret is needed.
   * The `totpSecret` column has `select: false` by default, so this
   * method explicitly selects it.
   *
   * @param id - User ID.
   * @returns The matching user with TOTP secret, or null if not found.
   */
  async findByIdWithTotp(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.totpSecret')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * Finds a user by email address.
   *
   * @param email - User email address (unique).
   * @returns The matching user or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /**
   * Finds a user by email address, including the password hash.
   *
   * Used for authentication flows where the password hash is needed
   * for verification. The `passwordHash` column has `select: false`
   * by default, so this method explicitly selects it.
   *
   * @param email - User email address (unique).
   * @returns The matching user with password hash, or null if not found.
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Creates and persists a new user.
   *
   * @param data - Partial user data to create (typically from registration or OAuth).
   * @returns The created and persisted user entity.
   */
  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  /**
   * Updates an existing user by ID.
   *
   * @param id - Unique identifier of the user to update.
   * @param data - Partial user data to update (partial update).
   * @returns The updated user or null if not found.
   */
  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Soft-deletes a user by setting the `deletedAt` timestamp.
   * Does not physically remove the record from the database.
   *
   * @param id - Unique identifier of the user to soft-delete.
   * @returns Promise that resolves when soft deletion is complete.
   */
  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  /**
   * Permanently removes users soft-deleted older than the given number of days.
   *
   * @param olderThanDays - Retention period in days.
   * @returns void
   */
  async purgeSoftDeleted(olderThanDays: number): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    await this.repository.delete({ deletedAt: LessThan(cutoff) });
  }
}