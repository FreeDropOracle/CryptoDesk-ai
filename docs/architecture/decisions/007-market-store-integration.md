# ADR-007: Market Store Integration Strategy

## Status
Accepted

## Date
2026-03-22

## Context
Phase 2 already provides a secure read-only connection layer in the main process. The renderer now needs a predictable way to display that market data without reintroducing trust-boundary problems or mixing UI state with privileged IPC behavior.

## Decision
We keep the renderer market layer split into two responsibilities:

1. `useMarketStore`
   A pure Zustand store that manages only renderer-safe state such as cached tickers, tracked subscriptions, timestamps, and displayable error messages.

2. `useMarketData`
   A renderer hook that owns the preload subscription lifecycle and writes sanitized market data into the store.

The store must never call `window.api` or `ipcClient` directly. All bridge interaction stays in hooks and components.

## Consequences

### Positive
- Renderer state remains easy to test in isolation.
- IPC side effects stay out of shared store logic.
- Market data can be reused across dashboard and portfolio screens without duplicate subscriptions.
- Phase 2 remains display-only because the market layer exposes no mutation actions beyond local state updates.

### Negative
- Hooks must coordinate subscription lifecycle explicitly.
- Store selectors need immutable `Map` and `Set` updates to preserve render correctness.
- Portfolio display remains local/read-only until authenticated balance syncing is wired in a later phase.

## Security Implications
- The store never holds API keys or decrypted credentials.
- All inbound market data originates from preload-mediated channels only.
- UI pages can render watchlists and portfolio views without gaining write access to exchanges.
- Error messages are localized for display and avoid leaking backend implementation details.

## Related Documents
- [ADR-004: IPC Channel Design with Zod Validation](./004-ipc-channel-design.md)
- [ADR-006: CCXT Integration Strategy](./006-ccxt-integration.md)
- [Offline-First Workflow](../../development/offline-first-workflow.md)
