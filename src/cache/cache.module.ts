import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Keyv } from 'keyv';

/**
 * Cache module using KeyV with Redis adapter.
 *
 * This provides a distributed cache backed by Redis with no in-memory fallback.
 * Configure the Redis connection via the REDIS_URL environment variable.
 *
 * @see https://github.com/nestjs/cache-manager
 * @see https://keyv.dev/
 */
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        // Use KeyV with Redis — no in-memory fallback
        stores: [
          new Keyv(process.env.REDIS_URL ?? 'redis://localhost:6379'),
        ],
        // TTL in seconds for all cache entries
        ttl: Number(process.env.CACHE_TTL ?? 300),
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}