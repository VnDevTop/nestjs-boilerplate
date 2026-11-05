import { describe, expect, it } from 'vitest';

import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    const guard = new JwtAuthGuard();

    expect(guard).toBeDefined();
  });

  it('should be an instance of JwtAuthGuard', () => {
    const guard = new JwtAuthGuard();

    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
