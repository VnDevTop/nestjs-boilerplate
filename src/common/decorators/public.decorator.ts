import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for public (unauthenticated) routes.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public (no authentication required).
 *
 * Use on endpoints that should be accessible without a JWT token,
 * such as login, registration, and health checks.
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);