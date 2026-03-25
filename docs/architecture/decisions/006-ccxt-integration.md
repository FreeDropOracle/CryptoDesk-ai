# ADR-006: CCXT Integration Strategy

## Status
Accepted

## Date
2026-03-22

## Context
Phase 2 introduces real exchange connectivity for market data and portfolio reads, but the application must remain financially safe while infrastructure and dependency installation are still stabilizing.

We need a connection layer that:
- Works in read-only mode first
- Uses Binance Spot Testnet by default
- Respects exchange rate limits
- Separates REST polling from WebSocket streaming
- Keeps trade execution disabled until a later phase

## Decision
We use `ccxt@4.2.0` as the exchange abstraction layer for REST-style reads and a dedicated `WebSocketManager` for live ticker streams.

### Rules
- Phase 2 is read-only by design.
- `ExchangeService.placeOrder()` must throw a typed `ExchangeError` in this phase.
- REST requests must pass through a `RateLimitQueue`.
- Binance Spot Testnet is the default connection target.
- When sandbox support exists, `setSandboxMode(true)` is called immediately after client creation.

## Security Implications
- API keys remain in the main process only.
- Exchange errors are normalized before surfacing to other layers.
- No secrets are written to logs or returned to the renderer.
- Live trade execution remains blocked despite exchange connectivity being available.

## Operational Notes
- Binance Spot Testnet currently documents `https://testnet.binance.vision/api` for REST and `wss://stream.testnet.binance.vision/ws` for market streams.
- CCXT’s manual requires enabling sandbox mode immediately after client creation for supported exchanges.
- Because dependency installation is still constrained in the current environment, Phase 2 verification stays mock-driven and type-safe for now.

## Follow-Up
- Verify authenticated Binance Testnet balance reads against the pinned CCXT version once full dependencies are installed.
- Add REST fallback orchestration on top of WebSocket disconnect detection.
- Connect renderer market state and portfolio widgets to the new read-only services.

## Related Documents
- [ADR-004: IPC Channel Design with Zod Validation](./004-ipc-channel-design.md)
- [ADR-005: Security-Sensitive IPC Channel Handling](./005-security-channels.md)
- [Offline-First Workflow](../../development/offline-first-workflow.md)
