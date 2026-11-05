# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [12.8.2] - 2026-11-05

### Added

- Phase 8.3 e2e coverage: health check endpoints (`GET /health`, `GET /health/ready`), admin controller e2e suites (authentication and role-based access control flows), and users happy-path e2e tests.
- E2E seed helpers and standalone admin seed script (`npm run seed`).

### Changed

- OIDC subject identifiers are now prefixed with the provider identifier (e.g. `google-oauth2|1234567890`) and user lookups use the subject identifier instead of the internal user UUID.

### Fixed

- OIDC user lookup by subject identifier.

### CI

- GitHub Actions test workflow for pull requests targeting `master`, running build, database seed, unit and e2e tests against PostgreSQL and Redis.

## [12.8.1] - 2026-11-04

### Added

- Phase 8 basic JWT authentication and authorization (auth module skeleton, email/password registration and login, Argon2id password hashing, JWT access/refresh tokens, JWT strategy and guards, RBAC, permissions, admin module foundation, global guard activation).
- Phase 8.2 OIDC providers (Google, Microsoft, GitHub, Apple, Facebook, X/Twitter) with provider abstraction, implementations, registration and config, OIDC service and controller, setup documentation.

### Fixed

- OIDC user lookup by subject identifier.

### Tests

- Unit and e2e tests for JWT auth and OIDC flows.

## [12.7.4] - 2026-11-04

### Added

- User unit tests, user e2e tests, OIDC claim mapping documentation, Phase 7 summary.

## [12.7.3] - 2026-11-04

### Added

- Users service, user profile endpoints, role management, data retention and cleanup hooks.

## [12.7.2] - 2026-11-03

### Added

- User entity compliant with OIDC claims, user repository, soft delete and partial unique indexes.

## [12.7.1] - 2026-11-03

### Added

- Security tooling, CI dependency bumps, shared users/auth enums and types, Phase 7 summary.

## [12.6.2] - 2026-11-03

### Added

- Phase 6.2 reliability (optional): resilience module, retry/timeout/circuit breaker/bulkhead/fallback configuration, idempotency module, and reliability tests.

### Changed

- Resilience environment variables are typed with `Duration` and validated accordingly.

## [12.6.1] - 2026-11-03

### Added

- Phase 6.1 cross-cutting core packages: Swagger, class-validator/class-transformer, Zod, typed config, health checks, cache manager, BullMQ queues, mailer, i18n, HTTP (axios), throttling, security headers, CORS, event emitter, and scheduler.
- `.env.example` documenting all supported environment variables.
- Unit tests for configuration, core setup functions, global validation pipe, and base entity.

### Changed

- Configuration namespaces use module option types directly and are exposed via the config barrel.
- CORS and security headers are configured through dedicated setup functions in `src/core`.

## [12.6.0] - 2026-11-01

### Added

- Modular source layout and feature module folders.
- Configuration module with Zod env validation and typed namespaces.
- TypeORM + PostgreSQL configuration via `DATABASE_URL` (with SSL support).
- Docker Compose with PostgreSQL and Redis.
- Conditional Observe module registration.
- Phase 6 summary documentation.

## [12.5.0] - 2026-11-01

### Added

- Project documentation and process files (README, SECURITY, CONTRIBUTING, LICENSE, PLAN).
- Project skill (`.opencode/skills/nestjs-boilerplate/SKILL.md`).

## [12.4.0] - 2026-11-01

### Added

- Updated package metadata and engine requirements.
- Upgraded dependencies (including `@nestjs/*` and vulnerable transitive packages).

### Changed

- `npm audit` reports 0 vulnerabilities.

## [12.3.0] - 2026-11-01

### Added

- CodeQL configuration (`.github/codeql/codeql-config.yml`).
- CodeQL analysis workflow (`.github/workflows/codeql.yml`).

## [12.2.0] - 2026-11-01

### Added

- Verify workflow (lint, typecheck, build).
- Unit and e2e test workflow (PostgreSQL + Redis).
- Test coverage reporting workflow.
- Build artifact workflow (Docker image, no push).
- Dockerfile and `.dockerignore`.

## [12.1.0] - 2026-11-01

### Added

- Husky and commitlint dependencies.
- Conventional commit rules (`commitlint.config.cjs`).
- Husky commit-msg and prepare script.
- AI tool rules for JSDoc and `@ApiProperty` metadata.
- oxlint JSDoc plugin and pre-commit hook.

## [12.0.0] - 2026-11-01

### Added

- NestJS project skeleton.
- Standardised `src` directory structure.
- Folder-level README files.