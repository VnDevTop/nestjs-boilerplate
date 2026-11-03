# Phase 6 — Structure & core packages

## Branch

`feat/project-structure` / `feat/core-packages`

## Summary

Established the modular source layout and added configuration, database, and
documentation foundations. Core packages will be added incrementally.

## Tasks completed

### Phase 6.0 — Project structure

1. `feat(structure): establish modular src layout`
   - Created `src/common/dto` and feature module folders under `src/modules`.
2. `chore(config): add configuration module and env validation`
   - Added `@nestjs/config` and Zod-based env validation.
3. `chore(database): add typeorm with postgresql and base entity`
   - Added `@nestjs/typeorm`, `typeorm`, `pg`, and `BaseEntity`.
4. `docs(structure): document folder conventions`
   - Added `docs/STRUCTURE.md`.
5. `chore(deps): add phase 1 runtime dependencies`
   - Runtime dependencies added in config/database commits.

### Phase 6.1 — Cross-cutting core packages (started)

- `chore(deps): add phase 2 dependencies`
  - Added Phase 6.1 runtime dependencies (swagger, validation, cache, queue, mail, i18n, http, throttle, security headers, cors, events, schedule).
- `feat(swagger): add openapi documentation with setupSwagger`
  - Added `@nestjs/swagger` and `src/core/swagger/` module.
  - Created `setupSwagger()` function to manage Swagger configuration.
  - Two API doc endpoints: `GET /api/docs` (public) and `GET /api/docs/admin` (admin, enabled in non-production or via `SWAGGER_ENABLE_ADMIN` env).
  - Path, version, and enable/disable configurable via environment variables (`SWAGGER_PATH`, `SWAGGER_VERSION`, `SWAGGER_ENABLE_ADMIN`).
  - Convention: every DTO and entity property exposed in API must use `@ApiProperty`/`@ApiPropertyOptional` with `type`, `example`, and `description` (for SDK generation and API docs).
- `feat(validation): add class-validator and class-transformer`
  - Added global `ValidationPipe` using `class-validator` and `class-transformer`.
  - Configuration: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.
  - Pipe automatically validates DTOs on incoming requests, stripping non-whitelisted properties and transforming payloads.
  - Every DTO property exposed in API must use `@ApiProperty`/`@ApiPropertyOptional` with `type`, `example`, and `description` (for SDK generation and API docs).
- `feat(validation): add zod support`
  - `zod` is used for environment validation via `src/config/env.validation.ts`.
  - Zod schema validates required environment variables at startup with clear error messages.
  - Schema includes: `NODE_ENV`, `PORT`, `APP_NAME`, `API_PREFIX`, `API_VERSION`, `APP_URL`, `DATABASE_URL`, `DB_SSL`, `DB_SSL_REJECT_UNAUTHORIZED`, `OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`, `OBSERVE_SERVICE_ID`, and Swagger config (`SWAGGER_*`).
  - Validation uses `zod.safeParse()` for clear error messages at boot rather than confusing failures later.
  - Schema also validates `REDIS_URL` (must be valid URL format) and `CACHE_TTL` (must be positive integer, default: 300).
- `feat(config): refine typed configuration namespaces`
  - Added `appConfig`, `observeConfig`, `databaseConfig`, and `cacheConfig` using `registerAs`.
  - Declared `NodeJS.ProcessEnv` types in `src/env.d.ts` with JSDoc descriptions for all 21 environment variables.
  - Config namespaces exportable via `src/config/index.ts` barrel export.
- `feat(config): apply typed config sample and env declarations`
- `feat(database): support ssl options`
- `chore(docker): add compose with postgres and redis`
- `feat(config): conditionally register observe module`
- `feat(health): add terminus health checks`
  - Added `@nestjs/terminus` for health check endpoints.
  - Endpoints: `GET /health` (general health) and `GET /health/ready` (readiness).
  - Configurable via `TerminusModule.forRoot()` with options for timeout, ignore errors, and exploration.
  - Health status exposed via Nest's built-in monitoring.
- `feat(cache): add cache manager` (keyv + Redis, no memory fallback)
  - Added `@nestjs/cache-manager`, `keyv`, and `@keyv/redis` dependencies.
  - **Moved to configuration namespace**: cache configuration now uses `cacheConfig` from `src/config/cache.config.ts` via `registerAs`.
  - Configured distributed cache backed by Redis via KeyV with no in-memory fallback.
  - Redis connection configured via `REDIS_URL` environment variable.
  - TTL configurable via `CACHE_TTL` environment variable (default: 300 seconds).
  - Cache module exported for use with `@InjectCache()` decorator across the application.
  - Registered in `AppModule` via `CacheModule.registerAsync(cacheConfig.asProvider())`.
- `feat(queue): add bullmq queues`
  - Installed `bullmq` dependency for distributed job processing.
  - Configured `BullModule.forRootAsync()` with Redis connection using `queueConfig.asProvider()` (no in-memory fallback).
  - Queue module exported for job registration via `@InjectQueue()` decorator.
  - Queue configuration via `queueConfig` with `redis`, `redisHost`, `redisPort`, `redisPassword`, and `redisDb` options.
  - Jobs and queues defined in `src/modules/queue/` directory.
- `feat(mail): add mailer`
  - Installed `@nestjs-modules/mailer` and `nodemailer` dependencies.
  - Configured outbound email service via SMTP with Nodemailer transport.
  - Email settings configurable via environment variables (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_SECURE`, `MAIL_PREVIEW`).
  - Mailer module exported for use with `@Mailer()` decorator and `@SendMessage()` handler across the application.
  - Mail configuration registered in `AppModule` via `MailerModule.forRootAsync(mailConfig.asProvider())`.
- `feat(i18n): add internationalization`
  - Installed `@nestjs/i18n` package for internationalization support.
  - Configured i18n module with default language Vietnamese (`vi`) and English (`en`).
  - Language settings configurable via environment variables (`I18N_DEFAULT_LANGUAGE`, `I18N_AVAILABLE_LANGUAGES`).
  - i18n module registered in `AppModule` via `I18nModule.forRoot()` with language options.
  - Supports language switching and locale middleware for i18n middleware.
- `feat(http): add axios http module`
  - Added `@nestjs/axios` and `axios` dependencies for HTTP client integration.
- `feat(throttle): add rate limiting`
  - Added `@nestjs/throttler` and Redis-backed throttler storage.
  - Registered `ThrottlerModule` and `ThrottlerGuard` globally in `AppModule`.
- `feat(helmet): add security headers`
  - Added `src/config/security-header.config.ts` (`securityHeaderConfig`) and `src/core/security-header/` (`setupSecurityHeader`).
  - Security headers applied globally via `app.useSecurityHeaders()` in `main.ts`.
- `feat(config): use module option types directly`
- `feat(cors): add cors support`
  - Added `src/config/cors.config.ts` (`corsConfig`) and `src/core/cors/` (`setupCors`).
  - CORS is enabled globally via `app.enableCors()` using env-driven options (`CORS_ORIGIN`, `CORS_METHODS`, `CORS_ALLOWED_HEADERS`, `CORS_EXPOSED_HEADERS`, `CORS_CREDENTIALS`, `CORS_MAX_AGE`, `CORS_PREFLIGHT_CONTINUE`, `CORS_OPTIONS_SUCCESS_STATUS`).
  - Registered `corsConfig` in `AppModule` and invoked `setupCors(app)` in `main.ts`.
- `feat(events): add event emitter`
  - Added `@nestjs/event-emitter` and registered `EventEmitterModule.forRoot()` in `AppModule`.
- `feat(schedule): add scheduler`
  - Added `@nestjs/schedule` and registered `ScheduleModule.forRoot()` in `AppModule`.
- `chore(config): move ProcessEnv declaration to env.d.ts`
  - `NodeJS.ProcessEnv` declarations (including CORS variables) live in `src/env.d.ts`.
- `chore(config): use module option types directly`
  - Configuration namespaces use their module option types directly (`CorsOptions`, `SecurityHeadersOptions`, `CacheModuleOptions`, etc.).
- `chore(app): shorten config imports via barrel`
  - `AppModule` imports configuration through `src/config/index.ts` barrel.
- `test(config): add config unit tests`
  - Added `src/config/config.spec.ts` covering `validateEnv` and all config namespaces (including CORS branches).
- Test coverage improvements
  - Added unit tests for `src/core` setup functions, `src/common/pipes/global-validation.pipe.ts`, and `src/database/base.entity.ts`.
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

All commands pass on the `feat/project-structure` branch.

### Phase 6.2 — Reliability (optional)

- `chore(deps): add phase 3 dependencies`
  - Added `@nestjs/resilience` and `@nestjs/idempotency`.
- `feat(resilience): add resilience module`
  - Registered `ResilienceModule.forRoot()` in `AppModule`.
- `feat(resilience): configure retry and timeout policies`
  - Configured default retry/timeout policies via `src/config/resilience.config.ts` (env-driven).
- `feat(resilience): add circuit breaker and bulkhead`
  - Added circuit breaker and bulkhead defaults (env-driven thresholds).
- `feat(resilience): add fallback handlers`
  - Added a default preset with a fallback handler in `resilience.config.ts`.
- `feat(idempotency): add idempotency module`
  - Registered `IdempotencyModule.forRoot()` in `AppModule`.
- `test(resilience): add reliability tests`
  - Added unit tests for `resilienceConfig` (including env overrides and fallback).