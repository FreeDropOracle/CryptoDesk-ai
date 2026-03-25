# Incident Response

## First Response

1. Disable live trading feature flags immediately.
2. Preserve local audit logs and the SQLite database.
3. Ask affected users to revoke exchange API keys from the exchange dashboard.

## Investigation

- Review local audit trail for suspicious settings changes or order attempts.
- Inspect packaged app integrity and recent dependency updates.
- Verify whether sensitive data was exposed in logs or crash reports.

## Recovery

- Rotate local keys and require new API credential entry.
- Patch the vulnerable path and add regression tests.
- Publish updated release notes with a clear impact summary.
