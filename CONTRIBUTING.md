# Contributing Guide

## Branching

- Default branch: `master`.
- Branch naming: `feat/<topic>`, `docs/<topic>`, `chore/<topic>`, `ci/<topic>`, `perf/<topic>`.
- One branch per phase or feature.

## Commits

- Format: `type(scope): description` (Conventional Commits).
- Allowed types: `feat`, `fix`, `chore`, `docs`, `ci`, `test`, `perf`, `refactor`, `style`.
- One task = at least one commit.
- Dependency upgrades: one commit per dependency.

## Pull Requests

- Open a PR from your feature branch to `master`.
- Ensure quality gates pass: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`.
- Request review and merge manually.

## Code standards

- Use official `@nestjs/*` packages when available.
- Include complete JSDoc for new/changed code.
- Use `@ApiProperty`/`@ApiPropertyOptional` with `type`, `example`, `description` for DTO/entity properties.