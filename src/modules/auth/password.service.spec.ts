import { describe, expect, it } from 'vitest';

import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  describe('hash', () => {
    it('should hash a password', async () => {
      const hash = await passwordService.hash('test-password');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('test-password');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same password', async () => {
      const hash1 = await passwordService.hash('test-password');
      const hash2 = await passwordService.hash('test-password');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should verify a correct password', async () => {
      const hash = await passwordService.hash('test-password');
      const isValid = await passwordService.verify(hash, 'test-password');
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const hash = await passwordService.hash('test-password');
      const isValid = await passwordService.verify(hash, 'wrong-password');
      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const isValid = await passwordService.verify('invalid-hash', 'test-password');
      expect(isValid).toBe(false);
    });
  });

  describe('needsRehash', () => {
    it('should return false for a freshly hashed password', async () => {
      const hash = await passwordService.hash('test-password');
      const needsRehash = passwordService.needsRehash(hash);
      expect(needsRehash).toBe(false);
    });

    it('should return true for an invalid hash', () => {
      const needsRehash = passwordService.needsRehash('invalid-hash');
      expect(needsRehash).toBe(true);
    });
  });
});