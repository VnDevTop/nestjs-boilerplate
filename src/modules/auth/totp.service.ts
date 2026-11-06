import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { TOTP } from '@otplib/totp';
import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { ScureBase32Plugin } from '@otplib/plugin-base32-scure';

/**
 * TOTP (time-based one-time password) service for two-factor authentication.
 *
 * Wraps `@otplib/totp` to generate the shared secret, build the
 * `otpauth://` provisioning URI for authenticator apps, and verify user
 * submitted TOTP codes (RFC 6238).
 *
 * @class TotpService
 */
@Injectable()
export class TotpService {
  private readonly totp: TOTP;

  constructor() {
    this.totp = new TOTP({
      algorithm: 'sha1',
      digits: 6,
      period: 30,
      crypto: new NodeCryptoPlugin(),
      base32: new ScureBase32Plugin(),
    });
  }

  /**
   * Generates a new random Base32-encoded TOTP secret.
   *
   * @returns The Base32-encoded secret.
   */
  generateSecret(): string {
    return this.totp.generateSecret();
  }

  /**
   * Generates an `otpauth://` provisioning URI for authenticator apps.
   *
   * @param secret - Base32-encoded TOTP secret.
   * @param userId - User identifier used as the label (e.g. email).
   * @returns The otpauth provisioning URI.
   */
  generateUri(secret: string, userId: string): string {
    return this.totp.toURI({
      secret,
      label: userId,
      issuer: 'NestJS Boilerplate',
    });
  }

  /**
   * Verifies a TOTP token against the user's secret.
   *
   * @param token - The user submitted TOTP code.
   * @param secret - The user's Base32-encoded TOTP secret.
   * @returns True when the token is valid, false otherwise.
   */
  async verifyTotp(token: string, secret: string): Promise<boolean> {
    const result = await this.totp.verify(token, { secret, crypto: new NodeCryptoPlugin() });
    return result.valid;
  }

  /**
   * Generates one-time backup codes for MFA recovery.
   *
   * @returns Array of backup codes.
   */
  generateBackupCodes(): string[] {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const alphabetLength = alphabet.length;
    const maxUnbiased = Math.floor(256 / alphabetLength) * alphabetLength;

    const codes = new Set<string>();
    while (codes.size < 10) {
      let code = '';
      while (code.length < 8) {
        const byte = randomBytes(1)[0];
        if (byte >= maxUnbiased) {
          continue;
        }
        code += alphabet[byte % alphabetLength];
      }
      codes.add(code);
    }
    return [...codes];
  }
}
