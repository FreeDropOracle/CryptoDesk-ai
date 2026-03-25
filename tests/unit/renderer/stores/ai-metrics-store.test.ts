/// <reference path="../../../types/jest-globals.d.ts" />

import { useAIMetricsStore } from '../../../../src/renderer/stores/ai-metrics-store';

describe('useAIMetricsStore', () => {
  beforeEach(() => {
    useAIMetricsStore.getState().reset();
  });

  it('calculates accuracy and filtered rates safely', () => {
    useAIMetricsStore.getState().incrementSignal({
      signalKey: 'signal-1',
      wasAccurate: true,
      wasFiltered: false,
      confidence: 0.8
    });
    useAIMetricsStore.getState().incrementSignal({
      signalKey: 'signal-2',
      wasAccurate: false,
      wasFiltered: false,
      confidence: 0.6
    });
    useAIMetricsStore.getState().incrementSignal({
      signalKey: 'signal-3',
      wasAccurate: true,
      wasFiltered: true,
      confidence: 0.5
    });

    expect(useAIMetricsStore.getState().getAccuracyRate()).toBe(0.5);
    expect(useAIMetricsStore.getState().getFilteredRate()).toBeCloseTo(1 / 3);
    expect(useAIMetricsStore.getState().metrics?.avgConfidence).toBeCloseTo((0.8 + 0.6 + 0.5) / 3);
  });

  it('guards against duplicate feedback and zero division', () => {
    const firstResult = useAIMetricsStore.getState().incrementSignal({
      signalKey: 'same-signal',
      wasAccurate: true,
      wasFiltered: false,
      confidence: 0.7
    });
    const secondResult = useAIMetricsStore.getState().incrementSignal({
      signalKey: 'same-signal',
      wasAccurate: false,
      wasFiltered: false,
      confidence: 0.4
    });

    expect(firstResult).toBe(true);
    expect(secondResult).toBe(false);

    useAIMetricsStore.getState().reset();
    expect(useAIMetricsStore.getState().getAccuracyRate()).toBe(0);
    expect(useAIMetricsStore.getState().getFilteredRate()).toBe(0);
  });
});
