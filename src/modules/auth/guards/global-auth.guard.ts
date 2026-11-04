import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator.js';

/**
 * Global authentication guard.
 *
 * Activates JWT authentication on all routes by default. Routes marked
 * with `@Public()` are skipped. This guard is registered as an
 * `APP_GUARD` so it applies application-wide.
 *
 * @class GlobalAuthGuard
 */
@Injectable()
export class GlobalAuthGuard extends PassportAuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}