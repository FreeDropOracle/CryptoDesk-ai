// File: src/main/ai/risk-filter.ts
// Responsibility: Applies product and risk-policy filters to AI recommendations.
// Security: Downgrades risky signals transparently and keeps auto-execution disabled in V1.

import type { AIFilterReason, AISignal } from '@shared/public/ai.types';
import type { FeatureFlags } from '../config/features';
import type { TradingLimits } from '../config/loader';
import type { SignalEvaluation } from './types';

const VOLATILITY_FILTER_THRESHOLD = 12;
const ABNORMAL_MOVE_THRESHOLD = 9;

export class AIRiskFilter {
  public constructor(
    private readonly featureFlags: FeatureFlags,
    private readonly limits: TradingLimits
  ) {}

  public filter(evaluation: SignalEvaluation): AISignal {
    const signal = evaluation.signal;

    if (signal.confidence < this.limits.minConfidenceForAutoAlert) {
      return this.downgradeSignal(
        signal,
        'CONFIDENCE_TOO_LOW',
        `Risk filter downgraded the advisory because confidence is below ${Math.round(
          this.limits.minConfidenceForAutoAlert * 100
        )}%.`
      );
    }

    if (evaluation.indicators.volatility24h > VOLATILITY_FILTER_THRESHOLD) {
      return this.downgradeSignal(
        signal,
        'VOLATILITY_TOO_HIGH',
        'Risk filter downgraded the advisory because volatility is above policy limits.'
      );
    }

    if (Math.abs(evaluation.indicators.priceChangePercent) > ABNORMAL_MOVE_THRESHOLD) {
      return this.downgradeSignal(
        signal,
        'ABNORMAL_PRICE_SWING',
        'Risk filter downgraded the advisory because the recent price swing is unusually large.'
      );
    }

    return signal;
  }

  public canAutoExecute(signal: AISignal): boolean {
    const policyWouldAllow =
      this.featureFlags.tradingEnabled &&
      this.featureFlags.aiAutoExecuteEnabled &&
      signal.confidence >= 0.9;

    return policyWouldAllow && false;
  }

  private downgradeSignal(
    signal: AISignal,
    filterReason: AIFilterReason,
    explanation: string
  ): AISignal {
    return {
      ...signal,
      action: 'hold',
      filtered: true,
      filterReason,
      reasoning: [...signal.reasoning, explanation]
    };
  }
}
