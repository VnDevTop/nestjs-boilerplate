# OIDC claim mapping

This document describes how standard OpenID Connect (OIDC) claims returned by
identity providers are mapped to the `User` entity fields in the users module.
It is the single source of truth for the claim-to-column contract used during
registration and profile synchronization.

## Source

- OIDC claims interface: `src/common/interfaces/oidc-claims.interface.ts`
- User entity: `src/modules/users/entities/user.entity.ts`
- Users service: `src/modules/users/users.service.ts`

## Claim mapping table

| OIDC claim (`OidcClaims`) | User entity field | Column type | Notes |
|---------------------------|-------------------|-------------|-------|
| `sub` | `sub` | `varchar(255)` | Subject identifier. Unique among active (non-deleted) users. Required. |
| `email` | `email` | `varchar(255)` | Email address. Unique among active users. Required for login flows. |
| `email_verified` | `emailVerified` | `boolean` | Whether the email has been verified by the provider. Defaults to `false`. |
| `name` | `name` | `varchar(255)` (nullable) | Full display name. |
| `given_name` | `givenName` | `varchar(255)` (nullable) | Given (first) name. |
| `family_name` | `familyName` | `varchar(255)` (nullable) | Family (last) name. |
| `picture` | `picture` | `varchar(512)` (nullable) | Profile picture URL. |
| `locale` | `locale` | `varchar(16)` (nullable) | Preferred locale (e.g. `en`, `vi`). |
| `iss` | — | — | Issuer. Not stored; used for provider identification. |
| `aud` | — | — | Audience. Not stored; used for token validation. |
| `exp` | — | — | Expiration time. Not stored; used for token validation. |
| `iat` | — | — | Issued at. Not stored; used for token validation. |

## Fields not derived from OIDC claims

The following `User` fields are managed internally by the application and are
**not** part of the OIDC claim set:

| User field | Source / Default | Notes |
|------------|------------------|-------|
| `id` | Generated (UUID) | Primary key. |
| `roles` | `[Role.USER]` | Granted on first login. Admins can change via `changeRoles`. |
| `status` | `UserStatus.ACTIVE` | Account lifecycle state. |
| `createdAt` | Auto (TypeORM) | Record creation timestamp. |
| `updatedAt` | Auto (TypeORM) | Last update timestamp. |
| `deletedAt` | `null` | Soft-delete marker. Set on deactivation. |

## Mapping rules

1. **Subject (`sub`)** is the canonical identifier. It is stored verbatim from
   the identity provider and is unique among active users (partial unique index
   where `deletedAt IS NULL`).
2. **Email** is stored as-is from the provider. When an email is missing from
   the claims, the user record is still created with whatever fields are
   available; downstream flows may require email verification.
3. **Boolean coercion**: `email_verified` is coerced to a boolean. If absent,
   it defaults to `false`.
4. **Nullable fields**: `name`, `givenName`, `familyName`, `picture`, and
   `locale` are nullable. A missing claim results in `null`.
5. **Roles and status** are never taken from OIDC claims; they are always
   set by the application.
6. **Soft delete reuse**: After soft deletion, the `sub` and `email` values may
   be reused by a new account (partial unique indexes allow this).

## Partial unique indexes

Partial unique indexes on `sub` and `email` are created via migration
`1730592000000-partial-unique-indexes.ts` where `deletedAt IS NULL`. This
allows identifier reuse after soft delete while keeping active users unique.

## Example mapping

Given the following OIDC claims from a provider:

```json
{
  "sub": "google-oauth2|1234567890",
  "email": "jane@example.com",
  "email_verified": true,
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "picture": "https://example.com/avatar.png",
  "locale": "en"
}
```

The resulting `User` entity would be:

```typescript
{
  id: "<generated-uuid>",
  sub: "google-oauth2|1234567890",
  email: "jane@example.com",
  emailVerified: true,
  name: "Jane Doe",
  givenName: "Jane",
  familyName: "Doe",
  picture: "https://example.com/avatar.png",
  locale: "en",
  roles: [Role.USER],
  status: UserStatus.ACTIVE,
  createdAt: <auto>,
  updatedAt: <auto>,
  deletedAt: null,
}
```