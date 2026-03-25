// File: src/renderer/hooks/useAISignals.ts
// Responsibility: Fetches advisory AI signals for a symbol through the secure preload bridge.
// Security: Receives sanitized, renderer-safe recommendations only and treats them as non-executable advice.

import { useEffect, useState } from 'react';
import {
  DEFAULT_AI_ALERT_MIN_CONFIDENCE,
  type AISignal
} from '@shared/public/ai.types';
import type { LocalizedError } from '@shared/public/ui.types';
import { useSettingsStore } from '../stores/settings-store';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

const MAX_VISIBLE_SIGNALS = 6;

const getTimestampValue = (value: string): number => {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getAISignalKey = (signal: Pick<AISignal, 'symbol' | 'generatedAt'>): string => {
  return `${signal.symbol}-${signal.generatedAt}`;
};

export const normalizeAISignals = (
  signals: readonly AISignal[],
  limit = MAX_VISIBLE_SIGNALS
): readonly AISignal[] => {
  const uniqueSignals = new Map<string, AISignal>();

  for (const signal of signals) {
    uniqueSignals.set(getAISignalKey(signal), signal);
  }

  return [...uniqueSignals.values()]
    .sort((left, right) => getTimestampValue(right.generatedAt) - getTimestampValue(left.generatedAt))
    .slice(0, limit);
};

export const mergeAISignals = (
  signals: readonly AISignal[],
  incomingSignal: AISignal,
  limit = MAX_VISIBLE_SIGNALS
): readonly AISignal[] => {
  return normalizeAISignals([incomingSignal, ...signals], limit);
};

export const useAISignals = (symbol: string) => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const [signals, setSignals] = useState<readonly AISignal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<LocalizedError | null>(null);
  const [streamConnected, setStreamConnected] = useState<boolean>(false);
  const [lastAlertAt, setLastAlertAt] = useState<string | null>(null);

  const refreshSignals = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const nextSignals = await ipcClient.getAISignals(symbol);
      setSignals(normalizeAISignals(nextSignals));
    } catch (refreshError) {
      setError(
        toLocalizedError(ERROR_MESSAGES.AI.LOAD_SIGNALS, refreshError, {
          locale
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshSignals();
  }, [symbol, locale]);

  useEffect(() => {
    let cancelled = false;
    const subscription = ipcClient.subscribeToAIAlerts(
      symbol,
      (incomingSignal) => {
        setSignals((currentSignals) => mergeAISignals(currentSignals, incomingSignal));
        setLastAlertAt(incomingSignal.generatedAt);
      },
      {
        minConfidence: DEFAULT_AI_ALERT_MIN_CONFIDENCE
      }
    );

    void subscription.ready
      .then(() => {
        if (!cancelled) {
          setStreamConnected(true);
        }
      })
      .catch((subscriptionError) => {
        if (!cancelled) {
          setStreamConnected(false);
          setError(
            toLocalizedError(ERROR_MESSAGES.AI.ALERT_STREAM, subscriptionError, {
              locale
            })
          );
        }
      });

    return () => {
      cancelled = true;
      setStreamConnected(false);
      subscription.unsubscribe();
    };
  }, [symbol, locale]);

  return {
    signals,
    loading,
    error,
    refreshSignals,
    streamConnected,
    lastAlertAt
  };
};
