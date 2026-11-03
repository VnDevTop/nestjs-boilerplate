import { describe, expect, it, vi } from 'vitest';

import { setupCors } from './cors.setup.js';

describe('setupCors', () => {
  it('enables cors using the config service value', () => {
    const enableCors = vi.fn();
    const app = {
      get: () => ({
        get: () => ({ origin: true, credentials: false }),
      }),
      enableCors,
    } as any;

    setupCors(app);

    expect(enableCors).toHaveBeenCalledWith({ origin: true, credentials: false });
  });

  it('enables cors with undefined config when none is registered', () => {
    const enableCors = vi.fn();
    const app = {
      get: () => ({
        get: () => undefined,
      }),
      enableCors,
    } as any;

    setupCors(app);

    expect(enableCors).toHaveBeenCalledWith(undefined);
  });
});