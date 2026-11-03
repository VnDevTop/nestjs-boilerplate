import { registerAs } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Parses a comma-separated origin string into a static origin value accepted by
 * the CORS middleware.
 *
 * - `'*'` is returned as-is (allow any origin).
 * - `'true'` is converted to `true` (reflect request origin, useful with credentials).
 * - A single value is returned as a string.
 * - Multiple comma-separated values are returned as an array of strings.
 *
 * @param value - Raw environment value for `CORS_ORIGIN`.
 * @returns A static origin value for `CorsOptions.origin`.
 */
function parseOrigin(value: string | undefined): CorsOptions['origin'] {
  if (!value) {
    // Default to reflecting the request origin (permissive but safe for dev).
    return true;
  }

  const trimmed = value.trim();
  if (trimmed === '*') {
    return '*';
  }
  if (trimmed.toLowerCase() === 'true') {
    return true;
  }

  const origins = trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (origins.length === 0) {
    return true;
  }
  if (origins.length === 1) {
    return origins[0];
  }
  return origins;
}

/**
 * CORS (Cross-Origin Resource Sharing) configuration namespace.
 *
 * CORS is enforced globally per application to control which origins may access
 * the API. Settings are read from environment variables:
 * - CORS_ORIGIN: Allowed origin(s). Comma-separated list, '*' for any, or 'true' to reflect. Default: true
 * - CORS_METHODS: Allowed HTTP methods (comma-separated). Default: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
 * - CORS_ALLOWED_HEADERS: Allowed request headers (comma-separated). Default: undefined (reflect request headers)
 * - CORS_EXPOSED_HEADERS: Exposed response headers (comma-separated). Default: undefined
 * - CORS_CREDENTIALS: Whether to allow credentials. Default: false
 * - CORS_MAX_AGE: Preflight cache duration in seconds. Default: undefined
 * - CORS_PREFLIGHT_CONTINUE: Whether to pass preflight to next handler. Default: false
 * - CORS_OPTIONS_SUCCESS_STATUS: Status code for successful OPTIONS requests. Default: 204
 *
 * This config follows the same pattern as `security-header.config.ts` and
 * `throttle.config.ts`, and is designed to be used with `app.enableCors()` in
 * main.ts.
 *
 * @example
 * // Environment variables:
 * # CORS_ORIGIN=https://example.com,https://app.example.com
 * # CORS_CREDENTIALS=true
 * # CORS_MAX_AGE=86400
 *
 * @see https://docs.nestjs.com/security/cors
 * @see https://github.com/expressjs/cors
 */
export const corsConfig = registerAs<CorsOptions>('cors', () => ({
  origin: parseOrigin(process.env.CORS_ORIGIN),
  methods: process.env.CORS_METHODS
    ? process.env.CORS_METHODS.split(',').map((method) => method.trim())
    : 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS
    ? process.env.CORS_ALLOWED_HEADERS.split(',').map((header) => header.trim())
    : undefined,
  exposedHeaders: process.env.CORS_EXPOSED_HEADERS
    ? process.env.CORS_EXPOSED_HEADERS.split(',').map((header) => header.trim())
    : undefined,
  credentials: process.env.CORS_CREDENTIALS === 'true',
  maxAge: process.env.CORS_MAX_AGE ? Number(process.env.CORS_MAX_AGE) : undefined,
  preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true',
  optionsSuccessStatus: process.env.CORS_OPTIONS_SUCCESS_STATUS
    ? Number(process.env.CORS_OPTIONS_SUCCESS_STATUS)
    : 204,
}));