import { registerAs } from '@nestjs/config';
import { CacheModuleOptions } from "@nestjs/cache-manager";
import { Keyv } from "keyv";

/**
 * Cache configuration namespace using KeyV with Redis.
 *
 * Cache stores and TTL settings are read from environment variables:
 * - REDIS_URL: Redis connection URL (required)
 * - CACHE_TTL: Time-to-live in seconds for cache entries (default: 300)
 */
export const cacheConfig = registerAs<CacheModuleOptions>(
  'cache',
  () => ({
    isGlobal: true,
    // Use KeyV with Redis — no in-memory fallback
    stores: [
      new Keyv(process.env.REDIS_URL ?? 'redis://localhost:6379'),
    ],
    // TTL in seconds for all cache entries
    ttl: Number(process.env.CACHE_TTL ?? 300),
    namespace: 'cache',
  })
);