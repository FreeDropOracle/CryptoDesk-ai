# Smoke Test Report — v1.0.0-alpha.1

**Date:** 2026-03-24  
**Tester:** Codex (automated smoke validation)  
**Environment:** Windows, local workspace, Electron 28 runtime

## Scope

This report covers the startup and runtime smoke checks that were validated directly from the local environment after fixing the development workflow.

It does **not** claim full manual UX verification of every page interaction, because this session cannot click through the GUI the way a human tester can.

## Verified Fixes

- `ELECTRON_RUN_AS_NODE` is cleared automatically in the development launcher
- TypeScript path aliases are rewritten for runtime via `tsc-alias`
- `npm run dev` now starts the renderer, TypeScript watchers, and Electron together
- Renderer-wide `ErrorBoundary` is active and `npm run typecheck` passes

## Automated Development Smoke Test

Command path exercised:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npm run dev
```

### Result

- [x] Vite dev server started on `http://localhost:5173`
- [x] Electron development runtime started
- [x] Main-process startup completed successfully
- [x] No immediate application exit after startup
- [x] Secure startup logs reported `Application services initialized`

### Evidence

- Electron dev launcher reported: `Electron dev runtime starting with renderer http://localhost:5173`
- Main process logged successful startup
- Electron processes remained alive during the smoke window

## Built Artifact Smoke Test

Artifact exercised:

```text
dist/release/win-unpacked/CryptoDesk AI.exe
```

### Result

- [x] Built executable launches successfully
- [x] Process remained alive after 10 seconds
- [x] Process responded normally

### Evidence

- Process name: `CryptoDesk AI`
- Process status: `Responding=True`

## Manual Checks Still Recommended

These should still be verified by a human before broad beta distribution:

- [ ] Dashboard or onboarding screen renders correctly
- [ ] Navigation between major pages works
- [ ] Language switching updates the interface correctly
- [ ] ErrorBoundary fallback can be triggered and reloaded manually
- [ ] Tray icon behavior matches expected UX
- [ ] No user-visible console noise blocks normal usage

## Issues Found

| Severity | Description | Status |
|----------|-------------|--------|
| Low | `npm run dev` emitted non-blocking deprecation warnings from dependency tooling | Accepted for alpha |
| Low | Interactive GUI navigation was not validated in this CLI-only smoke session | Manual follow-up recommended |

## Verdict

✅ **PASS (Startup / Packaging Smoke Test)**  

The development workflow now boots correctly, and the built Windows executable stays alive as expected. The application is ready for final human visual checks and GitHub release draft preparation.
