# ADR-004: IPC Channel Design with Zod Validation

## Status
Accepted

## Date
2026-03-22

## Context
CryptoDesk AI uses Electron, which means the renderer and the main process sit on opposite sides of a trust boundary. The renderer must never be allowed to call privileged code with unchecked payloads, especially in a financial application where malformed requests could trigger unsafe trading, credential misuse, or confusing audit trails.

We also need one consistent source of truth for:
- Channel names shared across preload and main
- Validation rules for every invoke payload
- Types inferred from those validation rules
- Tests that prove invalid input is rejected before privileged execution

## Decision
We separate IPC concerns into two shared internal modules:

1. `src/shared/internal/ipc.channels.ts`
Defines canonical channel names only.

2. `src/shared/internal/ipc.schemas.ts`
Defines Zod schemas and inferred request types for every invoke payload.

Preload validates outbound payloads before `ipcRenderer.invoke`, and the main process validates inbound payloads again before handling them. This gives us defense in depth at both sides of the bridge.

## Consequences

### Positive
- Every privileged channel is explicit and reviewable.
- Renderer payloads fail fast before crossing the boundary.
- Main-process handlers fail closed on malformed input.
- Request types stay synchronized with runtime validation through `z.infer`.
- Auditing stays cleaner because invalid requests are normalized early.

### Negative
- Each new channel now requires both a constant and a schema.
- Schema drift must be managed carefully when contracts evolve.
- Some duplication exists because both preload and main validate the same payload.

## Security Implications
- Reduces the blast radius of renderer compromise by rejecting malformed IPC messages.
- Prevents accidental widening of trusted payload shapes over time.
- Makes it harder for XSS-style renderer issues to escalate into privileged operations.
- Creates a clearer review surface for trading, settings, AI, and credential channels.

## Implementation Rules
- Every new invoke channel must be added to `ipc.channels.ts`.
- Every invoke payload must have a schema in `ipc.schemas.ts`.
- Preload must validate before invoking.
- Main must validate again before execution.
- Unit tests must cover at least one valid and one invalid payload per sensitive channel family.

## Related Documents
- [ADR-001: Electron Choice](./001-electron-choice.md)
- [ADR-003: Keychain Storage Strategy](./003-keychain-strategy.md)
- [Threat Model](../threat-model.md)
- [IPC API Reference](../../api/ipc-channels.md)
