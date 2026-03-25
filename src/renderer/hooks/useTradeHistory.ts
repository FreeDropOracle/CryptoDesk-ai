// File: src/renderer/hooks/useTradeHistory.ts
// Responsibility: Loads simulation-only trade history and syncs derived virtual portfolio state.
// Security: Requests simulation history explicitly and never exposes a path to live trade records.

import { useEffect } from 'react';
import type { SupportedExchange } from '@shared/public/constants';
import type { TickerData } from '@shared/public/market.types';
import { useMarketStore } from '../stores/market-store';
import { usePortfolioStore } from '../stores/portfolio-store';
import { useSettingsStore } from '../stores/settings-store';
import { useTradeHistoryStore } from '../stores/trade-history-store';
import { useVirtualPortfolioStore } from '../stores/virtual-portfolio-store';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

interface UseTradeHistoryOptions {
  exchange?: SupportedExchange;
  symbol?: string;
  limit?: number;
}

const buildPriceMap = (tickers: ReadonlyMap<string, TickerData>): ReadonlyMap<string, number> => {
  return new Map(
    Array.from(tickers.entries()).map(([symbol, ticker]) => [symbol, ticker.price] as const)
  );
};

export const useTradeHistory = (
  options: UseTradeHistoryOptions = {}
): {
  refreshHistory(): Promise<void>;
  resetSimulationData(): Promise<void>;
  loading: boolean;
} => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const setTrades = useTradeHistoryStore((state) => state.setTrades);
  const setLoading = useTradeHistoryStore((state) => state.setLoading);
  const setError = useTradeHistoryStore((state) => state.setError);
  const trades = useTradeHistoryStore((state) => state.trades);
  const loading = useTradeHistoryStore((state) => state.loading);
  const resetTradeHistoryStore = useTradeHistoryStore((state) => state.reset);
  const applyTradeHistory = useVirtualPortfolioStore((state) => state.applyTradeHistory);
  const resetVirtualPortfolio = useVirtualPortfolioStore((state) => state.reset);
  const resetLegacySimulation = usePortfolioStore((state) => state.resetSimulation);
  const tickers = useMarketStore((state) => state.tickers);

  const refreshHistory = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const page = await ipcClient.getTradeHistory({
        simulation: true,
        limit: options.limit ?? 100,
        ...(options.exchange !== undefined ? { exchange: options.exchange } : {}),
        ...(options.symbol !== undefined ? { symbol: options.symbol } : {})
      });
      setTrades(page.items);
    } catch (error) {
      setError(
        toLocalizedError(ERROR_MESSAGES.SIMULATION.LOAD_HISTORY, error, {
          locale
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const resetSimulationData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await ipcClient.resetSimulation({
        confirmationCode: 'RESET',
        ...(options.exchange !== undefined ? { exchange: options.exchange } : {})
      });
      resetTradeHistoryStore();
      resetVirtualPortfolio();
      resetLegacySimulation();
    } catch (error) {
      setError(
        toLocalizedError(ERROR_MESSAGES.SIMULATION.RESET_HISTORY, error, {
          locale
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshHistory();
  }, [options.exchange, options.limit, options.symbol, locale]);

  useEffect(() => {
    applyTradeHistory(trades, buildPriceMap(tickers));
  }, [trades, tickers, applyTradeHistory]);

  return {
    refreshHistory,
    resetSimulationData,
    loading
  };
};
