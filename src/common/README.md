# `src/common`

Shared, cross-cutting building blocks used across the whole application. Everything here is
generic and has no dependency on a specific feature module.

## Structure

```
common
├── constants     metadata keys, header names, app wide limits
├── decorators    @Public, @CurrentUser, @Roles, @ManagerOnly, @Permissions, @DeviceName
├── enums         Role
├── exceptions    domain exceptions
├── filters       AllExceptionsFilter, HttpExceptionFilter
├── guards        JwtAuthGuard, RolesGuard, ManagerGuard, PermissionsGuard
├── interceptors  ResponseTransformInterceptor
├── interfaces    ApiResponse, JwtPayload, RequestUser
├── middlewares   RequestIdMiddleware
├── pagination    the cursor and the two shapes a paged response has
├── query         the query layer: a spec, a criteria, and the SQL they produce
├── search        the search language: a tokenizer, a parser and a tree
├── tenancy       the tenant context, the scoped repository and the database scope
├── pipes         global validation pipe
└── utils         password, encryption, recovery codes, user agent, request id
```

## Conventions

- Each subfolder exposes a barrel `index.ts`; import via the subfolder barrel or `src/common/index.ts`.
- Because the project is ESM (`"type": "module"`), relative imports must include the `.js` extension.
- Keep modules here framework-agnostic where possible; NestJS-specific wiring belongs in `src/core` or feature modules.
- Every public class/function/type added here must include complete JSDoc.
- Update this README whenever a subfolder is added, removed, or repurposed.