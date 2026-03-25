// File: src/shared/public/trade.types.ts
// Responsibility: Public trade and AI recommendation contracts exposed to the renderer.
// Security: Only includes renderer-safe trade metadata and sanitized AI outputs.

import type {
  SupportedExchange,
  SupportedOrderSide,
  SupportedOrderType
} from './constants';
import type {
  AISignal as SharedAISignal,
  AISignalAction,
  AISignalSource
} from './ai.types';
import type { MarketData as SharedMarketData } from './market.types';

export type TradeStatus =
  | 'pending'
  | 'queued'
  | 'submitted'
  | 'filled'
  | 'rejected'
  | 'cancelled'
  | 'failed';

export type SignalAction = AISignalAction;
export type SignalSource = AISignalSource;

export interface PublicTrade {
  id: string;
  exchange: SupportedExchange;
  symbol: string;
  side: SupportedOrderSide;
  type: SupportedOrderType;
  quantity: number;
  price?: number;
  status: TradeStatus;
  simulation: boolean;
  timestamp: string;
  clientOrderId?: string;
}

export interface PublicTradeInput {
  exchange: SupportedExchange;
  symbol: string;
  side: SupportedOrderSide;
  type: SupportedOrderType;
  quantity: number;
  price?: number;
  simulation?: boolean;
  clientOrderId?: string;
}

export interface CancelTradeInput {
  exchange: SupportedExchange;
  orderId: string;
  symbol?: string;
}

export interface TradeHistoryQuery {
  exchange?: SupportedExchange;
  symbol?: string;
  simulation?: boolean;
  limit?: number;
  offset?: number;
}

export interface TradeHistoryPage {
  items: readonly PublicTrade[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ResetSimulationInput {
  exchange?: SupportedExchange;
  confirmationCode: string;
}

export interface SimulationResetResult {
  cleared: number;
  resetAt: string;
  simulationOnly: true;
  exchange?: SupportedExchange;
}

export type AISignal = SharedAISignal;

export type MarketData = SharedMarketData;
