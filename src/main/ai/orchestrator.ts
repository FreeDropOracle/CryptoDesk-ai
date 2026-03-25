// File: src/main/ai/orchestrator.ts
// Responsibility: Runs AI inference in a worker and returns filtered recommendations.
// Security: Enforces worker isolation, timeout handling, and graceful fallback behavior.

import path from 'node:path';
import { Worker } from 'node:worker_threads';
import type { AISignal } from '@shared/public/ai.types';
import type { AppConfig } from '../config/loader';
import { SignalEngine } from './signal-engine';
import { AIRiskFilter } from './risk-filter';
import type {
  AIInferenceRequest,
  InferenceResult,
  WorkerInferenceMessage,
  WorkerInferenceResponse
} from './types';

export class AISignalOrchestrator {
  public constructor(
    private readonly config: AppConfig,
    private readonly signalEngine: SignalEngine,
    private readonly riskFilter: AIRiskFilter
  ) {}

  public async getSignals(request: AIInferenceRequest): Promise<readonly AISignal[]> {
    const inference = await this.runInference(request).catch((error) => {
      return this.buildFallbackInference(error);
    });
    const evaluation = this.signalEngine.generateSignal(request, inference);
    return [this.riskFilter.filter(evaluation)];
  }

  private async runInference(request: AIInferenceRequest): Promise<InferenceResult> {
    const workerPath = path.resolve(__dirname, 'worker', 'inference.worker.js');

    return new Promise<InferenceResult>((resolve, reject) => {
      const worker = new Worker(workerPath);
      const timeout = setTimeout(() => {
        void worker.terminate();
        reject(new Error('AI inference timed out.'));
      }, this.config.aiInferenceTimeoutMs);

      worker.once('message', (response: WorkerInferenceResponse) => {
        clearTimeout(timeout);
        void worker.terminate();

        if (response.ok) {
          resolve(response.result);
          return;
        }

        reject(new Error(response.error));
      });

      worker.once('error', (error) => {
        clearTimeout(timeout);
        void worker.terminate();
        reject(error);
      });

      const payload: WorkerInferenceMessage = {
        modelPath: this.config.aiModelPath,
        request
      };

      worker.postMessage(payload);
    });
  }

  private buildFallbackInference(error: unknown): InferenceResult {
    void error;

    return {
      action: 'hold',
      confidence: 0.52,
      reasoning: ['Local AI worker was unavailable, so the advisory posture downgraded to HOLD.'],
      riskScore: 0.58,
      source: 'heuristic',
      modelVersion: 'v1.0.0-fallback'
    };
  }
}
