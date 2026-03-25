// File: src/main/trading/types.ts
// Responsibility: Internal trading-domain contracts for exchange access and risk checks.
// Security: Keeps credential-bearing types main-process only.

import type { SupportedExchange } from '@shared/public/constants';
import type { MarketData, PortfolioSnapshot } from '@shared/public/market.types';
import type { PublicTradeInput } from '@shared/public/trade.types';

export interface ExchangeCredentials {
  exchange: SupportedExchange;
  clientId: string;
  apiKey: string;
  apiSecret: string;
}

export interface QueuedOrder {
  request: PublicTradeInput;
  submittedAt: string;
}

export interface RiskDecision {
  allowed: boolean;
  reasons: readonly string[];
  estimatedOrderValue: number;
  projectedExposurePercent: number;
}

export interface TradeExecutionContext {
  portfolio: PortfolioSnapshot;
  referencePrice: number;
}

export type ConnectionMode = 'testnet' | 'mainnet';
export type MarketStreamState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'closed';

export interface ExchangeTickerSnapshot {
  symbol?: string;
  last?: number;
  bid?: number;
  ask?: number;
  percentage?: number;
  baseVolume?: number;
  timestamp?: number;
}

export interface ExchangeBalanceSnapshot {
  total?: Record<string, number>;
  free?: Record<string, number>;
  used?: Record<string, number>;
}

export interface ExchangeOrderSnapshot {
  id?: string;
  timestamp?: number;
}

export interface ExchangeClient {
  fetchTicker(symbol: string): Promise<ExchangeTickerSnapshot>;
  fetchBalance(): Promise<ExchangeBalanceSnapshot>;
  createOrder?(
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price?: number
  ): Promise<ExchangeOrderSnapshot>;
  setSandboxMode?(enabled: boolean): void;
}

export type ExchangeClientFactory = new (
  options?: Record<string, unknown>
) => ExchangeClient;

export interface RateLimitQueueOptions {
  requestsPerInterval?: number;
  intervalMs?: number;
}

export interface ExchangeServiceOptions {
  connectionMode?: ConnectionMode;
  requestQueueOptions?: RateLimitQueueOptions;
  clientOverrides?: Partial<Record<SupportedExchange, ExchangeClientFactory>>;
  timeoutMs?: number;
}

export interface WebSocketLike {
  onopen: (() => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onclose: ((event: { code?: number; reason?: string }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  close(): void;
}

export type WebSocketFactory = (url: string) => WebSocketLike;

export interface WebSocketManagerOptions {
  exchange: SupportedExchange;
  connectionMode?: ConnectionMode;
  socketFactory?: WebSocketFactory;
  reconnectDelayMs?: number;
  maxReconnects?: number;
  onMarketData?: (data: MarketData) => void;
  onStateChange?: (state: MarketStreamState) => void;
}

export class ExchangeError extends Error {
  public constructor(
    public readonly code:
      | 'READ_ONLY_MODE'
      | 'PORTFOLIO_FETCH_NOT_IMPLEMENTED_IN_PHASE_2'
      | 'RATE_LIMITED'
      | 'NETWORK_ERROR'
      | 'EXCHANGE_UNAVAILABLE'
      | 'INVALID_RESPONSE'
      | 'UNSUPPORTED_EXCHANGE',
    message: string,
    public readonly retryable: boolean,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'ExchangeError';
  }
}
