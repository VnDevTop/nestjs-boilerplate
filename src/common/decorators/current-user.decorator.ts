import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestUser } from '../interfaces/request-user.interface.js';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: RequestUser) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);