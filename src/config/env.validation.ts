import { z } from 'zod';

/**
 * Validates the application environment before any connections are established,
 * ensuring required configuration is present and correctly typed. Missing or
 * invalid settings will cause a clear error at boot rather than confusing
 * failures at runtime.
 *
 * Validation rules are defined via Zod schema; error messages use Zod's own
 * descriptive output rather than a separate lookup table.
 */

/**
 * Zod schema describing the required environment variables with their
 * validation rules. Covers application mode, server settings, database
 * connection, observation service configuration, and Swagger documentation
 * options.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_NAME: z.string().optional(),
  API_PREFIX: z.string().optional(),
  API_VERSION: z.string().optional(),
  APP_URL: z.url().optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.url().optional(),
  CACHE_TTL: z.coerce.number().int().positive().default(300),
  CORS_ORIGIN: z.string().optional(),
  CORS_METHODS: z.string().optional(),
  CORS_ALLOWED_HEADERS: z.string().optional(),
  CORS_EXPOSED_HEADERS: z.string().optional(),
  CORS_CREDENTIALS: z.string().optional(),
  CORS_MAX_AGE: z.coerce.number().int().positive().optional(),
  CORS_PREFLIGHT_CONTINUE: z.string().optional(),
  CORS_OPTIONS_SUCCESS_STATUS: z.coerce.number().int().optional(),
  QUEUE_NAME: z.string().optional(),
  QUEUE_TIMEOUT: z.coerce.number().int().positive().optional(),
  QUEUE_REMOVE: z.string().optional(),
  QUEUE_ATTEMPTS: z.coerce.number().int().optional(),
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.string().optional(),
  MAIL_USERNAME: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.email().optional(),
  MAIL_SECURE: z.string().optional(),
  MAIL_PREVIEW: z.string().optional(),
  DB_SSL: z.string().optional(),
  DB_SSL_REJECT_UNAUTHORIZED: z.string().optional(),
  OBSERVE_APP_KEY: z.string().optional(),
  OBSERVE_APP_SECRET: z.string().optional(),
  OBSERVE_SERVICE_ID: z.string().optional(),
  SWAGGER_TITLE: z.string().optional(),
  SWAGGER_DESCRIPTION: z.string().optional(),
  SWAGGER_VERSION: z.string().optional(),
  SWAGGER_PATH: z.string().optional(),
  SWAGGER_ADMIN_PATH: z.string().optional(),
  SWAGGER_ENABLE_ADMIN: z.string().optional(),
  RESILIENCE_TIMEOUT: z.string().optional(),
  RESILIENCE_RETRY_ATTEMPTS: z.coerce.number().int().positive().optional(),
  RESILIENCE_RETRY_DELAY: z.string().optional(),
  RESILIENCE_RETRY_MAX_DELAY: z.string().optional(),
  RESILIENCE_CIRCUIT_FAILURE_THRESHOLD: z.coerce.number().int().positive().optional(),
  RESILIENCE_CIRCUIT_MINIMUM_CALLS: z.coerce.number().int().positive().optional(),
  RESILIENCE_CIRCUIT_OPEN_DURATION: z.string().optional(),
  RESILIENCE_BULKHEAD_MAX_CONCURRENT: z.coerce.number().int().positive().optional(),
  RESILIENCE_BULKHEAD_MAX_QUEUE: z.coerce.number().int().nonnegative().optional(),
  I18N_DEFAULT_LOCALE: z.string().optional(),
  I18N_SUPPORTED_LOCALES: z.string().optional(),
  I18N_QUERY_LOCALE: z.string().optional(),
  I18N_HEADER_LOCALE: z.string().optional(),
  THROTTLE_TTL: z.coerce.number().int().positive().optional(),
  THROTTLE_LIMIT: z.coerce.number().int().positive().optional(),
  THROTTLE_BLOCK_DURATION: z.coerce.number().int().optional(),
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