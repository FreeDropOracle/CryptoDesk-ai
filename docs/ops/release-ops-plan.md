# Release Ops Plan

## Purpose

Standardize the CryptoDesk AI release process so each version is documented, verifiable, and easy to support.

## Release Workflow

1. Cut a release branch or freeze a release snapshot.
2. Update `CHANGELOG.md` with the target version.
3. Run the full verification stack when the environment is ready.
4. Build release artifacts.
5. Sign artifacts for supported platforms.
6. Prepare GitHub release notes from the release template.
7. Verify checksums, links, and upgrade instructions.
8. Publish the release and distribute the announcement set.

## Versioning Strategy

- `MAJOR`: incompatible or breaking changes
- `MINOR`: backward-compatible feature releases
- `PATCH`: backward-compatible fixes
- pre-release suffixes such as `-alpha`, `-beta`, or `-rc` communicate readiness level

## Release Security Checklist

- [ ] dependencies audited
- [ ] no sensitive information leaked into notes or assets
- [ ] code signing verified where applicable
- [ ] checksums published for distributed binaries
- [ ] support and rollback guidance prepared

## Supporting Docs

- `CHANGELOG.md`
- `.github/RELEASE_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `docs/ops/status-page-fallback.md`
- `docs/launch/launch-day-runbook.md`
