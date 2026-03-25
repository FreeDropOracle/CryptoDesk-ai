// File: src/renderer/stores/ai-metrics-store.ts
// Responsibility: Tracks transparent advisory-AI performance metrics from explicit user feedback.
// Security: Stores renderer-safe analytics only and never affects execution policy or privileged APIs.

import { create } from 'zustand';

export interface AIMetrics {
  totalSignals: number;
  accurateSignals: number;
  filteredSignals: number;
  reviewedSignals: number;
  accuracyRate: number;
  avgConfidence: number;
  lastUpdated: number;
}

interface IncrementSignalInput {
  signalKey?: string;
  wasAccurate: boolean;
  wasFiltered: boolean;
  confidence: number;
}

interface AIMetricsStore {
  metrics: AIMetrics | null;
  loading: boolean;
  reviewedSignalKeys: readonly string[];
  setLoading(loading: boolean): void;
  updateMetrics(metrics: Partial<AIMetrics>): void;
  incrementSignal(input: IncrementSignalInput): boolean;
  reset(): void;
  getAccuracyRate(): number;
  getFilteredRate(): number;
  hasTrackedSignal(signalKey: string): boolean;
}

const createInitialMetrics = (): AIMetrics => {
  return {
    totalSignals: 0,
    accurateSignals: 0,
    filteredSignals: 0,
    reviewedSignals: 0,
    accuracyRate: 0,
    avgConfidence: 0,
    lastUpdated: 0
  };
};

const clampConfidence = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 1);
};

export const useAIMetricsStore = create<AIMetricsStore>((set, get) => ({
  metrics: null,
  loading: false,
  reviewedSignalKeys: [],
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  updateMetrics: (metrics: Partial<AIMetrics>) => {
    const baseMetrics = get().metrics ?? createInitialMetrics();
    const nextMetrics: AIMetrics = {
      ...baseMetrics,
      ...metrics,
      lastUpdated: Date.now()
    };

    set({
      metrics: nextMetrics,
      loading: false
    });
  },
  incrementSignal: (input: IncrementSignalInput): boolean => {
    const signalKey = input.signalKey?.trim();

    if (signalKey !== undefined && signalKey.length > 0 && get().reviewedSignalKeys.includes(signalKey)) {
      return false;
    }

    const currentMetrics = get().metrics ?? createInitialMetrics();
    const nextTotalSignals = currentMetrics.totalSignals + 1;
    const nextFilteredSignals =
      currentMetrics.filteredSignals + (input.wasFiltered ? 1 : 0);
    const nextReviewedSignals =
      currentMetrics.reviewedSignals + (input.wasFiltered ? 0 : 1);
    const nextAccurateSignals =
      currentMetrics.accurateSignals + (!input.wasFiltered && input.wasAccurate ? 1 : 0);
    const nextAvgConfidence =
      (currentMetrics.avgConfidence * currentMetrics.totalSignals +
        clampConfidence(input.confidence)) /
      nextTotalSignals;
    const nextMetrics: AIMetrics = {
      totalSignals: nextTotalSignals,
      accurateSignals: nextAccurateSignals,
      filteredSignals: nextFilteredSignals,
      reviewedSignals: nextReviewedSignals,
      accuracyRate:
        nextReviewedSignals > 0 ? nextAccurateSignals / nextReviewedSignals : 0,
      avgConfidence: nextAvgConfidence,
      lastUpdated: Date.now()
    };

    set((state) => ({
      metrics: nextMetrics,
      loading: false,
      reviewedSignalKeys:
        signalKey === undefined || signalKey.length === 0
          ? state.reviewedSignalKeys
          : [...state.reviewedSignalKeys, signalKey]
    }));

    return true;
  },
  reset: () => {
    set({
      metrics: null,
      loading: false,
      reviewedSignalKeys: []
    });
  },
  getAccuracyRate: () => {
    return get().metrics?.accuracyRate ?? 0;
  },
  getFilteredRate: () => {
    const metrics = get().metrics;

    if (metrics === null || metrics.totalSignals === 0) {
      return 0;
    }

    return metrics.filteredSignals / metrics.totalSignals;
  },
  hasTrackedSignal: (signalKey: string) => {
    const normalizedKey = signalKey.trim();
    return normalizedKey.length > 0 && get().reviewedSignalKeys.includes(normalizedKey);
  }
}));
