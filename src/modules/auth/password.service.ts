import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Password hashing and verification service using Argon2id.
 *
 * Argon2id is the winner of the Password Hashing Competition and is
 * recommended by OWASP for password storage. It is resistant to both
 * side-channel and GPU/ASIC attacks.
 *
 * @class PasswordService
 */
@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  /**
   * Argon2id configuration parameters.
   *
   * - memoryCost: 64 MB — memory-hard to resist GPU/ASIC attacks
   * - timeCost: 3 — computational cost iterations
   * - parallelism: 4 — degree of parallelism
   */
  private readonly argon2Options: argon2.HashOptions = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };

  /**
   * Hashes a plain-text password using Argon2id.
   *
   * @param password - Plain-text password to hash.
   * @returns The hashed password string.
   */
  async hash(password: string): Promise<string> {
    this.logger.debug('Hashing password');
    return argon2.hash(password, this.argon2Options);
  }

  /**
   * Verifies a plain-text password against a stored hash.
   *
   * @param hash - Stored password hash.
   * @param password - Plain-text password to verify.
   * @returns `true` if the password matches the hash, `false` otherwise.
   */
  async verify(hash: string, password: string): Promise<boolean> {
    this.logger.debug('Verifying password');
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Checks whether a hash needs to be rehashed with updated parameters.
   *
   * Useful for upgrading password hashes when security parameters change.
   *
   * @param hash - Stored password hash.
   * @returns `true` if the hash should be rehashed.
   */
  needsRehash(hash: string): boolean {
    try {
      return argon2.needsRehash(hash, this.argon2Options);
    } catch {
      return true;
    }
  }
}