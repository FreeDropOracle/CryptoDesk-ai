# Threat Model

## Primary Assets

- User exchange API credentials
- Local trading history and audit trail
- Renderer-to-main IPC boundary
- AI recommendation integrity

## Main Threats

1. Renderer compromise through XSS or unsafe navigation
2. Credential disclosure through logs, storage, or memory overexposure
3. Malicious or malformed IPC payloads reaching privileged code
4. Unsafe live trading execution without explicit gates
5. AI worker hangs or resource exhaustion impacting responsiveness

## Mitigations

- `contextIsolation: true`, `sandbox: false`, `nodeIntegration: false`
- Preload remains the only privileged bridge and exposes a strict whitelisted surface to the renderer
- Zod schemas on every invoked IPC channel
- Redacted structured logging
- OS keychain + local AES-256-GCM encryption for sensitive secrets
- Worker-thread AI execution with timeouts
- Feature flags and local settings both required for sensitive operations

## Residual Risks

- A compromised local machine can still observe user actions.
- Live execution is intentionally not wired in this scaffold yet.
- Model quality and market drift remain operational risks outside code hardening.
