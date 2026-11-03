import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Enables CORS (Cross-Origin Resource Sharing) on the NestJS application.
 *
 * This function configures CORS globally on the application instance using the
 * `cors` configuration namespace defined in `cors.config.ts`. The configuration
 * is read from environment variables and applied via `app.enableCors()`.
 *
 * CORS controls which origins may access the API and which headers/methods are
 * allowed, protecting against unintended cross-origin access while enabling
 * legitimate browser clients.
 *
 * @param app - The NestJS application instance.
 * @returns undefined
 *
 * @example
 * // Enable CORS with defaults (reflects request origin):
 * setupCors(app);
 *
 * // Restrict to specific origins via environment variables:
 * // CORS_ORIGIN=https://example.com,https://app.example.com
 * // CORS_CREDENTIALS=true
 */
export function setupCors(app: INestApplication): void {
  const configService = app.get(ConfigService);

  // Resolve CORS configuration from config service
  const corsConfig = configService.get<CorsOptions>('cors');

  app.enableCors(corsConfig);
}