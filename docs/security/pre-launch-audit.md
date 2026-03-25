# Pre-Launch Security Audit

## Scope
This checklist is the final security gate before any public beta or wider launch activity.

## Code Review
- [ ] No `any` types in security-critical paths (`main`, `preload`, encryption, keychain, IPC validation).
- [ ] All IPC invoke channels are validated with Zod before use.
- [ ] Renderer has no direct Node.js or filesystem access.
- [ ] No raw `console.log` statements remain in production paths.
- [ ] Error messages shown to users are actionable and do not expose stack traces.

## Secret Handling
- [ ] Exchange credentials are stored only through OS keychain integration.
- [ ] Decrypted credential material is never written to logs, renderer stores, or persistent plaintext files.
- [ ] Encryption serialization/deserialization paths are covered by tests.
- [ ] Key deletion paths require explicit confirmation phrases.

## Runtime Hardening
- [ ] `contextIsolation` is enabled.
- [ ] `nodeIntegration` is disabled in all renderer windows.
- [ ] Preload exposes only whitelisted, validated capabilities.
- [ ] AI inference runs off the main thread.
- [ ] Live trading remains disabled until credential wiring, runtime validation, and signing are complete.

## Packaging And Distribution
- [ ] Code signing secrets are injected through environment variables, never committed.
- [ ] Windows signing and macOS notarization variables are documented for release operators.
- [ ] GitHub release publishing remains `draft` until launch approval.
- [ ] Auto-update flow is tested against signed builds only.

## Dependency Review
- [ ] `package.json` uses pinned versions for critical dependencies.
- [ ] Lockfile is generated from a trusted environment.
- [ ] `npm audit` or equivalent returns no unresolved critical vulnerabilities.
- [ ] Native dependencies are rebuilt and tested on release-target platforms.

## Product Guardrails
- [ ] Onboarding presents risk acknowledgment and simulation-first guidance.
- [ ] AI surfaces remain advisory-only with explicit disclaimers.
- [ ] Filtered AI signals are shown transparently, not silently dropped.
- [ ] Simulation data is clearly labeled and cannot be confused with real account state.

## Launch Readiness Sign-Off
- [ ] Security review completed by engineering.
- [ ] Release checklist reviewed by product and operations.
- [ ] Beta program support channels are ready.
- [ ] Incident response contacts are current.
