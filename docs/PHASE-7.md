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

### Phase 7.1 — Data model

1. `feat(users): add user entity compliant with oidc claims`
2. `feat(users): add user repository`

### Phase 7.2 — Service & API

3. `feat(users): add users service`
4. `feat(users): add user profile endpoints`
5. `feat(users): add role management`
6. `feat(users): add data retention and cleanup hooks`

### Phase 7.3 — Tests & docs

7. `test(users): add user unit tests`
8. `test(users): add user e2e tests`
9. `docs(users): document oidc claim mapping`
   - Added `docs/OIDC-CLAIM-MAPPING.md`.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```