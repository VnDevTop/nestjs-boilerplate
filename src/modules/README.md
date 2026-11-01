# `src/modules`

Feature modules of the application. Each module is self-contained: entity, repository, service,
controller, DTOs, and module definition live together under its own folder.

## Planned modules (Phase 6+)

- `auth` — authentication and authorization
- `users` — user management and OIDC-compliant profile
- `health` — health/readiness checks
- `mail` — mailer integration
- `cache` — cache-backed services
- `queue` — background jobs
- `i18n` — internationalization
- `http` — HTTP client integration
- `compliance` — GDPR/compliance features

## Conventions

- Each module exports a single `*Module` class registered in `AppModule`.
- Modules depend on `src/core` for infrastructure and `src/common` for shared primitives.
- Keep module-internal helpers private; expose only services/controllers intended for reuse.
- Update this README whenever a module is added, removed, or repurposed.