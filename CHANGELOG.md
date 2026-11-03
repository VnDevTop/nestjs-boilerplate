# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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