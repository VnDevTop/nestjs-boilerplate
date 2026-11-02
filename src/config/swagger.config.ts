/**
 * Swagger (OpenAPI) configuration module.
 *
 * Centralized configuration for Swagger (OpenAPI) documentation.
 * All settings can be overridden via environment variables.
 *
 * @module swagger.config
 */
import { registerAs } from '@nestjs/config';

/**
 * Swagger configuration options interface.
 */
export interface SwaggerConfig {
  /** Title of the API documentation. */
  title?: string;
  /** Description of the API. */
  description?: string;
  /** Version of the API. */
  version?: string;
  /** Path prefix for the Swagger UI (e.g., 'api/docs'). */
  path?: string;
  /** Whether to enable the admin-only Swagger endpoint. */
  admin?: boolean;
  /** Path for the admin-only Swagger UI (e.g., 'api/docs/admin'). */
  adminPath?: string;
}

/**
 * Default Swagger configuration read from environment variables.
 * Values follow the priority: env vars > defaults.
 */
export const swaggerConfig = registerAs<SwaggerConfig>('swagger', (): SwaggerConfig => ({
  title: process.env.SWAGGER_TITLE,
  description: process.env.SWAGGER_DESCRIPTION,
  version: process.env.SWAGGER_VERSION,
  path: process.env.SWAGGER_PATH,
  admin: process.env.SWAGGER_ENABLE_ADMIN !== 'false',
  adminPath: process.env.SWAGGER_ADMIN_PATH,
}));

