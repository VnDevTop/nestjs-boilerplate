# NestJS Boilerplate — Project Skill

## Purpose

This skill guides contributors and AI assistants working on the NestJS boilerplate repository.

## Conventions

- Follow Conventional Commits (`type(scope): description`).
- One task = at least one commit.
- Run quality gates before committing: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`.
- ESM project: relative imports must include `.js` extension.
- Every created/modified file, class, and function must include complete JSDoc.
- Every DTO/entity property exposed in the API must use `@ApiProperty`/`@ApiPropertyOptional`
  with `type`, `example`, and `description`.

## Structure

- `src/common` — shared primitives and utilities.
- `src/core` — cross-cutting infrastructure modules.
- `src/database` — TypeORM setup and base entity.
- `src/modules` — feature modules.
- `src/config` — configuration and env validation.

## Documentation

- Folder-level `README.md` files describe each area.
- Phase summaries live in `docs/PHASE-*.md`.