import { registerAs } from '@nestjs/config';

/**
 * JWT configuration namespace.
 *
 * JSON Web Token settings for authentication. Secrets and expiry times
 * are read from environment variables:
 * - JWT_SECRET: Secret key for signing access tokens (required in production)
 * - JWT_REFRESH_SECRET: Secret key for signing refresh tokens (defaults to JWT_SECRET)
 * - JWT_EXPIRES_IN: Access token lifetime (default: '15m')
 * - JWT_REFRESH_EXPIRES_IN: Refresh token lifetime (default: '7d')
 *
 * This config follows the same pattern as `database.config.ts` and `cache.config.ts`,
 * and is designed to be used with `JwtModule.registerAsync(jwtConfig.asProvider())`.
 */
export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'change-me-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'change-me-in-production',
  signOptions: {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as any,
  },
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));