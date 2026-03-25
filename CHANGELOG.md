# Changelog

All notable changes to CryptoDesk AI will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning with pre-release suffixes for early channels.

## [1.0.0-alpha.1] - 2026-03-24

### Added

- Hardened Electron application scaffold with isolated `main`, `preload`, `renderer`, and shared layers
- Typed IPC contracts with Zod-backed validation and preload-only privileged access
- Local encryption, keychain integration scaffolding, and audit-oriented security modules
- Read-only exchange connectivity, portfolio preview flows, and market stream integration
- Simulation trading engine with fat-finger protection, local history, and virtual portfolio state
- Explainable AI advisory flow with reasoning, confidence, transparent risk filtering, metrics, and live alerts
- Bilingual renderer foundations for English and Arabic, including RTL shell behavior
- Onboarding wizard with mandatory risk acknowledgment before broader navigation
- Unified localized renderer error messages across AI, market, portfolio, settings, simulation, security, and trading flows
- Launch-readiness documentation, beta planning, and pre-launch security checklist
- First distributable Windows x64 alpha artifact for closed beta delivery

### Changed

- Pinned critical dependency versions in `package.json` for reproducibility
- Expanded renderer pages with consistent loading states and launch-oriented UX polish
- Switched the default Windows alpha packaging path to `zip` for stable unsigned beta delivery
- Upgraded README to reflect beta positioning, environment guidance, packaging, and release readiness

### Security

- Preserved non-custodial architecture boundaries across all implementation phases
- Kept live trading disabled by default while simulation and advisory workflows matured
- Ensured sensitive operations remain outside renderer reach and behind preload/main validation

### Testing

- Full `npm run typecheck` passes with zero TypeScript errors
- Full Jest suite passes with `24/24` suites and `60/60` tests
- Windows packaging completed successfully through `npm run build:win`
- Added and expanded targeted unit coverage for error messaging, onboarding helpers, AI flows, simulation state, and repository/store behavior

### Known Limitations

- Windows x64 zip is the current release artifact; macOS and Linux distribution are still pending
- Code signing is intentionally deferred for this alpha release, so Windows may show an `Unknown Publisher` warning
- Portable NSIS packaging remains experimental in the current local environment

### Upgrade Notes

- First public alpha release. No prior version upgrade path exists yet.
- Auto-update metadata is not yet published for this release track.
