# `src/core`

Cross-cutting NestJS modules and providers that wire the application together (configuration,
database, caching, queue, mail, i18n, HTTP, throttling, security headers, etc.).

## Purpose

- Hosts application-wide providers and modules that are not feature-specific.
- Aggregates third-party integrations behind NestJS module boundaries.
- Provides shared infrastructure consumed by feature modules in `src/modules`.

## Status

Skeleton only at this stage. Concrete core modules are introduced in Phase 6+.

## Conventions

- One module per concern; register via `imports` in `AppModule`.
- Keep feature logic out of `core`; `core` only provides infrastructure.
- Update this README whenever a core module is added or changed.