# CryptoDesk AI

CryptoDesk AI is a security-first Electron desktop application for non-custodial crypto trading, simulation-first execution, and explainable AI advisory workflows.

The project is currently positioned for a controlled beta launch. Core product phases are implemented, the renderer boundary is hardened, and live trading remains intentionally gated until full dependency installation, signing, and runtime verification are complete.

## What Ships Today

- Non-custodial credential handling with local encryption and OS keychain storage
- Strict TypeScript boundaries across `main`, `preload`, `renderer`, and shared contracts
- Read-only market and portfolio preview flows through validated IPC
- Simulation trading with fat-finger confirmation and isolated virtual balances
- Explainable AI signals with transparent risk filtering, metrics, and live advisory alerts
- Bilingual UX support for English and Arabic, including RTL shell behavior for Arabic

## Security Model

- Renderer code has no direct Node.js, filesystem, or credential access
- All privileged actions cross preload through typed, validated IPC channels
- Secrets are never intended for logs, local storage, or server-side custody
- AI remains advisory-only in this release track
- Live trading stays disabled by default until release hardening is finished

## Current Product Status

- Phase 1: Foundation and security hardening completed
- Phase 2: Read-only connection engine completed
- Phase 3: Simulation trading workspace completed
- Phase 4: Explainable AI and alerting completed
- Phase 5: UX polish and launch preparation largely completed

## Launch Readiness Snapshot

Completed now:

- Bilingual error messages across critical renderer flows
- Onboarding wizard with required risk acknowledgment
- Contextual tooltips in key trading and settings surfaces
- Pre-launch audit checklist and closed beta plan
- Signing placeholders in packaging configuration

Still pending full release hardening:

- Performance profiling under real runtime load
- Production code signing
- Auto-update publication metadata
- macOS and Linux distributable artifacts

## Development Quick Start

Recommended environment:

- Node `20.11.0 LTS`
- npm `10.x`
- Windows: Visual Studio Build Tools with `Desktop development with C++` for native modules
- Windows users should prefer `npm.cmd` in PowerShell if execution policy blocks `npm.ps1`

Prerequisites:

- Node.js `20.11.0 LTS` is required for stable native module support
- npm `9+`
- Windows users need Visual Studio Build Tools before rebuilding `better-sqlite3`, `keytar`, or Electron native artifacts

Basic workflow:

1. Install dependencies with `npm install`.
2. Review `.env.example` and set local development values in `.env`.
3. Run `npm run typecheck`.
4. Run `npm test`.
5. Start the project with `npm run dev`.

Windows packaging for the current alpha track:

1. Run `npm run build:win`.
2. Use the generated zip artifact in `dist/release/` for tester distribution.
3. Use `dist/release/win-unpacked/` for local smoke validation.

The single-file portable target remains available as an experimental fallback, but the stable local Windows build path is currently the zip package described in `docs/development/build-windows.md`.

## Downloads

| Platform | Version | Link |
|----------|---------|------|
| Windows x64 | 1.0.0-alpha.1 | [Download ZIP](https://github.com/FreeDropOracle/cryptodesk-ai/releases/tag/v1.0.0-alpha.1) |

Alpha release notes:

- unsigned alpha build for testing and feedback
- simulation-first and advisory-only workflow
- start with onboarding and simulation mode before any exchange connectivity

## Offline-First Verification

When native modules or network access are blocked, use the partial TypeScript verification workflow:

```powershell
.\.tscheck-tools\node_modules\.bin\tsc.cmd --project tsconfig.check.json --noEmit
```

This verifies the Electron security boundary, preload bridge, shared contracts, and key renderer-safe modules before the full dependency graph is available.

See `docs/development/offline-first-workflow.md` for the full process.

## Internationalization

CryptoDesk AI includes bilingual support for English and Arabic in the navigation shell, onboarding flow, settings, tooltips, and user-facing error states.

- Language is controlled by `settings.locale`
- Arabic automatically switches the UI shell to RTL layout
- Translation definitions live in `src/renderer/utils/i18n.ts`
- RTL presentation rules live in `src/renderer/styles/rtl.css`

## Key Project Documents

- `CHANGELOG.md`
- `docs/security/pre-launch-audit.md`
- `docs/launch/beta-testing-plan.md`
- `docs/launch/faq.md`
- `docs/launch/beta-intake-form.md`
- `docs/launch/selection-criteria.md`
- `docs/launch/acceptance-email.md`
- `docs/launch/rejection-email.md`
- `docs/launch/applicant-tracker.md`
- `docs/launch/beta-recruitment-posts.md`
- `docs/launch/beta-launch-checklist.md`
- `docs/launch/discord-server-setup.md`
- `docs/launch/bug-report-template.md`
- `docs/launch/weekly-survey.md`
- `docs/launch/beta-metrics-dashboard.md`
- `docs/launch/crisis-communication-plan.md`
- `docs/launch/video-demo-script.md`
- `docs/launch/pre-recording-checklist.md`
- `docs/launch/social-cutdowns.md`
- `docs/launch/video-demo-plan.md`
- `docs/launch/public-launch-announcement.md`
- `docs/launch/platform-variants.md`
- `docs/launch/press-kit.md`
- `docs/launch/email-sequence.md`
- `docs/launch/launch-day-runbook.md`
- `docs/launch/launch-signoff.md`
- `docs/launch/public-announcement-plan.md`
- `.github/RELEASE_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `docs/ops/status-page-fallback.md`
- `docs/ops/release-ops-plan.md`
- `docs/ops/smoke-test-report.md`
- `docs/development/build-windows.md`
- `docs/architecture/decisions/010-ai-integration-strategy.md`

## Watch Demo

The beta marketing stack now includes a planned walkthrough video package:

- full script in `docs/launch/video-demo-script.md`
- recording prep in `docs/launch/pre-recording-checklist.md`
- short-form edits in `docs/launch/social-cutdowns.md`
- distribution plan in `docs/launch/video-demo-plan.md`

Public placeholder links:

- Demo: `https://cryptodesk.ai/demo`
- Beta signup: `https://cryptodesk.ai/beta`

## Launch Announcements

The public-facing launch stack is now documented as well:

- master launch copy in `docs/launch/public-launch-announcement.md`
- channel variants in `docs/launch/platform-variants.md`
- press assets checklist in `docs/launch/press-kit.md`
- lifecycle emails in `docs/launch/email-sequence.md`
- day-of execution in `docs/launch/launch-day-runbook.md`
- coordination notes in `docs/launch/public-announcement-plan.md`

## Release Process

The release operations layer is now documented too:

- GitHub release notes template in `.github/RELEASE_TEMPLATE.md`
- issue intake templates in `.github/ISSUE_TEMPLATE/bug_report.md` and `.github/ISSUE_TEMPLATE/feature_request.md`
- temporary service-health fallback in `docs/ops/status-page-fallback.md`
- release workflow and SemVer guidance in `docs/ops/release-ops-plan.md`

## Beta Positioning

This repository is ready for documentation-led beta preparation and architecture review today.

The beta program should focus on:

- onboarding clarity
- simulation vs live-trading understanding
- AI trust and explanation quality
- stability under real user interaction

The beta program should not market the current build as live auto-trading software.

## Important Release Note

`v1.0.0-alpha.1` now has a packaged Windows x64 build for controlled beta distribution. It should still be treated as alpha software:

- Windows may display an `Unknown Publisher` warning because code signing is not enabled yet
- the primary distribution artifact is a zip package, not an installer
- simulation-first usage remains the recommended path for new testers
