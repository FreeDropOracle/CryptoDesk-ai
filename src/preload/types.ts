// File: src/preload/types.ts
// Responsibility: Declares the renderer-facing API exposed by preload.
// Security: Only safe, validated capabilities are available through this bridge.

import type { SupportedExchange } from '@shared/public/constants';
import type {
  AIAlertSubscriptionStatus,
  AISignal
} from '@shared/public/ai.types';
import type { MarketData, PortfolioAccountSnapshot } from '@shared/public/market.types';
import type {
  CancelTradeInput,
  PublicTrade,
  PublicTradeInput,
  ResetSimulationInput,
  SimulationResetResult,
  TradeHistoryPage,
  TradeHistoryQuery
} from '@shared/public/trade.types';
import type {
  DeleteCredentialResult,
  StoredCredentialStatus,
  UserSettings
} from '@shared/public/ui.types';

export interface AIAlertSubscriptionHandle {
  ready: Promise<AIAlertSubscriptionStatus>;
  unsubscribe(): void;
}

export interface CryptoDeskApi {
  subscribeToMarket(symbol: string, callback: (data: MarketData) => void): () => void;
  subscribeToPortfolio(
    exchange: SupportedExchange,
    callback: (data: PortfolioAccountSnapshot) => void
  ): () => void;
  fetchPortfolio(exchange: SupportedExchange): Promise<PortfolioAccountSnapshot>;
  placeOrder(order: PublicTradeInput): Promise<PublicTrade>;
  getAISignals(symbol: string): Promise<readonly AISignal[]>;
  subscribeToAIAlerts(
    symbol: string,
    callback: (signal: AISignal) => void,
    options?: {
      minConfidence?: number;
    }
  ): AIAlertSubscriptionHandle;
  saveApiKey(
    exchange: SupportedExchange,
    keyId: string,
    encryptedKey: string
  ): Promise<{ saved: true; keyId: string; exchange: SupportedExchange }>;
  getApiKeyStatus(
    exchange: SupportedExchange,
    keyId: string
  ): Promise<StoredCredentialStatus>;
  deleteApiKey(
    exchange: SupportedExchange,
    keyId: string,
    confirmationCode: string
  ): Promise<DeleteCredentialResult>;
  cancelOrder(order: CancelTradeInput): Promise<PublicTrade>;
  getTradeHistory(query?: TradeHistoryQuery): Promise<TradeHistoryPage>;
  resetSimulation(input: ResetSimulationInput): Promise<SimulationResetResult>;
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}

declare global {
  interface Window {
    api: CryptoDeskApi;
  }
}

export {};
