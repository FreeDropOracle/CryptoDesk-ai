# ADR 003: OS Keychain Strategy

## Status

Accepted

## Context

CryptoDesk AI must store exchange credentials locally without exposing them to the renderer or any remote service.

The project also needs a practical strategy that allows architecture work to continue when native modules are not yet installable in the current environment.

## Decision

Use `keytar` as the production integration point for OS keychain storage, wrapped by `src/main/security/keychain.ts`.

For offline-first architecture validation:

- keep `KeychainService` in the main process only
- typecheck it through `tsconfig.check.json`
- use test-time mocks for `keytar`
- avoid weakening the implementation to a renderer-visible stub

## Consequences

Positive:

- Credentials remain outside SQLite and browser storage
- The renderer never sees raw persisted secrets
- The security boundary can still be validated when full native installs are blocked

Tradeoffs:

- Real runtime verification still depends on native module installation
- Windows, macOS, and Linux behavior must later be tested against actual OS keychains

## Follow-Up

- Add integration tests against real OS keychains once the dependency layer is fully installed
- Keep live trading disabled until keychain flows are exercised end to end
