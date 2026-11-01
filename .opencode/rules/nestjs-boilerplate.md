# AI assistant rules — NestJS boilerplate

## Documentation (JSDoc)

- Every created or modified file, class, method, and function **must** include complete JSDoc:
  - Description of purpose.
  - `@param` for every parameter (name, type, meaning).
  - `@returns` for return values.
  - `@throws` where applicable.
  - `@example` where useful.
- Do **not** modify or remove existing JSDoc unless strictly necessary (for example, a
  signature change). Preserve documentation to keep community maintainability.
- JSDoc quality is enforced via oxlint rules, AI skill rules, and code review.

## API metadata (`@ApiProperty`)

- Every DTO or entity property exposed in the API **must** use `@ApiProperty` /
  `@ApiPropertyOptional` with at least:
  - `type`
  - `example`
  - `description`
- This is required for SDK generation and accurate OpenAPI documentation.

## General

- Prefer official `@nestjs/*` packages.
- Keep changes consistent with the surrounding code style and structure.
- Run quality gates (`npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`) before committing.