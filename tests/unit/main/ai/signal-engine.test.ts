import type { AIInferenceRequest, InferenceResult } from '../../../../src/main/ai/types';
import { SignalEngine } from '../../../../src/main/ai/signal-engine';

const buildRequest = (
  closes: readonly number[],
  volumes: readonly number[] = closes.map(() => 100)
): AIInferenceRequest => {
  return {
    symbol: 'BTC/USDT',
    features: [0.62, 0.58, 0.31],
    candles: closes.map((close, index) => ({
      timestamp: new Date(Date.UTC(2026, 2, 23, 10, index)).toISOString(),
      open: close + 1,
      high: close + 2,
      low: close - 2,
      close,
      volume: volumes[index] ?? 100
    }))
  };
};

const buildInference = (overrides: Partial<InferenceResult> = {}): InferenceResult => {
  return {
    action: 'buy',
    confidence: 0.7,
    reasoning: ['Local heuristic baseline detected directional pressure.'],
    riskScore: 0.35,
    source: 'heuristic',
    modelVersion: 'v1.0.0-rules',
    ...overrides
  };
};

describe('SignalEngine', () => {
  it('downgrades low-confidence outputs to hold', () => {
    const engine = new SignalEngine(0.65);
    const evaluation = engine.generateSignal(
      buildRequest([100, 100.5, 101, 100.8, 100.6, 100.5]),
      buildInference({
        confidence: 0.4
      })
    );

    expect(evaluation.signal.action).toBe('hold');
    expect(
      evaluation.signal.reasoning.some((reason) => reason.includes('advisory threshold'))
    ).toBe(true);
  });

  it('adds explainable oversold reasoning to a bullish advisory', () => {
    const engine = new SignalEngine(0.65);
    const evaluation = engine.generateSignal(
      buildRequest([100, 98, 96, 95, 94, 93, 92, 91, 90, 89], [100, 100, 110, 120, 130, 140, 150, 160, 180, 260]),
      buildInference({
        action: 'buy',
        confidence: 0.74,
        source: 'onnx'
      })
    );

    expect(evaluation.signal.action).toBe('buy');
    expect(
      evaluation.signal.reasoning.some((reason) => reason.includes('oversold'))
    ).toBe(true);
    expect(evaluation.signal.modelVersion).toBe('v1.0.0-rules');
  });
});
