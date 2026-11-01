import { z } from 'zod';

/**
 * Validates the environment before anything connects, so a missing or unusable
 * setting is a clear error at boot rather than a confusing failure later.
 *
 * Only the rules are custom. Messages are zod's own, because a schema that
 * describes *what* is wrong is enough; the alternative is a lookup table of
 * wording that has to be kept in step with the constraints themselves.
 */


/**
 * Zod schema describing the required environment variables.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  OBSERVE_APP_KEY: z.string().optional(),
  OBSERVE_APP_SECRET: z.string().optional(),
});

/**
 * Validates the process environment using Zod.
 *
 * @param config - Raw environment configuration.
 * @returns The validated and typed environment configuration.
 * @throws {Error} When validation fails.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Environment validation failed:\n${result.error.message}`);
  }
  return result.data as Record<string, unknown>;
}