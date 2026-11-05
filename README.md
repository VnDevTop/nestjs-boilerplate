# NestJS Boilerplate

<p align="center">
  <a href="https://nestjs.com" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A production-ready <a href="https://nestjs.com" target="_blank">NestJS</a> boilerplate with modular architecture, authentication scaffolding, quality tooling, and observability.
</p>

<p align="center">
  <a href="https://github.com/VnDevTop/nestjs-boilerplate/actions/workflows/verify.yml"><img src="https://github.com/VnDevTop/nestjs-boilerplate/actions/workflows/verify.yml/badge.svg?branch=master" alt="Verify" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate/actions/workflows/test.yml"><img src="https://github.com/VnDevTop/nestjs-boilerplate/actions/workflows/test.yml/badge.svg?branch=master" alt="Test" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate/actions/workflows/codeql.yml"><img src="https://github.com/VnDevTop/nestjs-boilerplate/actions/workflows/codeql.yml/badge.svg?branch=master" alt="CodeQL" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate"><img src="https://img.shields.io/github/commit-activity/t/VnDevTop/nestjs-boilerplate?label=commits" alt="Commits" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate"><img src="https://aschey.tech/tokei/github.com/VnDevTop/nestjs-boilerplate?category=code" alt="Lines of code" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate"><img src="https://img.shields.io/badge/tests-263%20unit%20%7C%2037%20e2e-brightgreen" alt="Tests" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate/releases"><img src="https://img.shields.io/badge/version-12.8.2-blue" alt="Version" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate/blob/master/SECURITY.md"><img src="https://img.shields.io/badge/security-policy-blue" alt="Security Policy" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate"><img src="https://img.shields.io/badge/dependabot-enabled-brightgreen?logo=dependabot" alt="Dependabot" /></a>
  <a href="https://snyk.io/test/github/VnDevTop/nestjs-boilerplate"><img src="https://snyk.io/test/github/VnDevTop/nestjs-boilerplate/badge.svg" alt="Snyk" /></a>
  <a href="https://github.com/VnDevTop/nestjs-boilerplate/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" /></a>
</p>

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Project setup](#project-setup)
- [Compile and run](#compile-and-run-the-project)
- [Tests](#run-tests)
- [Quality gates](#quality-gates)
- [Docker](#docker)
- [Observability](#observability)
- [Project structure](#project-structure)
- [License](#license)

## Features

- Modular source layout (`src/common`, `src/core`, `src/database`, `src/modules`).
- TypeScript, ESM (`"type": "module"`), strict mode.
- Validation-ready (class-validator, class-transformer, zod-ready).
- TypeORM + PostgreSQL baseline (planned in later phases).
- Cache, queue, mailer, i18n, HTTP, throttling, helmet, CORS (planned).
- JWT/OIDC authentication and authorization (planned).
- Husky + commitlint conventional commits.
- oxlint with JSDoc rules.
- GitHub Actions (verify, test, coverage, build) and CodeQL.
- Docker image build (no push) in CI.

## Requirements

- Node.js >= 24
- npm >= 11

## Project setup

```bash
npm install
```

Copy `.env` values as needed (see `.env`).

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# debug mode
npm run start:debug

# production mode
npm run start:prod
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Quality gates

```bash
npm run lint
npx tsc --noEmit
npm run build
npm test
npm run test:e2e
```

## Docker

```bash
docker build -t nestjs-boilerplate .
```

## Observability

This project is instrumented with [NestJS Observe](https://observe.nestjs.com). Set
`OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in `.env` (written by `npx @nestjs/observe link`).

## Project structure

See `docs/STRUCTURE.md` and folder-level `README.md` files under `src/`.

## License

MIT