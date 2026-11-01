# Phase 2 — CI workflow (GitHub Actions)

## Branch

`ci/github-actions`

## Summary

Added GitHub Actions workflows for verification, testing, coverage, and build artifacts.

## Tasks completed

1. `ci(verify): add lint, typecheck, and build workflow`
   - `.github/workflows/verify.yml`
2. `ci(test): add unit and e2e test workflow`
   - `.github/workflows/test.yml` (PostgreSQL + Redis services)
3. `ci(coverage): add test coverage reporting`
   - `.github/workflows/coverage.yml` (uploads coverage artifact; thresholds in vitest config)
4. `ci(build): add build artifact workflow (no push)`
   - `.github/workflows/build.yml` (Docker image build without push; uploads image tar)

## Validation

- Push branch and confirm all workflows green.

All local quality gates pass on the `ci/github-actions` branch.