import type { Duration } from '@nestjs/resilience';

declare global {
  /**
   * Environment variables required for the NestJS application.
   * Validation is performed via Zod schema in env.validation.ts.
   * Missing or invalid settings will cause a clear error at boot.
   */
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Application mode: development, production, or test.
       * Defaults to 'development' if not set.
       */
      NODE_ENV?: 'development' | 'production' | 'test';
      /**
       * Port number for the application server.
       * Defaults to 3000 if not set.
       */
      PORT?: string;
      /**
       * Name of the application.
       * Optional: used for display/logging purposes.
       */
      APP_NAME?: string;
      /**
       * Prefix for all API routes.
       * Optional: enables route versioning/organization.
       */
      API_PREFIX?: string;
      /**
       * Version of the API.
       * Optional: used in API documentation and route grouping.
       */
      API_VERSION?: string;
      /**
       * Base URL of the application.
       * Optional: used for generating absolute URLs and Swagger documentation.
       */
      APP_URL?: string;
      /**
       * Connection string for the database (PostgreSQL).
       * Optional: if not provided, database connection may be disabled or use defaults.
       */
      DATABASE_URL?: string;
      /**
       * Redis connection URL.
       * Required for cache functionality using KeyV/Redis.
       * Format: redis://[[user][:password@]host][:port][/db_number]
       */
      REDIS_URL?: string;
      /**
       * Time-to-live for cache entries in seconds.
       * Defaults to 300 seconds (5 minutes) if not set.
       * Must be a positive integer.
       */
      CACHE_TTL?: number;
      /**
       * Queue name for BullMQ.
       * Optional: defaults to 'default' if not set.
       */
      QUEUE_NAME?: string;
      /**
       * Job processing timeout in milliseconds.
       * Optional: defaults to 0 (no timeout) if not set.
       */
      QUEUE_TIMEOUT?: number;
      /**
       * Remove completed jobs from queue.
       * Set to 'false' to keep completed jobs in queue (default: true).
       */
      QUEUE_REMOVE?: string;
      /**
       * Allow job retry on failure.
       * Set to 0 for unlimited retries (default: 0).
       */
      QUEUE_ATTEMPTS?: number;
      /**
       * SMTP host for outbound email.
       * Optional: defaults to 'smtp.google.com' if not set.
       */
      MAIL_HOST?: string;
      /**
       * SMTP port for outbound email.
       * Required: mail server port (e.g. 587, 465).
       */
      MAIL_PORT?: number;
      /**
       * SMTP username for authentication.
       * Required: mail server username.
       */
      MAIL_USERNAME?: string;
      /**
       * SMTP password or app-specific password.
       * Required: mail server password.
       */
      MAIL_PASSWORD?: string;
      /**
       * Default sender email address.
       * Optional: defaults to 'no-reply@example.com' if not set.
       * Must be a valid email format.
       */
      MAIL_FROM?: string;
      /**
       * Enable SSL/TLS for SMTP connection.
       * Optional: default true. Set to 'false' to disable.
       */
      MAIL_SECURE?: string;
      /**
       * Enable email preview in development (Mailtrap/io).
       * Optional: default false. Set to 'true' to enable.
       */
      MAIL_PREVIEW?: string;
      /**
       * Default language code for i18n module.
       * Optional: defaults to 'en' if not set.
       */
      I18N_DEFAULT_LOCALE?: string;
      /**
       * Comma-separated list of supported locale codes for i18n module.
       * Optional: defaults to 'cn,en,fr,ru,vi' if not set.
       */
      I18N_SUPPORTED_LOCALES?: string;
      /**
       * Query parameter name for locale switching.
       * Optional: defaults to 'lang' if not set.
       */
      I18N_QUERY_LOCALE?: string;
      /**
       * Header name for locale switching.
       * Optional: defaults to 'x-lang' if not set.
       */
      I18N_HEADER_LOCALE?: string;
      /**
       * Enable SSL for database connection.
       * Optional: string value to configure SSL settings.
       */
      DB_SSL?: string;
      /**
       * Reject unauthorized certificates for database SSL connection.
       * Optional: string value to configure SSL rejection settings.
       */
      DB_SSL_REJECT_UNAUTHORIZED?: string;
      /**
       * Time-to-live for throttle rate limit cache in seconds.
       * Defaults to 60 seconds if not set.
       * Must be a positive integer.
       */
      THROTTLE_TTL?: number;
      /**
       * Maximum number of requests allowed per TTL period.
       * Defaults to 10 if not set.
       * Must be a positive integer.
       */
      THROTTLE_LIMIT?: number;
      /**
       * Duration to block requests after rate limit is exceeded in milliseconds.
       * Set to 0 to disable blocking (default: 0).
       * Must be a non-negative integer.
       */
      THROTTLE_BLOCK_DURATION?: number;
      /**
       * Key for NestJS Observe tracing/metrics.
       * Optional: obtained from Observe dashboard.
       */
      OBSERVE_APP_KEY?: string;
      /**
       * Secret for NestJS Observe authentication.
       * Optional: obtained from Observe dashboard.
       */
      OBSERVE_APP_SECRET?: string;
      /**
       * Service ID for NestJS Observe.
       * Optional: identifies the service in the Observe dashboard.
       */
      OBSERVE_SERVICE_ID?: string;
      /**
       * Title for Swagger API documentation.
       * Optional: defaults to application name or "API".
       */
      SWAGGER_TITLE?: string;
      /**
       * Description for Swagger API documentation.
       * Optional: describes the API purpose and capabilities.
       */
      SWAGGER_DESCRIPTION?: string;
      /**
       * Version for Swagger API documentation.
       * Optional: describes the API version.
       */
      SWAGGER_VERSION?: string;
      /**
       * Path prefix for Swagger UI.
       * Optional: custom path for accessing Swagger documentation.
       */
      SWAGGER_PATH?: string;
      /**
       * Admin path prefix for Swagger UI.
       * Optional: custom admin endpoint for Swagger documentation.
       */
      SWAGGER_ADMIN_PATH?: string;
      /**
       * Enable Swagger admin endpoint.
       * Optional: boolean-like string to enable admin features in Swagger.
       */
      SWAGGER_ENABLE_ADMIN?: string;
      /**
       * Default timeout duration for resilience policies.
       * Optional: duration (e.g. '5s'). Defaults to '5s'.
       */
      RESILIENCE_TIMEOUT?: Duration;
      /**
       * Number of retry attempts for resilience policies.
       * Optional: positive integer. Defaults to 3.
       */
      RESILIENCE_RETRY_ATTEMPTS?: number;
      /**
       * Initial retry backoff delay for resilience policies.
       * Optional: duration (e.g. '200ms'). Defaults to '200ms'.
       */
      RESILIENCE_RETRY_DELAY?: Duration;
      /**
       * Maximum retry backoff delay for resilience policies.
       * Optional: duration (e.g. '2s'). Defaults to '2s'.
       */
      RESILIENCE_RETRY_MAX_DELAY?: Duration;
      /**
       * Circuit breaker failure rate threshold in percent.
       * Optional: number. Defaults to 50.
       */
      RESILIENCE_CIRCUIT_FAILURE_THRESHOLD?: number;
      /**
       * Minimum calls before the circuit breaker evaluates the failure rate.
       * Optional: number. Defaults to 5.
       */
      RESILIENCE_CIRCUIT_MINIMUM_CALLS?: number;
      /**
       * Duration the circuit breaker stays open.
       * Optional: duration (e.g. '30s'). Defaults to '30s'.
       */
      RESILIENCE_CIRCUIT_OPEN_DURATION?: Duration;
      /**
       * Maximum concurrent calls allowed by the bulkhead.
       * Optional: number. Defaults to 10.
       */
      RESILIENCE_BULKHEAD_MAX_CONCURRENT?: number;
      /**
       * Maximum queued calls allowed by the bulkhead.
       * Optional: number. Defaults to 0.
       */
      RESILIENCE_BULKHEAD_MAX_QUEUE?: number;
      /**
       * Number of days to retain soft-deleted user records.
       * Optional: positive integer. Defaults to 30.
       */
      RETENTION_DAYS?: number;
      /**
       * Allowed origin(s) for CORS.
       * Optional: comma-separated list, '*' for any, or 'true' to reflect request origin. Defaults to reflecting origin.
       */
      CORS_ORIGIN?: string;
      /**
       * Allowed HTTP methods for CORS.
       * Optional: comma-separated list. Defaults to GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS.
       */
      CORS_METHODS?: string;
      /**
       * Allowed request headers for CORS.
       * Optional: comma-separated list. Defaults to reflecting request headers.
       */
      CORS_ALLOWED_HEADERS?: string;
      /**
       * Exposed response headers for CORS.
       * Optional: comma-separated list.
       */
      CORS_EXPOSED_HEADERS?: string;
      /**
       * Whether to allow credentials for CORS.
       * Optional: 'true' to enable. Defaults to false.
       */
      CORS_CREDENTIALS?: string;
      /**
       * Preflight cache duration in seconds for CORS.
       * Optional: positive integer.
       */
      CORS_MAX_AGE?: number;
      /**
       * Whether to pass preflight requests to next handler for CORS.
       * Optional: 'true' to enable. Defaults to false.
       */
      CORS_PREFLIGHT_CONTINUE?: string;
      /**
       * Status code for successful CORS OPTIONS requests.
       * Optional: integer. Defaults to 204.
       */
      CORS_OPTIONS_SUCCESS_STATUS?: number;
    }
  }
}

export {};