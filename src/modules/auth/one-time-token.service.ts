import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
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
    const buffer = randomBytes(4);
    const value = buffer.readUInt32BE(0) % 1_000_000;
    return String(value).padStart(6, '0');
  }

  /**
   * Hashes a plain token using SHA-256 (one-way, non-reversible).
   *
   * @param token - Plain token (magic link token or passcode).
   * @returns The hex encoded SHA-256 hash.
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Persists a newly generated one-time token for a user (hash + expiry).
   *
   * @param userId - User ID the token is issued for.
   * @param authMethod - Authentication method granted by the token.
   * @returns The plain token and its expiry date.
   */
  async createToken(userId: string, authMethod: AuthMethod): Promise<{ token: string; expiresAt: Date }> {
    const token = authMethod === AuthMethod.MAGIC_LINK ? this.generateToken() : this.generatePasscode();
    const tokenHash = this.hashToken(token);
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
   * @param authMethod - Authentication method granted by the token.
   * @returns The user ID and granted auth method on success.
   * @throws UnauthorizedException when the token is unknown, expired or already used.
   */
  async verifyToken(token: string, authMethod: AuthMethod = AuthMethod.MAGIC_LINK): Promise<OneTimeTokenPayload> {
    const tokenHash = this.hashToken(token);
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

    return { userId: user.id, authMethod };
  }
}
