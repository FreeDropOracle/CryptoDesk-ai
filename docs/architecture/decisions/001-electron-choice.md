# ADR 001: Electron For Desktop Delivery

## Status

Accepted

## Context

CryptoDesk AI needs:

- Cross-platform desktop distribution
- Secure local filesystem and keychain access
- Rich charting and responsive desktop UI
- Offline-capable local inference and persistence

## Decision

Use Electron with React and TypeScript, paired with strict preload isolation.

## Consequences

Positive:

- Strong ecosystem for desktop packaging and updates
- Clear separation between renderer and privileged code
- Good fit for local-first non-custodial workflows

Tradeoffs:

- Requires careful security hardening
- Larger application footprint than native alternatives
- IPC design must be deliberate to avoid privilege leakage
