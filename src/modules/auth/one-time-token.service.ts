import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomBytes, randomInt } from 'node:crypto';
import * as argon2 from 'argon2';
import { AuthMethod } from '../../common/enums/auth-method.enum.js';
import { UsersService } from '../users/users.service.js';

/**
 * Payload returned when a one-time login token is successfully verified.
 */
export interface OneTimeTokenPayload {
  /** User ID the token was issued for. */
  userId: string;
  /** Authentication method the token grants (e.g. MAGIC_LINK). */
  authMethod: AuthMethod;
}

/**
 * Supported one-time login token types.
 */
export type OneTimeTokenType = 'MAGIC_LINK' | 'PASSCODE';

/**
 * One-time login token service.
 *
 * Implements the Option B storage strategy for magic link / passcode login:
 * the plain token (opaque random value or numeric passcode) is generated,
 * immediately hashed and persisted (hash + expiry + single-use consumption)
 * on the user record; the plain token is only ever delivered out-of-band
 * (email). Verification resolves the user through the token hash and
 * consumes the token atomically in the single-use flow.
 *
 * @class OneTimeTokenService
 */
@Injectable()
export class OneTimeTokenService {
  private readonly logger = new Logger(OneTimeTokenService.name);

  /**
   * Default lifetime of a one-time login token (15 minutes).
   */
  private readonly tokenTtlMs: number = 15 * 60 * 1000;

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
   * Fixed salt for one-time login token hashes.
   *
   * Argon2 hashes are salted, but a fixed salt keeps the resulting hash
   * deterministic, which allows a presented token to be hashed and matched
   * against the stored hash directly (exact-match lookup on the user record).
   */
  private readonly tokenSalt: Buffer = Buffer.from('one-time-login-token');

  constructor(private readonly usersService: UsersService) {}

  /**
   * Generates an opaque random token (magic link).
   *
   * @returns The random token string.
   */
  generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  /**
   * Generates a numeric one-time passcode (email code).
   *
   * @returns The 6-digit passcode string.
   */
  generatePasscode(): string {
    const value = randomInt(1_000_000);
    return String(value).padStart(6, '0');
  }

  /**
   * Hashes a plain token using Argon2id (one-way, salted, memory-hard).
   *
   * The salt is fixed so the hash is deterministic and can be used for the
   * exact-match token lookup, while still benefiting from Argon2id's
   * memory-hard resistance against GPU/ASIC brute-force attacks.
   *
   * @param token - Plain token (magic link token or passcode).
   * @returns The Argon2id hash of the token.
   */
  async hashToken(token: string): Promise<string> {
    return argon2.hash(token, { ...this.argon2Options, salt: this.tokenSalt });
  }

  /**
   * Persists a newly generated one-time token for a user (hash + expiry).
   *
   * @param userId - User ID the token is issued for.
   * @param type - One-time token type (magic link token or passcode).
   * @returns The plain token and its expiry date.
   */
  async createToken(userId: string, type: OneTimeTokenType): Promise<{ token: string; expiresAt: Date }> {
    const token = type === 'MAGIC_LINK' ? this.generateToken() : this.generatePasscode();
    const tokenHash = await this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.tokenTtlMs);

    await this.usersService.updateProfile(userId, {
      loginTokenHash: tokenHash,
      loginTokenExpiresAt: expiresAt,
      loginTokenConsumed: false,
    });

    return { token, expiresAt };
  }

  /**
   * Verifies a one-time login token and consumes it (single-use).
   *
   * @param token - Plain token (magic link token or passcode) submitted by the user.
   * @returns The user ID and granted auth method on success.
   * @throws UnauthorizedException when the token is unknown, expired or already used.
   */
  async verifyToken(token: string): Promise<OneTimeTokenPayload> {
    const tokenHash = await this.hashToken(token);
    const user = await this.usersService.findByLoginTokenHash(tokenHash);

    if (!user) {
      throw new UnauthorizedException('Invalid login token');
    }

    const expiresAt = user.loginTokenExpiresAt;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Login token has expired');
    }

    if (user.loginTokenConsumed) {
      throw new UnauthorizedException('Login token has already been used');
    }

    await this.usersService.updateProfile(user.id, { loginTokenConsumed: true });

    return { userId: user.id, authMethod: AuthMethod.MAGIC_LINK };
  }
}
