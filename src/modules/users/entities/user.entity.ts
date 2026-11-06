import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';

import { Role } from '../../../common/enums/role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';
import { BaseEntity } from '../../../database/base.entity.js';

/**
 * User entity compliant with OIDC standard claims.
 *
 * Partial unique indexes on `sub` and `email` are created via migration
 * `1730592000000-partial-unique-indexes.ts` where `deletedAt IS NULL`,
 * allowing reuse of identifiers after soft delete while keeping active
 * users unique.
 *
 * @class User
 */
@Entity('users')
export class User extends BaseEntity {
  /**
   * Subject identifier from the identity provider (OIDC `sub` claim).
   * This is a unique identifier for the user at the identity provider level.
   * Example: `google-oauth2|1234567890`
   */
  @ApiProperty({
    type: String,
    example: 'google-oauth2|1234567890',
    description: 'Subject identifier from the identity provider.',
  })
  @Index({ unique: true, where: '"deletedAt" IS NULL' })
  @Column({ type: 'varchar', length: 255 })
  sub!: string;

  /**
   * User email address. Must be unique and indexed.
   * Used for authentication and communication with the user.
   * Example: `user@example.com`
   */
  @ApiProperty({
    type: String,
    example: 'user@example.com',
    description: 'User email address.',
  })
  @Index({ unique: true, where: '"deletedAt" IS NULL' })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  /**
   * Hashed password for email/password authentication.
   * Null for users who only authenticate via OIDC providers.
   * Never store or return the plain-text password.
   */
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash?: string | null;

  /**
   * Base32-encoded TOTP secret for two-factor authentication (MFA).
   * Null when TOTP is not enabled for the user.
   * Never expose or return the secret to clients.
   */
  @ApiProperty({
    type: String,
    example: 'JBSWY3DPEHPK3PXP',
    description: 'Base32-encoded TOTP secret for two-factor authentication (MFA). Null when disabled.',
  })
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  totpSecret?: string | null;

  /**
   * Whether two-factor authentication (TOTP) is enabled for the user.
   * Default: `false`
   */
  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Whether two-factor authentication (TOTP) is enabled.',
  })
  @Column({ type: 'boolean', default: false })
  totpEnabled!: boolean;

  /**
   * Hashed one-time backup codes for MFA recovery.
   * Can be null when no backup codes have been issued.
   */
  @ApiProperty({
    type: [String],
    example: [],
    description: 'Hashed one-time backup codes for MFA recovery.',
  })
  @Column({ type: 'simple-array', nullable: true })
  backupCodes?: string[] | null;

  /**
   * Hashed one-time login token (magic link token or email passcode) used
   * for passwordless / enhanced login flows. Null when no token is pending.
   * The plain token is only ever delivered to the user by email; only its
   * hash is persisted here.
   */
  @ApiProperty({
    type: String,
    nullable: true,
    example: 'a1b2c3d4e5f6...',
    description: 'Hashed one-time login token for magic link or passcode authentication.',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  loginTokenHash?: string | null;

  /**
   * Expiry timestamp for the one-time login token.
   */
  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Expiry timestamp of the one-time login token.',
  })
  @Column({ type: 'timestamptz', nullable: true })
  loginTokenExpiresAt?: Date | null;

  /**
   * Whether the one-time login token has been consumed (single-use).
   * Once consumed, the token is invalid even before its expiry.
   */
  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Whether the one-time login token was consumed.',
  })
  @Column({ type: 'boolean', default: false })
  loginTokenConsumed!: boolean;

  /**
   * Whether the email address has been verified.
   * `true` if the user has verified their email address through the
   * identity provider or verification flow.
   * Default: `false`
   */
  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the email address has been verified.',
  })
  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  /**
   * Full display name of the user.
   * This is the name shown to other users or in the UI.
   * Can be `null` if not provided.
   * Example: `Jane Doe`
   */
  @ApiProperty({
    type: String,
    example: 'Jane Doe',
    description: 'Full display name.',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string | null;

  /**
   * Given name (first name) of the user.
   * Part of the OIDC name claims. Can be `null` if not provided.
   * Example: `Jane`
   */
  @ApiProperty({
    type: String,
    example: 'Jane',
    description: 'Given name.',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  givenName?: string | null;

  /**
   * Family name (last name) of the user.
   * Part of the OIDC name claims. Can be `null` if not provided.
   * Example: `Doe`
   */
  @ApiProperty({
    type: String,
    example: 'Doe',
    description: 'Family name.',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  familyName?: string | null;

  /**
   * Profile picture URL of the user.
   * Typically a URL to an avatar or profile photo.
   * Can be `null` if not provided.
   * Example: `https://example.com/avatar.png`
   */
  @ApiProperty({
    type: String,
    example: 'https://example.com/avatar.png',
    description: 'Profile picture URL.',
  })
  @Column({ type: 'varchar', length: 512, nullable: true })
  picture?: string | null;

  /**
   * Preferred locale for the user (e.g., `en`, `vi`, `fr`).
   * Used to determine the user's language/regional preferences.
   * Can be `null` if not set.
   * Example: `en`
   */
  @ApiProperty({
    type: String,
    example: 'en',
    description: 'Preferred locale.',
  })
  @Column({ type: 'varchar', length: 16, nullable: true })
  locale?: string | null;

  /**
   * Roles granted to the user.
   * Defines the user's permissions and access levels within the application.
   * Default: `[Role.USER]`
   * Example: `[Role.USER]`
   */
  @ApiProperty({
    type: [String],
    example: [Role.USER],
    description: 'Roles granted to the user.',
  })
  @Column({ type: 'simple-array', default: Role.USER })
  roles!: Role[] | string[];

  /**
   * Account lifecycle status.
   * Represents the current state of the user account (e.g., active, inactive, suspended).
   * Default: `UserStatus.ACTIVE`
   * Example: `UserStatus.ACTIVE`
   */
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Account lifecycle status.',
  })
  @Column({ type: 'varchar', length: 32, default: UserStatus.ACTIVE })
  status!: UserStatus;
}