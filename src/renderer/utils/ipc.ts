// File: src/renderer/utils/ipc.ts
// Responsibility: Renderer-safe wrapper around the preload bridge.
// Security: All privileged operations must pass through the exposed preload API.

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

interface RendererAIAlertSubscriptionHandle {
  ready: Promise<AIAlertSubscriptionStatus>;
  unsubscribe(): void;
}

interface RendererApi {
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
  ): RendererAIAlertSubscriptionHandle;
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

type RendererWindow = Window & {
  api?: RendererApi;
};

const getApi = (): RendererApi => {
  const api = (window as RendererWindow).api;

  if (api === undefined) {
    throw new Error(
      'Secure preload bridge is unavailable. Start the renderer inside Electron.'
    );
  }

  return api;
};

export const ipcClient = {
  subscribeToMarket(symbol: string, callback: (data: MarketData) => void): () => void {
    return getApi().subscribeToMarket(symbol, callback);
  },

  subscribeToPortfolio(
    exchange: SupportedExchange,
    callback: (data: PortfolioAccountSnapshot) => void
  ): () => void {
    return getApi().subscribeToPortfolio(exchange, callback);
  },

  fetchPortfolio(exchange: SupportedExchange): Promise<PortfolioAccountSnapshot> {
    return getApi().fetchPortfolio(exchange);
  },

  placeOrder(order: PublicTradeInput): Promise<PublicTrade> {
    return getApi().placeOrder(order);
  },

  getAISignals(symbol: string): Promise<readonly AISignal[]> {
    return getApi().getAISignals(symbol);
  },

  subscribeToAIAlerts(
    symbol: string,
    callback: (signal: AISignal) => void,
    options?: {
      minConfidence?: number;
    }
  ): RendererAIAlertSubscriptionHandle {
    return getApi().subscribeToAIAlerts(symbol, callback, options);
  },

  saveApiKey(
    exchange: SupportedExchange,
    keyId: string,
    encryptedKey: string
  ): Promise<{ saved: true; keyId: string; exchange: SupportedExchange }> {
    return getApi().saveApiKey(exchange, keyId, encryptedKey);
  },

  getApiKeyStatus(
    exchange: SupportedExchange,
    keyId: string
  ): Promise<StoredCredentialStatus> {
    return getApi().getApiKeyStatus(exchange, keyId);
  },

  deleteApiKey(
    exchange: SupportedExchange,
    keyId: string,
    confirmationCode: string
  ): Promise<DeleteCredentialResult> {
    return getApi().deleteApiKey(exchange, keyId, confirmationCode);
  },

  cancelOrder(order: CancelTradeInput): Promise<PublicTrade> {
    return getApi().cancelOrder(order);
  },

  getTradeHistory(query?: TradeHistoryQuery): Promise<TradeHistoryPage> {
    return getApi().getTradeHistory(query);
  },

  resetSimulation(input: ResetSimulationInput): Promise<SimulationResetResult> {
    return getApi().resetSimulation(input);
  },

  getSettings(): Promise<UserSettings> {
    return getApi().getSettings();
  },

  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return getApi().updateSettings(settings);
  }
};
