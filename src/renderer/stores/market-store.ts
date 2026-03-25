// File: src/renderer/stores/market-store.ts
// Responsibility: Holds renderer-safe market state without touching IPC directly.
// Security: Accepts only sanitized public market data and never stores credentials.

import { create } from 'zustand';
import type { TickerData } from '@shared/public/market.types';

const isValidTickerData = (data: TickerData): boolean => {
  return (
    data.symbol.trim().length > 0 &&
    Number.isFinite(data.price) &&
    data.price > 0 &&
    Number.isFinite(data.bid) &&
    Number.isFinite(data.ask) &&
    Number.isFinite(data.change24h) &&
    Number.isFinite(data.volume24h) &&
    data.timestamp.trim().length > 0
  );
};

interface MarketState {
  tickers: ReadonlyMap<string, TickerData>;
  subscriptions: ReadonlySet<string>;
  lastUpdate: number | null;
  error: string | null;
  subscribe(symbol: string): void;
  unsubscribe(symbol: string): void;
  updateTicker(data: TickerData): void;
  setError(message: string | null): void;
  clearError(): void;
  getTicker(symbol: string): TickerData | undefined;
  getAllTickers(): readonly TickerData[];
  reset(): void;
}

const initialTickers = new Map<string, TickerData>();
const initialSubscriptions = new Set<string>();

export const useMarketStore = create<MarketState>((set, get) => ({
  tickers: initialTickers,
  subscriptions: initialSubscriptions,
  lastUpdate: null,
  error: null,
  subscribe: (symbol: string) => {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (normalizedSymbol.length === 0) {
      return;
    }

    set((state) => {
      const nextSubscriptions = new Set(state.subscriptions);
      nextSubscriptions.add(normalizedSymbol);

      return {
        subscriptions: nextSubscriptions
      };
    });
  },
  unsubscribe: (symbol: string) => {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (normalizedSymbol.length === 0) {
      return;
    }

    set((state) => {
      const nextSubscriptions = new Set(state.subscriptions);
      nextSubscriptions.delete(normalizedSymbol);

      return {
        subscriptions: nextSubscriptions
      };
    });
  },
  updateTicker: (data: TickerData) => {
    if (!isValidTickerData(data)) {
      set({
        error: 'Invalid market data was ignored.'
      });
      return;
    }

    set((state) => {
      const nextTickers = new Map(state.tickers);
      nextTickers.set(data.symbol, data);

      return {
        tickers: nextTickers,
        lastUpdate: Date.now(),
        error: null
      };
    });
  },
  setError: (message: string | null) => {
    set({
      error: message
    });
  },
  clearError: () => {
    set({
      error: null
    });
  },
  getTicker: (symbol: string) => {
    return get().tickers.get(symbol.trim().toUpperCase());
  },
  getAllTickers: () => {
    return Array.from(get().tickers.values());
  },
  reset: () => {
    set({
      tickers: new Map<string, TickerData>(),
      subscriptions: new Set<string>(),
      lastUpdate: null,
      error: null
    });
  }
}));
