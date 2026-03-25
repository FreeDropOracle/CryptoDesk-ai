# CryptoDesk AI Beta FAQ

## What is CryptoDesk AI?

CryptoDesk AI is a desktop application for non-custodial crypto trading workflows. It combines read-only market data, simulation trading, and explainable AI recommendations inside a security-first Electron architecture.

## Does CryptoDesk AI hold my funds?

No. The product is designed as non-custodial. Exchange credentials are intended to stay on the user's machine and be stored locally through encrypted, OS-level secure storage paths.

## Does the current beta execute live trades?

No. The current release track is simulation-first. Live trading remains intentionally disabled until runtime validation, dependency verification, signing, and additional release hardening are complete.

## What does "simulation mode" mean?

Simulation mode lets you practice order entry, review trade history, and evaluate AI-assisted workflows without touching a real exchange balance. Virtual balances and simulation history are kept separate from read-only exchange preview data.

## Are AI signals automatic trading commands?

No. AI signals are advisory-only. They are designed to explain why the system is leaning `buy`, `sell`, or `hold`, but the user remains in control. Risk filtering may downgrade a risky advisory to `hold` transparently.

## Why do some AI signals become `hold`?

This happens when the risk filter detects conditions such as low confidence, elevated volatility, or other protective triggers. The product shows that downgrade on purpose so the user can understand what happened.

## Can I use the product in Arabic?

Yes. The renderer now supports both English and Arabic. Arabic mode also switches key parts of the interface into RTL layout.

## Why is portfolio preview read-only?

That is intentional in the current release track. Read-only preview lets us validate exchange connectivity and renderer-safe balance display without opening a live execution path.

## Where are my API keys stored?

They are designed to remain local to the machine and go through secure main-process storage flows. They should never be stored in the renderer, browser storage, or any remote custody service.

## What should beta testers focus on?

- onboarding clarity
- simulation vs live-trading understanding
- AI explanation quality
- confusing error states
- language quality in English and Arabic
- stability during repeated refreshes and alerts

## Is this ready for public launch?

The architecture and UX are close, but a few final release steps remain: full dependency installation in the target environment, complete test execution, performance profiling, code signing, and beta distribution rehearsal.

## What environment is recommended for developers?

Node `20.11.x` is the recommended target. On Windows PowerShell, `npm.cmd` is preferred when execution policy blocks `npm.ps1`.
