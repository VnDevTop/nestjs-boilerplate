# Phase 3 — CodeQL

## Branch

`ci/codeql`

## Summary

Added CodeQL configuration and analysis workflow for JavaScript/TypeScript.

## Tasks completed

1. `ci(codeql): add codeql configuration`
   - `.github/codeql/codeql-config.yml` (paths-ignore: dist, coverage, node_modules)
2. `ci(codeql): add codeql analysis workflow`
   - `.github/workflows/codeql.yml` (language javascript-typescript, query suite security-and-quality)

## Validation

- CodeQL workflow runs successfully with zero high/critical findings.