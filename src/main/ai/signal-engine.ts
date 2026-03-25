// File: src/main/ai/signal-engine.ts
// Responsibility: Produces explainable advisory AI signals from local inference plus candle-derived indicators.
// Security: Normalizes weak outputs to HOLD and never emits opaque, execution-ready instructions.

import type { AISignal, AISignalAction } from '@shared/public/ai.types';
import type {
  AIInferenceRequest,
  IndicatorSnapshot,
  InferenceResult,
  SignalEvaluation
} from './types';

const clamp = (value: number, minimum = 0, maximum = 1): number => {
  return Math.min(Math.max(value, minimum), maximum);
};

const average = (values: readonly number[]): number => {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const calculateRSIProxy = (closes: readonly number[]): number => {
  if (closes.length < 2) {
    return 50;
  }

  let gains = 0;
  let losses = 0;

  for (let index = 1; index < closes.length; index += 1) {
    const previous = closes[index - 1];
    const current = closes[index];

    if (previous === undefined || current === undefined) {
      continue;
    }

    const change = current - previous;

    if (change >= 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  if (losses === 0) {
    return 70;
  }

  const relativeStrength = gains / losses;
  return clamp(100 - 100 / (1 + relativeStrength), 0, 100);
};

const calculateVolatilityPercent = (closes: readonly number[]): number => {
  if (closes.length < 2) {
    return 0;
  }

  const returns: number[] = [];

  for (let index = 1; index < closes.length; index += 1) {
    const previous = closes[index - 1];
    const current = closes[index];

    if (previous === undefined || current === undefined || previous <= 0) {
      continue;
    }

    returns.push(((current - previous) / previous) * 100);
  }

  const mean = average(returns);
  const variance = average(
    returns.map((value) => {
      return (value - mean) ** 2;
    })
  );

  return Math.sqrt(variance);
};

const buildIndicatorSnapshot = (request: AIInferenceRequest): IndicatorSnapshot => {
  const closes = request.candles.map((candle) => candle.close);
  const volumes = request.candles.map((candle) => candle.volume);
  const firstClose = closes[0];
  const latestClose = closes[closes.length - 1];
  const previousVolumes = volumes.slice(0, Math.max(volumes.length - 1, 0));
  const latestVolume = volumes[volumes.length - 1] ?? 0;
  const averageVolume = average(previousVolumes);

  return {
    rsi14: calculateRSIProxy(closes),
    volatility24h: calculateVolatilityPercent(closes),
    volumeSpikeRatio: averageVolume > 0 ? latestVolume / averageVolume : 1,
    priceChangePercent:
      firstClose !== undefined && latestClose !== undefined && firstClose > 0
        ? ((latestClose - firstClose) / firstClose) * 100
        : 0
  };
};

const mergeRuleAction = (
  currentAction: AISignalAction,
  preferredAction: AISignalAction
): AISignalAction => {
  return currentAction === 'hold' ? preferredAction : currentAction;
};

export class SignalEngine {
  public constructor(private readonly confidenceThreshold: number) {}

  public generateSignal(
    request: AIInferenceRequest,
    inference: InferenceResult
  ): SignalEvaluation {
    const indicators = buildIndicatorSnapshot(request);
    const reasoning = [...inference.reasoning];
    let action = inference.action;
    let confidence = inference.confidence;

    if (indicators.rsi14 <= 35) {
      reasoning.push('RSI proxy suggests oversold conditions.');
      action = mergeRuleAction(action, 'buy');
      confidence += 0.12;
    } else if (indicators.rsi14 >= 65) {
      reasoning.push('RSI proxy suggests overbought conditions.');
      action = mergeRuleAction(action, 'sell');
      confidence += 0.12;
    }

    if (indicators.volumeSpikeRatio >= 1.25) {
      reasoning.push('Volume is trading above its recent average.');
      confidence += 0.08;
    }

    if (indicators.priceChangePercent >= 2.5) {
      reasoning.push('Short-term price momentum remains positive.');
      action = mergeRuleAction(action, 'buy');
      confidence += 0.05;
    } else if (indicators.priceChangePercent <= -2.5) {
      reasoning.push('Short-term price momentum remains negative.');
      action = mergeRuleAction(action, 'sell');
      confidence += 0.05;
    }

    if (indicators.volatility24h >= 8) {
      reasoning.push('Elevated volatility suggests extra caution.');
    }

    confidence = clamp(confidence, 0.05, 0.95);

    if (confidence < this.confidenceThreshold) {
      reasoning.push(
        `Confidence stayed below the advisory threshold (${Math.round(
          this.confidenceThreshold * 100
        )}%).`
      );
      action = 'hold';
    }

    if (reasoning.length === 0) {
      reasoning.push('The model remains neutral, so the advisory posture stays HOLD.');
    }

    const riskScore = clamp((inference.riskScore + indicators.volatility24h / 20) / 2);
    const signal: AISignal = {
      symbol: request.symbol,
      action,
      confidence,
      reasoning,
      riskScore,
      generatedAt: new Date().toISOString(),
      source: inference.source,
      modelVersion: inference.modelVersion,
      filtered: false,
      filterReason: null,
      advisory: 'human-in-the-loop'
    };

    return {
      signal,
      indicators
    };
  }
}
