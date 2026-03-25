# Windows Build Guide

This document captures the currently working Windows packaging flow for `CryptoDesk AI`.

## Recommended Runtime

- Node `20.11.0 LTS`
- npm `10.x`
- Visual Studio Build Tools with `Desktop development with C++`

## Current Working Output

For `v1.0.0-alpha.1`, the recommended Windows artifact is a `zip` package:

```powershell
npm run build:win
```

This produces:

- `dist/release/win-unpacked/`
- `dist/release/CryptoDesk AI-<version>-win-x64.zip`

The `win-unpacked` directory can be launched directly for validation, and the zip artifact is suitable for closed alpha or beta distribution.

## Why Zip Is the Default for Alpha

The project previously attempted a `portable` target to avoid code-signing blockers. That removed the original `winCodeSign` extraction failure, but the environment still hit an `NSIS` compiler mmap error during final portable packaging.

Because of that, `zip` is currently the stable Windows packaging target for local alpha builds.

## Experimental Portable Build

If you want to retry a single-file portable executable on a different machine or CI runner:

```powershell
npm run build:win:portable
```

Use this only after verifying the target environment can run `makensis` without mmap or privilege issues.

## Local Node 20 Fallback

If the machine still defaults to a newer incompatible global Node version, use the project-local runtime:

```powershell
$localNodeDir = (Resolve-Path '.\.tools\node-v20.11.0-win-x64').Path
$env:Path = "$localNodeDir;$env:Path"
& "$localNodeDir\node.exe" "$localNodeDir\node_modules\npm\bin\npm-cli.js" run build:win
```

## Development Runtime Troubleshooting

If Electron opens and then exits immediately in PowerShell, check whether this shell variable is set:

```powershell
$env:ELECTRON_RUN_AS_NODE
```

If it returns `1`, Electron will behave like plain Node.js and the app will fail during startup.

Clear it before manual Electron launch:

```powershell
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
```

The `npm run dev` workflow already clears this variable automatically through `scripts/dev/start-electron.cjs`.

## Known Limitation

- Windows executable signing is intentionally deferred for alpha builds.
- `signAndEditExecutable` is disabled in the current Windows build config to avoid environment-specific signing and resource-editing blockers.
- Re-enable signing and executable editing before public release once the signing toolchain is stable.
