# Plan: Phase 8.3 — Task 1 — Two-Factor Authentication (TOTP)

> **Parent plan:** `/Users/vn.chemgio/.opencode/plan/nestjs-boilerplate-plan.md`
> **Phase:** 8 — Authentication & authorization (JWT) → Phase 8.3 — Advanced security
> **Task:** `feat(auth): add two-factor authentication (totp)`
> **Branch:** `feat/auth-security`
> **Status:** Planned (draft — implementation pending Coding agent switch)

---

## 1. Objective

Add TOTP-based two-factor authentication (2FA) on top of the existing JWT
email/password login flow, following the task description:

> Implement TOTP setup/verify; QR code generation; recovery codes.

Existing base (from Phase 8.1/8.2, already Done):

- `AuthService.login()` validates credentials and immediately issues access +
  refresh tokens (returns `AuthResult` with `user` + `tokens`).
- `JwtPayload` (`src/common/interfaces/jwt-payload.interface.ts`) has no MFA claim.
- `User` entity has no TOTP/MFA columns.
- `UserRepository.findByEmailWithPassword()` uses query builder with
  `addSelect('user.passwordHash')`.
- `AuthMethod` enum already declares `MFA` (plus `MAGIC_LINK`, `API_KEY`) but unused.

---

## 2. Sub-tasks (one task = one commit, Conventional Commits)

### Task 1.1 — `chore(deps): add speakeasy and qrcode dependencies`

- Install TOTP library: `@otplib/totp`
- Install QR code generation: `qrcode` (+ `@types/qrcode`).
- One commit per dependency per plan convention:
  - `chore(deps): add @otplib/totp for totp secret generation and verification`
  - `chore(deps): add qrcode for otpauth provisioning uri qr code generation`

### Task 1.2 — `feat(users): add totp fields to user entity`

- Extend `src/modules/users/entities/user.entity.ts`:
  - `totpSecret?: string | null` — `@Column({ type: 'varchar', length: 255, nullable: true, select: false })`
  - `totpEnabled?: boolean` — `@Column({ type: 'boolean', default: false })`
  - `backupCodes?: string[] | null` — stored hashed (or json) for recovery.
- Add TypeORM migration for the new `users` columns
  (follow existing migration style, e.g. timestamp-prefixed class name).
- Add/adjust unit tests for the entity if present.

### Task 1.3 — `feat(auth): add totp service`

- Create TOTP service (location follows existing `src/modules/auth/password.service.ts` pattern).
- Methods:
  - `generateSecret(userId/email)` → `{ secret, otpauthUrl, qrCode }`.
  - `verifyTotp(secret, code)` → boolean.
  - `generateBackupCodes(secret)` → hashed one-time recovery codes.

### Task 1.4 — `feat(auth): add mfa endpoints`

- Add endpoints on `AuthController` (`@Controller('auth')`):
  - `POST /auth/mfa/setup` — generate TOTP secret + QR, return provisioning URI.
  - `POST /auth/mfa/verify` — body `{ code }` → verify, persist enabled state.
  - `POST /auth/mfa/disable` — body `{ code/password }` → disable MFA.

### Task 1.5 — `feat(auth): add mfa step to login flow and jwt claims`

- Rework login result for MFA-enabled users:
  - After successful password validation, if `totpEnabled === true` → return
    pending-MFA response (e.g. `AuthResult.mfaRequired: true` + `mfaToken`/`totpToken`)
    instead of issuing tokens.
- Extend `JwtPayload` with MFA claim (e.g. `mfaVerified?: boolean` / `authMethod?: AuthMethod`).
- Issue refresh token only after MFA verification succeeds (MFA-verified access token).

### Task 1.6 — `test(auth): add totp unit tests`

- Unit tests for TOTP service (setup/verify/backup codes).
- Unit tests for login MFA branch and MFA endpoints at service level.
- Existing tests must keep passing (default `totpEnabled: false` for new users).

---

## 3. Key design decisions / conflict resolution points (from analysis)

1. **Login flow shape change is unavoidable** — TOTP requires a two-step flow
   (password → TOTP) before token issuance. Extend `AuthResult` and
   `JwtPayload` instead of creating parallel flows where feasible.
2. **Repository select handling** — `totpSecret` should use `select: false` and
   be added via `addSelect` in auth-specific lookups (mirror
   `findByEmailWithPassword`).
3. **MFA state source** — user entity columns (`totpEnabled`, `totpSecret`);
   enable/disable persisted through `UsersService.updateProfile` or a new
   MFA-specific update method.
4. **Token issuance** — MFA-verified JWT should carry MFA claim; refresh tokens
   only for fully authenticated (password + TOTP) users.

---

## 4. Quality gates (after each sub-task)

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

---

## 5. Docs deliverable

- Update `docs/PHASE-8.md` — add Task 1 entry under Phase 8.3.

---

*End of Task 1 plan.*
