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
    }
  }
}

export {};