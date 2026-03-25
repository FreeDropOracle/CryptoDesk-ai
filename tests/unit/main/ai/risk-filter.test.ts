import type { AISignal } from '../../../../src/shared/public/ai.types';
import type { SignalEvaluation } from '../../../../src/main/ai/types';
import { AIRiskFilter } from '../../../../src/main/ai/risk-filter';

const createSignal = (overrides: Partial<AISignal> = {}): AISignal => {
  return {
    symbol: 'BTC/USDT',
    action: 'buy',
    confidence: 0.8,
    reasoning: ['Momentum remains constructive.'],
    riskScore: 0.3,
    generatedAt: '2026-03-23T10:00:00.000Z',
    source: 'heuristic',
    modelVersion: 'v1.0.0-rules',
    filtered: false,
    filterReason: null,
    advisory: 'human-in-the-loop',
    ...overrides
  };
};

const createEvaluation = (overrides: Partial<SignalEvaluation> = {}): SignalEvaluation => {
  return {
    signal: createSignal(),
    indicators: {
      rsi14: 52,
      volatility24h: 4,
      volumeSpikeRatio: 1.1,
      priceChangePercent: 1.2
    },
    ...overrides
  };
};

describe('AIRiskFilter', () => {
  const filter = new AIRiskFilter(
    {
      tradingEnabled: false,
      aiAutoExecuteEnabled: false,
      canaryReleaseEnabled: true,
      simulationModeEnabled: true
    },
    {
      maxDailyLossPercent: 5,
      maxPositionSizePercent: 20,
      minConfidenceForAutoAlert: 0.65,
      maxOrdersPerMinute: 5
    }
  );

  it('downgrades low-confidence advisories to hold', () => {
    const result = filter.filter(
      createEvaluation({
        signal: createSignal({
          confidence: 0.4
        })
      })
    );

    expect(result.action).toBe('hold');
    expect(result.filtered).toBe(true);
    expect(result.filterReason).toBe('CONFIDENCE_TOO_LOW');
  });

  it('flags unusually volatile conditions transparently', () => {
    const result = filter.filter(
      createEvaluation({
        indicators: {
          rsi14: 58,
          volatility24h: 16,
          volumeSpikeRatio: 1.4,
          priceChangePercent: 2.8
        }
      })
    );

    expect(result.filtered).toBe(true);
    expect(result.filterReason).toBe('VOLATILITY_TOO_HIGH');
  });
});
