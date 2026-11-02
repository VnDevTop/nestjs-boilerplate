/**
 * Swagger (OpenAPI) setup module for NestJS application.
 *
 * Provides a centralized way to configure Swagger documentation with support for:
 * - Public API documentation endpoint (accessible to all users)
 * - Admin API documentation endpoint (role-gated or non-production only)
 * - Configuration via environment variables and NestJS ConfigModule
 * - Custom title, description, version, and paths from project configuration
 *
 * Every DTO/entity property exposed in the API must use `@ApiProperty`
 * or `@ApiPropertyOptional` with `type`, `example`, and `description`
 * for SDK generation and API documentation.
 *
 * @module swagger.setup
 */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

/**
 * Configuration options for the Swagger setup.
 * Values can be overridden via environment variables or passed directly.
 */
export type SwaggerOption = {
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
};

/**
 * Default Swagger settings read from environment variables via ConfigService.
 * These defaults can be overridden by passing options to `setupSwagger()`.
 */
export const defaultSwaggerOption: SwaggerOption = {
  title: 'NestJS Boilerplate API',
  description: 'Production-ready NestJS boilerplate with modular architecture',
  version: '1.0.0',
  path: 'api/docs',
  admin: false,
  adminPath: 'api/docs/admin',
};

/**
 * Setup Swagger (OpenAPI) documentation for the given Nest application.
 *
 * This function configures two Swagger UI endpoints:
 *
 * 1. **Public endpoint**: `GET /${path}`
 *    - Available to all users in all environments.
 *    - Displays the full OpenAPI specification and interactive UI.
 *
 * 2. **Admin endpoint**: `GET /${adminPath}`
 *    - Only enabled when `admin: true` AND the application is NOT in production.
 *    - Useful for internal/admin APIs that should not be exposed publicly.
 *
 * The configuration values are resolved in the following priority order:
 * 1. Options passed directly to `setupSwagger()`.
 * 2. Environment variables (`SWAGGER_TITLE`, `SWAGGER_DESCRIPTION`, `SWAGGER_VERSION`,
 *    `SWAGGER_PATH`, `SWAGGER_ADMIN_PATH`, `SWAGGER_ENABLE_ADMIN`).
 * 3. Default values defined in `defaultSwaggerOption`.
 *
 * @param app - The NestJS application instance.
 * @param options - Optional configuration object to override defaults.
 *                  All values can be provided via environment variables.
 * @returns The initialized INestApplication for further configuration.
 *
 * @example
 * ```typescript
 * // Using default config from environment variables
 * setupSwagger(app);
 *
 * // Custom configuration
 * setupSwagger(app, {
 *   title: 'My Custom API',
 *   version: '2.0.0',
 *   admin: true,
 * });
 * ```
 */
export function setupSwagger(
  app: INestApplication,
  options?: SwaggerOption,
): INestApplication {
  const configService = app.get(ConfigService);

  // Resolve Swagger configuration from config service
  // The 'swagger' config is registered with registerAs and guaranteed to exist
  const swaggerConfig = configService.get<SwaggerOption>('swagger')!;

  // Resolve Swagger title
  // Priority: options.title > config swagger.title > default
  const title: string = options?.title ?? (swaggerConfig.title as string);

  // Resolve Swagger description
  // Priority: options.description > config swagger.description > default
  const description: string = options?.description ?? (swaggerConfig.description as string);

  // Resolve Swagger version
  // Priority: options.version > config swagger.version > default
  const version: string = options?.version ?? (swaggerConfig.version as string);

  // Resolve Swagger path
  // Priority: options.path > config swagger.path > default
  const path: string = options?.path ?? (swaggerConfig.path as string);

  // Resolve Swagger admin flag
  // Priority: options.admin > config swagger.admin > default
  const admin: boolean = options?.admin !== undefined ? options.admin : swaggerConfig.admin as boolean;

  // Resolve Swagger admin path
  // Priority: options.adminPath > config swagger.adminPath > default
  const adminPath: string = options?.adminPath ?? (swaggerConfig.adminPath as string);

  // Build the Swagger document configuration using DocumentBuilder
  const documentBuilder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addTag('nestjs')
    .addTag('boilerplate')
    .addTag('api');

  // Add additional tags if needed (customize per project)
  // documentBuilder.addTag('users');
  // documentBuilder.addTag('auth');

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  // 1. Public Swagger UI endpoint — always available
  SwaggerModule.setup(path, app, document);

  // 2. Admin Swagger UI endpoint — only when enabled and not in production
  if (admin && process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup(adminPath, app, document);
  }

  return app;
}