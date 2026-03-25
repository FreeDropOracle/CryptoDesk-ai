// File: src/renderer/stores/trade-history-store.ts
// Responsibility: Holds renderer-safe simulation history query results and loading state.
// Security: Stores only sanitized public trade metadata returned through preload.

import { create } from 'zustand';
import type { PublicTrade } from '@shared/public/trade.types';
import type { LocalizedError } from '@shared/public/ui.types';

interface TradeHistoryState {
  trades: readonly PublicTrade[];
  loading: boolean;
  error: LocalizedError | null;
  lastSyncedAt: number | null;
  setTrades(trades: readonly PublicTrade[]): void;
  setLoading(loading: boolean): void;
  setError(error: LocalizedError | null): void;
  reset(): void;
}

export const useTradeHistoryStore = create<TradeHistoryState>((set) => ({
  trades: [],
  loading: false,
  error: null,
  lastSyncedAt: null,
  setTrades: (trades: readonly PublicTrade[]) => {
    set({
      trades,
      error: null,
      loading: false,
      lastSyncedAt: Date.now()
    });
  },
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  setError: (error: LocalizedError | null) => {
    set({
      error,
      loading: false
    });
  },
  reset: () => {
    set({
      trades: [],
      loading: false,
      error: null,
      lastSyncedAt: null
    });
  }
}));
