# Offline-First Development Workflow

## When To Use

- network restrictions prevent full dependency installation
- native module compilation is blocked
- the team needs early security-boundary validation before runtime wiring

## Workflow

1. Pin critical dependency versions in `package.json`.
2. Add `.nvmrc` for the target Node LTS release.
3. Create a focused `tsconfig.check.json` for boundary-safe files.
4. Install TypeScript tooling into an isolated local folder such as `.tscheck-tools`.
5. Provide minimal type stubs for blocked external modules in `types/check-stubs.d.ts`.
6. Run partial typecheck before attempting a full environment bootstrap.

## What This Validates

- preload bridge typing
- renderer-safe shared contracts
- internal/shared security types
- targeted main-process security services like keychain handling

## Limitations

- no native runtime verification
- no end-to-end Electron launch confidence
- no real database or OS keychain execution yet

## Exit Criteria

Move back to the full workflow once:

- Node LTS is active
- package installation succeeds
- native modules can be rebuilt
- full `npm.cmd run typecheck` is available
