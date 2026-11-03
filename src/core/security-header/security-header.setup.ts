import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityHeadersOptions } from "@nestjs/common/interfaces/http/security-headers-options.interface";

/**
 * Sets up security headers on the NestJS application.
 *
 * This function configures security headers globally on the application instance
 * using the `securityHeader` configuration namespace defined in `security-header.config.ts`.
 * The configuration is read from environment variables and applied via
 * `app.useSecurityHeaders()` (NestJS 12.1+).
 *
 * Security headers protect against common web vulnerabilities including:
 * - Clickjacking (X-Frame-Options)
 * - Protocol downgrade attacks (Strict-Transport-Security/HSTS)
 * - Referrer information leakage (Referrer-Policy)
 *
 * @param app - The NestJS application instance
 * @returns undefined
 *
 * @example
 * // Enable all security headers with defaults:
 * setupSecurityHeader(app);
 *
 * // Disable X-Frame-Options while keeping others:
 * // Set SECURITY_HEADERS_X_FRAME_OPTIONS=false in .env
 */
export function setupSecurityHeader(
  app: INestApplication,
) {
  const configService = app.get(ConfigService);
  
  // Resolve SecurityHeaders configuration from config service
  const securityHeaderConfig = configService.get<SecurityHeadersOptions>('securityHeader');
  
  app.useSecurityHeaders(securityHeaderConfig);
}