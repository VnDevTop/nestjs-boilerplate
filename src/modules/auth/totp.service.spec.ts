import { TOTP } from '@otplib/totp';
import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { ScureBase32Plugin } from '@otplib/plugin-base32-scure';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { TotpService } from './totp.service.js';

const { mockedRandomBytes } = vi.hoisted(() => ({
  mockedRandomBytes: vi.fn((size: number) => Buffer.alloc(size)),
}));

vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  mockedRandomBytes.mockImplementation((size: number) => actual.randomBytes(size));
  return {
    ...actual,
    randomBytes: mockedRandomBytes,
  };
});

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(() => {
    service = new TotpService();
  });

  describe('generateSecret', () => {
    it('should generate a Base32 secret', () => {
      const secret = service.generateSecret();

      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
    });
  });

  describe('generateUri', () => {
    it('should generate an otpauth uri containing secret and label', () => {
      const secret = service.generateSecret();
      const uri = service.generateUri(secret, 'user@example.com');

      expect(uri).toContain('otpauth://totp/');
      expect(uri).toContain(encodeURIComponent('user@example.com'));
      expect(uri).toContain(secret);
    });
  });

  describe('verifyTotp', () => {
    it('should return false for an invalid token', async () => {
      const secret = service.generateSecret();

      await expect(service.verifyTotp('000000', secret)).resolves.toBe(false);
    });

    it('should return true for a valid token', async () => {
      const secret = service.generateSecret();
      const totp = new TOTP({
        algorithm: 'sha1',
        digits: 6,
        period: 30,
        crypto: new NodeCryptoPlugin(),
        base32: new ScureBase32Plugin(),
      });
      const token = await totp.generate({ secret, crypto: new NodeCryptoPlugin(), base32: new ScureBase32Plugin() });

      await expect(service.verifyTotp(token, secret)).resolves.toBe(true);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 unique backup codes of length 8', () => {
      const codes = service.generateBackupCodes();

      expect(codes).toHaveLength(10);
      expect(new Set(codes).size).toBe(10);
      codes.forEach((code) => {
        expect(code).toHaveLength(8);
      });
    });

    it('should skip random bytes beyond the unbiased bound during backup code generation', () => {
      // Force the rejection-sampling branch (byte >= maxUnbiased -> continue)
      // so the backup code generation loop is fully covered.
      mockedRandomBytes.mockReturnValueOnce([300] as unknown as Buffer<ArrayBuffer>);

      const codes = service.generateBackupCodes();

      expect(codes).toHaveLength(10);
      expect(new Set(codes).size).toBe(10);
      codes.forEach((code) => {
        expect(code).toHaveLength(8);
      });
    });
  });
});
