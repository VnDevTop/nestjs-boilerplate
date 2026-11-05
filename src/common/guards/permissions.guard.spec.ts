import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';

import { PermissionsGuard } from './permissions.guard.js';
import { Permission } from '../enums/permission.enum.js';

describe('PermissionsGuard', () => {
  const reflector = new Reflector();
  const guard = new PermissionsGuard(reflector);

  const createContext = (user: any, requiredPermissions?: string[]) => {
    const handler = {};
    const cls = {};
    if (requiredPermissions) {
      reflector.getAllAndOverride = vi.fn().mockReturnValue(requiredPermissions);
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

  it('should allow access when no permissions are required', () => {
    const context = createContext({ sub: 'user-1', roles: ['USER'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has all required permissions', () => {
    const context = createContext({ sub: 'user-1', roles: ['ADMIN'] }, [Permission.USERS_READ]);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks a required permission', () => {
    const context = createContext({ sub: 'user-1', roles: ['USER'] }, [Permission.USERS_READ, Permission.USERS_WRITE]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when user has no roles array', () => {
    const context = createContext({ sub: 'user-1' }, [Permission.USERS_READ]);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny access when no user is present', () => {
    const context = createContext(null, [Permission.USERS_READ]);
    expect(guard.canActivate(context)).toBe(false);
  });
});
