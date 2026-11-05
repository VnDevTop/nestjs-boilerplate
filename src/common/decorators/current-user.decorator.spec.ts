import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';

import { CurrentUser } from './current-user.decorator.js';
import type { RequestUser } from '../interfaces/request-user.interface.js';

describe('CurrentUser', () => {
  it('should return the user from the request', () => {
    class Dummy {
      handler(@CurrentUser() user: RequestUser) {
        return user;
      }
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Dummy, 'handler') as any;
    const entries = Object.values(metadata ?? {}) as any[];
    const entry = entries.find((item) => item && typeof item.factory === 'function');
    const factory = entry.factory as (data: unknown, ctx: ExecutionContext) => RequestUser;
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: 'user-1' } }),
      }),
    } as unknown as ExecutionContext;

    expect(factory({}, ctx)).toEqual({ sub: 'user-1' });
  });

  it('should return undefined when no user is present', () => {
    class Dummy {
      handler(@CurrentUser() user: RequestUser) {
        return user;
      }
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, Dummy, 'handler') as any;
    const entries = Object.values(metadata ?? {}) as any[];
    const entry = entries.find((item) => item && typeof item.factory === 'function');
    const factory = entry.factory as (data: unknown, ctx: ExecutionContext) => RequestUser;
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(factory({}, ctx)).toBeUndefined();
  });
});
