import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { randomBytes, randomInt } from 'node:crypto';

import { DeviceAuthorization, DeviceAuthorizationStatus } from './entities/device-authorization.entity.js';

/**
 * Response contract returned when a device requests a device authorization.
 *
 * Follows the OAuth2 Device Authorization Grant (RFC 8628) style response:
 * - `device_code` is the secret the device uses to poll for tokens.
 * - `user_code` is the human-friendly code the user enters to approve.
 * - `verification_uri` / `verification_uri_complete` point to the approval page.
 * - `expires_in` / `interval` drive the polling behaviour of the device.
 */
export interface DeviceAuthorizationResponse {
  /** Server-issued opaque device code (secret for the device). */
  deviceCode: string;
  /** User-facing device code (`XXXX-XXXX` style). */
  userCode: string;
  /** Verification URI for the user approval page. */
  verificationUri: string;
  /** Verification URI including the client id (complete form). */
  verificationUriComplete: string;
  /** Device authorization lifetime in seconds. */
  expiresIn: number;
  /** Polling interval in seconds recommended to the device client. */
  interval: number;
}

/**
 * Response contract returned when a device polls its device code.
 */
export interface DevicePollResponse {
  /** Current lifecycle status of the device authorization. */
  status: DeviceAuthorizationStatus;
  /** Access token pair, only present when the status is `APPROVED`. */
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
    tokenType?: string;
  };
}

/**
 * Device authorization service.
 *
 * Implements the storage and lifecycle management of OAuth2 device
 * authorization grant entries (device code + user code + status + expiry).
 * Device codes are server-issued opaque secrets; user codes are
 * human-friendly and short-lived.
 *
 * @class DeviceAuthorizationService
 */
@Injectable()
export class DeviceAuthorizationService {
  private readonly logger = new Logger(DeviceAuthorizationService.name);

  /**
   * Default lifetime of a device authorization (15 minutes).
   */
  private readonly deviceTtlMs: number = 15 * 60 * 1000;

  constructor(
    @InjectRepository(DeviceAuthorization)
    private readonly deviceRepository: Repository<DeviceAuthorization>,
  ) {}

  /**
   * Generates a new server-issued opaque device code (high entropy secret).
   *
   * @returns The opaque device code.
   */
  generateDeviceCode(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generates a user-facing device code (`XXXX-XXXX` uppercase alphanumeric).
   *
   * @returns The user-facing device code.
   */
  generateUserCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const chars = Array.from({ length: 8 }, () => alphabet[randomInt(0, alphabet.length)]);
    const groupA = chars.slice(0, 4).join('');
    const groupB = chars.slice(4, 8).join('');
    return `${groupA}-${groupB}`;
  }

  /**
   * Creates a new pending device authorization for the given client.
   *
   * @param clientId - OAuth2 client identifier.
   * @param scopes - Optional requested scopes.
   * @returns The persisted pending device authorization.
   */
  async createAuthorization(clientId: string, scopes?: string[]): Promise<DeviceAuthorization> {
    const now = new Date();
    const deviceAuthorization = this.deviceRepository.create({
      deviceCode: this.generateDeviceCode(),
      userCode: this.generateUserCode(),
      clientId,
      userId: null,
      status: DeviceAuthorizationStatus.PENDING,
      scopes: scopes ?? null,
      expiresAt: new Date(now.getTime() + this.deviceTtlMs),
    });

    const saved = await this.deviceRepository.save(deviceAuthorization);
    this.logger.log(`Device authorization created for client: ${clientId}`);
    return saved;
  }

  /**
   * Finds a device authorization by its opaque device code.
   *
   * Marks the authorization as expired when the TTL has elapsed.
   *
   * @param deviceCode - Opaque device code.
   * @returns The device authorization or null when unknown.
   */
  async findByDeviceCode(deviceCode: string): Promise<DeviceAuthorization | null> {
    const deviceAuthorization = await this.deviceRepository.findOne({ where: { deviceCode } });
    if (deviceAuthorization && this.isExpired(deviceAuthorization)) {
      deviceAuthorization.status = DeviceAuthorizationStatus.EXPIRED;
      await this.deviceRepository.save(deviceAuthorization);
      return deviceAuthorization;
    }
    return deviceAuthorization;
  }

  /**
   * Finds a device authorization by its user-facing code.
   *
   * Marks the authorization as expired when the TTL has elapsed.
   *
   * @param userCode - User-facing device code.
   * @returns The device authorization or null when unknown.
   */
  async findByUserCode(userCode: string): Promise<DeviceAuthorization | null> {
    const deviceAuthorization = await this.deviceRepository.findOne({ where: { userCode } });
    if (deviceAuthorization && this.isExpired(deviceAuthorization)) {
      deviceAuthorization.status = DeviceAuthorizationStatus.EXPIRED;
      await this.deviceRepository.save(deviceAuthorization);
      return deviceAuthorization;
    }
    return deviceAuthorization;
  }

  /**
   * Approves a device authorization for the given user.
   *
   * @param deviceCode - Opaque device code.
   * @param userId - Identifier of the approving user.
   * @returns The approved device authorization.
   * @throws NotFoundException when the device authorization is unknown.
   */
  async approve(deviceCode: string, userId: string): Promise<DeviceAuthorization> {
    const deviceAuthorization = await this.findByDeviceCode(deviceCode);
    if (!deviceAuthorization) {
      throw new NotFoundException('Device authorization not found');
    }

    if (deviceAuthorization.status !== DeviceAuthorizationStatus.PENDING) {
      throw new NotFoundException('Device authorization is not pending');
    }

    deviceAuthorization.status = DeviceAuthorizationStatus.APPROVED;
    deviceAuthorization.userId = userId;
    const saved = await this.deviceRepository.save(deviceAuthorization);
    this.logger.log(`Device authorization approved for user: ${userId}`);
    return saved;
  }

  /**
   * Approves a device authorization identified by its user-facing code.
   *
   * @param userCode - User-facing device code.
   * @param userId - Identifier of the approving user.
   * @returns The approved device authorization.
   * @throws NotFoundException when the device authorization is unknown.
   */
  async approveByUserCode(userCode: string, userId: string): Promise<DeviceAuthorization> {
    const deviceAuthorization = await this.findByUserCode(userCode);
    if (!deviceAuthorization) {
      throw new NotFoundException('Device authorization not found');
    }

    if (deviceAuthorization.status !== DeviceAuthorizationStatus.PENDING) {
      throw new NotFoundException('Device authorization is not pending');
    }

    deviceAuthorization.status = DeviceAuthorizationStatus.APPROVED;
    deviceAuthorization.userId = userId;
    const saved = await this.deviceRepository.save(deviceAuthorization);
    this.logger.log(`Device authorization approved via user code for user: ${userId}`);
    return saved;
  }

  /**
   * Denies a device authorization.
   *
   * @param deviceCode - Opaque device code.
   * @returns The denied device authorization.
   * @throws NotFoundException when the device authorization is unknown.
   */
  async deny(deviceCode: string): Promise<DeviceAuthorization> {
    const deviceAuthorization = await this.findByDeviceCode(deviceCode);
    if (!deviceAuthorization) {
      throw new NotFoundException('Device authorization not found');
    }

    if (deviceAuthorization.status !== DeviceAuthorizationStatus.PENDING) {
      throw new NotFoundException('Device authorization is not pending');
    }

    deviceAuthorization.status = DeviceAuthorizationStatus.DENIED;
    const saved = await this.deviceRepository.save(deviceAuthorization);
    this.logger.log(`Device authorization denied for device code: ${deviceCode}`);
    return saved;
  }

  /**
   * Checks whether a device authorization has exceeded its TTL.
   *
   * @param deviceAuthorization - The device authorization to check.
   * @returns True when the authorization is expired.
   */
  isExpired(deviceAuthorization: DeviceAuthorization): boolean {
    return deviceAuthorization.expiresAt.getTime() < Date.now();
  }

  /**
   * Removes all expired device authorizations.
   *
   * @returns void
   */
  async cleanupExpired(): Promise<void> {
    await this.deviceRepository.delete({ expiresAt: LessThan(new Date()) });
  }
}
