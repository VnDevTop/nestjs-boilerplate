# Project Structure

## Source layout

```
src
├── common        shared primitives and utilities
├── config        configuration and env validation
├── core          cross-cutting infrastructure modules
├── database      TypeORM setup and base entity
└── modules       feature modules
```

## Conventions

- `src/common` is generic and has no dependency on a specific feature module.
- `src/core` hosts application-wide providers and infrastructure.
- `src/modules` contains self-contained feature modules.
- Relative imports must include the `.js` extension (ESM).
- Every DTO/entity property exposed in the API must use `@ApiProperty`/`@ApiPropertyOptional`
  with `type`, `example`, and `description`.