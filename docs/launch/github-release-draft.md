# GitHub Release Draft Guide

This guide documents the manual steps required to create the `v1.0.0-alpha.1` GitHub release draft for `CryptoDesk AI`.

## Release Metadata

- Tag: `v1.0.0-alpha.1`
- Title: `CryptoDesk AI v1.0.0-alpha.1`
- Target branch: `main`
- Mark as pre-release: `Yes`
- Publish immediately: `No`, save as draft first

## Release Assets

Upload the following files from `dist/release/`:

- `CryptoDesk AI-1.0.0-alpha.1-win-x64.zip`
- `RELEASE_NOTES.md`
- `checksums.txt`

## Manual Steps

1. Open `https://github.com/FreeDropOracle/cryptodesk-ai/releases/new`
2. Set tag version to `v1.0.0-alpha.1`
3. Choose `main` as the target branch
4. Set the release title to `CryptoDesk AI v1.0.0-alpha.1`
5. Copy the contents of `dist/release/RELEASE_NOTES.md` into the description
6. Upload the three release assets listed above
7. Check `This is a pre-release`
8. Click `Save draft`

## Recommended Validation Before Publish

- Extract the zip on a clean Windows machine
- Launch `CryptoDesk AI.exe`
- Verify the window, icon, onboarding flow, and core navigation load correctly
- Confirm no critical errors appear during first launch

## Current Alpha Notes

- This release is unsigned, so Windows may display an `Unknown Publisher` prompt
- The release artifact is a zip package, not an installer
- Auto-update metadata is not included for this alpha release
