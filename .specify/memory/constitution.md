<!-- SYNC IMPACT REPORT (temporary human-review draft; not governance content)
Version change: 1.0.0 → 1.1.0
Modified principles: none
Added sections: none
Removed sections: none
Follow-up TODOs:
- TODO(RATIFICATION_DATE): no prior ratification found; ratified on first application
-->

# NestJS Boilerplate Constitution

## Core Principles

### I. Enterprise Security & Compliance

Zero-trust architecture MUST be strictly aligned with HIPAA §164.312, ISO 27001, and
OWASP ASVS. Access MUST be authenticated, authorized, and least-privilege, and audit
logging MUST be enforced.

Rationale: PHI protection and regulatory compliance REQUIRE continuous trust verification.

### II. Target Framework & Version

The project MUST target NestJS 12. Native capabilities MUST be leveraged: Observability,
Telemetry, Prometheus metrics, Graceful Shutdown hooks via app.enableShutdownHooks(), and
native useSecurityHeaders. External helmet packages MUST NOT be used.

Rationale: Framework-native features REDUCE integration risk and boilerplate.

### III. Code Documentation & Explainability

JSDoc MUST be mandatory for all files, classes, methods, functions, and DTOs. Every
imported package or module MUST include an inline comment explaining its exact purpose. A
README MUST be maintained and a phase-end summary plus documentation update MUST ship at
the end of every phase.

Rationale: Explainability REDUCES onboarding cost and incident-debugging time.

### IV. Strict Validation & Transformation

Every DTO MUST rigorously utilize class-validator and class-transformer with a global
ValidationPipe enforcing whitelist: true, forbidNonWhitelisted: true, and transform: true.

Rationale: Silent transformation errors COMPROMISE data integrity.

### V. Type-Safe Environment Management

A mandatory env.d.ts declaration file extending NodeJS.ProcessEnv MUST provide compile-time
type safety. Zero hardcoded configuration MUST be used. @nestjs/config MUST be used via
registerAs, .asProvider(), and Joi validation schemas.

Rationale: Compile-time safety PREVENTS runtime misconfiguration.

### VI. Distributed Infrastructure & Local Development Fallbacks

A shared REDIS_URL MUST be used with strict prefix namespaces via @keyv/redis and BullMQ.
Local development environments MUST support automatic fallback mechanisms: memory cache and
in-memory queues MUST be available for zero-dependency local execution.

Rationale: Shared state MUST stay namespaced and local development MUST run without
external dependencies.

### VII. Uncompromising Testing Standard

No task is considered complete without rigorous automated testing. Every implemented task
MUST deliver comprehensive unit tests, strict code coverage thresholds, and E2E verification
tests.

Rationale: Undisciplined shipping COMPROMISES production readiness.

### VIII. Strict Git, Commit & Phased Workflow

The mandatory Conventional Commits format (type(scope): subject) MUST be used with strict
branch naming conventions. Every task in the implementation plan MUST define its target
branch and commit message. Implementation MUST pause at the end of every completed phase for
testing, code review, git push, and PR merging before proceeding.

Rationale: Predictable history and phased releases REDUCE operational risk.

### IX. Dependency & Infrastructure Hardening

A zero-vulnerability policy MUST be enforced. npm packages MUST be regularly audited and
upgraded to their latest stable versions. Workflows MUST integrate Dependabot, CodeQL, and
SAST/SCA scanners. Build and deploy runners and Docker bases MUST use ubuntu-latest and OS
base images to mitigate CVE vulnerabilities.

Rationale: Unpatched CVEs EXPLOIT known weaknesses.

### X. Living Plan Compliance, Deep Atomic Granularity & Git Mapping

./opencode/implementation-plan.md MUST be a living document requiring full 5-level deep
atomic task breakdowns across ALL 11 steps. Every microscopic task MUST detail its target
branch and commit message, be tracked, checked off upon completion, and dynamically updated
whenever requirements evolve.

Rationale: Evolving requirements REQUIRE atomic, tracked task breakdown.

### XI. Continuous Package & Version Lifecycle

package.json dependencies MUST be continuously audited and bumped to their latest stable
releases to prevent security vulnerabilities. The project version in package.json MUST
increment incrementally in sync with completed implementation phases.

Rationale: Incremental versions PREVENT breaking-change chaos.

## Security Requirements

Zero-trust architecture MUST remain strictly aligned with HIPAA §164.312, ISO 27001, and
OWASP ASVS across all environments.

## Development Workflow, Review Process & Quality Gates

Implementation MUST pause at the end of every completed phase for testing, code review, git
push, and PR merging before proceeding.

## Governance

This constitution supersedes all other practices. Amendments require documentation,
approval, and migration plan. All PRs and reviews MUST verify compliance. Complexity MUST be
justified. Runtime development guidance MUST align with this constitution.

**Version**: 1.1.0 | **Ratified**: 2026-11-13 | **Last Amended**: 2026-11-13
