# Implementation Plan: Enterprise Security & Reliability Boilerplate

**Branch**: `001-enterprise-nestjs-security` | **Date**: 2026-11-13 | **Spec**: `specs/001-enterprise-nestjs-security/spec.md`

## Summary

Build a production-ready, highly secure NestJS 12 enterprise boilerplate. The plan delivers,
in strict phased order, secure-by-default foundation capabilities: modular architecture with
API versioning, native security headers, data persistence with soft delete and AES-256-GCM field
level encryption, distributed caching/queues with in-memory dev fallbacks, advanced security and
anti-scanning defenses, multi-method authentication, a mandatory testing suite, and DevSecOps/CVE
prevention delivery pipelines.

## Technical Context

- **Language/Version**: TypeScript 5.x with NestJS 12
- **Primary Dependencies**: @nestjs/config, @nestjs/common, @nestjs/core, @nestjs/platform-express,
  @nestjs/typeorm, @keyv/redis, bullmq, argon2, @nestjs/passport, `@nestjs/jwt` (JWT),
  Joi env validation, class-validator/class-transformer,
  @nestjs/i18n, handlebars, OpenTelemetry
- **Storage**: Database via `DATABASE_URL` (TypeORM) with soft delete; Redis for distributed
  cache and job broker; in-memory fallbacks for local development
- **Testing**: Vitest unit tests (`*.spec.ts`) with mocked external dependencies (DB, Redis, Mail);
  strict coverage thresholds; Supertest E2E tests (`*.e2e-spec.ts`) for HTTP endpoints, DTO
  validation pipes, and guards
- **Target Platform**: Linux server / Docker on ubuntu-latest runner
- **Project Type**: web-service / backend
- **Performance Goals**: Secure-by-default baseline with minimal performance overhead from
  security controls
- **Constraints**: Native `useSecurityHeaders` (no external helmet); local dev in-memory fallbacks;
  HIPAA §164.312 / ISO 27001 / OWASP ASVS alignment
- **Scale/Scope**: Enterprise boilerplate serving multiple internal services

## Constitution Check

**Gate**: Must pass before Phase 0 research; re-check after Phase 1 design.

- I. Enterprise Security & Compliance: Aligned — security requirements from spec map directly to
  constitution principles.
- II. Target Framework & Version: Aligned — NestJS 12 native capabilities required.
- III. Code Documentation & Explainability: Pending implementation.
- IV. Strict Validation & Transformation: Aligned — global whitelist validation planned.
- V. Type-Safe Environment Management: Aligned — env.d.ts/Joi/`registerAs` planned.
- VI. Distributed Infrastructure & Local Development Fallbacks: Aligned — memory fallbacks planned.
- VII. Uncompromising Testing Standard: Aligned — unit/coverage/E2E mandatory per task.
- VIII. Strict Git, Commit & Phased Workflow: Aligned — Conventional Commits + phase gating.
- IX. Dependency & Infrastructure Hardening: Aligned — Dependabot/CodeQL/ubuntu-latest planned.
- X. Living Plan Compliance & Deep Atomic Granularity: In progress (this plan).
- XI. Continuous Package & Version Lifecycle: Pending implementation.

**Gate status**: PASS for design phase (violations none; complexity justified).

## Implementation Phases and Atomic Task Breakdown

The breakdown uses a strict 5-level hierarchy: **Phase ➔ Step ➔ Sub-step ➔ Task ➔ Atomic Work Unit**.

### Phase I: Foundation, Scaffolding & Security Tooling (Steps 1–3)

#### Step 1: Project Scaffolding, Governance & Code Quality Setup

##### Sub-step 1.1: Repository and toolchain bootstrap

###### Task T101: Initialize NestJS 12 project structure and TypeScript configuration

- **Atomic Work Units**:
  - T101-A1: Scaffold base NestJS artifacts (package.json, tsconfig, nest-cli, src/main.ts).
  - T101-A2: Configure Vitest, lint, format, and test scripts.
- **Branch**: `chore/project-scaffolding`
- **Commit**: `chore(core): initialize nestjs 12 scaffolding and git quality gates`
- **Testing**: Unit — configuration module unit tests; Coverage — baseline thresholds; E2E — smoke test.

##### Sub-step 1.2: Governance and code quality tooling

###### Task T102: Add oxlint, Prettier, commitlint, and Git hooks

- **Atomic Work Units**:
  - T102-A1: Install and configure oxlint + Prettier.
  - T102-A2: Install and configure commitlint + husky.
- **Branch**: `chore/project-scaffolding`
- **Commit**: `chore(code-quality): add oxlint prettier commitlint husky`
- **Testing**: Unit — lint/hook unit tests where applicable; E2E — commit hook integration.

#### Step 2: Automated CI/CD & Vulnerability Scanning Workflows (ubuntu-latest, Dependabot, CodeQL)

##### Sub-step 2.1: Security-first CI pipeline

###### Task T103: Create GitHub Actions CI workflow on ubuntu-latest with Dependabot and CodeQL, followed by test/coverage, Docker build, and deployment stages in strict sequence

- **Atomic Work Units**:
  - T103-A1: Add Dependabot configuration.
  - T103-A2: Add CodeQL workflow.
  - T103-A3: Add test & coverage stage.
  - T103-A4: Add multi-stage Docker build stage.
  - T103-A5: Add deployment stage.
- **Branch**: `ci/github-sec-workflows`
- **Commit**: `ci(sec): configure dependabot, codeql and github actions on ubuntu-latest`
- **Testing**: YAML lint/validation; E2E — pipeline stage validation where feasible.

##### Sub-step 2.2: Multi-stage Docker build

###### Task T104: Add multi-stage Dockerfile based on latest OS base image

- **Atomic Work Units**:
  - T104-A1: Builder stage.
  - T104-A2: Production stage.
- **Branch**: `ci/github-sec-workflows`
- **Commit**: `ci(sec): configure dependabot, codeql and github actions on ubuntu-latest`
- **Testing**: E2E — Docker build validation.

#### Step 3: Native Security Headers (useSecurityHeaders), Validation & Core Configuration

##### Sub-step 3.1: Security headers implementation

###### Task T105: Implement native security headers via useSecurityHeaders

- **Atomic Work Units**:
  - T105-A1: Create security headers configuration/middleware.
  - T105-A2: Register globally in application bootstrap.
- **Branch**: `feat/core-config-validation`
- **Commit**: `feat(config): integrate native security headers, typed env and validation pipe`
- **Testing**: Unit — security headers unit tests; E2E — Supertest header assertions.

##### Sub-step 3.2: Validation and core configuration

###### Task T106: Add global ValidationPipe and type-safe environment/core configuration

- **Atomic Work Units**:
  - T106-A1: ValidationPipe with whitelist, forbidNonWhitelisted, transform.
  - T106-A2: env.d.ts, Joi schemas, registerAs providers.
- **Branch**: `feat/core-config-validation`
- **Commit**: `feat(config): integrate native security headers, typed env and validation pipe`
- **Testing**: Unit — DTO validation unit tests; E2E — Supertest DTO validation tests.

### Phase II: Data Layer, Resilience & Local Dev Fallbacks (Steps 4–5)

#### Step 4: Data Persistence, Soft Delete & Field-Level Encryption (AES-256-GCM)

##### Sub-step 4.1: Data layer with soft delete

###### Task T107: Integrate `DATABASE_URL` with TypeORM and add soft delete base entity

- **Atomic Work Units**:
  - T107-A1: Database connection via `DATABASE_URL`.
  - T107-A2: Soft delete base entity/field.
- **Branch**: `feat/database-typeorm-encryption`
- **Commit**: `feat(database): setup typeorm postgres with soft delete and aes-256-gcm`
- **Testing**: Unit — soft delete unit tests; E2E — persistence E2E tests.

##### Sub-step 4.2: Field-level encryption

###### Task T108: Add field-level encryption at rest with AES-256-GCM

- **Atomic Work Units**:
  - T108-A1: Encryption service using AES-256-GCM.
  - T108-A2: Wire encryption into persistence layer.
- **Branch**: `feat/database-typeorm-encryption`
- **Commit**: `feat(database): setup typeorm postgres with soft delete and aes-256-gcm`
- **Testing**: Unit — crypto unit tests; E2E — encryption E2E tests.

#### Step 5: Distributed Caching, Queues & Local Dev Fallbacks (Redis + Memory Fallback)

##### Sub-step 5.1: Distributed cache fallback

###### Task T109: Add @keyv/redis distributed cache with in-memory fallback

- **Atomic Work Units**:
  - T109-A1: Keyv + Redis store.
  - T109-A2: In-memory store fallback.
- **Branch**: `feat/cache-queue-fallbacks`
- **Commit**: `feat(infrastructure): setup redis keyv, bullmq and local memory fallbacks`
- **Testing**: Unit — fallback unit tests; E2E — cache fallback E2E tests.

##### Sub-step 5.2: BullMQ fallback

###### Task T110: Add BullMQ distributed queue with in-memory fallback

- **Atomic Work Units**:
  - T110-A1: BullMQ queue setup.
  - T110-A2: In-memory queue fallback.
- **Branch**: `feat/cache-queue-fallbacks`
- **Commit**: `feat(infrastructure): setup redis keyv, bullmq and local memory fallbacks`
- **Testing**: Unit — fallback unit tests; E2E — queue fallback E2E tests.

### Phase III: User Management, Auth & Anti-Scanning Defense (Steps 6–8)

#### Step 6: User Module & Anti-Scanning Defense Architecture (Argon2id, Timing Attack Mitigation, Idempotency)

##### Sub-step 6.1: User module and Argon2id hashing

###### Task T111: Create user module with Argon2id password hashing

- **Atomic Work Units**:
  - T111-A1: User entity/module structure.
  - T111-A2: Argon2id hashing service.
- **Branch**: `feat/user-anti-scanning`
- **Commit**: `feat(user): implement argon2id hashing and timing attack defense`
- **Testing**: Unit — hash/verify unit tests; E2E — auth E2E tests.

##### Sub-step 6.2: Timing attack mitigation

###### Task T112: Add constant-time comparison timing-attack mitigation

- **Atomic Work Units**:
  - T112-A1: Constant-time compare utility.
- **Branch**: `feat/user-anti-scanning`
- **Commit**: `feat(user): implement argon2id hashing and timing attack defense`
- **Testing**: Unit — timing-safe compare unit tests.

##### Sub-step 6.3: Idempotency

###### Task T113: Add idempotency key middleware

- **Atomic Work Units**:
  - T113-A1: Idempotency key store/middleware.
- **Branch**: `feat/user-anti-scanning`
- **Commit**: `feat(user): implement argon2id hashing and timing attack defense`
- **Testing**: Unit — idempotency unit tests; E2E — idempotent write E2E tests.

#### Step 7: Basic Authentication & Session Management (Local Strategy, JWT Access/Refresh)

##### Sub-step 7.1: Local credentials strategy

###### Task T114: Add local credentials authentication strategy

- **Atomic Work Units**:
  - T114-A1: Passport local strategy.
  - T114-A2: Credentials validation.
- **Branch**: `feat/auth-jwt-basic`
- **Commit**: `feat(auth): implement local strategy, jwt access and refresh tokens`
- **Testing**: Unit — strategy unit tests; E2E — login E2E tests.

##### Sub-step 7.2: JWT access token

###### Task T115: Add JWT access token issuing and verification

- **Atomic Work Units**:
  - T115-A1: JWT signing/verification service.
  - T115-A2: Access token issuance in login flow.
- **Branch**: `feat/auth-jwt-basic`
- **Commit**: `feat(auth): implement local strategy, jwt access and refresh tokens`
- **Testing**: Unit — token service unit tests; E2E — login token E2E tests.

##### Sub-step 7.3: Refresh token rotation and session management

###### Task T116: Add JWT refresh token rotation and session management

- **Atomic Work Units**:
  - T116-A1: Refresh token issuance/rotation.
  - T116-A2: Token/session store integration.
- **Branch**: `feat/auth-jwt-basic`
- **Commit**: `feat(auth): implement local strategy, jwt access and refresh tokens`
- **Testing**: Unit — rotation unit tests; E2E — refresh E2E tests.

#### Step 8: Advanced Auth: Key Rotation (kid), Blacklist & Federated OAuth2 (OIDC/SAML, M2M)

##### Sub-step 8.1: Blacklist and key rotation

###### Task T117: Add Redis JWT token blacklist with key rotation (`kid`)

- **Atomic Work Units**:
  - T117-A1: Redis-backed token blacklist store.
  - T117-A2: `kid`-based key rotation support.
- **Branch**: `feat/auth-key-rotation-oauth2`
- **Commit**: `feat(auth): add jwt key rotation with kid, token blacklist and oauth2`
- **Testing**: Unit — blacklist unit tests; E2E — logout/blacklist E2E tests.

##### Sub-step 8.2: Federated auth and M2M

###### Task T118: Add federated OAuth2 (Google, Microsoft, GitHub, Apple, X), OIDC/SAML SSO, and M2M clients

- **Atomic Work Units**:
  - T118-A1: OAuth2 strategy configurations.
  - T118-A2: OIDC/SAML SSO integration.
  - T118-A3: M2M client credentials flow.
- **Branch**: `feat/auth-key-rotation-oauth2`
- **Commit**: `feat(auth): add jwt key rotation with kid, token blacklist and oauth2`
- **Testing**: Unit — strategy unit tests; E2E — OAuth2 flow E2E tests.

### Phase IV: Communication, Security Add-ons & Hardening (Steps 9–10)

#### Step 9: Mailer Service & Internationalization (nestjs-i18n, Handlebars templates via BullMQ)

##### Sub-step 9.1: Mailer service

###### Task T119: Add BullMQ-backed mailer service

- **Atomic Work Units**:
  - T119-A1: Mailer provider via BullMQ queue.
- **Branch**: `feat/mailer-i18n-queues`
- **Commit**: `feat(mail): integrate nestjs-i18n with handlebars and bullmq queues`
- **Testing**: Unit — mailer unit tests; E2E — mailer E2E tests.

##### Sub-step 9.2: Internationalization

###### Task T120: Add nestjs-i18n internationalization with Handlebars templates via BullMQ

- **Atomic Work Units**:
  - T120-A1: i18n setup.
  - T120-A2: Handlebars templates.
- **Branch**: `feat/mailer-i18n-queues`
- **Commit**: `feat(mail): integrate nestjs-i18n with handlebars and bullmq queues`
- **Testing**: Unit — i18n unit tests; E2E — i18n E2E tests.

#### Step 10: Enterprise Security Add-ons & Resilience Patterns (Sliding Window Rate Limiting, Circuit Breaker)

##### Sub-step 10.1: Rate limiting and uniform responses

###### Task T121: Add sliding window multi-tier rate limiting and uniform security responses

- **Atomic Work Units**:
  - T121-A1: Sliding window rate limiter.
  - T121-A2: Uniform security response format.
- **Branch**: `feat/security-rate-limit-resilience`
- **Commit**: `feat(security): add sliding window rate limiting and circuit breaker`
- **Testing**: Unit — rate limiter unit tests; E2E — rate limit E2E tests.

##### Sub-step 10.2: Circuit breaker

###### Task T122: Add circuit breaker resilience pattern

- **Atomic Work Units**:
  - T122-A1: Circuit breaker wrapper.
- **Branch**: `feat/security-rate-limit-resilience`
- **Commit**: `feat(security): add sliding window rate limiting and circuit breaker`
- **Testing**: Unit — circuit breaker unit tests; E2E — breaker E2E tests.

### Phase V: Production Observability & Final Compliance Audit (Step 11)

#### Step 11: Production Observability (OpenTelemetry/Prometheus metrics), Benchmarking & Compliance Audit (HIPAA, ISO 27001, OWASP ASVS)

##### Sub-step 11.1: Production observability

###### Task T123: Add OpenTelemetry/Prometheus production observability

- **Atomic Work Units**:
  - T123-A1: OpenTelemetry setup.
  - T123-A2: Prometheus metrics export.
- **Branch**: `feat/observability-compliance-audit`
- **Commit**: `feat(observability): add open-telemetry metrics and final compliance audit`
- **Testing**: Unit — metrics unit tests; E2E — metrics/health E2E tests.

##### Sub-step 11.2: Benchmarking and compliance audit

###### Task T124: Conduct final compliance audit and performance benchmarking

- **Atomic Work Units**:
  - T124-A1: Compliance audit (HIPAA, ISO 27001, OWASP ASVS).
  - T124-A2: Performance benchmarking.
- **Branch**: `feat/observability-compliance-audit`
- **Commit**: `feat(observability): add open-telemetry metrics and final compliance audit`
- **Testing**: Compliance checklist validation; E2E — validation smoke tests.

## Phase Summary

| Phase | Steps | Tasks | Primary Outcome |
|-------|-------|-------|-----------------|
| I | 1–3 | T101–T106 | Secure foundation scaffolded and configured |
| II | 4–5 | T107–T110 | Data persistence, encryption, resilience fallbacks |
| III | 6–8 | T111–T118 | Auth and anti-scanning defense stack |
| IV | 9–10 | T119–T122 | Communication, hardening, resilience |
| V | 11 | T123–T124 | Observability, benchmarking, compliance |

## Readiness for Next Phase

The implementation plan is complete for the `/speckit.plan` phase. The next step is:

**`/speckit.tasks`** — Explode all 11 steps into 5-level deep atomic tasks inside
`./opencode/implementation-plan.md`, ensuring every task explicitly states its target Branch
Name and Conventional Commit Message.

## Done When

- [x] Plan workflow executed and design artifacts generated
- [x] Extension hooks dispatched or skipped according to the rules in Mandatory Post-Execution Hooks above (skipped: no `.specify/extensions.yml`)
- [x] Completion reported to user with branch, plan path, and generated artifacts
