import { registerAs } from '@nestjs/config';
import { BullModuleOptions } from "@nestjs/bull";

/**
 * Queue configuration namespace using BullMQ with Redis.
 *
 * Queue connection settings are read from environment variables:
 * - REDIS_URL: Redis connection URL (required)
 * - Queue name defaults to 'default' if not specified
 * - Timeout and retry options for job processing
 *
 * Note: Uses native BullMQ Redis connection (not KeyV).
 * For distributed queuing with multiple processes, ensure same REDIS_URL is used.
 */
export const queueConfig = registerAs<BullModuleOptions>(
  'queue',
  () => ({
    // Redis connection URL for BullMQ
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
    // Queue name, defaults to 'default'
    name: process.env.QUEUE_NAME ?? 'default',
    // Job processing timeout in milliseconds (default: 0 = no timeout)
    timeout: Number(process.env.QUEUE_TIMEOUT ?? 0),
    // automatically remove completed jobs from the queue (default: true)
    remove: process.env.QUEUE_REMOVE !== 'false',
    // allow job to be retried if it fails (default: 0 = unlimited)
    attempts: Number(process.env.QUEUE_ATTEMPTS ?? 0),
    // delay between retries in milliseconds (exponential backoff)
    backoff: {
      type: 'exponential',
      delay: 5000,
    } as const,
  })
);