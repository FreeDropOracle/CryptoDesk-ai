/// <reference path="../../../types/jest-globals.d.ts" />

import type { AISignal } from '../../../../src/shared/public/ai.types';
import {
  getAISignalKey,
  mergeAISignals,
  normalizeAISignals
} from '../../../../src/renderer/hooks/useAISignals';

const buildSignal = (overrides: Partial<AISignal> = {}): AISignal => {
  return {
    symbol: 'BTC/USDT',
    action: 'buy',
    confidence: 0.8,
    reasoning: ['Bullish momentum remains intact.'],
    riskScore: 0.35,
    generatedAt: '2026-03-23T12:00:00.000Z',
    source: 'heuristic',
    modelVersion: 'v1.0.0-rules',
    filtered: false,
    filterReason: null,
    advisory: 'human-in-the-loop',
    ...overrides
  };
};

describe('useAISignals helpers', () => {
  it('builds stable signal keys from symbol and timestamp', () => {
    expect(getAISignalKey(buildSignal())).toBe('BTC/USDT-2026-03-23T12:00:00.000Z');
  });

  it('normalizes signals by removing duplicates and sorting by recency', () => {
    const normalized = normalizeAISignals([
      buildSignal({
        generatedAt: '2026-03-23T11:58:00.000Z',
        action: 'hold'
      }),
      buildSignal({
        generatedAt: '2026-03-23T12:01:00.000Z',
        action: 'sell'
      }),
      buildSignal({
        generatedAt: '2026-03-23T12:01:00.000Z',
        action: 'sell'
      })
    ]);

    expect(normalized).toHaveLength(2);
    expect(normalized[0]?.action).toBe('sell');
  });

  it('merges incoming live alerts without duplicating existing entries', () => {
    const merged = mergeAISignals(
      [
        buildSignal({
          generatedAt: '2026-03-23T12:00:00.000Z',
          action: 'hold'
        })
      ],
      buildSignal({
        generatedAt: '2026-03-23T12:02:00.000Z',
        action: 'buy'
      })
    );

    expect(merged).toHaveLength(2);
    expect(merged[0]?.action).toBe('buy');
  });
});
