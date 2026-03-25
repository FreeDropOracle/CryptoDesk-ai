// File: src/main/ai/worker/model-loader.ts
// Responsibility: Loads the local model or safely falls back to heuristics.
// Security: Model execution stays local; missing models never trigger remote fetches.

import { access } from 'node:fs/promises';
import { InferenceSession } from 'onnxruntime-node';
import type { LoadedModel } from '../types';

const clamp = (value: number): number => {
  return Math.min(Math.max(value, 0), 1);
};

const heuristicScores = (features: readonly number[]): readonly number[] => {
  const trend = features[0] ?? 0.5;
  const momentum = features[1] ?? 0.5;
  const volatility = features[2] ?? 0.5;
  const buy = clamp((trend + momentum) / 2 - volatility * 0.2);
  const sell = clamp((1 - trend + volatility) / 2);
  const hold = clamp(1 - Math.abs(buy - sell));

  return [buy, sell, hold];
};

export const loadModel = async (modelPath: string): Promise<LoadedModel> => {
  try {
    await access(modelPath);
    await InferenceSession.create(modelPath);

    return {
      name: 'default-signal-v1',
      sessionAvailable: true,
      infer: async (features: readonly number[]): Promise<readonly number[]> => {
        // TODO: Replace heuristic fallback with real ONNX tensor preparation and output parsing.
        return heuristicScores(features);
      }
    };
  } catch {
    return {
      name: 'heuristic-fallback',
      sessionAvailable: false,
      infer: async (features: readonly number[]): Promise<readonly number[]> => {
        // TODO: Load a packaged baseline model once one is approved for local inference.
        return heuristicScores(features);
      }
    };
  }
};
