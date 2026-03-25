// File: src/shared/public/ai.types.ts
// Responsibility: Public AI recommendation contracts shared across main, preload, and renderer.
// Security: Exposes advisory metadata only and never includes privileged execution controls.

export const AI_SIGNAL_ACTIONS = ['buy', 'sell', 'hold'] as const;
export type AISignalAction = (typeof AI_SIGNAL_ACTIONS)[number];

export const AI_SIGNAL_SOURCES = ['heuristic', 'onnx'] as const;
export type AISignalSource = (typeof AI_SIGNAL_SOURCES)[number];

export const AI_FILTER_REASONS = [
  'CONFIDENCE_TOO_LOW',
  'VOLATILITY_TOO_HIGH',
  'ABNORMAL_PRICE_SWING'
] as const;
export type AIFilterReason = (typeof AI_FILTER_REASONS)[number];

export const AI_ADVISORY_MODES = ['human-in-the-loop'] as const;
export type AIAdvisoryMode = (typeof AI_ADVISORY_MODES)[number];

export const DEFAULT_AI_ALERT_MIN_CONFIDENCE = 0.65;

export interface AISignal {
  symbol: string;
  action: AISignalAction;
  confidence: number;
  reasoning: readonly string[];
  riskScore: number;
  generatedAt: string;
  source: AISignalSource;
  modelVersion: string;
  filtered: boolean;
  filterReason: AIFilterReason | null;
  advisory: AIAdvisoryMode;
}

export interface AIAlertSubscriptionInput {
  symbol: string;
  minConfidence?: number;
}

export interface AIAlertSubscriptionStatus {
  subscriptionId: string;
  symbol: string;
  minConfidence: number;
  subscribed: boolean;
}

export const AI_ADVISORY_MESSAGE =
  'AI recommendations are advisory only. Always review the market context yourself.';
