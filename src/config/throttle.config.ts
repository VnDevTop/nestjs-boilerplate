import { registerAs } from '@nestjs/config';
import { ThrottlerModuleOptions } from "@nestjs/throttler";

/**
 * Throttle configuration namespace using NestJS Throttler.
 *
 * Rate limiting is enforced globally per application IP address.
 * Configuration is read from environment variables:
 * - THROTTLE_TTL: Time-to-live in seconds for the rate limit cache (default: 60)
 * - THROTTLE_LIMIT: Maximum number of requests allowed per TTL period (default: 10)
 * - THROTTLE_BLOCK_DURATION: Duration to block requests after limit exceeded (default: 0 = disabled)
 *
 * This config follows the same pattern as `database.config.ts` and `cache.config.ts`.
 */
export const throttleConfig = registerAs<ThrottlerModuleOptions>('throttle', () => ({
  // Lets a client see how much budget it has left and back off, instead of
  // only discovering the limit by being rejected.
  setHeaders: true,
  
  /**
   * Every bucket the guard may enforce, not the ones in use.
   *
   * `ThrottlerGuard` builds its list here and nothing else, then loops over the
   * whole list on every request. A bucket declared only in `@Throttle()` metadata
   * is never reached, which is why the per-address mail limit declared in Phase 14
   * had never actually run. Declaring them all here and skipping the ones a route
   * did not opt into is the only shape that works.
   *
   * Each carries a `skipIf` keyed on the route's group, so an endpoint without
   * `@RateLimit` is limited by `default` alone.
   */
  throttlers: [{
    ttl: Number(process.env.THROTTLE_TTL ?? 60000),
    limit: Number(process.env.THROTTLE_LIMIT ?? 100),
    blockDuration:
      Number(process.env.THROTTLE_BLOCK_DURATION ?? 0) || undefined,
  }]
}));