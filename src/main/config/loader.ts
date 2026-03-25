// File: src/main/config/loader.ts
// Responsibility: Loads and validates runtime configuration for the main process.
// Security: Enforces safe defaults for trading, logging, and AI execution.

import path from 'node:path';
import { app } from 'electron';
import { z } from 'zod';
import { APP_NAME } from '@shared/public/constants';
import { DEFAULT_FEATURE_FLAGS, type FeatureFlags } from './features';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface TradingLimits {
  maxDailyLossPercent: number;
  maxPositionSizePercent: number;
  minConfidenceForAutoAlert: number;
  maxOrdersPerMinute: number;
}

export interface AppConfig {
  appName: string;
  env: AppEnvironment;
  version: string;
  dataDirectory: string;
  databasePath: string;
  rendererIndexPath: string;
  rendererDevUrl?: string;
  aiModelPath: string;
  aiInferenceTimeoutMs: number;
  aiConfidenceThreshold: number;
  keychainServiceName: string;
  logSensitiveData: boolean;
  featureFlags: FeatureFlags;
  tradingLimits: TradingLimits;
}

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  APP_VERSION: z.string().min(1).default('1.0.0-alpha.1'),
  AI_MODEL_PATH: z.string().min(1).default('./assets/models/default-signal-v1.onnx'),
  AI_INFERENCE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  AI_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.65),
  KEYCHAIN_SERVICE_NAME: z.string().min(1).default('cryptodesk-ai'),
  LOG_SENSITIVE_DATA: z.coerce.boolean().default(false),
  MAX_DAILY_LOSS_PERCENT: z.coerce.number().positive().default(5),
  MAX_POSITION_SIZE_PERCENT: z.coerce.number().positive().default(20),
  MIN_CONFIDENCE_FOR_AUTO_ALERT: z.coerce.number().min(0).max(1).default(0.75),
  ENABLE_TRADING: z.coerce.boolean().default(false),
  ENABLE_AI_AUTO_EXECUTE: z.coerce.boolean().default(false),
  ENABLE_CANARY_RELEASE: z.coerce.boolean().default(true),
  VITE_DEV_SERVER_URL: z.string().url().optional()
});

const resolveUserDataDirectory = (): string => {
  if (app.isReady()) {
    return app.getPath('userData');
  }

  return path.resolve(process.cwd(), '.cryptodesk-ai');
};

export const loadAppConfig = (overrides?: Partial<NodeJS.ProcessEnv>): AppConfig => {
  const parsed = envSchema.parse({
    ...process.env,
    ...overrides
  });
  const dataDirectory = resolveUserDataDirectory();
  const featureFlags: FeatureFlags = {
    ...DEFAULT_FEATURE_FLAGS,
    tradingEnabled: parsed.ENABLE_TRADING,
    aiAutoExecuteEnabled: parsed.ENABLE_AI_AUTO_EXECUTE,
    canaryReleaseEnabled: parsed.ENABLE_CANARY_RELEASE
  };

  return {
    appName: APP_NAME,
    env: parsed.APP_ENV as AppEnvironment,
    version: parsed.APP_VERSION,
    dataDirectory,
    databasePath: path.join(dataDirectory, 'data', 'cryptodesk.db'),
    rendererIndexPath: path.resolve(process.cwd(), 'dist', 'renderer', 'index.html'),
    aiModelPath: path.resolve(process.cwd(), parsed.AI_MODEL_PATH),
    aiInferenceTimeoutMs: parsed.AI_INFERENCE_TIMEOUT_MS,
    aiConfidenceThreshold: parsed.AI_CONFIDENCE_THRESHOLD,
    keychainServiceName: parsed.KEYCHAIN_SERVICE_NAME,
    logSensitiveData: parsed.LOG_SENSITIVE_DATA,
    featureFlags,
    tradingLimits: {
      maxDailyLossPercent: parsed.MAX_DAILY_LOSS_PERCENT,
      maxPositionSizePercent: parsed.MAX_POSITION_SIZE_PERCENT,
      minConfidenceForAutoAlert: parsed.MIN_CONFIDENCE_FOR_AUTO_ALERT,
      maxOrdersPerMinute: 5
    },
    ...(parsed.VITE_DEV_SERVER_URL !== undefined
      ? { rendererDevUrl: parsed.VITE_DEV_SERVER_URL }
      : {})
  };
};
