# Phase 0 — Skeleton

## Branch

`chore/skeleton`

## Summary

Established a runnable NestJS project skeleton based on `@nestjs/cli`, TypeScript, and ESM
(`"type": "module"`). Added the standardised source layout used by all later phases.

## Tasks completed

1. `chore(skeleton): initialize nestjs project with nest cli`
   - Base project scaffolded with `@nestjs/cli`; `tsconfig.json`, `tsconfig.build.json`,
     and `nest-cli.json` verified.
2. `chore(skeleton): establish src directory structure (config, core, common, modules, database)`
   - Created `src/config`, `src/core`, `src/database`, `src/modules`, and `src/common` with
     all planned subfolders.
   - Added barrel exports (`index.ts`) for `common` and its subfolders, plus `config`,
     `core`, `database`, and `modules`.
3. `docs(structure): add README.md for common, core, and modules folders`
   - Added `src/common/README.md`, `src/core/README.md`, `src/modules/README.md`.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
```

All commands pass on the `chore/skeleton` branch.