import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { AuthGuard } from './auth.guard.js';
import { Role } from '../../../common/enums/role.enum.js';

describe('AuthGuard', () => {
  const reflector = new Reflector();
  const guard = new AuthGuard(reflector);

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
    const context = createContext({ sub: 'user-1', roles: [Role.USER] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when no user is present', () => {
    const context = createContext(null);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow access when user has required role', () => {
    const context = createContext({ sub: 'user-1', roles: [Role.ADMIN] }, [Role.ADMIN]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    const context = createContext({ sub: 'user-1', roles: [Role.USER] }, [Role.ADMIN]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user has no roles array', () => {
    const context = createContext({ sub: 'user-1' }, [Role.ADMIN]);
    expect(guard.canActivate(context)).toBe(false);
  });
});