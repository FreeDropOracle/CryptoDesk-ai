// File: src/renderer/stores/portfolio-store.ts
// Responsibility: Tracks local recent trades, simulation balance, and renderer-safe portfolio previews.
// Security: Stores sanitized public snapshots only and never touches IPC directly.

import { create } from 'zustand';
import type { PortfolioAccountSnapshot } from '@shared/public/market.types';
import type { PublicTrade } from '@shared/public/trade.types';

const BALANCE_PATTERN = /^\d+(\.\d+)?$/;

const isValidPortfolioSnapshot = (snapshot: PortfolioAccountSnapshot): boolean => {
  return (
    snapshot.exchange.trim().length > 0 &&
    Number.isInteger(snapshot.timestamp) &&
    snapshot.timestamp > 0 &&
    snapshot.balances.every((balance) => {
      const usdValueIsValid =
        balance.usdValue === undefined ||
        (Number.isFinite(balance.usdValue) && balance.usdValue >= 0);

      return (
        balance.asset.trim().length > 0 &&
        BALANCE_PATTERN.test(balance.free) &&
        BALANCE_PATTERN.test(balance.locked) &&
        usdValueIsValid
      );
    })
  );
};

interface PortfolioState {
  snapshot: PortfolioAccountSnapshot | null;
  loading: boolean;
  error: string | null;
  notice: string | null;
  simulationBalance: number;
  recentTrades: readonly PublicTrade[];
  setSnapshot(snapshot: PortfolioAccountSnapshot): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setNotice(notice: string | null): void;
  resetPreview(): void;
  getTotalUsdValue(): number;
  getAssetBalance(asset: string): string | undefined;
  addTrade(trade: PublicTrade): void;
  resetSimulation(): void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  snapshot: null,
  loading: false,
  error: null,
  notice: null,
  simulationBalance: 10000,
  recentTrades: [],
  setSnapshot: (snapshot: PortfolioAccountSnapshot) => {
    if (!isValidPortfolioSnapshot(snapshot)) {
      set({
        error: 'Invalid portfolio preview was ignored.',
        loading: false
      });
      return;
    }

    set({
      snapshot,
      loading: false,
      error: null
    });
  },
  setLoading: (loading: boolean) => {
    set({ loading });
  },
  setError: (error: string | null) => {
    set({ error, loading: false });
  },
  setNotice: (notice: string | null) => {
    set({ notice });
  },
  resetPreview: () => {
    set({
      snapshot: null,
      loading: false,
      error: null,
      notice: null
    });
  },
  getTotalUsdValue: () => {
    const snapshot = get().snapshot;

    if (snapshot === null) {
      return 0;
    }

    if (typeof snapshot.totalUsdValue === 'number') {
      return snapshot.totalUsdValue;
    }

    return snapshot.balances.reduce((sum, balance) => {
      return sum + (balance.usdValue ?? 0);
    }, 0);
  },
  getAssetBalance: (asset: string) => {
    const normalizedAsset = asset.trim().toUpperCase();
    return get().snapshot?.balances.find((balance) => balance.asset.toUpperCase() === normalizedAsset)
      ?.free;
  },
  addTrade: (trade: PublicTrade) => {
    const tradeValue = trade.quantity * (trade.price ?? 0);
    const balanceDelta = trade.side === 'buy' ? -tradeValue : tradeValue;

    set((state) => ({
      simulationBalance: trade.simulation
        ? state.simulationBalance + balanceDelta
        : state.simulationBalance,
      recentTrades: [trade, ...state.recentTrades].slice(0, 25)
    }));
  },
  resetSimulation: () => {
    set({
      simulationBalance: 10000,
      recentTrades: []
    });
  }
}));
