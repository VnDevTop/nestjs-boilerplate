import { registerAs } from '@nestjs/config';
import { SecurityHeadersOptions } from "@nestjs/common/interfaces/http/security-headers-options.interface";

/**
 * Security headers configuration namespace using NestJS Helmet/SecurityHeaders.
 *
 * Security headers are enforced globally per application to protect against
 * common web vulnerabilities. Settings are read from environment variables:
 * - SECURITY_HEADERS_X_FRAME_OPTIONS: Set to 'false' to disable X-Frame-Options
 * - SECURITY_HEADERS_STRICT_TRANSPORT_SECURITY: Enable HSTS with maxAge and preload
 * - SECURITY_HEADERS_REFERRER_POLICY: Set referrer policy for cross-origin requests
 *
 * This config follows the same pattern as `database.config.ts` and `cache.config.ts`,
 * and is designed to be used with `app.useSecurityHeaders()` in main.ts (NestJS 12.1+).
 *
 * @example
 * // Environment variables:
 * # SECURITY_HEADERS_X_FRAME_OPTIONS=false
 * # SECURITY_HEADERS_STRICT_TRANSPORT_SECURITY_maxAge=63072000
 * # SECURITY_HEADERS_STRICT_TRANSPORT_SECURITY_preload=true
 * # SECURITY_HEADERS_REFERRER_POLICY=strict-origin-when-cross-origin
 *
 * @see https://docs.nestjs.com/security/helmet
 * @see httpsdeveloper.mozilla.org/en-US/docs/Web/HTTP/Headers
 */
export const securityHeaderConfig = registerAs<SecurityHeadersOptions>(
  'securityHeader',
  () => ({
    xFrameOptions: false,
    strictTransportSecurity: {maxAge: 63072000, preload: true},
    referrerPolicy: {policy: 'strict-origin-when-cross-origin'},
  })
);