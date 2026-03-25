# ADR-008: Portfolio Fetch Strategy for Read-Only Connectivity

## Status
Accepted

## Date
2026-03-22

## Context
Phase 2 already delivers market data safely into the renderer, but authenticated account balances remain a higher-risk boundary. Real portfolio fetching would require decrypting exchange credentials in the main process, calling `ccxt.fetchBalance()`, and then sanitizing the result before it crosses IPC.

We want to keep Phase 2 read-only, preserve momentum during the offline-first workflow, and avoid breaking the existing numeric `PortfolioSnapshot` contract that is already used by simulation and risk logic.

## Decision
We will add a dedicated `PORTFOLIO` IPC surface for renderer-safe balance views without replacing the internal `PortfolioSnapshot` type.

### IPC Contract
- `portfolio:fetch`
  - Request payload contains `exchange` only.
  - No API key, secret, or encrypted credential material is accepted from the renderer.
- `portfolio:update`
  - Event payload contains a sanitized public account snapshot with string balances for precision preservation.

### Phase 2 Behavior
- In non-production environments, `ExchangeService.fetchPortfolioPreview()` returns a mock `PortfolioAccountSnapshot`.
- In production, the same method throws `PORTFOLIO_FETCH_NOT_IMPLEMENTED_IN_PHASE_2`.
- Real credential retrieval and decryption remain deferred to Phase 3.

### Type Strategy
- Keep `PortfolioSnapshot` unchanged for risk and simulation paths.
- Introduce a new public type, `PortfolioAccountSnapshot`, for renderer-facing account snapshots.

### UI Integration Decision
- `Portfolio.tsx` loads all preview data through a dedicated `usePortfolio` hook.
- `usePortfolio` is the only renderer bridge that touches portfolio IPC calls.
- `portfolio-store` remains pure state with no preload or IPC imports.
- Phase 2 UI stays display-only and labels deferred production behavior clearly.

## Security Implications
- Credentials remain in the OS keychain and are never accepted over IPC.
- Decrypted secrets are still forbidden from reaching the renderer.
- The new IPC schema rejects attempts to smuggle sensitive fields in the request.
- Mock data keeps the UI integration path moving without creating false confidence about live account connectivity.
- Incoming portfolio updates are validated before they are committed to renderer state.
- The UI exposes no trade or key-management actions through the portfolio preview surface.

## Consequences

### Positive
- Preserves current risk/simulation contracts.
- Lets the renderer prepare for real account data using a stable public shape.
- Keeps Phase 2 strictly read-only.

### Tradeoffs
- Portfolio UI remains backed by mock snapshots until runtime dependencies and keychain-backed credential retrieval are ready.
- We now maintain two portfolio representations with different purposes.

## Follow-Up
- Add keychain-backed credential lookup in the main process only.
- Decrypt credentials in memory immediately before `ccxt.fetchBalance()`.
- Wipe decrypted buffers after use.
- Replace the mock preview path with a live sanitized balance fetch in Phase 3.
