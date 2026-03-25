// File: src/shared/internal/ipc.channels.ts
// Responsibility: Canonical IPC channel names shared across preload and main.
// Security: Centralizes channel naming so privileged operations remain explicit and auditable.

export const IPC_CHANNELS = {
  MARKET: {
    SUBSCRIBE: 'market:subscribe',
    UNSUBSCRIBE: 'market:unsubscribe',
    DATA: 'market:data'
  },
  PORTFOLIO: {
    FETCH: 'portfolio:fetch',
    UPDATE: 'portfolio:update'
  },
  TRADE: {
    PLACE: 'trade:place',
    CANCEL: 'trade:cancel',
    HISTORY: 'trade:history',
    RESET_SIMULATION: 'trade:reset-simulation'
  },
  SECURITY: {
    SAVE_KEY: 'security:save-key',
    GET_KEY: 'security:get-key',
    DELETE_KEY: 'security:delete-key'
  },
  AI: {
    GET_SIGNALS: 'ai:get-signals',
    SUBSCRIBE_ALERTS: 'ai:subscribe-alerts',
    UNSUBSCRIBE_ALERTS: 'ai:unsubscribe-alerts',
    ALERT: 'ai:alert'
  },
  SETTINGS: {
    GET: 'settings:get',
    UPDATE: 'settings:update'
  }
} as const;

export type InvokeChannel =
  | (typeof IPC_CHANNELS.MARKET)[keyof typeof IPC_CHANNELS.MARKET]
  | (typeof IPC_CHANNELS.PORTFOLIO)[keyof typeof IPC_CHANNELS.PORTFOLIO]
  | (typeof IPC_CHANNELS.TRADE)[keyof typeof IPC_CHANNELS.TRADE]
  | (typeof IPC_CHANNELS.SECURITY)[keyof typeof IPC_CHANNELS.SECURITY]
  | (typeof IPC_CHANNELS.AI)[keyof typeof IPC_CHANNELS.AI]
  | (typeof IPC_CHANNELS.SETTINGS)[keyof typeof IPC_CHANNELS.SETTINGS];
