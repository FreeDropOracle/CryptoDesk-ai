// File: src/shared/public/constants.ts
// Responsibility: Public, renderer-safe constants shared across the application.
// Security: Exposes only non-sensitive values that are safe for the renderer.

export const APP_NAME = 'CryptoDesk AI';
export const DEFAULT_SYMBOL = 'BTC/USDT';
export const DEFAULT_QUOTE_CURRENCY = 'USDT';

export const SUPPORTED_EXCHANGES = ['binance', 'bybit'] as const;
export type SupportedExchange = (typeof SUPPORTED_EXCHANGES)[number];

export const SUPPORTED_ORDER_TYPES = ['market', 'limit'] as const;
export type SupportedOrderType = (typeof SUPPORTED_ORDER_TYPES)[number];

export const SUPPORTED_ORDER_SIDES = ['buy', 'sell'] as const;
export type SupportedOrderSide = (typeof SUPPORTED_ORDER_SIDES)[number];

export const SUPPORTED_THEMES = ['system', 'light', 'dark'] as const;
export type SupportedTheme = (typeof SUPPORTED_THEMES)[number];
