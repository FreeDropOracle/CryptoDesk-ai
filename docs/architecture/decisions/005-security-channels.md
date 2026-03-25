# ADR-005: Security-Sensitive IPC Channel Handling

## Status
Accepted

## Date
2026-03-22

## Context
The first IPC layer already centralizes channel names and payload validation. The remaining high-risk channels still needed explicit policy decisions because they touch either credential lifecycle or trade-state mutation:

- `SECURITY.GET_KEY`
- `SECURITY.DELETE_KEY`
- `TRADE.CANCEL`
- `TRADE.HISTORY`

These channels are sensitive because they can reveal credential state, remove secrets, or mutate locally tracked trading records.

## Decision
We apply four additional rules for security-sensitive IPC handlers:

1. `SECURITY.GET_KEY` returns metadata only.
   The handler may confirm whether a stored credential exists and when it was last updated, but it must never return the encrypted payload or any decrypted secret.

2. `SECURITY.DELETE_KEY` requires explicit textual confirmation.
   The payload must include `confirmationCode: "DELETE"` and the confirmation is validated in preload and again in main.

3. `TRADE.CANCEL` must verify local ownership before mutation.
   In the current single-user desktop architecture, ownership is represented by the local trade ledger. If an order is not present in the repository for the given exchange, cancellation is rejected.

4. `TRADE.HISTORY` must be paginated and capped.
   History requests are limited to a bounded page size and require offset-based pagination semantics to avoid unbounded data extraction from the local database.

## Consequences

### Positive
- Credential state can be surfaced to the UI without leaking secrets.
- Secret deletion now has deliberate user intent built into the contract.
- Trade mutation is tied to locally known orders instead of blind order identifiers.
- History queries are bounded and predictable for both privacy and performance.

### Negative
- Renderer code must now provide explicit confirmation for destructive actions.
- Cancellation behavior is intentionally conservative until live exchange identity and ownership models are added.
- Some channels return metadata instead of raw data, which means consumers must handle richer but narrower responses.

## Security Implications
- Prevents accidental or malicious disclosure of stored credential contents.
- Reduces destructive mistakes by requiring an explicit deletion phrase.
- Makes order cancellation fail closed when the local application cannot prove ownership.
- Limits local data exfiltration by capping history page size.

## Follow-Up
- Add secure retrieval wiring for live exchange credentials in a later phase without exposing secrets to the renderer.
- Replace local ownership checks with stronger account-scoped identity checks once authenticated multi-profile support exists.
- Extend history responses with cursor tokens if offset pagination becomes insufficient.

## Related Documents
- [ADR-003: Keychain Storage Strategy](./003-keychain-strategy.md)
- [ADR-004: IPC Channel Design with Zod Validation](./004-ipc-channel-design.md)
- [Threat Model](../threat-model.md)
