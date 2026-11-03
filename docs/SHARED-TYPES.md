# Shared enums & types

This document describes the shared enums and interfaces introduced for the
user and authentication modules. They live under `src/common/enums` and
`src/common/interfaces` and are re-exported from `src/common`.

## Enums

### `Role` (`src/common/enums/role.enum.ts`)

- Values: `ADMIN`, `MANAGER`, `USER`.
- Use for role-based access control (RBAC) guards/decorators and user roles.

### `UserStatus` (`src/common/enums/user-status.enum.ts`)

- Values: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED`.
- Use to track account lifecycle and gate authentication.

### `TokenType` (`src/common/enums/token-type.enum.ts`)

- Values: `ACCESS`, `REFRESH`, `ID`, `API_KEY`.
- Use when issuing/validating tokens and differentiating token kinds.

### `AuthMethod` (`src/common/enums/auth-method.enum.ts`)

- Values: `PASSWORD`, `OIDC`, `MFA`, `MAGIC_LINK`, `API_KEY`.
- Use to record how a user authenticated.

### `OidcProvider` (`src/common/enums/oidc-provider.enum.ts`)

- Values: `GOOGLE`, `MICROSOFT`, `GITHUB`, `APPLE`, `FACEBOOK`, `X`.
- Use to identify the configured OIDC provider.

## Interfaces

### `JwtPayload` (`src/common/interfaces/jwt-payload.interface.ts`)

- Claims stored in a JWT (`sub`, `email`, `roles`, `iat`, `exp`, `jti`, `type`).
- Use in JWT strategy and token verification.

### `RequestUser` (`src/common/interfaces/request-user.interface.ts`)

- Authenticated user attached to a request (`sub`, `email`, `roles`, `emailVerified`, `name`).
- Use in guards, decorators, and controllers.

### `OidcClaims` (`src/common/interfaces/oidc-claims.interface.ts`)

- Standard OIDC claims returned by providers (`sub`, `email`, `name`, etc.).
- Use when mapping provider profiles to user entities.

### `TokenPair` (`src/common/interfaces/token-pair.interface.ts`)

- Access/refresh token pair returned after authentication.
- Use in auth responses and token services.

### `AuthResult` (`src/common/interfaces/auth-result.interface.ts`)

- Combines an authenticated `RequestUser` with a `TokenPair`.
- Use as the return type of login/registration flows.