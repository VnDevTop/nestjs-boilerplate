# Phase 4 — Metadata & dependency upgrades

## Branch

`chore/package-metadata`

## Summary

Updated package metadata and engine requirements, and upgraded all compatible dependencies
(including all `@nestjs/*` packages and vulnerable transitive dependencies).

## Tasks completed

1. `chore(package): update metadata and engine requirements`
   - Updated name, description, author, repository, bugs, homepage, keywords, license, engines.

2. Dependency upgrades (one commit per dependency):
   - `@nestjs/observe` → `0.3.21`
   - `@types/node` → `26.6.6`
   - `vitest` → `5.0.5`
   - `@vitest/coverage-v8` → `5.0.5`
   - `typescript` → `6.0.3` (latest compatible; 7.x not supported by Nest CLI yet)
   - `@nestjs/common` → `12.3.2`
   - `@nestjs/core` → `12.3.2`
   - `@nestjs/platform-express` → `12.3.2`
   - `@nestjs/testing` → `12.3.2`
   - `@nestjs/cli` → `12.0.11`
   - `@nestjs/schematics` → `12.0.12`
   - `@nestjs/mau` → `0.2.9`
   - `tmp` → `0.2.7`
   - `undici` → `8.12.3`
   - `minimatch` → `11.0.3`

## Validation

```bash
npm outdated
npm run lint
npm run build
npm test
npm audit
```

All commands pass on the `chore/package-metadata` branch (only `typescript@7.x` remains
incompatible with the Nest CLI).