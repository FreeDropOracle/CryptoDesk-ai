# Architecture Overview

CryptoDesk AI is a non-custodial Electron desktop application with three strict trust boundaries:

1. Renderer: React UI with no direct Node.js access.
2. Preload: Narrow context bridge exposing only safe, typed APIs.
3. Main: Privileged orchestration layer for security, trading, AI, and persistence.

## Core Principles

- Renderer isolation is mandatory.
- API credentials are encrypted locally and stored in the OS keychain.
- IPC payloads are validated with Zod before execution.
- AI inference runs in a worker, never on the main thread.
- Live trading remains feature-gated and disabled by default.

## Domain Layout

- `src/main/security`: encryption, keychain, validation, audit logging
- `src/main/trading`: CCXT wrapper, order queue, portfolio access, risk checks
- `src/main/ai`: worker-based inference orchestration and signal shaping
- `src/main/db`: local SQLite repositories with prepared statements
- `src/preload`: secure renderer bridge
- `src/renderer`: UI, state stores, hooks, and presentation components
