// File: src/main/ai/types.ts
// Responsibility: Internal AI orchestration and worker contracts.
// Security: Keeps model execution metadata out of the renderer boundary.

import type { PriceBar } from '@shared/public/market.types';
import type { AISignal, AISignalAction, AISignalSource } from '@shared/public/ai.types';

export interface AIInferenceRequest {
  symbol: string;
  features: readonly number[];
  candles: readonly PriceBar[];
}

export interface InferenceResult {
  action: AISignalAction;
  confidence: number;
  reasoning: readonly string[];
  riskScore: number;
  source: AISignalSource;
  modelVersion: string;
}

export interface IndicatorSnapshot {
  rsi14: number;
  volatility24h: number;
  volumeSpikeRatio: number;
  priceChangePercent: number;
}

export interface SignalEvaluation {
  signal: AISignal;
  indicators: IndicatorSnapshot;
}

export interface LoadedModel {
  name: string;
  sessionAvailable: boolean;
  infer(features: readonly number[]): Promise<readonly number[]>;
}

export interface WorkerInferenceMessage {
  modelPath: string;
  request: AIInferenceRequest;
}

export type WorkerInferenceResponse =
  | {
      ok: true;
      result: InferenceResult;
    }
  | {
      ok: false;
      error: string;
    };
