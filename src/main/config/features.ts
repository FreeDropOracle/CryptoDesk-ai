// File: src/main/config/features.ts
// Responsibility: Runtime feature flags for high-risk capabilities.
// Security: Sensitive actions default to disabled and require explicit enablement.

export interface FeatureFlags {
  tradingEnabled: boolean;
  aiAutoExecuteEnabled: boolean;
  canaryReleaseEnabled: boolean;
  simulationModeEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  tradingEnabled: false,
  aiAutoExecuteEnabled: false,
  canaryReleaseEnabled: true,
  simulationModeEnabled: true
};

export const isFeatureEnabled = (
  flags: FeatureFlags,
  feature: keyof FeatureFlags
): boolean => {
  return flags[feature];
};
