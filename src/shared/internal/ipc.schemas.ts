// File: src/shared/internal/ipc.schemas.ts
// Responsibility: Zod validation schemas and derived request types for IPC boundaries.
// Security: Every invoke payload is validated before crossing into privileged execution.

import { z } from 'zod';
import {
  SUPPORTED_EXCHANGES,
  SUPPORTED_ORDER_SIDES,
  SUPPORTED_ORDER_TYPES,
  SUPPORTED_THEMES
} from '../public/constants';
import {
  AI_ADVISORY_MODES,
  DEFAULT_AI_ALERT_MIN_CONFIDENCE,
  AI_FILTER_REASONS,
  AI_SIGNAL_ACTIONS,
  AI_SIGNAL_SOURCES
} from '../public/ai.types';
import { IPC_CHANNELS } from './ipc.channels';

export const marketSymbolSchema = z
  .string()
  .min(3)
  .max(24)
  .regex(/^[A-Z0-9]+\/[A-Z0-9]+$/, 'Symbol must be formatted like BTC/USDT.');

const exchangeSchema = z.enum(SUPPORTED_EXCHANGES);
const orderSideSchema = z.enum(SUPPORTED_ORDER_SIDES);
const orderTypeSchema = z.enum(SUPPORTED_ORDER_TYPES);
const themeSchema = z.enum(SUPPORTED_THEMES);

const marketSubscriptionSchema = z
  .object({
    symbol: marketSymbolSchema
  })
  .strict();

const settingsSchema = z
  .object({
    locale: z.string().min(2).max(16),
    theme: themeSchema,
    tradingEnabled: z.boolean(),
    aiAutoExecuteEnabled: z.boolean(),
    simulationMode: z.boolean(),
    riskAcknowledged: z.boolean(),
    preferredQuoteCurrency: z.string().min(2).max(10),
    notificationsEnabled: z.boolean()
  })
  .strict();

const tradePlaceSchema = z
  .object({
    exchange: exchangeSchema,
    symbol: marketSymbolSchema,
    side: orderSideSchema,
    type: orderTypeSchema,
    quantity: z.number().positive().finite(),
    price: z.number().positive().finite().optional(),
    simulation: z.boolean().optional(),
    clientOrderId: z.string().min(1).max(64).optional()
  })
  .strict()
  .superRefine((value, context) => {
    if (value.type === 'limit' && typeof value.price !== 'number') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Limit orders require a price.'
      });
    }
  });

const tradeCancelSchema = z
  .object({
    exchange: exchangeSchema,
    orderId: z.string().min(1).max(128),
    symbol: marketSymbolSchema.optional()
  })
  .strict();

const tradeHistorySchema = z
  .object({
    exchange: exchangeSchema.optional(),
    symbol: marketSymbolSchema.optional(),
    simulation: z.boolean().optional(),
    limit: z.number().positive().finite().max(100).optional(),
    offset: z.number().finite().optional()
  })
  .strict()
  .superRefine((value, context) => {
    if (value.simulation === false) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['simulation'],
        message: 'This history surface is restricted to simulation trades only.'
      });
    }

    if (typeof value.limit === 'number' && !Number.isInteger(value.limit)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['limit'],
        message: 'Trade history limit must be an integer.'
      });
    }

    if (typeof value.offset === 'number') {
      if (!Number.isInteger(value.offset)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['offset'],
          message: 'Trade history offset must be an integer.'
        });
      }

      if (value.offset < 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['offset'],
          message: 'Trade history offset cannot be negative.'
        });
      }
    }
  });

const tradeResetSimulationSchema = z
  .object({
    exchange: exchangeSchema.optional(),
    confirmationCode: z
      .string()
      .regex(/^RESET$/, 'Type RESET to confirm simulation reset.')
  })
  .strict();

const aiSignalsRequestSchema = z
  .object({
    symbol: marketSymbolSchema,
    exchange: exchangeSchema.optional()
  })
  .strict();

const aiSubscribeAlertsSchema = z
  .object({
    symbol: marketSymbolSchema,
    minConfidence: z
      .number()
      .finite()
      .min(0)
      .max(1)
      .default(DEFAULT_AI_ALERT_MIN_CONFIDENCE)
  })
  .strict();

const aiUnsubscribeAlertsSchema = z
  .object({
    subscriptionId: z.string().min(1).max(128)
  })
  .strict();

const aiSignalResponseSchema = z
  .object({
    symbol: marketSymbolSchema,
    action: z.enum(AI_SIGNAL_ACTIONS),
    confidence: z.number().finite().min(0).max(1),
    reasoning: z.array(z.string().min(1)),
    riskScore: z.number().finite().min(0).max(1),
    generatedAt: z.string().min(1),
    source: z.enum(AI_SIGNAL_SOURCES),
    modelVersion: z.string().min(1).max(64),
    filtered: z.boolean(),
    filterReason: z.enum(AI_FILTER_REASONS).nullable(),
    advisory: z.enum(AI_ADVISORY_MODES)
  })
  .strict();

const aiAlertSubscriptionStatusSchema = z
  .object({
    subscriptionId: z.string().min(1).max(128),
    symbol: marketSymbolSchema,
    minConfidence: z.number().finite().min(0).max(1),
    subscribed: z.boolean()
  })
  .strict();

const saveKeySchema = z
  .object({
    exchange: exchangeSchema,
    keyId: z.string().min(1).max(128),
    encryptedKey: z.string().min(1).max(8192)
  })
  .strict();

const getKeySchema = z
  .object({
    exchange: exchangeSchema,
    keyId: z.string().min(1).max(128)
  })
  .strict();

const deleteKeySchema = z
  .object({
    exchange: exchangeSchema,
    keyId: z.string().min(1).max(128),
    confirmationCode: z
      .string()
      .regex(/^DELETE$/, 'Type DELETE to confirm key deletion.')
  })
  .strict();

const portfolioBalanceSchema = z
  .object({
    asset: z.string().min(1).max(32),
    free: z.string().regex(/^\d+(\.\d+)?$/, 'Free balance must be a numeric string.'),
    locked: z.string().regex(/^\d+(\.\d+)?$/, 'Locked balance must be a numeric string.'),
    usdValue: z.number().finite().min(0).optional()
  })
  .strict();

const portfolioFetchSchema = z
  .object({
    exchange: exchangeSchema
  })
  .strict();

const portfolioUpdateSchema = z
  .object({
    exchange: exchangeSchema,
    balances: z.array(portfolioBalanceSchema),
    totalUsdValue: z.number().finite().min(0).optional(),
    timestamp: z.number().int().positive()
  })
  .strict();

export const IPC_SCHEMAS = {
  market: {
    subscribe: marketSubscriptionSchema,
    unsubscribe: marketSubscriptionSchema
  },
  portfolio: {
    fetch: portfolioFetchSchema,
    update: portfolioUpdateSchema
  },
  trade: {
    place: tradePlaceSchema,
    cancel: tradeCancelSchema,
    history: tradeHistorySchema,
    resetSimulation: tradeResetSimulationSchema
  },
  ai: {
    getSignals: aiSignalsRequestSchema,
    subscribeAlerts: aiSubscribeAlertsSchema,
    unsubscribeAlerts: aiUnsubscribeAlertsSchema,
    alertSubscriptionStatus: aiAlertSubscriptionStatusSchema,
    signalResponse: aiSignalResponseSchema
  },
  security: {
    saveKey: saveKeySchema,
    getKey: getKeySchema,
    deleteKey: deleteKeySchema
  },
  settings: {
    get: z.undefined(),
    update: settingsSchema.partial().strict()
  }
} as const;

export const IPC_INVOKE_SCHEMAS = {
  [IPC_CHANNELS.MARKET.SUBSCRIBE]: IPC_SCHEMAS.market.subscribe,
  [IPC_CHANNELS.MARKET.UNSUBSCRIBE]: IPC_SCHEMAS.market.unsubscribe,
  [IPC_CHANNELS.PORTFOLIO.FETCH]: IPC_SCHEMAS.portfolio.fetch,
  [IPC_CHANNELS.TRADE.PLACE]: IPC_SCHEMAS.trade.place,
  [IPC_CHANNELS.TRADE.CANCEL]: IPC_SCHEMAS.trade.cancel,
  [IPC_CHANNELS.TRADE.HISTORY]: IPC_SCHEMAS.trade.history,
  [IPC_CHANNELS.TRADE.RESET_SIMULATION]: IPC_SCHEMAS.trade.resetSimulation,
  [IPC_CHANNELS.AI.GET_SIGNALS]: IPC_SCHEMAS.ai.getSignals,
  [IPC_CHANNELS.AI.SUBSCRIBE_ALERTS]: IPC_SCHEMAS.ai.subscribeAlerts,
  [IPC_CHANNELS.AI.UNSUBSCRIBE_ALERTS]: IPC_SCHEMAS.ai.unsubscribeAlerts,
  [IPC_CHANNELS.SECURITY.SAVE_KEY]: IPC_SCHEMAS.security.saveKey,
  [IPC_CHANNELS.SECURITY.GET_KEY]: IPC_SCHEMAS.security.getKey,
  [IPC_CHANNELS.SECURITY.DELETE_KEY]: IPC_SCHEMAS.security.deleteKey,
  [IPC_CHANNELS.SETTINGS.GET]: IPC_SCHEMAS.settings.get,
  [IPC_CHANNELS.SETTINGS.UPDATE]: IPC_SCHEMAS.settings.update
} as const;

export type MarketSubscriptionRequest = z.infer<typeof IPC_SCHEMAS.market.subscribe>;
export type PortfolioFetchRequest = z.infer<typeof IPC_SCHEMAS.portfolio.fetch>;
export type PortfolioUpdatePayload = z.infer<typeof IPC_SCHEMAS.portfolio.update>;
export type PlaceOrderRequest = z.infer<typeof IPC_SCHEMAS.trade.place>;
export type CancelOrderRequest = z.infer<typeof IPC_SCHEMAS.trade.cancel>;
export type TradeHistoryRequest = z.infer<typeof IPC_SCHEMAS.trade.history>;
export type ResetSimulationRequest = z.infer<typeof IPC_SCHEMAS.trade.resetSimulation>;
export type AISignalsRequest = z.infer<typeof IPC_SCHEMAS.ai.getSignals>;
export type AISubscribeAlertsRequest = z.infer<typeof IPC_SCHEMAS.ai.subscribeAlerts>;
export type AIUnsubscribeAlertsRequest = z.infer<typeof IPC_SCHEMAS.ai.unsubscribeAlerts>;
export type AIAlertSubscriptionStatus = z.infer<typeof IPC_SCHEMAS.ai.alertSubscriptionStatus>;
export type SaveKeyRequest = z.infer<typeof IPC_SCHEMAS.security.saveKey>;
export type GetKeyRequest = z.infer<typeof IPC_SCHEMAS.security.getKey>;
export type DeleteKeyRequest = z.infer<typeof IPC_SCHEMAS.security.deleteKey>;
export type SettingsUpdateRequest = z.infer<typeof IPC_SCHEMAS.settings.update>;
