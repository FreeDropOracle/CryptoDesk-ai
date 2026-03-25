// File: src/preload/index.ts
// Responsibility: Secure bridge between the isolated renderer and the main process.
// Security: Exposes only whitelisted APIs, with no direct Node.js access in the renderer.

import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { IPC_CHANNELS } from '@shared/internal/ipc.channels';
import { IPC_SCHEMAS } from '@shared/internal/ipc.schemas';
import type { SupportedExchange } from '@shared/public/constants';
import type {
  AIAlertSubscriptionStatus,
  AISignal
} from '@shared/public/ai.types';
import {
  toPortfolioAccountSnapshot,
  type MarketData,
  type PortfolioAccountSnapshot
} from '@shared/public/market.types';
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

const buildAIAlertChannel = (subscriptionId: string): string => {
  return `${IPC_CHANNELS.AI.ALERT}.${subscriptionId}`;
};

contextBridge.exposeInMainWorld('api', {
  subscribeToMarket: (symbol: string, callback: (data: MarketData) => void): (() => void) => {
    const validatedRequest = IPC_SCHEMAS.market.subscribe.parse({ symbol });
    const channel = `${IPC_CHANNELS.MARKET.DATA}.${validatedRequest.symbol}`;
    const handler = (event: IpcRendererEvent, data: MarketData): void => {
      void event;
      callback(data);
    };

    ipcRenderer.on(channel, handler);
    return (): void => {
      ipcRenderer.removeListener(channel, handler);
    };
  },

  subscribeToPortfolio: (
    exchange: SupportedExchange,
    callback: (data: PortfolioAccountSnapshot) => void
  ): (() => void) => {
    const validatedRequest = IPC_SCHEMAS.portfolio.fetch.parse({ exchange });
    const channel = `${IPC_CHANNELS.PORTFOLIO.UPDATE}.${validatedRequest.exchange}`;
    const handler = (event: IpcRendererEvent, data: PortfolioAccountSnapshot): void => {
      void event;
      callback(toPortfolioAccountSnapshot(IPC_SCHEMAS.portfolio.update.parse(data)));
    };

    ipcRenderer.on(channel, handler);
    return (): void => {
      ipcRenderer.removeListener(channel, handler);
    };
  },

  fetchPortfolio: async (exchange: SupportedExchange): Promise<PortfolioAccountSnapshot> => {
    const validatedRequest = IPC_SCHEMAS.portfolio.fetch.parse({ exchange });
    return ipcRenderer.invoke(
      IPC_CHANNELS.PORTFOLIO.FETCH,
      validatedRequest
    ) as Promise<PortfolioAccountSnapshot>;
  },

  placeOrder: async (order: PublicTradeInput): Promise<PublicTrade> => {
    const validatedOrder = IPC_SCHEMAS.trade.place.parse(order);
    return ipcRenderer.invoke(IPC_CHANNELS.TRADE.PLACE, validatedOrder) as Promise<PublicTrade>;
  },

  getAISignals: async (symbol: string): Promise<readonly AISignal[]> => {
    const validatedRequest = IPC_SCHEMAS.ai.getSignals.parse({ symbol });
    const response = (await ipcRenderer.invoke(
      IPC_CHANNELS.AI.GET_SIGNALS,
      validatedRequest
    )) as readonly unknown[];

    return response.map((signal) => {
      return IPC_SCHEMAS.ai.signalResponse.parse(signal);
    });
  },

  subscribeToAIAlerts: (
    symbol: string,
    callback: (signal: AISignal) => void,
    options?: {
      minConfidence?: number;
    }
  ) => {
    const validatedRequest = IPC_SCHEMAS.ai.subscribeAlerts.parse({
      symbol,
      ...options
    });
    let disposed = false;
    let subscriptionId: string | null = null;
    let activeChannel: string | null = null;
    let handler:
      | ((event: IpcRendererEvent, data: unknown) => void)
      | null = null;

    const removeListener = (): void => {
      if (activeChannel !== null && handler !== null) {
        ipcRenderer.removeListener(activeChannel, handler);
      }

      activeChannel = null;
      handler = null;
    };

    const ready = (async (): Promise<AIAlertSubscriptionStatus> => {
      const response = await ipcRenderer.invoke(
        IPC_CHANNELS.AI.SUBSCRIBE_ALERTS,
        validatedRequest
      );
      const subscription = IPC_SCHEMAS.ai.alertSubscriptionStatus.parse(response);

      if (disposed) {
        const unsubscribePayload = IPC_SCHEMAS.ai.unsubscribeAlerts.parse({
          subscriptionId: subscription.subscriptionId
        });
        void ipcRenderer.invoke(IPC_CHANNELS.AI.UNSUBSCRIBE_ALERTS, unsubscribePayload);
        return subscription;
      }

      subscriptionId = subscription.subscriptionId;
      activeChannel = buildAIAlertChannel(subscription.subscriptionId);
      handler = (event: IpcRendererEvent, data: unknown): void => {
        void event;
        callback(IPC_SCHEMAS.ai.signalResponse.parse(data));
      };
      ipcRenderer.on(activeChannel, handler);

      return subscription;
    })();

    return {
      ready,
      unsubscribe: (): void => {
        disposed = true;
        removeListener();

        if (subscriptionId !== null) {
          const unsubscribePayload = IPC_SCHEMAS.ai.unsubscribeAlerts.parse({
            subscriptionId
          });
          void ipcRenderer.invoke(IPC_CHANNELS.AI.UNSUBSCRIBE_ALERTS, unsubscribePayload);
          subscriptionId = null;
        }
      }
    };
  },

  saveApiKey: async (
    exchange: SupportedExchange,
    keyId: string,
    encryptedKey: string
  ): Promise<{ saved: true; keyId: string; exchange: SupportedExchange }> => {
    const validatedPayload = IPC_SCHEMAS.security.saveKey.parse({
      exchange,
      keyId,
      encryptedKey
    });

    return ipcRenderer.invoke(IPC_CHANNELS.SECURITY.SAVE_KEY, validatedPayload) as Promise<{
      saved: true;
      keyId: string;
      exchange: SupportedExchange;
    }>;
  },

  getApiKeyStatus: async (
    exchange: SupportedExchange,
    keyId: string
  ): Promise<StoredCredentialStatus> => {
    const validatedPayload = IPC_SCHEMAS.security.getKey.parse({
      exchange,
      keyId
    });

    return ipcRenderer.invoke(IPC_CHANNELS.SECURITY.GET_KEY, validatedPayload) as Promise<StoredCredentialStatus>;
  },

  deleteApiKey: async (
    exchange: SupportedExchange,
    keyId: string,
    confirmationCode: string
  ): Promise<DeleteCredentialResult> => {
    if (confirmationCode !== 'DELETE') {
      throw new Error('Explicit deletion confirmation is required.');
    }

    const validatedPayload = IPC_SCHEMAS.security.deleteKey.parse({
      exchange,
      keyId,
      confirmationCode
    });

    return ipcRenderer.invoke(
      IPC_CHANNELS.SECURITY.DELETE_KEY,
      validatedPayload
    ) as Promise<DeleteCredentialResult>;
  },

  cancelOrder: async (order: CancelTradeInput): Promise<PublicTrade> => {
    const validatedOrder = IPC_SCHEMAS.trade.cancel.parse(order);
    return ipcRenderer.invoke(IPC_CHANNELS.TRADE.CANCEL, validatedOrder) as Promise<PublicTrade>;
  },

  getTradeHistory: async (query: TradeHistoryQuery = {}): Promise<TradeHistoryPage> => {
    const validatedQuery = IPC_SCHEMAS.trade.history.parse({
      simulation: true,
      ...query
    });
    return ipcRenderer.invoke(IPC_CHANNELS.TRADE.HISTORY, validatedQuery) as Promise<TradeHistoryPage>;
  },

  resetSimulation: async (
    input: ResetSimulationInput
  ): Promise<SimulationResetResult> => {
    const validatedInput = IPC_SCHEMAS.trade.resetSimulation.parse(input);
    return ipcRenderer.invoke(
      IPC_CHANNELS.TRADE.RESET_SIMULATION,
      validatedInput
    ) as Promise<SimulationResetResult>;
  },

  getSettings: async (): Promise<UserSettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.GET) as Promise<UserSettings>;
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const validatedSettings = IPC_SCHEMAS.settings.update.parse(settings);
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS.UPDATE, validatedSettings) as Promise<
      UserSettings
    >;
  }
});
