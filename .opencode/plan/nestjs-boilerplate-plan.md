# Plan: NestJS Boilerplate — Production-Ready Roadmap

> **Repository:** https://github.com/VnDevTop/nestjs-boilerplate.git  
> **Initial version:** `v12.0.0` (NestJS v12)  
> **Status:** Planning document (no implementation in this file)

---

## 0. Purpose

This plan describes the end-to-end process for turning the current minimal NestJS scaffold into a
production-grade, reusable boilerplate. It is written for review: every phase lists the branch to
create, the tasks to perform, the commit messages to use, and the validation commands to run.

Goals:

1. Standardised, production-ready repository.
2. Comprehensive, modern NestJS package coverage.
3. Large test suite with high coverage.
4. Easy to understand and extend (native NestJS packages + full documentation).
5. Security-first design aligned with HIPAA §164.312, ISO 27001, and OWASP ASVS.

---

## 1. Conventions

### 1.1 Branching

- Default branch: `master`.
- Branch naming: `feat/<topic>`, `docs/<topic>`, `chore/<topic>`, `ci/<topic>`, `perf/<topic>`.
- One branch per phase (or per sub-phase where noted).
- Merge to `master` only via Pull Request on GitHub.

### 1.2 Commits

- Format: `type(scope): description` (Conventional Commits).
- One task = at least one commit.
- Dependency upgrades: one commit per dependency.
- Documentation files: one commit per file.
- Config vs. workflow: one commit per part.

### 1.3 Quality gates (run after every task)

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
docker build -t nestjs-boilerplate .
```

### 1.4 Runtime baseline

- Node.js >= 24 (latest) for local dev and CI.
- npm >= 11.
- Prefer official `@nestjs/*` packages whenever available.
- Validation: `class-validator`, `class-transformer`, `zod`.
- ORM: TypeORM with PostgreSQL.
- Cache: `@nestjs/cache-manager` + `keyv` + Redis (no in-memory fallback).

### 1.5 Merge policy (manual review)

- After each task, stop and evaluate locally.
- Do **not** auto-merge.
- Open a PR, review, then merge manually on GitHub.
- At the end of each phase, add detailed docs describing what was done.

---

## 2. Phase overview

| # | Phase | Status | Outcome |
|---|-------|--------|---------|
| 0 | Skeleton | Done | Runnable NestJS project skeleton |
| 1 | Code quality | Done | Husky + commitlint |
| 2 | CI workflow | Done | Verify / test / coverage / build workflows |
| 3 | CodeQL | Done | CodeQL config + analysis workflow |
| 4 | Metadata & dependency upgrades | Done | Updated metadata, latest dependencies |
| 5 | Project docs & process files | Done | README, CHANGELOG, SECURITY, skill, plan |
| 6 | Structure & core packages | Done | Modular layout + cross-cutting packages |
| 7 | User module | Done | OIDC-compliant user model & service |
| 8 | Authentication & authorization | Done | JWT, OIDC providers, 2FA, M2M |
| 9 | Performance & production hardening | Done | Speed, caching, hardening |
| 10+ | Enhancement | Planned | Advanced query, search, tenancy, DX |

---

## 3. Phase details

### Phase 0 — Skeleton

**Branch:** `chore/skeleton`  
**Status:** Done

#### Tasks

1. `chore(skeleton): initialize nestjs project with nest cli`
   - Scaffold with `@nestjs/cli`, TypeScript, ESM (`"type": "module"`).
   - NestJS CLI generates the base project.
   - Add/verify `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`.

2. `chore(skeleton): establish src directory structure (config, core, modules)`
   - Create directories: `src/config`, `src/core`, `src/modules`, `src/common`, `src/database`.
   - Add barrel exports where useful.

#### Validation

```bash
npm run lint
npm run build
npm test
```

#### Docs deliverable

- `docs/PHASE-0.md`.

---

### Phase 1 — Code quality packages

**Branch:** `chore/code-quality`  
**Status:** Done

#### Tasks

1. `chore(deps): add husky and commitlint dependencies`
2. `chore(commitlint): configure conventional commit rules`
3. `chore(husky): add commit-msg hook and prepare script`

#### Validation

```bash
npx commitlint --from HEAD~1 --to HEAD --verbose
npm run lint
```

#### Docs deliverable

- `docs/PHASE-1.md`.

---

### Phase 2 — CI workflow (GitHub Actions)

**Branch:** `ci/github-actions`  
**Status:** Done

#### Tasks

1. `ci(verify): add lint, typecheck, and build workflow`
   - Use latest Node.js version (>= 24).
2. `ci(test): add unit and e2e test workflow`
   - Use latest Node.js version (>= 24).
   - Services: PostgreSQL, Redis.
3. `ci(coverage): add test coverage reporting`
4. `ci(build): add build artifact workflow (no push)`

#### Validation

- Push branch and confirm all workflows green.

#### Docs deliverable

- `docs/PHASE-2.md`.

---

### Phase 3 — CodeQL

**Branch:** `ci/codeql`  
**Status:** Done

#### Tasks

1. `ci(codeql): add codeql configuration`
   - Use latest Node.js to minimise warnings.
2. `ci(codeql): add codeql analysis workflow`
   - Use latest Node.js to minimise warnings.

#### Validation

- CodeQL workflow runs successfully with zero high/critical findings.

#### Docs deliverable

- `docs/PHASE-3.md`.

---

### Phase 4 — Metadata & dependency upgrades

**Branch:** `chore/package-metadata`  
**Status:** Done

#### Tasks

1. `chore(package): update metadata and engine requirements`
2. Dependency upgrades (one commit per dependency)
   - `chore(deps): upgrade <package> to <version>`

#### Validation

```bash
npm outdated
npm run lint
npm run build
npm test
```

#### Docs deliverable

- `docs/PHASE-4.md`.

---

### Phase 5 — Project documentation & process files

**Branch:** `docs/project-documentation`  
**Status:** Done

#### Tasks

1. `docs(readme): rewrite readme for boilerplate project`
2. `docs(changelog): add changelog`
3. `docs(security): add security policy`
4. `docs(skill): add project skill`
5. `docs(plan): add project roadmap`
6. `docs(contributing): add contribution guide`
7. `docs(license): add license file`

#### Validation

- Markdown lint (if configured).
- Links resolve.

#### Docs deliverable

- `docs/PHASE-5.md`.

---

### Phase 6 — Structure & core packages

**Branch:** `feat/project-structure`, `feat/core-packages`  
**Status:** Done

#### Phase 6.0 — Project structure

Tasks:

1. `feat(structure): establish modular src layout`
2. `chore(config): add configuration module and env validation`
3. `chore(database): add typeorm with postgresql and base entity`
4. `docs(structure): document folder conventions`
5. `chore(deps): add phase 1 runtime dependencies`

#### Phase 6.1 — Cross-cutting core packages

Tasks (one commit per package):

1. `chore(deps): add phase 2 dependencies`
2. `feat(swagger): add openapi documentation` (two docs links: normal user + admin)
3. `feat(validation): add class-validator and class-transformer`
4. `feat(validation): add zod support`
5. `feat(config): refine typed configuration namespaces` (`registerAs`, `ModuleOption`, `env.d.ts`)
6. `feat(health): add terminus health checks`
7. `feat(cache): add cache manager` (keyv + Redis, no memory fallback)
8. `feat(queue): add bullmq queues`
9. `feat(mail): add mailer`
10. `feat(i18n): add internationalization`
11. `feat(http): add axios http module`


12. `feat(throttle): add rate limiting`
13. `feat(helmet): add security headers`
14. `feat(cors): add cors support`
15. `feat(events): add event emitter`
16. `feat(schedule): add scheduler`
17. `chore(config): move ProcessEnv declaration to env.d.ts`
18. `chore(config): use module option types directly`
19. `chore(app): shorten config imports via barrel`
20. `test(config): add config unit tests`
21. Tao file env.example

#### Phase 6.2 — Reliability (recommended)

Tasks:

1. `chore(deps): add phase 3 dependencies`
2. `feat(resilience): add resilience module`
3. `feat(resilience): configure retry and timeout policies`
4. `feat(resilience): add circuit breaker and bulkhead`
5. `feat(resilience): add fallback handlers`
6. `feat(idempotency): add idempotency module`
7. `test(resilience): add reliability tests`

#### Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

#### Docs deliverable

- `docs/PHASE-6.md`.

---

### Phase 7 — User module (OIDC-compliant data)

**Branch:** `feat/users`  
**Status:** Done

#### Phase 7.1 — Data model

1. `feat(users): add user entity compliant with oidc claims`
2. `feat(users): add user repository`

#### Phase 7.2 — Service & API

3. `feat(users): add users service`
4. `feat(users): add user profile endpoints`
5. `feat(users): add role management`
6. `feat(users): add data retention and cleanup hooks`

#### Phase 7.3 — Tests & docs

7. `test(users): add user unit tests`
8. `test(users): add user e2e tests`
9. `docs(users): document oidc claim mapping`

#### Validation

```bash
npm test
npm run test:e2e
```

#### Docs deliverable

- `docs/PHASE-7.md`.

---

### Phase 8 — Authentication & authorization (JWT)

**Branch:** `feat/auth` (+ sub-branches)  
**Status:** Done

#### Phase 8.1 — Basic JWT auth

Hãy implement Phase 8.1 — Basic JWT auth
task 2. `feat(auth): add email/password registration and login`

1. `feat(auth): add auth module skeleton`
2. `feat(auth): add email/password registration and login`
3. `feat(auth): add password hashing (argon2/bcrypt)`
4. `feat(auth): add jwt access and refresh tokens`
5. `feat(auth): add jwt strategy and guards`
6. `feat(auth): add role-based access control`
7. `feat(auth): add permission-based authorization`
8. `feat(auth): add admin module foundation`

#### Phase 8.2 — OIDC providers

1. `feat(auth): add oidc provider abstraction`
2. `feat(auth): implement google oidc provider`
3. `feat(auth): implement microsoft oidc provider`
4. `feat(auth): implement github oidc provider`
5. `feat(auth): implement apple oidc provider`
6. `feat(auth): implement facebook oidc provider`
7. `feat(auth): implement x (twitter) oidc provider`
8. `feat(auth): add provider registration and config`

#### Phase 8.3 — Advanced security

Dựa theo /Users/vn.chemgio/.opencode/plan/nestjs-boilerplate-plan.md
Hãy implement Phase 8.3 — Advanced security 
Task 1. `feat(auth): add two-factor authentication (totp)`


1. `feat(auth): add two-factor authentication (totp)`
2. `feat(auth): add passcode / magic link login`
3. `feat(auth): add device code flow`
4. `feat(auth): add refresh token rotation`
5. `feat(security): add brute-force protection`
6. `feat(security): add audit logging`
7. `feat(auth): add jwt key versioning and rotation`
8. `feat(security): add account security features`

#### Phase 8.4 — Machine-to-machine

1. `feat(auth): add client credentials flow`
2. `feat(auth): add api key authentication`

#### Phase 8.5 — Cache-backed auth & notifications

1. `feat(auth): add authentication and authorization through cache`
2. `feat(notifications): add notification module foundation`

#### Phase 8.6 — Tests

1. `test(auth): add auth and security tests`
2. `test(auth): add oidc provider tests`
3. `test(auth): improve auth coverage`

#### Validation

```bash
npm test
npm run test:e2e
```

#### Docs deliverable

- `docs/PHASE-8.md`.

---

### Phase 9 — Performance & production hardening

**Branch:** `perf/optimization`  
**Status:** Done

#### Phase 9.1 — Performance

1. `perf(app): enable compression middleware`
2. `perf(database): add indexes and query optimization`
3. `perf(database): add query result caching`
4. `perf(cache): optimize cache keys and ttl`
5. `perf(serialization): add serialization interceptor`

#### Phase 9.2 — Production hardening

1. `feat(hardening): production hardening baseline`
2. `feat(hardening): operational hardening`
3. `feat(integration): optional integration foundation`
4. `feat(config): configuration expansion`

#### Phase 9.3 — Email & queue

1. `feat(mail): outbound email`
2. `feat(mail): configurable email templates`
3. `feat(queue): background job queue`
4. `feat(queue): job progress and cancellation`

#### Phase 9.4 — Testing & docs

1. `test(core): testing depth improvements`
2. `docs(core): documentation improvements`
3. `perf(build): optimize tsconfig and bundle`

#### Validation

```bash
npm run build
npm test
```

#### Docs deliverable

- `docs/PHASE-9.md`.

---

### Phase 10+ — Enhancement (planned)

**Branch:** `feat/enhancement`  
**Status:** Planned

#### Phase 10.1 — Query & search

1. `feat(query): cursor pagination`
2. `feat(query): reusable query criteria object`
3. `feat(search): lucene query parser`
4. `feat(search): field registry and translators`
5. `feat(search): postgres translator`
6. `feat(search): user search`
7. `docs(search): search documentation`

#### Phase 10.2 — Audit & observability read surface

1. `feat(audit): audit read surface`
2. `feat(observability): metrics and tracing baseline`

#### Phase 10.3 — Future enhancements (backlog)

- Multi-tenancy support.
- Feature flags.
- OpenTelemetry deep integration.
- Admin panel.
- GraphQL module.
- Webhooks.
- File storage (S3/GCS/Azure Blob).
- Push/SMS notifications.
- API versioning strategy.
- Advanced identity (passkeys, SAML, SCIM).

#### Validation

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

#### Docs deliverable

- `docs/PHASE-10.md`.

---

## 4. Security & compliance mapping

| Feature | HIPAA §164.312 | ISO 27001 | OWASP ASVS |
|---------|----------------|-----------|------------|
| Authentication (JWT, OIDC, MFA) | §164.312(d) | A.9 | V2 |
| Authorization (RBAC) | §164.312(a)(1) | A.9 | V4 |
| Audit logging | §164.312(b) | A.12 | V7 |
| Rate limiting / brute-force protection | §164.312(c)(1) | A.13 | V2 |
| Security headers (Helmet, CORS) | §164.312(e)(1) | A.13 | V14 |
| Input validation | §164.312(c)(1) | A.14 | V5 |
| Encryption in transit (TLS) | §164.312(e)(1) | A.13 | V9 |
| Data lifecycle / soft delete | §164.312(c)(2) | A.8 | V8 |
| Vulnerability scanning (CodeQL) | §164.312(a)(2) | A.12 | V14 |

---

## 5. Release process

After each phase:

1. Open PR from feature branch to `master`.
2. Review and merge manually.
3. Tag: `v12.0.x` (increment patch per phase).
4. Push tag to GitHub.
5. Create GitHub Release with generated notes.
6. Update `CHANGELOG.md`.

First release: `v12.0.0`.

---

## 6. Risk register

| Risk | Mitigation |
|------|------------|
| OIDC provider API changes | Keep behind abstraction; config-driven enable/disable |
| Dependency upgrade breakage | One commit per dependency; run full quality gates |
| Compliance checklist ≠ certification | Document as control tracking only |
| Key rotation downtime | Support previous keys during rotation window |
| Test flakiness in CI | Retry policies; isolated test DB/Redis |

---

## 7. Progress tracking

- [x] Phase 0 — Skeleton
- [x] Phase 1 — Code quality
- [x] Phase 2 — CI workflow
- [x] Phase 3 — CodeQL
- [x] Phase 4 — Metadata & upgrades
- [x] Phase 5 — Documentation
- [x] Phase 6.0 — Project structure
- [x] Phase 6.1 — Core packages
- [x] Phase 6.2 — Reliability
- [x] Phase 7 — User module
- [x] Phase 8.1 — Basic JWT auth
- [x] Phase 8.2 — OIDC providers
- [x] Phase 8.3 — Advanced security
- [x] Phase 8.4 — Machine-to-machine
- [x] Phase 8.5 — Cache-backed auth & notifications
- [x] Phase 8.6 — Auth tests
- [x] Phase 9.1 — Performance
- [x] Phase 9.2 — Production hardening
- [x] Phase 9.3 — Email & queue
- [x] Phase 9.4 — Testing & docs
- [ ] Phase 10.1 — Query & search
- [ ] Phase 10.2 — Audit & observability read surface
- [ ] Phase 10.3 — Future enhancements

---

*End of plan.*
