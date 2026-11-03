import { describe, expect, it, vi } from 'vitest';

import { setupSecurityHeader } from './security-header.setup.js';

describe('setupSecurityHeader', () => {
  it('applies security headers from the config service', () => {
    const useSecurityHeaders = vi.fn();
    const config = { xFrameOptions: false };
    const app = {
      get: () => ({
        get: () => config,
      }),
      useSecurityHeaders,
    } as any;

    setupSecurityHeader(app);

    expect(useSecurityHeaders).toHaveBeenCalledWith(config);
  });

  it('applies undefined when no config is registered', () => {
    const useSecurityHeaders = vi.fn();
    const app = {
      get: () => ({
        get: () => undefined,
      }),
      useSecurityHeaders,
    } as any;

    setupSecurityHeader(app);

    expect(useSecurityHeaders).toHaveBeenCalledWith(undefined);
  });
});