# API Contract: Health & Operations

**Feature**: Enterprise Security & Reliability Boilerplate
**Plan**: `specs/001-enterprise-nestjs-security/plan.md`
**Date**: 2026-11-13

## Interface Overview

Exposes operational interfaces for deployment and observability:
- Liveness and readiness health checks
- Prometheus metrics endpoint

## Endpoints

### GET /health
- **Auth**: Public
- **Response**: `200` with service status

### GET /health/ready
- **Auth**: Public
- **Response**: `200` when dependencies (DB, Redis with fallback) are ready

### GET /metrics
- **Auth**: Protected/internal
- **Response**: OpenTelemetry/Prometheus metrics

## Security Requirements

- No sensitive payload leakage in health responses.
- Metrics endpoint access controlled.

## Data References

- Entities: Retention/Job Entry, Encrypted Data — see `data-model.md`.
