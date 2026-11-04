import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { resolvePermissions } from '../constants/permissions.constant.js';

/**
 * Guard enforcing permission-based access control.
 *
 * Checks that the authenticated user's roles grant all required
 * permissions specified via the `@Permissions()` decorator.
 *
 * @class PermissionsGuard
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request?.user;

    if (!user || !Array.isArray(user.roles)) {
      return false;
    }

    const grantedPermissions = resolvePermissions(user.roles);
    return requiredPermissions.every((permission) =>
      grantedPermissions.includes(permission as any),
    );
  }
}