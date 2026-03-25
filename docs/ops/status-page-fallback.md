# Status Page Fallback

Until a dedicated status page exists, use these fallback channels to communicate product health.

## Primary Fallback Channels

- GitHub Releases for build health and release notes
- GitHub Issues for known problems and active investigation
- Discord status or announcements channel for real-time user updates
- Email for high-severity incidents affecting the current cohort

## Suggested Manual Status States

- `Operational`
- `Degraded`
- `Partial Outage`
- `Major Outage`

## Manual Status Update Template

```text
Status: {{STATE}}
Affected Scope: {{AFFECTED_SCOPE}}
Started: {{TIMESTAMP}}
Current Guidance: {{GUIDANCE}}
Next Update: {{NEXT_UPDATE}}
```

## When To Use This Fallback

- release links are broken
- launch communications need a temporary health note
- a bug affects onboarding, simulation, AI, or downloads
- the dedicated hosted status page is not available yet

## Future Direction

When the infrastructure is ready, replace this fallback with a dedicated status page and keep GitHub plus Discord as secondary channels.
