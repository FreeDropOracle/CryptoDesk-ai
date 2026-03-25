// File: src/main/ai/worker/inference.worker.ts
// Responsibility: Executes AI inference off the main thread.
// Security: Keeps model work isolated and returns only structured signal data.

import { parentPort } from 'node:worker_threads';
import { loadModel } from './model-loader';
import type { LoadedModel, WorkerInferenceMessage, WorkerInferenceResponse } from '../types';
import type { AISignalAction } from '@shared/public/ai.types';

const getMaxScore = (scores: readonly number[]): number => {
  return scores.reduce((max, score) => (score > max ? score : max), 0);
};

const resolveAction = (scores: readonly number[]): AISignalAction => {
  const buyScore = scores[0] ?? 0;
  const sellScore = scores[1] ?? 0;
  const holdScore = scores[2] ?? 0;

  if (buyScore >= sellScore && buyScore >= holdScore) {
    return 'buy';
  }

  if (sellScore >= buyScore && sellScore >= holdScore) {
    return 'sell';
  }

  return 'hold';
};

let cachedModelPromise: Promise<LoadedModel> | null = null;

if (parentPort !== null) {
  const activeParentPort = parentPort;

  activeParentPort.on('message', async (message: WorkerInferenceMessage) => {
    try {
      if (cachedModelPromise === null) {
        cachedModelPromise = loadModel(message.modelPath);
      }

      const model = await cachedModelPromise;
      const scores = await model.infer(message.request.features);
      const confidence = getMaxScore(scores);
      const action = resolveAction(scores);
      const response: WorkerInferenceResponse = {
        ok: true,
        result: {
          action,
          confidence,
          reasoning: [
            model.sessionAvailable
              ? 'Local ONNX inference completed successfully.'
              : 'Packaged heuristic fallback executed successfully.'
          ],
          riskScore: 1 - confidence,
          source: model.sessionAvailable ? 'onnx' : 'heuristic',
          modelVersion: model.name
        }
      };

      activeParentPort.postMessage(response);
    } catch (error) {
      const response: WorkerInferenceResponse = {
        ok: false,
        error: error instanceof Error ? error.message : 'Inference worker failed.'
      };

      activeParentPort.postMessage(response);
    }
  });
}
