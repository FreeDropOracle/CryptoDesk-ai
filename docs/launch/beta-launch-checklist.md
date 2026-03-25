# Beta Launch Checklist

Use this document as the operational runbook for the first closed beta launch.

## Pre-Launch

- [ ] Final code review completed for the beta branch or release snapshot
- [ ] `docs/security/pre-launch-audit.md` reviewed and signed off
- [ ] Beta intake form finalized and published in its public destination
- [ ] Applicant tracker created and accessible to the core team
- [ ] Acceptance and rejection templates reviewed and ready
- [ ] Beta recruitment posts scheduled across the selected channels
- [ ] Discord or support community prepared before outreach starts

## Build And Distribution

- [ ] Dependencies installed successfully in the target Node 20 environment
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Performance profiling completed against launch targets
- [ ] Production build created successfully
- [ ] Build smoke-tested on the intended operating systems
- [ ] Signing credentials prepared and release configuration reviewed
- [ ] Draft distribution release created and checked by engineering

## Cohort Activation

- [ ] First cohort selected from the applicant tracker
- [ ] Acceptance messages sent with the correct expectations
- [ ] Waitlist and rejection responses sent respectfully
- [ ] Download or installation instructions sent only to accepted users
- [ ] Community invites and onboarding instructions delivered
- [ ] Users asked to begin in simulation workflows first

## Beta Operations

- [ ] Daily triage window assigned for bug reports and user blockers
- [ ] Weekly survey cadence scheduled
- [ ] Feedback tagged by area: onboarding, simulation, AI, performance, translation, trust
- [ ] Critical issues escalated within the agreed response window
- [ ] Changelog updated for every beta fix release
- [ ] Mid-beta review scheduled with product and engineering

## Post-Beta

- [ ] All critical bugs reviewed and dispositioned
- [ ] Retention, satisfaction, and trust signals summarized
- [ ] Public-launch blockers separated from later roadmap items
- [ ] Public launch announcement draft prepared
- [ ] Pricing, support, and distribution assumptions revalidated
- [ ] Beta retrospective completed with clear next actions

## Go / No-Go Questions

- [ ] Is simulation labeling still unmistakable?
- [ ] Are AI disclaimers and filtered-signal explanations clear to testers?
- [ ] Are the onboarding and settings flows stable enough for broader use?
- [ ] Is there any unresolved security or credential-handling blocker?
- [ ] Can support realistically handle the next cohort size?
