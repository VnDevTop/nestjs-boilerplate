# Phase 8 — Authentication & authorization (JWT)

## Branch

`feat/auth`

## Summary

Implemented basic JWT authentication and authorization including email/password
registration and login, Argon2id password hashing, JWT access/refresh tokens,
Passport JWT strategy and guards, role-based access control, permission-based
authorization, admin module foundation, and global guard activation.

## Tasks completed

### Phase 8.1 — Basic JWT auth

1. `feat(auth): add auth module skeleton`
   - Created `src/modules/auth/auth.module.ts` with `UsersModule`, `PassportModule`, `JwtModule`.
   - Created `src/modules/auth/auth.service.ts` with stubs for `validateUser`, `register`, `login`.
   - Created `src/modules/auth/auth.controller.ts` with `POST /auth/register` and `POST /auth/login`.
   - Registered `AuthModule` in `AppModule`.
   - Installed `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`.

2. `feat(auth): add email/password registration and login`
   - Implemented `register()` — checks duplicate email, hashes password, creates user, issues tokens.
   - Implemented `login()` — validates credentials, issues tokens.
   - Added `passwordHash` column to `User` entity (`select: false`).
   - Added `findByEmailWithPassword()` to `UserRepository`.
   - Installed `@types/bcrypt`.

3. `feat(auth): add password hashing (argon2/bcrypt)`
   - Created `src/modules/auth/password.service.ts` with `hash()`, `verify()`, `needsRehash()`.
   - Uses Argon2id (memoryCost: 64MB, timeCost: 3, parallelism: 4).
   - Refactored `AuthService` to use `PasswordService`.
   - Removed `bcrypt` and `@types/bcrypt` in favor of `argon2`.

4. `feat(auth): add jwt access and refresh tokens`
   - Created `src/config/jwt.config.ts` with secret, refreshSecret, expiresIn, refreshExpiresIn.
   - Added JWT env vars to `env.validation.ts` and `env.d.ts`.
   - Loaded `jwtConfig` in `AppModule`.
   - Switched `AuthModule` to `JwtModule.registerAsync(jwtConfig.asProvider())`.
   - Enhanced `issueTokens()` with `expiresIn` and `tokenType`.
   - Added `refreshTokens()` method and `POST /auth/refresh` endpoint.

5. `feat(auth): add jwt strategy and guards`
   - Created `src/modules/auth/strategies/jwt.strategy.ts` (`JwtStrategy`).
   - Created `src/modules/auth/guards/jwt-auth.guard.ts` (`JwtAuthGuard`).
   - Strategy validates JWT, rejects refresh tokens for auth, looks up user.
   - Installed `@types/passport-jwt`.

6. `feat(auth): add role-based access control`
   - Created `src/common/decorators/current-user.decorator.ts` (`@CurrentUser()`).
   - Created `src/modules/auth/guards/auth.guard.ts` (combined JWT + RBAC guard).
   - Registered `RolesGuard` and `AuthGuard` in `AuthModule`.
   - Exported `RolesGuard`, `AuthGuard` from `AuthModule`.

7. `feat(auth): add permission-based authorization`
   - Created `src/common/enums/permission.enum.ts` (`Permission` enum).
   - Created `src/common/constants/permissions.constant.ts` (`ROLE_PERMISSIONS`, `resolvePermissions`).
   - Created `src/common/decorators/permissions.decorator.ts` (`@Permissions()`).
   - Created `src/common/guards/permissions.guard.ts` (`PermissionsGuard`).
   - Registered `PermissionsGuard` in `AuthModule`.

8. `feat(auth): add admin module foundation`
   - Created `src/modules/admin/admin.module.ts`, `admin.service.ts`, `admin.controller.ts`.
   - Admin endpoints: list users, get user, deactivate user, change roles.
   - All admin routes protected by `AuthGuard` + `@Roles(Role.ADMIN)`.

9. `feat(auth): activate guards globally`
   - Created `src/common/decorators/public.decorator.ts` (`@Public()`).
   - Created `src/modules/auth/guards/global-auth.guard.ts` (`GlobalAuthGuard`).
   - Registered `GlobalAuthGuard` as `APP_GUARD` in `AuthModule`.
   - Marked public routes: auth endpoints, health checks, root endpoint.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

## Docs deliverable

- `docs/PHASE-8.md` (this file).