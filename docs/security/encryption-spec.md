# Encryption Specification

## Goal

Protect user-provided exchange credentials without sending them to any remote service.

## Design

- Data encryption algorithm: `AES-256-GCM`
- Master key size: 32 bytes
- IV size: 12 bytes
- Integrity: authenticated tag from GCM

## Key Handling

1. Generate a random master key locally on first use.
2. Store the master key in the OS keychain.
3. When available, wrap the stored master key with Electron `safeStorage`.
4. Encrypt user secrets before persisting them to the keychain record.

## Non-Goals

- No server-side custody
- No browser storage fallback for credentials
- No plaintext secrets in logs
