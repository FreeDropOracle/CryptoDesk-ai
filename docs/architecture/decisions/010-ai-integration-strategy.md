# ADR-010: Explainable AI Integration Strategy

## Status
Accepted

## Date
2026-03-23

## Context
Phase 3 completed the safe simulation loop. Phase 4 needs to turn AI from a placeholder into a transparent advisory layer without creating false confidence, hidden decision paths, or any route to automatic execution.

The product goal is not "AI that trades for the user". The V1 goal is explainable guidance that the user can inspect, question, and ignore safely.

## Decision
- Phase 4 V1 uses local rule-enriched signals with explainable reasoning.
- Worker-based inference remains off the main thread.
- The signal engine combines worker output with candle-derived indicators such as RSI proxy, volatility, and volume spike ratio.
- Every signal is passed through a dedicated risk filter before it reaches the renderer.
- Filtered signals are shown transparently as downgraded `hold` advisories instead of being hidden.
- Auto-execution remains hard-disabled in V1 even if feature flags are enabled.

## Security Implications
- AI never receives direct access to credential material or exchange execution APIs.
- Advisory output is validated before it crosses the preload boundary.
- The renderer receives explanations, confidence, and filter reasons only.
- User-facing messaging must always state that AI is advisory only.
- Model version metadata is preserved for auditability and future incident review.

## Accuracy Expectations
- V1 targets disciplined, explainable behavior over headline accuracy.
- Confidence is capped conservatively.
- We do not promise unrealistic win rates or guaranteed profitability.

## Consequences

### Positive
- Users get explanations instead of opaque labels.
- Risk policy remains visible because filtered signals are not silently dropped.
- The existing worker/isolation model stays intact.
- Dashboard-level performance metrics can now build trust through explicit user feedback.

### Tradeoffs
- V1 signal quality is intentionally conservative.
- More advanced ML models remain deferred until runtime dependencies are fully validated.

## AI Metrics And Transparency Decision
- Advisory feedback is tracked locally in the renderer as product analytics, not as trading truth.
- Accuracy is calculated from reviewed non-filtered advisories only.
- Filtered advisories are surfaced as protected outcomes and tracked separately.
- Users can reset AI metrics without affecting trading history, settings, or simulation balances.

## Live Alert Stream Decision
- Advisory alerts are streamed through a dedicated IPC subscription channel rather than direct renderer polling alone.
- Every live alert is validated against the same public AI response schema before it reaches the renderer.
- Alert subscriptions are symbol-scoped, confidence-gated, and disposable so they can be cleaned up on unmount or window teardown.
- Duplicate alerts are suppressed per subscription when the effective advisory fingerprint has not changed.
- Live alerts never bypass the human-in-the-loop posture and never trigger execution paths.

## Follow-Up
- Add alert history and trend views once the live advisory stream proves stable at runtime.
- Introduce richer market features only after the data provenance is audited.
- Keep execution paths separate from advisory paths in every future phase.
