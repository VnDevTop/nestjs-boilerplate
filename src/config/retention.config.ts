import { registerAs } from '@nestjs/config';

/**
 * Data retention configuration namespace.
 *
 * Controls how long soft-deleted user records are kept before being
 * permanently purged by the scheduled cleanup job.
 *
 * - RETENTION_DAYS: Number of days to retain soft-deleted records (default: 30).
 *
 * @see src/modules/users/users-cleanup.service.ts
 */
export const retentionConfig = registerAs('retention', () => ({
  retentionDays: Number(process.env.RETENTION_DAYS ?? 30),
}));