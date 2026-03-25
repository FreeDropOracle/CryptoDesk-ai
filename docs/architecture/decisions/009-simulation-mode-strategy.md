# ADR-009: Simulation Mode Strategy for Phase 3

## Status
Accepted

## Date
2026-03-23

## Context
Phase 2 completed the read-only connection engine and renderer-safe portfolio integration. The next milestone is letting users practice the trading workflow without exposing real capital, real credentials, or live exchange execution.

We need a Phase 3 path that keeps the same secure IPC boundary, preserves TypeScript strictness, and gives the renderer instant feedback before a request crosses into the main process.

## Decision
Phase 3 will execute every order through a local-only simulation engine.

### Execution Model
- The renderer validates order drafts for fast UX feedback only.
- Large simulated orders require the user to type `CONFIRM` before submission.
- The main process remains authoritative and re-validates every order through `order-validation.ts`.
- `SimulationEngine` maintains virtual balances and trade history in local process memory only.
- No Phase 3 code path touches real exchange APIs for order execution.

### IPC Strategy
- Keep using the existing `trade:place` IPC contract.
- Force Phase 3 orders into `simulation: true` from the renderer path.
- Preserve the current feature-flag block that prevents live trading from being enabled accidentally.

### State Strategy
- Renderer state continues to hold renderer-safe recent trades and derived virtual balance summaries.
- Main-process simulation state is separate from renderer stores and never trusts renderer-reported balances.
- Trade history may still be persisted locally for auditability, but it remains device-local only.

## Security Implications
- Zero real-fund risk in Phase 3.
- Fat-finger protection reduces accidental oversized orders during practice.
- The renderer still cannot access exchange credentials, filesystem, database queries, or raw Node.js APIs.
- Re-validating in the main process prevents bypassing renderer checks.

## Trade History And Virtual Portfolio Decision
- Simulation trades are stored with the existing `simulation` flag and queried only through a dedicated simulation-history repository.
- Renderer history requests are forced onto simulation-only IPC paths.
- The virtual portfolio starts from a clear `$10,000` paper balance and is derived from local simulation history.
- Resetting simulation clears only simulated records and resets the in-memory simulation engine state.

## Consequences

### Positive
- Users can learn the trading flow before live execution exists.
- The future live-trading path can reuse most validation and UI contracts.
- Risk checks become testable before exchange credentials enter the picture.
- Simulation analytics now stay separate from read-only exchange portfolio views.

### Tradeoffs
- Virtual balances can diverge from read-only portfolio previews until a dedicated simulation portfolio surface is added.
- Phase 3 still needs runtime validation later when full dependency installation is available.

## Follow-Up
- Add simulation portfolio rendering to the dedicated `Simulation` surface.
- Introduce exchange selection persistence in settings without exposing new sensitive fields.
- Reuse the same validation layer when Phase 4 introduces keychain-backed live execution.
