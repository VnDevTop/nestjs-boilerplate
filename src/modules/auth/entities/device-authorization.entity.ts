import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../database/base.entity.js';

/**
 * Lifecycle status of a device authorization.
 *
 * - `PENDING`: device requested a code and is waiting for user approval.
 * - `APPROVED`: user approved the device; the device may now poll for tokens.
 * - `DENIED`: user denied the device.
 * - `EXPIRED`: device authorization expired before approval.
 */
export enum DeviceAuthorizationStatus {
  /** Device is waiting for user approval. */
  PENDING = 'PENDING',
  /** Device was approved by the user. */
  APPROVED = 'APPROVED',
  /** Device was denied by the user. */
  DENIED = 'DENIED',
  /** Device authorization expired before approval. */
  EXPIRED = 'EXPIRED',
}

/**
 * Device authorization record (OAuth2 device authorization grant storage).
 *
 * Persists the device authorization lifecycle (pending / approved / denied /
 * expired) so device codes survive server restarts and can be cleaned up by
 * TTL. The plain device code and user code are only generated here; only
 * opaque references are ever exposed to clients.
 *
 * @class DeviceAuthorization
 */
@Entity('device_authorizations')
export class DeviceAuthorization extends BaseEntity {
  /**
   * Server-issued opaque device code (random, high entropy).
   */
  @ApiProperty({
    type: String,
    example: 'b8f3k2d1e4a6c7b8f3k2d1e4a6c7b8f3k2d1e4',
    description: 'Server-issued opaque device code.',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  deviceCode!: string;

  /**
   * User-facing device code (`XXXX-XXXX` style) the user enters to approve.
   */
  @ApiProperty({
    type: String,
    example: 'ABCD-EFGH',
    description: 'User-facing device code for approval.',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  userCode!: string;

  /**
   * OAuth2 client identifier the device belongs to.
   */
  @ApiProperty({
    type: String,
    example: 'nestjs-device-client',
    description: 'OAuth2 client identifier.',
  })
  @Column({ type: 'varchar', length: 255 })
  clientId!: string;

  /**
   * Identifier of the user the device is bound to (set at device issuance).
   */
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'User identifier the device is bound to.',
  })
  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  userId?: string | null;

  /**
   * Current lifecycle status of the device authorization.
   * Default: `PENDING`
   */
  @ApiProperty({
    enum: DeviceAuthorizationStatus,
    default: DeviceAuthorizationStatus.PENDING,
    description: 'Device authorization status.',
  })
  @Column({ type: 'varchar', length: 32, default: DeviceAuthorizationStatus.PENDING })
  status!: DeviceAuthorizationStatus;

  /**
   * Requested scopes for the device authorization.
   */
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Requested scopes for the device authorization.',
  })
  @Column({ type: 'simple-array', nullable: true })
  scopes?: string[] | null;

  /**
   * Expiration timestamp of the device authorization.
   */
  @ApiProperty({
    type: Date,
    description: 'Expiry timestamp of the device authorization.',
  })
  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
