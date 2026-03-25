// File: src/shared/public/market.types.ts
// Responsibility: Public market and portfolio data contracts for the renderer.
// Security: Contains sanitized trading data only; no credentials or internal state.

import type { SupportedExchange } from './constants';

export interface PriceBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  exchange: SupportedExchange;
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  change24h: number;
  volume24h: number;
  timestamp: string;
}

export type TickerData = MarketData;

export interface PortfolioBalance {
  asset: string;
  free: number;
  used: number;
  total: number;
  fiatValue: number;
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
  marketPrice: number;
  unrealizedPnl: number;
}

export interface PortfolioSnapshot {
  exchange: SupportedExchange;
  balances: readonly PortfolioBalance[];
  positions: readonly PortfolioPosition[];
  totalValue: number;
  timestamp: string;
}

export interface PortfolioAssetSnapshot {
  asset: string;
  free: string;
  locked: string;
  usdValue?: number;
}

export interface PortfolioAccountSnapshot {
  exchange: SupportedExchange;
  balances: readonly PortfolioAssetSnapshot[];
  totalUsdValue?: number;
  timestamp: number;
}

interface PortfolioAssetSnapshotInput {
  asset: string;
  free: string;
  locked: string;
  usdValue?: number | undefined;
}

interface PortfolioAccountSnapshotInput {
  exchange: SupportedExchange;
  balances: readonly PortfolioAssetSnapshotInput[];
  totalUsdValue?: number | undefined;
  timestamp: number;
}

export const toPortfolioAccountSnapshot = (
  input: PortfolioAccountSnapshotInput
): PortfolioAccountSnapshot => {
  return {
    exchange: input.exchange,
    balances: input.balances.map((balance) => {
      return {
        asset: balance.asset,
        free: balance.free,
        locked: balance.locked,
        ...(typeof balance.usdValue === 'number' ? { usdValue: balance.usdValue } : {})
      };
    }),
    ...(typeof input.totalUsdValue === 'number' ? { totalUsdValue: input.totalUsdValue } : {}),
    timestamp: input.timestamp
  };
};

export interface PortfolioUpdateEvent {
  type: 'portfolio:update';
  data: PortfolioAccountSnapshot;
}
