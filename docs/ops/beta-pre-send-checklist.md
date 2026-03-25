# Beta Launch - Pre-Send Checklist

**Release:** `v1.0.0-alpha.1`  
**Owner:** Ahmed  
**Goal:** send the first private beta links in under 5 minutes

## 1. Confirm the files exist

- [ ] `dist/release/CryptoDesk AI-1.0.0-alpha.1-win-x64.zip`
- [ ] `dist/release/checksums.txt`
- [ ] release description text is ready
- [ ] GitHub repository is reachable

## 2. Create the GitHub release draft

- [ ] Open: `https://github.com/FreeDropOracle/CryptoDesk-ai/releases/new`
- [ ] Tag: `v1.0.0-alpha.1`
- [ ] Target: `main`
- [ ] Title: `CryptoDesk AI v1.0.0-alpha.1`
- [ ] Paste the final release description
- [ ] Upload:
- [ ] `CryptoDesk AI-1.0.0-alpha.1-win-x64.zip`
- [ ] `checksums.txt`
- [ ] Enable `Set as a pre-release`
- [ ] Click `Save draft`
- [ ] Copy the draft link

## 3. Prepare the tester list

- [ ] Open `docs/ops/beta-testers.md`
- [ ] Confirm 3-5 tester names and contact methods
- [ ] Keep status ready to update after each send

## 4. Send the first messages

- [ ] Paste the invite template
- [ ] Replace `[LINK]` with the draft link
- [ ] Replace `[CHECKSUM]` with the SHA256 value
- [ ] Send to Tester 1
- [ ] Send to Tester 2
- [ ] Send to Tester 3
- [ ] Update `beta-testers.md` after each send

## 5. Do one quick verification

- [ ] Ask one tester to confirm the message arrived
- [ ] If confirmed, continue as planned
- [ ] If not, resend through a second channel

## Plan B

| Issue | Quick fix |
|------|-----------|
| Draft link is wrong | reopen the release draft, save again, copy the fresh link |
| ZIP upload fails | retry the upload from `dist/release/` |
| Tester did not receive the message | resend via email or a different DM channel |
| Critical bug is reported immediately | pause new invites and fix internally first |

## First 7 Days

| Day | Action |
|-----|--------|
| Day 0 | save draft, send invites, update tracker |
| Day 1 | send launch check-in |
| Day 3 | request onboarding and simulation feedback |
| Day 7 | ask for final verdict and prepare go/no-go decision |

---

Execute calmly. Keep notes. Do not rush past the first critical bug.
