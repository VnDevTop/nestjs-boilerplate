# Phase 7 — User module (OIDC-compliant data)

## Branch

`feat/users`

## Summary

Added shared enums and types for users and authentication, plus module-specific
enum folders. Data model, service, and API work will follow in subsequent
sub-phases.

## Tasks completed

### Phase 7.0 — Shared enums & types

1. `feat(users): add shared enums for users and auth`
   - Created `src/common/enums/role.enum.ts` (`Role`).
   - Created `src/common/enums/user-status.enum.ts` (`UserStatus`).
   - Created `src/common/enums/token-type.enum.ts` (`TokenType`).
   - Created `src/common/enums/auth-method.enum.ts` (`AuthMethod`).
   - Created `src/common/enums/oidc-provider.enum.ts` (`OidcProvider`).
   - Added `src/modules/{users,auth}/enums` folders.
2. `feat(users): add shared types and interfaces for users and auth`
   - Created `src/common/interfaces/jwt-payload.interface.ts`.
   - Created `src/common/interfaces/request-user.interface.ts`.
   - Created `src/common/interfaces/oidc-claims.interface.ts`.
   - Created `src/common/interfaces/auth-result.interface.ts`.
   - Created `src/common/interfaces/token-pair.interface.ts`.
3. `chore(types): add barrel exports for shared enums and types`
   - Updated `src/common/enums/index.ts` and `src/common/interfaces/index.ts`.
   - `src/common/index.ts` already re-exports both.
4. `docs(types): document shared enum and type usage`
   - Added `docs/SHARED-TYPES.md`.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```