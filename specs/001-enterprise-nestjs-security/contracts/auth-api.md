# API Contract: Authentication

**Feature**: Enterprise Security & Reliability Boilerplate
**Plan**: `specs/001-enterprise-nestjs-security/plan.md`
**Date**: 2026-11-13

## Interface Overview

Exposes authentication interfaces for the enterprise boilerplate:
- Local credentials login (with account lockout)
- Logout / token revocation (Redis JWT blacklist with `kid` rotation)
- Refresh token rotation
- Federated OAuth2 (Google, Microsoft, GitHub, Apple, X), OIDC/SAML SSO, and M2M client flows

## Endpoints

### POST /auth/local/login
- **Method / Path**: `POST /auth/local/login`
- **Auth**: Public (rate-limited, lockout-aware)
- **Request**: `LocalLoginDto` (email, password, idempotency key optional)
- **Response**: `200` access token + refresh token; `401` invalid credentials; `423` locked account

### POST /auth/local/logout
- **Method / Path**: `POST /auth/local/logout`
- **Auth**: Bearer access token
- **Response**: `204` token revoked (blacklist)

### POST /auth/refresh
- **Method / Path**: `POST /auth/refresh`
- **Auth**: Bearer refresh token
- **Response**: new access token; rotation enforced

### POST /auth/oauth2/:provider/callback
- **Method / Path**: `POST /auth/oauth2/:provider/callback`
- **Auth**: Public (OAuth2 callback, state validation)
- **Response**: tokens or error; supports Google, Microsoft, GitHub, Apple, X

### M2M: POST /auth/m2m/token
- **Method / Path**: `POST /auth/m2m/token`
- **Auth**: Client credentials
- **Response**: access token

## Security Requirements

- Bearer JWT (access + refresh) with `kid` rotation and Redis blacklist.
- Rate limiting per user context; uniform security responses.
- Argon2id password hashing; constant-time comparison; lockout.

## Data References

- Entities: User Account, Security Token, Rate Limit Scope — see `data-model.md`.
