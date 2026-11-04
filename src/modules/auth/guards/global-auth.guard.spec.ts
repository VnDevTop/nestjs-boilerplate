import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';
import { GlobalAuthGuard } from './global-auth.guard.js';

describe('GlobalAuthGuard', () => {
  const reflector = new Reflector();
  const guard = new GlobalAuthGuard(reflector);

  const createContext = (isPublic: boolean) => {
    reflector.getAllAndOverride = vi.fn().mockReturnValue(isPublic);
    return {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should allow access to public routes', () => {
    const context = createContext(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should check IS_PUBLIC_KEY metadata', () => {
    const context = createContext(true);
    guard.canActivate(context);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [expect.anything(), expect.anything()]);
  });

  it('should delegate to super.canActivate for non-public routes', () => {
    const context = createContext(false);
    // Spy on the parent class method
    const superCanActivate = vi.fn().mockReturnValue(true);
    const proto = Object.getPrototypeOf(Object.getPrototypeOf(guard));
    const original = proto.canActivate;
    proto.canActivate = superCanActivate;

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(superCanActivate).toHaveBeenCalledWith(context);

    // Restore
    proto.canActivate = original;
  });
});