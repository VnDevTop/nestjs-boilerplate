# Phase 1 — Code quality

## Branch

`chore/code-quality`

## Summary

Added code-quality tooling: Husky git hooks and commitlint with conventional commits.
Configured oxlint with the jsdoc plugin and AI assistant rules requiring complete JSDoc
and `@ApiProperty` metadata.

## Tasks completed

1. `chore(deps): add husky and commitlint dependencies`
   - Added `husky`, `@commitlint/cli`, `@commitlint/config-conventional`.
2. `chore(commitlint): configure conventional commit rules`
   - Added `commitlint.config.cjs` with allowed types, required scope, lowercase subject.
3. `chore(husky): add commit-msg hook and prepare script`
   - Added `.husky/commit-msg` and `"prepare": "husky"` script.
4. `docs(ai): add ai tool rules requiring full jsdoc and apiproperty metadata`
   - Added `.opencode/rules/nestjs-boilerplate.md`.
5. `chore(jsdoc): enforce jsdoc via oxlint and husky pre-commit`
   - Enabled oxlint jsdoc plugin; added `.husky/pre-commit` running `npm run lint`.

## Validation

```bash
npx commitlint --from HEAD~1 --to HEAD --verbose
npm run lint
```

All commands pass on the `chore/code-quality` branch.