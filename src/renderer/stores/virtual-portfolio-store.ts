// File: src/renderer/stores/virtual-portfolio-store.ts
// Responsibility: Derives virtual holdings and performance metrics from simulation trades.
// Security: Uses renderer-safe trade history only and never mutates privileged state directly.

import { create } from 'zustand';
import type { PublicTrade } from '@shared/public/trade.types';

export interface VirtualAsset {
  symbol: string;
  asset: string;
  amount: string;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

interface VirtualPositionAccumulator {
  symbol: string;
  asset: string;
  quantity: number;
  avgBuyPrice: number;
}

interface VirtualPortfolioState {
  balance: { USDT: string };
  assets: readonly VirtualAsset[];
  totalPnl: number;
  realizedPnl: number;
  totalValue: number;
  winRate: number;
  tradeCount: number;
  applyTradeHistory(
    trades: readonly PublicTrade[],
    currentPrices?: ReadonlyMap<string, number>
  ): void;
  updateFromTrade(trade: PublicTrade, currentPrices?: ReadonlyMap<string, number>): void;
  calculatePnl(currentPrices: ReadonlyMap<string, number>): void;
  reset(): void;
  getTotalValue(): number;
  getAsset(symbol: string): VirtualAsset | undefined;
}

interface VirtualPortfolioComputation {
  balance: { USDT: string };
  assets: readonly VirtualAsset[];
  totalPnl: number;
  realizedPnl: number;
  totalValue: number;
  winRate: number;
  tradeCount: number;
  ledger: readonly PublicTrade[];
}

const STARTING_SIMULATION_BALANCE = 10_000;

const createInitialPortfolioState = (): VirtualPortfolioComputation => {
  return {
    balance: { USDT: STARTING_SIMULATION_BALANCE.toFixed(2) },
    assets: [],
    totalPnl: 0,
    realizedPnl: 0,
    totalValue: STARTING_SIMULATION_BALANCE,
    winRate: 0,
    tradeCount: 0,
    ledger: []
  };
};

const parseBaseAsset = (symbol: string): string => {
  const [baseAsset] = symbol.split('/');
  return baseAsset ?? symbol;
};

const roundMetric = (value: number): number => {
  return Number(value.toFixed(2));
};

const computeVirtualPortfolio = (
  trades: readonly PublicTrade[],
  currentPrices: ReadonlyMap<string, number> = new Map<string, number>()
): VirtualPortfolioComputation => {
  const sortedTrades = [...trades]
    .filter((trade) => trade.simulation)
    .sort((left, right) => {
      return new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
    });
  const positions = new Map<string, VirtualPositionAccumulator>();
  let cashBalance = STARTING_SIMULATION_BALANCE;
  let realizedPnl = 0;
  let winningSells = 0;
  let closedSells = 0;

  for (const trade of sortedTrades) {
    const price = typeof trade.price === 'number' ? trade.price : 0;

    if (price <= 0) {
      continue;
    }

    const tradeValue = trade.quantity * price;
    const position = positions.get(trade.symbol) ?? {
      symbol: trade.symbol,
      asset: parseBaseAsset(trade.symbol),
      quantity: 0,
      avgBuyPrice: 0
    };

    if (trade.side === 'buy') {
      const nextQuantity = position.quantity + trade.quantity;
      const nextCostBasis = position.quantity * position.avgBuyPrice + tradeValue;

      cashBalance -= tradeValue;
      position.quantity = nextQuantity;
      position.avgBuyPrice = nextQuantity > 0 ? nextCostBasis / nextQuantity : 0;
      positions.set(trade.symbol, position);
      continue;
    }

    const soldQuantity = Math.min(position.quantity, trade.quantity);

    if (soldQuantity <= 0) {
      continue;
    }

    cashBalance += soldQuantity * price;
    const tradePnl = (price - position.avgBuyPrice) * soldQuantity;
    realizedPnl += tradePnl;
    closedSells += 1;

    if (tradePnl > 0) {
      winningSells += 1;
    }

    position.quantity = Math.max(position.quantity - soldQuantity, 0);

    if (position.quantity === 0) {
      positions.delete(trade.symbol);
    } else {
      positions.set(trade.symbol, position);
    }
  }

  const assets = Array.from(positions.values())
    .filter((position) => position.quantity > 0)
    .sort((left, right) => left.symbol.localeCompare(right.symbol))
    .map((position) => {
      const currentPrice = currentPrices.get(position.symbol) ?? position.avgBuyPrice;
      const currentValue = position.quantity * currentPrice;
      const unrealizedPnl = (currentPrice - position.avgBuyPrice) * position.quantity;
      const costBasis = position.avgBuyPrice * position.quantity;

      return {
        symbol: position.symbol,
        asset: position.asset,
        amount: position.quantity.toFixed(8),
        avgBuyPrice: roundMetric(position.avgBuyPrice),
        currentPrice: roundMetric(currentPrice),
        currentValue: roundMetric(currentValue),
        pnl: roundMetric(unrealizedPnl),
        pnlPercent: costBasis > 0 ? roundMetric((unrealizedPnl / costBasis) * 100) : 0
      } satisfies VirtualAsset;
    });

  const unrealizedPnl = assets.reduce((sum, asset) => sum + asset.pnl, 0);
  const totalValue = roundMetric(cashBalance + assets.reduce((sum, asset) => sum + asset.currentValue, 0));
  const totalPnl = roundMetric(realizedPnl + unrealizedPnl);

  return {
    balance: { USDT: roundMetric(cashBalance).toFixed(2) },
    assets,
    totalPnl,
    realizedPnl: roundMetric(realizedPnl),
    totalValue,
    winRate: closedSells > 0 ? roundMetric((winningSells / closedSells) * 100) : 0,
    tradeCount: sortedTrades.length,
    ledger: sortedTrades
  };
};

export const useVirtualPortfolioStore = create<
  VirtualPortfolioState & { ledger: readonly PublicTrade[] }
>((set, get) => ({
  ...createInitialPortfolioState(),
  applyTradeHistory: (
    trades: readonly PublicTrade[],
    currentPrices: ReadonlyMap<string, number> = new Map<string, number>()
  ) => {
    set({
      ...computeVirtualPortfolio(trades, currentPrices)
    });
  },
  updateFromTrade: (
    trade: PublicTrade,
    currentPrices: ReadonlyMap<string, number> = new Map<string, number>()
  ) => {
    const nextLedger = [trade, ...get().ledger.filter((existingTrade) => existingTrade.id !== trade.id)];

    set({
      ...computeVirtualPortfolio(nextLedger, currentPrices)
    });
  },
  calculatePnl: (currentPrices: ReadonlyMap<string, number>) => {
    set({
      ...computeVirtualPortfolio(get().ledger, currentPrices)
    });
  },
  reset: () => {
    set({
      ...createInitialPortfolioState()
    });
  },
  getTotalValue: () => {
    return get().totalValue;
  },
  getAsset: (symbol: string) => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    return get().assets.find((asset) => asset.symbol.toUpperCase() === normalizedSymbol);
  }
}));
