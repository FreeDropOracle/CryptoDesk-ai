// File: config/limits.ts
// Responsibility: Trading guardrails used as product-level defaults.
// Security: Limits are conservative to reduce blast radius during early releases.

export const TRADING_LIMITS = {
  maxDailyLossPercent: 5,
  maxPositionSizePercent: 20,
  minConfidenceForAutoAlert: 0.75,
  maxOrdersPerMinute: 5
} as const;
