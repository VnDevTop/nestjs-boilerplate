# Phase 8 — Authentication & authorization (JWT)

## Branch

`feat/auth`

## Summary

Implemented basic JWT authentication and authorization including email/password
registration and login, Argon2id password hashing, JWT access/refresh tokens,
Passport JWT strategy and guards, role-based access control, permission-based
authorization, admin module foundation, and global guard activation.

Additionally implemented OIDC (OpenID Connect) provider support for 6 providers
(Google, Microsoft, GitHub, Apple, Facebook, X/Twitter) with a provider
abstraction layer, registry for multi-provider support, and setup documentation.

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

### Phase 8.2 — OIDC providers

1. `feat(auth): add oidc provider abstraction`
   - Created `src/modules/auth/oidc/oidc-provider-config.interface.ts` (`OidcProviderConfig`).
   - Created `src/modules/auth/oidc/oidc-provider.interface.ts` (`IOidcProvider`).
   - Created `src/modules/auth/oidc/base-oidc-provider.ts` (`BaseOidcProvider`).
   - Created `src/modules/auth/oidc/oidc-provider-registry.ts` (`OidcProviderRegistry`).
   - Created `src/config/oidc.config.ts` (`oidcConfig`) with env-driven provider registration.
   - Loaded `oidcConfig` in `AppModule`.

2. `feat(auth): implement google oidc provider`
   - Created `src/modules/auth/oidc/google-oidc.provider.ts` (`GoogleOidcProvider`).
   - Endpoints: accounts.google.com, oauth2.googleapis.com, googleapis.com/oauth2/v3/userinfo.

3. `feat(auth): implement microsoft oidc provider`
   - Created `src/modules/auth/oidc/microsoft-oidc.provider.ts` (`MicrosoftOidcProvider`).
   - Endpoints: login.microsoftonline.com, graph.microsoft.com.
   - Multi-tenant support via `/common/` endpoint.

4. `feat(auth): implement github oidc provider`
   - Created `src/modules/auth/oidc/github-oidc.provider.ts` (`GithubOidcProvider`).
   - Endpoints: github.com, api.github.com.
   - Fetches emails from separate endpoint when private.

5. `feat(auth): implement apple oidc provider`
   - Created `src/modules/auth/oidc/apple-oidc.provider.ts` (`AppleOidcProvider`).
   - Endpoints: appleid.apple.com.
   - Decodes ID token for user profile (no userinfo endpoint).

6. `feat(auth): implement facebook oidc provider`
   - Created `src/modules/auth/oidc/facebook-oidc.provider.ts` (`FacebookOidcProvider`).
   - Endpoints: facebook.com, graph.facebook.com.
   - Requires `fields` parameter for profile data.

7. `feat(auth): implement x (twitter) oidc provider`
   - Created `src/modules/auth/oidc/x-oidc.provider.ts` (`XOidcProvider`).
   - Endpoints: twitter.com, api.twitter.com.
   - PKCE support, X API v2 response format.

8. `feat(auth): add provider registration and config`
   - Created `src/modules/auth/oidc/oidc.service.ts` (`OidcService`) — provider registration, callback handling, user find-or-create.
   - Created `src/modules/auth/oidc/oidc.controller.ts` (`OidcController`) — public OIDC endpoints.
   - Registered `OidcController` and `OidcService` in `AuthModule`.

9. `docs(auth): add oidc provider setup guide`
   - Created `docs/OIDC-PROVIDER-SETUP.md` with step-by-step setup for all 6 providers.

### Phase 8.3 — Advanced security

#### Task 2 — `feat(auth): add passcode / magic link login`

1. `feat(users): add one-time login token storage fields`
   - Added `loginTokenHash`, `loginTokenExpiresAt` and `loginTokenConsumed` columns to the `User` entity, with TypeORM migration `1791283200000-add-one-time-login-token-columns.ts`, for hashed one-time token storage (Option B).

2. `feat(auth): add one-time login token service`
   - Added `OneTimeTokenService` generating hashed one-time tokens (magic link / passcode), persisting expiry and enforcing single-use consumption.

3. `feat(auth): add magic link login flow`
   - Added `POST /auth/magic-link/request` and `POST /auth/magic-link/verify` (public, throttled).
   - Magic link is delivered by email via `MailerService`; verify consumes the one-time token and completes login (MFA enforced when TOTP is enabled).

4. `feat(auth): add email passcode login flow`
   - Added `POST /auth/passcode/request` and `POST /auth/passcode/verify` (public, throttled).
   - Passcode is delivered by email and verified as a single-use hashed token.

#### Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

#### Docs deliverable

- `docs/PHASE-8.md` (this file).

---

### Phase 8.3 — E2E tests, OIDC subject lookup & seed data

1. `fix(auth): prefix oidc sub with provider identifier for traceability`
   - Prefixed OIDC `sub` claim with the provider identifier (e.g. `google-oauth2|1234567890`).
   - Keeps subject identifiers traceable across providers.

2. `fix(auth): look up oidc user by sub identifier instead of uuid`
   - OIDC user lookups now use the subject identifier (`sub`) instead of the internal user UUID.

3. `test(auth): add e2e tests for oidc google and github`

4. `test(auth): add mocked oidc callback e2e`

5. `test(users): add subject identifier lookup tests for full coverage`

6. `test(e2e): add health and admin e2e coverage with seed data script`
   - Added `test/health.e2e-spec.ts` (`GET /health`, `GET /health/ready`).
   - Added `test/admin.e2e-spec.ts` (admin auth/RBAC flows: list, get, deactivate, change roles).
   - Added `test/helpers/seed.ts` and `src/scripts/seed-admin.ts` (admin user seed).
   - Added `.github/workflows/test.yml` (pull request → `master`: build → seed → unit/e2e tests).

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
npm run seed
```

## Docs deliverable

- `docs/PHASE-8.md` (this file).