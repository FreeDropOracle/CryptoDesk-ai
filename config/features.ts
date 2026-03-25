// File: config/features.ts
// Responsibility: Static feature defaults for documentation and operational review.
// Security: Sensitive capabilities default to disabled until explicitly enabled.

export const FEATURE_FLAGS = {
  tradingEnabled: false,
  aiAutoExecuteEnabled: false,
  canaryReleaseEnabled: true,
  simulationModeEnabled: true
} as const;
