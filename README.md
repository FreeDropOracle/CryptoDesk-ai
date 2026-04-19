# CryptoDesk AI

> Trade smarter. Not harder.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-28.x-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-16A34A)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v1.0.0--alpha.1-F59E0B)](https://github.com/FreeDropOracle/CryptoDesk-ai/releases)

CryptoDesk AI is an AI-powered desktop trading co-pilot built with a security-first architecture. The current alpha is designed around three principles:

- non-custodial credential handling
- simulation-first learning and testing
- explainable, advisory-only AI

This repository is ready for controlled beta review, contributor onboarding, and release operations. Live trading remains intentionally gated until signing, runtime hardening, and broader validation are complete.

## Current Alpha Scope

What ships today:

- real-time market data through validated Electron IPC flows.
- read-only portfolio preview.
- simulation trading with isolated virtual balances.
- explainable AI signals with transparent filtering and metrics.
- bilingual user experience in English and Arabic.
- onboarding flow with explicit risk acknowledgment

What is intentionally limited in `v1.0.0-alpha.1`:

- Windows build only
- unsigned alpha build
- simulation-first usage path
- AI is advisory only and never auto-executes trades
- public live-trading execution is still disabled

## Quick Start

1. Download the latest Windows alpha from [Releases](https://github.com/FreeDropOracle/CryptoDesk-ai/releases).
2. Extract the zip archive to a new folder.
3. Run `CryptoDesk AI.exe`.
4. Complete onboarding.
5. Start in Simulation Mode before testing any exchange connectivity.

## Downloads

| Platform | Version | Link |
|----------|---------|------|
| Windows x64 | 1.0.0-alpha.1 | [Download ZIP](https://github.com/FreeDropOracle/CryptoDesk-ai/releases/tag/v1.0.0-alpha.1) |

Alpha notes:

- Windows may show an `Unknown Publisher` warning because code signing is not enabled yet.
- The primary tester artifact is a zip package, not an installer.
- The recommended path for new testers is onboarding plus simulation mode.

## Security First

- renderer code has no direct Node.js or credential access
- preload is the only privileged bridge into the main process
- IPC payloads are validated with Zod before privileged work runs
- secrets are stored locally with OS keychain integration and AES-256-GCM encryption
- the product is non-custodial by design

See [Security Protocol](docs/security/encryption-spec.md) and [Threat Model](docs/architecture/threat-model.md).

## Product Highlights

### Simulation Workspace

- virtual buying power and isolated paper-trading ledger
- trade history for simulation-only activity
- risk guardrails and fat-finger confirmation flow

### Explainable AI

- buy, sell, and hold signals with confidence scores
- transparent reasoning and risk filtering
- metrics dashboard and live advisory alerts

### User Experience

- dark desktop-first interface
- onboarding wizard with risk acknowledgment
- contextual tooltips in key screens
- English and Arabic support, including RTL behavior for Arabic

## Development Quick Start

Recommended environment:

- Node `20.11.0 LTS`
- npm `10.x`
- Windows: Visual Studio Build Tools with `Desktop development with C++`

Install and run:

```powershell
npm install
npm run typecheck
npm test
npm run dev
```

Windows packaging for the current alpha track:

```powershell
npm run build:win
```

See [Windows Build Instructions](docs/development/build-windows.md) and [Development Setup](docs/development/setup.md).

## Documentation

Core references:

- [Architecture Overview](docs/architecture/overview.md)
- [Architecture Decisions](docs/architecture/decisions/)
- [API / IPC Channels](docs/api/ipc-channels.md)
- [Getting Started Guide](docs/user-guide/getting-started.md)
- [Beta Testing Plan](docs/launch/beta-testing-plan.md)
- [Release Operations Plan](docs/ops/release-ops-plan.md)

Launch package:

- [Launch Sign-off](docs/launch/launch-signoff.md)
- [Public Launch Announcement](docs/launch/public-launch-announcement.md)
- [Video Demo Script](docs/launch/video-demo-script.md)
- [GitHub Release Draft Guide](docs/launch/github-release-draft.md)
- [Smoke Test Report](docs/ops/smoke-test-report.md)
- [Beta Pre-Send Checklist](docs/ops/beta-pre-send-checklist.md)
- [Beta Testers Tracker](docs/ops/beta-testers.md)
- [Alpha Round 1 Feedback Log](docs/feedback/alpha-round-1.md)

## Project Status

- Phase 1: foundation and security hardening completed
- Phase 2: connection and read-only market flows completed
- Phase 3: simulation trading experience completed
- Phase 4: explainable AI integration completed
- Phase 5: launch preparation and release operations completed for alpha

## Contributing

This is an alpha release, so thoughtful issues, feedback, and security-minded improvements are welcome.

- bug reports: [GitHub Issues](https://github.com/FreeDropOracle/CryptoDesk-ai/issues)
- release process: [.github/RELEASE_TEMPLATE.md](.github/RELEASE_TEMPLATE.md)
- conduct expectations: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- security policy: [.github/SECURITY.md](.github/SECURITY.md)

## Disclaimer

CryptoDesk AI is not an exchange, custodian, or financial advisor. Trading digital assets involves risk, and you remain fully responsible for your own exchange credentials, portfolio actions, and legal compliance in your jurisdiction.

This alpha should be treated as testing software, not a production trading environment.

---

Built by Ahmed Sami Khedhri with AI-assisted engineering support.
