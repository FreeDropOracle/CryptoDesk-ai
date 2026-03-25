// File: src/main/core/app-init.ts
// Responsibility: Boots main-process services and registers secure IPC handlers.
// Security: Centralizes trust-boundary validation, feature gating, and audit logging.

import { ipcMain } from 'electron';
import { z, type ZodTypeAny } from 'zod';
import { DEFAULT_SYMBOL, type SupportedExchange } from '@shared/public/constants';
import type {
  MarketData,
  PortfolioAccountSnapshot,
  PriceBar
} from '@shared/public/market.types';
import type {
  PublicTrade,
  SimulationResetResult,
  TradeHistoryPage
} from '@shared/public/trade.types';
import type {
  DeleteCredentialResult,
  StoredCredentialStatus,
  UserSettings
} from '@shared/public/ui.types';
import { IPC_CHANNELS } from '@shared/internal/ipc.channels';
import {
  IPC_SCHEMAS,
  type PlaceOrderRequest,
  type SettingsUpdateRequest
} from '@shared/internal/ipc.schemas';
import { loadAppConfig, type AppConfig } from '../config/loader';
import { databaseConnection } from '../db/connection';
import { AuditRepository } from '../db/repositories/audit.repo';
import { SettingsRepository } from '../db/repositories/settings.repo';
import { TradeHistoryRepository } from '../db/repositories/trade-history.repo';
import { TradeRepository } from '../db/repositories/trade.repo';
import type { TradeEntity } from '../db/entities/trade.entity';
import { AuditLogService } from '../security/audit-log';
import { EncryptionService } from '../security/encryption';
import { KeychainService } from '../security/keychain';
import { SecurityBoundaryError, getErrorMessage } from '../security/types';
import { validateSchema } from '../security/validator';
import { logger } from '../logger/secure-logger';
import { WindowManager } from './window-manager';
import { eventBus } from './event-bus';
import { OrderQueue } from '../trading/order-queue';
import { validateOrder } from '../trading/order-validation';
import { ExchangeService } from '../trading/exchange';
import { RiskManager } from '../trading/risk-manager';
import { SimulationEngine } from '../trading/simulation-engine';
import { SignalEngine } from '../ai/signal-engine';
import { AIRiskFilter } from '../ai/risk-filter';
import { AIAlertStreamService } from '../ai/alert-stream';
import { AISignalOrchestrator } from '../ai/orchestrator';
import type { AIInferenceRequest } from '../ai/types';
import { toPortfolioAccountSnapshot } from '@shared/public/market.types';

export interface ApplicationContext {
  config: AppConfig;
  windowManager: WindowManager;
}

let cachedContext: ApplicationContext | null = null;
let marketFeedStarted = false;
const DEFAULT_TRADE_HISTORY_LIMIT = 50;
const TRADE_HISTORY_PREFETCH_OFFSET = 1;

const mapTradeToEntity = (trade: PublicTrade): TradeEntity => {
  return {
    id: trade.id,
    exchange: trade.exchange,
    symbol: trade.symbol,
    side: trade.side,
    type: trade.type,
    quantity: trade.quantity,
    price: typeof trade.price === 'number' ? trade.price : null,
    status: trade.status,
    simulation: trade.simulation,
    timestamp: trade.timestamp,
    clientOrderId: typeof trade.clientOrderId === 'string' ? trade.clientOrderId : null
  };
};

const mapEntityToPublicTrade = (trade: TradeEntity): PublicTrade => {
  const optionalFields: Partial<Pick<PublicTrade, 'price' | 'clientOrderId'>> = {};

  if (typeof trade.price === 'number') {
    optionalFields.price = trade.price;
  }

  if (typeof trade.clientOrderId === 'string') {
    optionalFields.clientOrderId = trade.clientOrderId;
  }

  return {
    id: trade.id,
    exchange: trade.exchange,
    symbol: trade.symbol,
    side: trade.side,
    type: trade.type,
    quantity: trade.quantity,
    status: trade.status,
    simulation: trade.simulation,
    timestamp: trade.timestamp,
    ...optionalFields
  };
};

const isTradeCancellable = (trade: TradeEntity): boolean => {
  return (
    trade.status === 'pending' ||
    trade.status === 'queued' ||
    trade.status === 'submitted'
  );
};

const buildSampleBars = (): readonly PriceBar[] => {
  const now = Date.now();

  return Array.from({ length: 10 }, (_, index) => {
    const offset = (9 - index) * 60_000;
    const base = 65000 + index * 25;

    return {
      timestamp: new Date(now - offset).toISOString(),
      open: base - 10,
      high: base + 15,
      low: base - 20,
      close: base,
      volume: 100 + index * 3
    };
  });
};

const buildSampleInferenceRequest = (symbol: string): AIInferenceRequest => {
  return {
    symbol,
    candles: buildSampleBars(),
    features: [0.62, 0.58, 0.31]
  };
};

const buildStreamingInferenceRequest = (marketData: MarketData): AIInferenceRequest => {
  const now = Date.now();
  const safePrice = Math.max(marketData.price, 1);
  const shortTermDrift = marketData.change24h / 24;
  const spreadRatio = Math.min(Math.abs(marketData.ask - marketData.bid) / safePrice, 0.05);
  const normalizedVolume = Math.min(marketData.volume24h / 10000, 1);
  const candles = Array.from({ length: 10 }, (_, index) => {
    const remaining = 9 - index;
    const directionalBias = (shortTermDrift * remaining) / 4;
    const wave = Math.sin((index + 1) / 2) * safePrice * 0.0018;
    const close = Math.max(1, safePrice * (1 - directionalBias / 100) + wave);
    const open = Math.max(1, close - wave * 0.5);
    const high = Math.max(open, close) + safePrice * 0.0014;
    const low = Math.max(1, Math.min(open, close) - safePrice * 0.0014);

    return {
      timestamp: new Date(now - remaining * 60_000).toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.max(1, marketData.volume24h / 24 + index * 12)
    };
  });

  return {
    symbol: marketData.symbol,
    candles,
    features: [marketData.change24h / 100, normalizedVolume, spreadRatio]
  };
};

const toUserSettingsPatch = (payload: SettingsUpdateRequest): Partial<UserSettings> => {
  const patch: Partial<UserSettings> = {};

  if (payload.locale !== undefined) {
    patch.locale = payload.locale;
  }

  if (payload.theme !== undefined) {
    patch.theme = payload.theme;
  }

  if (payload.tradingEnabled !== undefined) {
    patch.tradingEnabled = payload.tradingEnabled;
  }

  if (payload.aiAutoExecuteEnabled !== undefined) {
    patch.aiAutoExecuteEnabled = payload.aiAutoExecuteEnabled;
  }

  if (payload.simulationMode !== undefined) {
    patch.simulationMode = payload.simulationMode;
  }

  if (payload.riskAcknowledged !== undefined) {
    patch.riskAcknowledged = payload.riskAcknowledged;
  }

  if (payload.preferredQuoteCurrency !== undefined) {
    patch.preferredQuoteCurrency = payload.preferredQuoteCurrency;
  }

  if (payload.notificationsEnabled !== undefined) {
    patch.notificationsEnabled = payload.notificationsEnabled;
  }

  return patch;
};

const startMockMarketFeed = (windowManager: WindowManager): void => {
  if (marketFeedStarted) {
    return;
  }

  marketFeedStarted = true;
  let tick = 0;
  const trackedSymbols = ['BTC/USDT', 'ETH/USDT'] as const;

  setInterval(() => {
    tick += 1;

    for (const symbol of trackedSymbols) {
      const isBitcoin = symbol === 'BTC/USDT';
      const basePrice = isBitcoin ? 65000 : 3400;
      const delta = Math.sin(tick / 3) * (isBitcoin ? 180 : 18);
      const price = basePrice + delta;
      const marketData: MarketData = {
        exchange: 'binance',
        symbol,
        price,
        bid: price - 1,
        ask: price + 1,
        change24h: Number((delta / basePrice) * 100),
        volume24h: isBitcoin ? 1240 : 8900,
        timestamp: new Date().toISOString()
      };

      windowManager.getMainWindow()?.webContents.send(
        `${IPC_CHANNELS.MARKET.DATA}.${symbol}`,
        marketData
      );
      eventBus.emit('market:update', marketData);
    }
  }, 4000);
};

const registerHandler = <TSchema extends ZodTypeAny, TResult>(
  channel: string,
  schema: TSchema,
  action: string,
  auditLog: AuditLogService,
  handler: (payload: z.infer<TSchema>) => Promise<TResult> | TResult
): void => {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, async (event, payload) => {
    void event;

    try {
      const validatedPayload = validateSchema(schema, payload) as z.infer<TSchema>;
      return await handler(validatedPayload);
    } catch (error) {
      auditLog.record({
        action: `${action}.failed`,
        severity: 'error',
        message: getErrorMessage(error),
        metadata: { channel }
      });
      throw error;
    }
  });
};

export const initializeApplication = async (): Promise<ApplicationContext> => {
  if (cachedContext !== null) {
    return cachedContext;
  }

  const config = loadAppConfig();
  const database = databaseConnection.getDatabase(config.databasePath);
  const tradeRepository = new TradeRepository(database);
  const tradeHistoryRepository = new TradeHistoryRepository(database);
  const settingsRepository = new SettingsRepository(database);
  const auditRepository = new AuditRepository(database);
  const auditLog = new AuditLogService({
    insert: (entry) => {
      auditRepository.insert(entry);
    }
  });
  const keychainService = new KeychainService(config.keychainServiceName);
  const encryptionService = new EncryptionService(keychainService);
  const riskManager = new RiskManager(config.tradingLimits);
  const orderQueue = new OrderQueue();
  const simulationEngine = new SimulationEngine();
  const exchangeService = new ExchangeService({
    connectionMode: config.env === 'production' ? 'mainnet' : 'testnet'
  });
  const signalEngine = new SignalEngine(config.aiConfidenceThreshold);
  const aiRiskFilter = new AIRiskFilter(config.featureFlags, config.tradingLimits);
  const aiOrchestrator = new AISignalOrchestrator(config, signalEngine, aiRiskFilter);
  const aiAlertStream = new AIAlertStreamService();
  const alertDispatchInFlight = new Set<string>();
  const windowManager = new WindowManager(config);

  registerHandler(
    IPC_CHANNELS.SETTINGS.GET,
    IPC_SCHEMAS.settings.get,
    'settings.get',
    auditLog,
    () => settingsRepository.getSettings()
  );

  registerHandler(
    IPC_CHANNELS.SETTINGS.UPDATE,
    IPC_SCHEMAS.settings.update,
    'settings.update',
    auditLog,
    (payload) => {
      const settings = settingsRepository.updateSettings(toUserSettingsPatch(payload));
      auditLog.record({
        action: 'settings.update.success',
        severity: 'info',
        message: 'Settings updated successfully.',
        metadata: {
          keys: Object.keys(payload)
        }
      });
      return settings;
    }
  );

  registerHandler(
    IPC_CHANNELS.SECURITY.SAVE_KEY,
    IPC_SCHEMAS.security.saveKey,
    'security.save-key',
    auditLog,
    async (payload) => {
      const encryptedPayload = await encryptionService.encryptString(payload.encryptedKey);
      const serializedPayload = encryptionService.serializePayload(encryptedPayload);
      const savedReference = await keychainService.saveCredential({
        exchange: payload.exchange,
        keyId: payload.keyId,
        encryptedSecret: serializedPayload
      });

      auditLog.record({
        action: 'security.save-key.success',
        severity: 'info',
        message: 'API credential saved to keychain.',
        metadata: {
          exchange: savedReference.exchange,
          keyId: savedReference.keyId
        }
      });

      return {
        saved: true as const,
        keyId: savedReference.keyId,
        exchange: savedReference.exchange
      };
    }
  );

  registerHandler(
    IPC_CHANNELS.SECURITY.GET_KEY,
    IPC_SCHEMAS.security.getKey,
    'security.get-key',
    auditLog,
    async (payload): Promise<StoredCredentialStatus> => {
      const reference = await keychainService.getCredentialReference(
        payload.exchange,
        payload.keyId
      );

      const status: StoredCredentialStatus =
        reference === null
          ? {
              exchange: payload.exchange,
              keyId: payload.keyId,
              exists: false
            }
          : {
              exchange: reference.exchange,
              keyId: reference.keyId,
              exists: true,
              updatedAt: reference.updatedAt
            };

      auditLog.record({
        action: 'security.get-key.success',
        severity: 'info',
        message: 'Credential metadata lookup completed.',
        metadata: {
          exchange: status.exchange,
          keyId: status.keyId,
          exists: status.exists
        }
      });

      return status;
    }
  );

  registerHandler(
    IPC_CHANNELS.SECURITY.DELETE_KEY,
    IPC_SCHEMAS.security.deleteKey,
    'security.delete-key',
    auditLog,
    async (payload): Promise<DeleteCredentialResult> => {
      const deleted = await keychainService.deleteCredential(payload.exchange, payload.keyId);

      auditLog.record({
        action: 'security.delete-key.success',
        severity: 'warn',
        message: 'Credential deletion request completed.',
        metadata: {
          exchange: payload.exchange,
          keyId: payload.keyId,
          deleted
        }
      });

      return {
        exchange: payload.exchange,
        keyId: payload.keyId,
        deleted
      };
    }
  );

  registerHandler(
    IPC_CHANNELS.PORTFOLIO.FETCH,
    IPC_SCHEMAS.portfolio.fetch,
    'portfolio.fetch',
    auditLog,
    async (payload): Promise<PortfolioAccountSnapshot> => {
      const snapshot = toPortfolioAccountSnapshot(
        IPC_SCHEMAS.portfolio.update.parse(
          await exchangeService.fetchPortfolioPreview(payload.exchange)
        )
      );

      windowManager
        .getMainWindow()
        ?.webContents.send(`${IPC_CHANNELS.PORTFOLIO.UPDATE}.${payload.exchange}`, snapshot);

      auditLog.record({
        action: 'portfolio.fetch.success',
        severity: 'info',
        message: 'Read-only portfolio snapshot prepared successfully.',
        metadata: {
          exchange: snapshot.exchange,
          balanceCount: snapshot.balances.length,
          source: config.env === 'production' ? 'deferred' : 'phase-2-stub'
        }
      });

      return snapshot;
    }
  );

  registerHandler(
    IPC_CHANNELS.AI.GET_SIGNALS,
    IPC_SCHEMAS.ai.getSignals,
    'ai.get-signals',
    auditLog,
    async (payload) => {
      const signals = await aiOrchestrator.getSignals(buildSampleInferenceRequest(payload.symbol));
      const validatedSignals = signals.map((signal) => {
        return IPC_SCHEMAS.ai.signalResponse.parse(signal);
      });

      for (const signal of validatedSignals) {
        eventBus.emit('ai:signal', signal);
      }

      auditLog.record({
        action: 'ai.get-signals.success',
        severity: 'info',
        message: 'AI signals generated successfully.',
        metadata: {
          symbol: payload.symbol,
          count: validatedSignals.length
        }
      });

      return validatedSignals;
    }
  );

  ipcMain.removeHandler(IPC_CHANNELS.AI.SUBSCRIBE_ALERTS);
  ipcMain.handle(IPC_CHANNELS.AI.SUBSCRIBE_ALERTS, async (event, payload) => {
    try {
      const validatedPayload = validateSchema(IPC_SCHEMAS.ai.subscribeAlerts, payload);
      const subscription = IPC_SCHEMAS.ai.alertSubscriptionStatus.parse(
        aiAlertStream.register({
          senderId: event.sender.id,
          symbol: validatedPayload.symbol,
          ...(typeof validatedPayload.minConfidence === 'number'
            ? { minConfidence: validatedPayload.minConfidence }
            : {}),
          target: event.sender
        })
      );

      auditLog.record({
        action: 'ai.subscribe-alerts.success',
        severity: 'info',
        message: 'AI alert subscription registered successfully.',
        metadata: {
          symbol: subscription.symbol,
          minConfidence: subscription.minConfidence,
          subscriptionId: subscription.subscriptionId
        }
      });

      return subscription;
    } catch (error) {
      auditLog.record({
        action: 'ai.subscribe-alerts.failed',
        severity: 'error',
        message: getErrorMessage(error),
        metadata: { channel: IPC_CHANNELS.AI.SUBSCRIBE_ALERTS }
      });
      throw error;
    }
  });

  ipcMain.removeHandler(IPC_CHANNELS.AI.UNSUBSCRIBE_ALERTS);
  ipcMain.handle(IPC_CHANNELS.AI.UNSUBSCRIBE_ALERTS, async (event, payload) => {
    try {
      const validatedPayload = validateSchema(IPC_SCHEMAS.ai.unsubscribeAlerts, payload);
      const unsubscribed = aiAlertStream.unregister(validatedPayload.subscriptionId);

      if (!unsubscribed) {
        aiAlertStream.clearSender(event.sender.id);
      }

      auditLog.record({
        action: 'ai.unsubscribe-alerts.success',
        severity: 'info',
        message: 'AI alert subscription removed successfully.',
        metadata: {
          subscriptionId: validatedPayload.subscriptionId,
          unsubscribed
        }
      });

      return {
        subscriptionId: validatedPayload.subscriptionId,
        unsubscribed
      };
    } catch (error) {
      auditLog.record({
        action: 'ai.unsubscribe-alerts.failed',
        severity: 'error',
        message: getErrorMessage(error),
        metadata: { channel: IPC_CHANNELS.AI.UNSUBSCRIBE_ALERTS }
      });
      throw error;
    }
  });

  eventBus.on('market:update', (marketData) => {
    if (!aiAlertStream.hasSubscribersForSymbol(marketData.symbol)) {
      return;
    }

    if (alertDispatchInFlight.has(marketData.symbol)) {
      return;
    }

    alertDispatchInFlight.add(marketData.symbol);

    void (async () => {
      try {
        const signals = await aiOrchestrator.getSignals(
          buildStreamingInferenceRequest(marketData)
        );
        const validatedSignals = signals.map((signal) => {
          return IPC_SCHEMAS.ai.signalResponse.parse(signal);
        });
        let delivered = 0;

        for (const signal of validatedSignals) {
          delivered += aiAlertStream.publish(signal);
        }

        if (delivered > 0) {
          auditLog.record({
            action: 'ai.alerts.dispatched',
            severity: 'info',
            message: 'AI alert stream delivered advisory updates.',
            metadata: {
              symbol: marketData.symbol,
              delivered
            }
          });
        }
      } catch (error) {
        auditLog.record({
          action: 'ai.alerts.dispatched.failed',
          severity: 'error',
          message: getErrorMessage(error),
          metadata: {
            symbol: marketData.symbol
          }
        });
      } finally {
        alertDispatchInFlight.delete(marketData.symbol);
      }
    })();
  });

  registerHandler(
    IPC_CHANNELS.TRADE.PLACE,
    IPC_SCHEMAS.trade.place,
    'trade.place',
    auditLog,
    async (payload) => {
      const currentSettings = settingsRepository.getSettings();
      const simulation = payload.simulation ?? currentSettings.simulationMode;
      const normalizedPayload: PlaceOrderRequest = {
        ...payload,
        simulation
      };
      const validationResult = validateOrder(normalizedPayload);

      if (!validationResult.valid) {
        throw new SecurityBoundaryError(
          'VALIDATION_FAILED',
          validationResult.errors.map((issue) => issue.message).join(' ')
        );
      }

      const validatedOrder = validationResult.data;

      if (!simulation && !config.featureFlags.tradingEnabled) {
        throw new SecurityBoundaryError(
          'FEATURE_DISABLED',
          'Live trading is disabled by feature flag.'
        );
      }

      if (!simulation && !currentSettings.tradingEnabled) {
        throw new SecurityBoundaryError(
          'FEATURE_DISABLED',
          'Live trading is disabled in local settings.'
        );
      }

      if (!simulation) {
        // TODO: Replace this scaffold guard with secure live-credential retrieval and exchange execution wiring.
        throw new SecurityBoundaryError(
          'TRADING_RESTRICTED',
          'Live exchange execution remains disabled in this scaffold until credential wiring is completed.'
        );
      }

      const portfolio = simulationEngine.getPortfolioSnapshot(validatedOrder.exchange);
      const referencePrice =
        typeof validatedOrder.price === 'number'
          ? validatedOrder.price
          : validatedOrder.symbol === DEFAULT_SYMBOL
            ? 65000
            : 3400;

      const riskDecision = riskManager.evaluateOrder(validatedOrder, portfolio, referencePrice);

      if (!riskDecision.allowed) {
        throw new SecurityBoundaryError(
          'TRADING_RESTRICTED',
          riskDecision.reasons.join(' ')
        );
      }

      const trade = await orderQueue.enqueue(validatedOrder, async (queuedOrder) => {
        const simulationResult = await simulationEngine.executeOrder(queuedOrder, {
          referencePrice
        });

        if (!simulationResult.success) {
          throw new SecurityBoundaryError(
            'TRADING_RESTRICTED',
            simulationResult.message
          );
        }

        return simulationResult.trade;
      });

      tradeRepository.insert(mapTradeToEntity(trade));
      eventBus.emit('trade:completed', trade);

      auditLog.record({
        action: 'trade.place.success',
        severity: 'info',
        message: 'Trade request executed successfully.',
        metadata: {
          symbol: trade.symbol,
          side: trade.side,
          type: trade.type,
          simulation: trade.simulation
        }
      });

      return trade;
    }
  );

  registerHandler(
    IPC_CHANNELS.TRADE.CANCEL,
    IPC_SCHEMAS.trade.cancel,
    'trade.cancel',
    auditLog,
    async (payload) => {
      const existingTrade = tradeRepository.findById(payload.orderId, payload.exchange);

      if (existingTrade === null) {
        throw new SecurityBoundaryError(
          'TRADING_RESTRICTED',
          'Unauthorized or unknown order reference.'
        );
      }

      if (typeof payload.symbol === 'string' && payload.symbol !== existingTrade.symbol) {
        throw new SecurityBoundaryError(
          'VALIDATION_FAILED',
          'Order symbol does not match the stored order reference.'
        );
      }

      if (!existingTrade.simulation) {
        throw new SecurityBoundaryError(
          'TRADING_RESTRICTED',
          'Live order cancellation remains disabled in this scaffold.'
        );
      }

      if (!isTradeCancellable(existingTrade)) {
        throw new SecurityBoundaryError(
          'TRADING_RESTRICTED',
          'Only queued or submitted local orders can be cancelled.'
        );
      }

      const cancelledTrade = tradeRepository.updateStatus(
        existingTrade.id,
        existingTrade.exchange,
        'cancelled'
      );

      if (cancelledTrade === null) {
        throw new SecurityBoundaryError(
          'INTERNAL_ERROR',
          'Failed to persist the cancelled trade state.'
        );
      }

      const publicTrade = mapEntityToPublicTrade(cancelledTrade);
      eventBus.emit('trade:cancelled', publicTrade);

      auditLog.record({
        action: 'trade.cancel.success',
        severity: 'info',
        message: 'Trade cancellation request completed.',
        metadata: {
          orderId: publicTrade.id,
          exchange: publicTrade.exchange,
          simulation: publicTrade.simulation
        }
      });

      return publicTrade;
    }
  );

  registerHandler(
    IPC_CHANNELS.TRADE.HISTORY,
    IPC_SCHEMAS.trade.history,
    'trade.history',
    auditLog,
    (payload): TradeHistoryPage => {
      const simulationOnly = payload.simulation ?? true;

      if (!simulationOnly) {
        throw new SecurityBoundaryError(
          'TRADING_RESTRICTED',
          'Renderer history requests are restricted to simulation trades.'
        );
      }

      const limit = payload.limit ?? DEFAULT_TRADE_HISTORY_LIMIT;
      const offset = payload.offset ?? 0;
      const historyQuery = {
        limit: limit + TRADE_HISTORY_PREFETCH_OFFSET,
        offset
      } as {
        exchange?: SupportedExchange;
        symbol?: string;
        limit: number;
        offset: number;
      };

      if (payload.exchange !== undefined) {
        historyQuery.exchange = payload.exchange;
      }

      if (payload.symbol !== undefined) {
        historyQuery.symbol = payload.symbol;
      }

      const historyResult = tradeHistoryRepository.listSimulationHistory(historyQuery);
      const hasMore = historyResult.items.length > limit;
      const items = historyResult.items
        .slice(0, limit)
        .map((row) => mapEntityToPublicTrade(row));

      auditLog.record({
        action: 'trade.history.success',
        severity: 'info',
        message: 'Trade history fetched successfully.',
        metadata: {
          simulationOnly: true,
          exchange: payload.exchange ?? 'all',
          symbol: payload.symbol ?? 'all',
          limit,
          offset,
          count: items.length
        }
      });

      return {
        items,
        limit,
        offset,
        hasMore
      };
    }
  );

  registerHandler(
    IPC_CHANNELS.TRADE.RESET_SIMULATION,
    IPC_SCHEMAS.trade.resetSimulation,
    'trade.reset-simulation',
    auditLog,
    (payload): SimulationResetResult => {
      const cleared = tradeHistoryRepository.clearSimulationHistory(payload.exchange);
      simulationEngine.reset(payload.exchange);

      auditLog.record({
        action: 'trade.reset-simulation.success',
        severity: 'warn',
        message: 'Simulation history reset completed.',
        metadata: {
          exchange: payload.exchange ?? 'all',
          cleared
        }
      });

      return {
        cleared,
        resetAt: new Date().toISOString(),
        simulationOnly: true,
        ...(payload.exchange !== undefined ? { exchange: payload.exchange } : {})
      };
    }
  );

  startMockMarketFeed(windowManager);

  auditLog.record({
    action: 'app.startup',
    severity: 'info',
    message: 'Application services initialized.',
    metadata: {
      env: config.env
    }
  });

  logger.info('Application services initialized.', {
    env: config.env,
    version: config.version
  });

  cachedContext = {
    config,
    windowManager
  };

  return cachedContext;
};
