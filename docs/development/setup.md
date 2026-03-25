# Development Setup

CryptoDesk AI targets a stable Electron and native-module workflow on Node `20.11.0 LTS`.

## Requirements

- Node.js `20.11.0 LTS`
- npm `9+`
- Windows: Visual Studio Build Tools with `Desktop development with C++`

## Recommended Flow

1. Use Node `20.11.0` from `.nvmrc`.
2. Install dependencies with `npm install`.
3. Run `npm run typecheck`.
4. Run `npm test`.
5. Rebuild native modules when needed:

```powershell
npm rebuild better-sqlite3 keytar electron
```

## Notes

- PowerShell users should prefer `npm.cmd` if execution policy blocks `npm.ps1`.
- If system Node cannot be downgraded immediately, a project-local Node `20.11.0` runtime can be used temporarily for rebuild and test verification.
