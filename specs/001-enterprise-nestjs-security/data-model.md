# Data Model: Enterprise Security & Reliability Boilerplate

**Feature**: Enterprise Security & Reliability Boilerplate
**Spec**: `specs/001-enterprise-nestjs-security/spec.md`
**Plan**: `specs/001-enterprise-nestjs-security/plan.md`
**Date**: 2026-11-13

## Entities

### User Account
- **Fields**: `id`, `email`, `passwordHash`, `status`, lockout state (`failedAttempts`,
  `lockedUntil`, `lockReason`), timestamps.
- **Relationships**: One-to-many with Security Tokens; links to federated identity subjects.
- **Validation**: Email format; password policy; lockout thresholds.

### Security Token (JWT)
- **Fields**: `jti`, `sub`, `iss`, `aud`, `iat`, `exp`, `kid`, `revoked`.
- **Relationships**: Belongs to a User Account; references key material via `kid`.
- **Lifecycle**: Access tokens short-lived; refresh tokens rotated; revoked via Redis blacklist.

### Rate Limit Scope
- **Fields**: scope key (user context), tier, window counter/state.
- **Purpose**: Multi-tier rate limiting decisions.

### Encrypted Data (Sensitive Field)
- **Fields**: field name, `encryptedValue`, `iv`, `authTag`, `keyId`.
- **Purpose**: Field-level encryption at rest (AES-256-GCM).

### Retention / Job Entry
- **Fields**: job id, type (retention purge), target, scheduled time, status, completion time.
- **Purpose**: Automated cron retention purge.

## State Transitions

- User Account: `active` → `locked` (on repeated failures) → `active` (after lockout expiry or
  admin action).
- Security Token: `issued` → `expired` | `revoked` via blacklist; `kid` rotation swaps signing key.

## Validation Rules

- Sensitive fields encrypted with AES-256-GCM before persistence.
- Lockout triggers after configured failed-attempt threshold.
- Idempotency keys scoped per operation context.

## Data Lifecycle

- Soft delete applied to domain records; retention purge removes expired data on schedule.

**Output**: data-model.md generated ✅
