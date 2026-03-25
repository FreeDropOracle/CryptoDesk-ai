// File: src/renderer/hooks/useMarketData.ts
// Responsibility: Bridges preload market subscriptions into the renderer store.
// Security: Uses the typed preload client and writes only validated public market data.

import { useEffect } from 'react';
import type { TickerData } from '@shared/public/market.types';
import type { LocalizedError } from '@shared/public/ui.types';
import { useMarketStore } from '../stores/market-store';
import { useSettingsStore } from '../stores/settings-store';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

interface UseMarketDataResult {
  ticker: TickerData | undefined;
  loading: boolean;
  error: LocalizedError | null;
  lastUpdate: number | null;
}

export const useMarketData = (symbol: string): UseMarketDataResult => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const ticker = useMarketStore((state) => state.getTicker(symbol));
  const subscribe = useMarketStore((state) => state.subscribe);
  const unsubscribe = useMarketStore((state) => state.unsubscribe);
  const updateTicker = useMarketStore((state) => state.updateTicker);
  const setError = useMarketStore((state) => state.setError);
  const clearError = useMarketStore((state) => state.clearError);
  const error = useMarketStore((state) => state.error);
  const lastUpdate = useMarketStore((state) => state.lastUpdate);

  useEffect(() => {
    clearError();
    subscribe(symbol);

    let dispose: (() => void) | null = null;

    try {
      dispose = ipcClient.subscribeToMarket(symbol, (data) => {
        updateTicker(data);
      });
    } catch (subscriptionError) {
      const localized = toLocalizedError(
        ERROR_MESSAGES.MARKET.SUBSCRIBE_STREAM,
        subscriptionError,
        {
          locale
        }
      );
      setError(localized.message);
    }

    return () => {
      dispose?.();
      unsubscribe(symbol);
    };
  }, [symbol, subscribe, unsubscribe, updateTicker, setError, clearError, locale]);

  const localizedMarketError =
    error === null
      ? null
      : {
          ...toLocalizedError(ERROR_MESSAGES.MARKET.SUBSCRIBE_STREAM, undefined, {
            locale
          }),
          message: error
        };

  return {
    ticker,
    loading: ticker === undefined,
    error: localizedMarketError,
    lastUpdate
  };
};
