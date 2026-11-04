import { describe, expect, it } from 'vitest';

import { IS_PUBLIC_KEY, Public } from './public.decorator.js';

describe('Public decorator', () => {
  it('should export IS_PUBLIC_KEY as "isPublic"', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should create metadata decorator', () => {
    const decorator = Public();
    expect(decorator).toBeDefined();
    expect(typeof decorator).toBe('function');
  });
});