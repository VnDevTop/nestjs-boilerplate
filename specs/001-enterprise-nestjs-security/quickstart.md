# Quickstart: Enterprise Security & Reliability Boilerplate

**Feature**: Enterprise Security & Reliability Boilerplate
**Spec**: `specs/001-enterprise-nestjs-security/spec.md`
**Plan**: `specs/001-enterprise-nestjs-security/plan.md`
**Date**: 2026-11-13

## Purpose

Runnable validation scenarios that prove the enterprise security boilerplate works end-to-end.

## Prerequisites

- Node.js 20+, npm
- `DATABASE_URL` configured (production) or local fallback (development)
- Redis for distributed cache/queues (production) or in-memory fallback (development)

## Setup Commands

```bash
npm install
cp .env.example .env   # or set required environment variables
npm run start:dev
```

## Validation Scenarios

### S1: Health Check
- **Action**: `GET /health`
- **Expected**: `200` with service operational status.

### S2: Native Security Headers
- **Action**: `GET /health` (or any endpoint)
- **Expected**: Response includes hardened headers (e.g., nosniff, frame protection, CSP).

### S3: Authentication & Lockout
- **Action**: `POST /auth/local/login` with valid/invalid credentials.
- **Expected**: Valid → token issued; invalid → `401`; repeated failures → lockout (`423`).

### S4: Rate Limiting
- **Action**: Repeated requests within a user context.
- **Expected**: Within tier limit → allowed; beyond tier limit → `429`.

### S5: Idempotency
- **Action**: Write operation with `Idempotency-Key`.
- **Expected**: Retries with same key produce consistent outcomes.

### S6: Encryption and Persistence
- **Action**: Persist sensitive field.
- **Expected**: Stored value encrypted with AES-256-GCM (round-trip verifiable).

### S7: Local Dev Fallbacks
- **Action**: Run cache/queue operations without Redis.
- **Expected**: In-memory fallback engaged transparently.

### S8: Metrics / Observability
- **Action**: `GET /metrics`.
- **Expected**: Prometheus metrics exposed.

## Run and Test Commands

```bash
npm run start:dev
npm run build
npm run test          # unit
npm run test:e2e      # Supertest E2E
npm run test:cov      # coverage
```

## Expected Outcomes

- All validation scenarios pass in local and CI environments (`ubuntu-latest`).
- Security controls do not break primary flows (login, writes, reads).

## References

- Interface contracts: `contracts/auth-api.md`, `contracts/health-api.md`
- Data model: `data-model.md`
