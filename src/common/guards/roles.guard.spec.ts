import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const createContext = (user: any, requiredRoles?: string[]) => {
    const handler = {};
    const cls = {};
    if (requiredRoles) {
      reflector.getAllAndOverride = vi.fn().mockReturnValue(requiredRoles);
    } else {
      reflector.getAllAndOverride = vi.fn().mockReturnValue(undefined);
    }
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => handler,
      getClass: () => cls,
    } as any;
  };

  it('should allow access when no roles are required', () => {
    const context = createContext({ sub: 'user-1', roles: ['USER'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has the required role', () => {
    const context = createContext({ sub: 'user-1', roles: ['ADMIN'] }, ['ADMIN']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks the required role', () => {
    const context = createContext({ sub: 'user-1', roles: ['USER'] }, ['ADMIN']);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user has no roles array', () => {
    const context = createContext({ sub: 'user-1' }, ['ADMIN']);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    const context = createContext(null, ['ADMIN']);
    expect(guard.canActivate(context)).toBe(false);
  });
});
