# Master Roadmap: Enterprise Security & Reliability Boilerplate

**Feature**: Enterprise Security & Reliability Boilerplate  
**Short Name**: `enterprise-nestjs-security`  
**Spec**: `specs/001-enterprise-nestjs-security/spec.md`  
**Branch**: `001-enterprise-nestjs-security`  
**Date**: 2026-11-13
**Compliance Targets**: HIPAA §164.312, ISO 27001, OWASP ASVS  
**Framework Baseline**: NestJS 12 (Native Observability, Native `useSecurityHeaders`, Graceful Shutdown)  
**Runner & OS Base**: `ubuntu-latest`  
**Status**: Active Master Blueprint (Living Document)

## Purpose

Design and build a production-ready, highly secure NestJS 12 enterprise boilerplate that
delivers secure-by-default foundation capabilities across architecture, data
persistence, zero-trust security, multi-tier
auth, dev fallbacks, testing, and delivery pipelines.

## Phases and Steps

Execution proceeds in strict order, one phase at a time:

$$\text{Phase I} \longrightarrow \text{Phase II} \longrightarrow \text{Phase III} \longrightarrow \text{Phase IV} \longrightarrow \text{Phase V}$$

Within each phase, steps execute in ascending chronological order: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11**.

⚠️ **Phase Gate Rule (Pause & Push Policy)**:  
At the end of every completed Phase, execution **MUST PAUSE**. The agent/developer must run full automated test suites (Unit + E2E), verify 100% coverage thresholds, execute continuous package security audit & version sync, `git push` the phase branch, and merge the Pull Request (PR) before commencing the next Phase.

---

## Executive Summary Table

| Phase | Step | Name | Core Objective | Target Branch | Conventional Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase I** | **1** | Project Scaffolding & Code Quality Setup | Bootstrap NestJS 12 with governance and code-quality tooling | `chore/project-scaffolding` | `chore(core): initialize nestjs 12 scaffolding and git quality gates` |
| | **2** | Automated CI/CD & Security Workflows | `ubuntu-latest` Dependabot + CodeQL security pipeline | `ci/github-sec-workflows` | `ci(sec): configure dependabot, codeql and github actions on ubuntu-latest` |
| | **3** | Native Security Headers & Core Config | Native security headers (`useSecurityHeaders`), strict validation, typed env | `feat/core-config-validation` | `feat(config): integrate native security headers, typed env and validation pipe` |
| **Phase II**| **4** | Data Persistence & Field Encryption | `DATABASE_URL` integration, soft delete, AES-256-GCM encryption | `feat/database-typeorm-encryption` | `feat(database): setup typeorm postgres with soft delete and aes-256-gcm` |
| | **5** | Caching, Queues & Local Dev Fallbacks | `@keyv/redis` + BullMQ with in-memory dev fallbacks | `feat/cache-queue-fallbacks` | `feat(infrastructure): setup redis keyv, bullmq and local memory fallbacks` |
| **Phase III**| **6** | User Module & Anti-Scanning Defense | User entity, Argon2id, timing-safe compare, idempotency middleware | `feat/user-anti-scanning` | `feat(user): implement argon2id hashing and timing attack defense` |
| | **7** | Basic Authentication & Session Management | Local strategy, JWT access/refresh token issuance & revocation | `feat/auth-jwt-basic` | `feat(auth): implement local strategy, jwt access and refresh tokens` |
| | **8** | Advanced Auth: Key Rotation & OAuth2 | Blacklist with `kid` rotation, federated OAuth2, M2M / SSO | `feat/auth-key-rotation-oauth2` | `feat(auth): add jwt key rotation with kid, token blacklist and oauth2` |
| **Phase IV**| **9** | Mailer Service & i18n Queues | Async mailer via BullMQ, `nestjs-i18n` + Handlebars templates | `feat/mailer-i18n-queues` | `feat(mail): integrate nestjs-i18n with handlebars and bullmq queues` |
| | **10**| Enterprise Security & Resilience | Sliding window rate limiting, circuit breaker, account lockout | `feat/security-rate-limit-resilience` | `feat(security): add sliding window rate limiting and circuit breaker` |
| **Phase V** | **11**| Observability & Compliance Audit | Native OpenTelemetry metrics, Vitest coverage gate, HIPAA/ISO/OWASP audit | `feat/observability-compliance-audit` | `feat(observability): add open-telemetry metrics and final compliance audit` |

---

## 🗺️ Detailed Phased Step Breakdown

### Phase I: Foundation, Scaffolding & Security Tooling (Steps 1–3)

#### Step 1: Project Scaffolding, Governance & Code Quality Setup
- **Target Branch**: `chore/project-scaffolding`
- **Commit Format**: `chore(core): initialize nestjs 12 scaffolding and git quality gates`
- **Key Deliverables:**
  1. Bootstrap NestJS 12 project with ESM (`"type": "module"`) and strict TypeScript compiler settings.
  2. Setup Husky, `lint-staged`, and Commitlint (`commitlint.config.js`) enforcing Conventional Commits.
  3. Configure `.vscode/settings.json`, oxlint, and Prettier rules.
  4. Implement native NestJS 12 Graceful Shutdown hooks (`app.enableShutdownHooks()`).
  5. Setup Unit (`*.spec.ts`) & E2E (`*.e2e-spec.ts`) testing scaffolding with strict Vitest coverage thresholds.
- **Testing Rule**: Unit test for main startup module + E2E smoke test passing.
- **Phase Gate**: Run Tests ➔ Coverage Check ➔ `git push` ➔ Merge PR.

#### Step 2: Automated CI/CD & Vulnerability Scanning Workflows
- **Target Branch**: `ci/github-sec-workflows`
- **Commit Format**: `ci(sec): configure dependabot, codeql and github actions on ubuntu-latest`
- **Key Deliverables:**
  1. Create `.github/dependabot.yml` targeting daily npm upgrades to latest stable versions.
  2. Create `.github/workflows/codeql.yml` running on `ubuntu-latest` for SAST analysis.
  3. Build GitHub Actions workflow running sequentially on `ubuntu-latest`: (1) Vulnerability Scans ➔ (2) Test & Coverage ➔ (3) Docker Build.
- **Testing Rule**: CI workflow syntax validation + mock security pipeline run verification.
- **Phase Gate**: All Workflows Green on `ubuntu-latest`.

#### Step 3: Native Security Headers (useSecurityHeaders), Validation & Core Configuration
- **Target Branch**: `feat/core-config-validation`
- **Commit Format**: `feat(config): integrate native security headers, typed env and validation pipe`
- **Key Deliverables:**
  1. Enable native NestJS 12 `useSecurityHeaders` (eliminating external `helmet` dependency).
  2. Create strongly typed `env.d.ts` extending `NodeJS.ProcessEnv`.
  3. Configure `@nestjs/config` using `registerAs`, `.asProvider()`, and Joi schema validation.
  4. Setup global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
  5. Enable OpenAPI / Swagger (`@nestjs/swagger`) with Bearer Security definitions.
- **Testing Rule**: Unit tests for ConfigService validation + E2E tests for security headers & invalid DTO rejection.
- **Phase Gate**: Phase I Tests Pass ➔ `git push` ➔ **PR Merge Phase I**.

---

### Phase II: Data Layer, Resilience & Local Dev Fallbacks (Steps 4–5)

#### Step 4: Data Persistence, Soft Delete & Field-Level Encryption (AES-256-GCM)
- **Target Branch**: `feat/database-typeorm-encryption`
- **Commit Format**: `feat(database): setup typeorm postgres with soft delete and aes-256-gcm`
- **Key Deliverables:**
  1. Integrate TypeORM with PostgreSQL using `DATABASE_URL`.
  2. Implement Base Entity with Soft Delete metadata and automated Cron purge retention.
  3. Implement Field-Level Encryption at Rest (**AES-256-GCM**) for sensitive PII/PHI fields (HIPAA §164.312).
- **Testing Rule**: Unit tests for AES-256-GCM crypto utility + E2E repository tests verifying encryption & soft delete filters.
- **Phase Gate**: Run Tests ➔ Coverage Check ➔ `git push`.

#### Step 5: Distributed Caching, Queues & Local Dev Fallbacks (Redis + Memory Fallback)
- **Target Branch**: `feat/cache-queue-fallbacks`
- **Commit Format**: `feat(infrastructure): setup redis keyv, bullmq and local memory fallbacks`
- **Key Deliverables:**
  1. Configure `@keyv/redis` sharing `REDIS_URL` with isolated prefix namespace (`boilerplate:cache:`).
  2. Configure BullMQ sharing `REDIS_URL` with isolated prefix namespace (`boilerplate:bull:`).
  3. **Local Dev Fallback Mechanism**: Implement automatic fallback wrappers switching to Memory Cache and In-Memory Queues when Redis is unavailable during local execution.
- **Testing Rule**: Unit tests for fallback handlers + E2E tests verifying cache hit/miss and queue execution under both Redis and In-Memory modes.
- **Phase Gate**: Phase II Tests Pass ➔ `git push` ➔ **PR Merge Phase II**.

---

### Phase III: User Management, Auth & Anti-Scanning Defense (Steps 6–8)

#### Step 6: User Module & Anti-Scanning Defense Architecture (Argon2id, Timing Attack Mitigation, Idempotency)
- **Target Branch**: `feat/user-anti-scanning`
- **Commit Format**: `feat(user): implement argon2id hashing and timing attack defense`
- **Key Deliverables:**
  1. Design User entity with structured `sub` claim (`local:uuid`, `google:sub_id`).
  2. Implement local password hashing using **Argon2id** (strictly prohibiting bcrypt).
  3. **Anti-Scanning Defense**: Implement dummy password hashing for non-existent users (constant-time execution to prevent timing attacks) and uniform success responses for registration/recovery flows.
  4. Implement Redis-backed **Idempotency Key Middleware** for critical write requests.
- **Testing Rule**: Unit tests for Argon2id service & timing equality + E2E tests verifying identical response times for existing vs non-existing users.
- **Phase Gate**: Run Tests ➔ `git push`.

#### Step 7: Basic Authentication & Session Management (Local Strategy, JWT Access/Refresh)
- **Target Branch**: `feat/auth-jwt-basic`
- **Commit Format**: `feat(auth): implement local strategy, jwt access and refresh tokens`
- **Key Deliverables:**
  1. Implement Local Strategy (Username/Password verification via Argon2id).
  2. Configure JWT Access Token and Refresh Token issuance and validation guards.
  3. Implement session management, refresh lifecycle, and explicit logout endpoints.
- **Testing Rule**: Unit tests for AuthGuard & Strategy + E2E tests verifying login, token issue, refresh token rotation, and invalid token rejection.
- **Phase Gate**: Run Tests ➔ `git push`.

#### Step 8: Advanced Auth: Key Rotation (kid), Blacklist & Federated OAuth2 (OIDC/SAML, M2M)
- **Target Branch**: `feat/auth-key-rotation-oauth2`
- **Commit Format**: `feat(auth): add jwt key rotation with kid, token blacklist and oauth2`
- **Key Deliverables:**
  1. **JWT Key Rotation**: Multi-key verification support via `kid` header for zero-downtime key rolling.
  2. Redis-backed Token Blacklist for instant session revocation upon logout/security alert.
  3. Integrate OAuth2 federated strategies (Google, Microsoft, GitHub, Apple, X).
  4. Implement Enterprise SSO (OIDC/SAML) foundation and M2M Client Credentials flow.
- **Testing Rule**: Unit tests for multi-key verification & blacklist interceptor + E2E tests for blacklisted token rejection and OAuth2 callback flows.
- **Phase Gate**: Phase III Tests Pass ➔ `git push` ➔ **PR Merge Phase III**.

---

### Phase IV: Communication, Security Add-ons & Hardening (Steps 9–10)

#### Step 9: Mailer Service & Internationalization (nestjs-i18n, Handlebars templates via BullMQ)
- **Target Branch**: `feat/mailer-i18n-queues`
- **Commit Format**: `feat(mail): integrate nestjs-i18n with handlebars and bullmq queues`
- **Key Deliverables:**
  1. Integrate dynamic email provider service (SMTP / SendGrid / Mailgun).
  2. Setup `nestjs-i18n` for multi-language support across error messages and emails.
  3. Create localized Handlebars email templates executed asynchronously via BullMQ jobs.
- **Testing Rule**: Unit tests for i18n translator & email job processor + E2E tests verifying email dispatch queueing and localized response payloads.
- **Phase Gate**: Run Tests ➔ `git push`.

#### Step 10: Enterprise Security Add-ons & Resilience Patterns (Sliding Window Rate Limiting, Circuit Breaker)
- **Target Branch**: `feat/security-rate-limit-resilience`
- **Commit Format**: `feat(security): add sliding window rate limiting and circuit breaker`
- **Key Deliverables:**
  1. Implement Sliding Window Rate Limiting per User-Context via Redis.
  2. Implement Circuit Breaker and Retry patterns for third-party service calls (OAuth, Mailer).
  3. Multi-tier account lockout mechanism triggered upon consecutive failed login attempts.
- **Testing Rule**: Unit tests for circuit breaker state transitions + E2E tests verifying HTTP 429 Rate Limit responses and account lockout triggers.
- **Phase Gate**: Phase IV Tests Pass ➔ `git push` ➔ **PR Merge Phase IV**.

---

### Phase V: Production Observability & Final Compliance Audit (Step 11)

#### Step 11: Production Observability (OpenTelemetry/Prometheus metrics), Benchmarking & Compliance Audit
- **Target Branch**: `feat/observability-compliance-audit`
- **Commit Format**: `feat(observability): add open-telemetry metrics and final compliance audit`
- **Key Deliverables:**
  1. Integrate NestJS 12 Native Observability / OpenTelemetry / Prometheus `/metrics` endpoints.
  2. Execute 100% Vitest Test Coverage verification across statement, branch, and line metrics.
  3. Audit `package.json` dependencies, bump all packages to latest stable releases, and increment project version in lockstep with release milestone.
  4. Conduct final Compliance Audit mapping system implementation against HIPAA §164.312, ISO 27001, and OWASP ASVS standards.
- **Testing Rule**: Full test suite execution (`npm run test:cov` & `npm run test:e2e`) passing 100% threshold gates.
- **Phase Gate**: Final Verification ➔ Merge PR ➔ Tag Release `v12.0.0`.


## Security & Compliance Traceability Matrix

| Security & Compliance Requirement | HIPAA §164.312 Target | ISO 27001 | OWASP ASVS | Implementation Location |
| :--- | :--- | :--- | :--- | :--- |
| **Argon2id & Timing Attack Mitigation** | §164.312(d) Access Control | A.9.4 | V2.1 | `src/modules/auth/crypto/` |
| **Native Security Headers** | §164.312(e) Transmission | A.13.1 | V14.4 | `src/main.ts` (`useSecurityHeaders`) |
| **Field-Level AES-256-GCM Encryption** | §164.312(a)(2) Encryption | A.10.1 | V8.3 | `src/common/crypto/` |
| **JWT Key Rotation (`kid`) & Revocation** | §164.312(d) Session Integrity | A.9.2 | V3.5 | `src/modules/auth/strategies/` |
| **Redis Blacklist & Dev Fallbacks** | §164.312(c) Integrity Control | A.12.3 | V3.3 | `src/common/cache/` |
| **CodeQL & Dependabot on `ubuntu-latest`** | §164.312(b) Audit Controls | A.12.6 | V14.2 | `.github/workflows/` |
| **Idempotency & Rate Limiting** | §164.312(c) System Integrity | A.12.1 | V11.1 | `src/common/middleware/` |


## Phase Order

Execution proceeds in strict order, one phase at a time:

**Phase I → Phase II → Phase III → Phase IV → Phase V**

Within each phase, steps execute in ascending order. Phase gating pauses execution at the
end of each phase for testing, code review, git push, and PR merging before proceeding.

## Step Dependency Summary

Execution sequence across all steps: **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11** (strict order; security tooling in Phase I precedes data and security hardening in later phases).
