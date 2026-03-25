// File: src/main/trading/websocket-manager.ts
// Responsibility: Maintains read-only market WebSocket streams with reconnect handling.
// Security: Streams market data only, caps reconnect attempts, and avoids privileged actions.

import type { MarketData } from '@shared/public/market.types';
import type { SupportedExchange } from '@shared/public/constants';
import type {
  ConnectionMode,
  MarketStreamState,
  WebSocketFactory,
  WebSocketLike,
  WebSocketManagerOptions
} from './types';
import { ExchangeError } from './types';

const DEFAULT_CONNECTION_MODE: ConnectionMode = 'testnet';
const DEFAULT_RECONNECT_DELAY_MS = 1500;
const DEFAULT_MAX_RECONNECTS = 5;

const buildBaseStreamUrl = (
  exchange: SupportedExchange,
  connectionMode: ConnectionMode
): string => {
  if (exchange !== 'binance') {
    throw new ExchangeError(
      'UNSUPPORTED_EXCHANGE',
      `WebSocket market streams are not configured for ${exchange} yet.`,
      false
    );
  }

  return connectionMode === 'testnet'
    ? 'wss://stream.testnet.binance.vision/ws'
    : 'wss://stream.binance.com:9443/ws';
};

const normalizeSymbol = (symbol: string): string => {
  return symbol.replace('/', '').toLowerCase();
};

const denormalizeSymbol = (rawSymbol: string): string => {
  const knownQuoteCurrencies = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BNB'] as const;
  const matchingQuote = knownQuoteCurrencies.find((quote) => rawSymbol.endsWith(quote));

  if (matchingQuote === undefined) {
    return rawSymbol;
  }

  return `${rawSymbol.slice(0, rawSymbol.length - matchingQuote.length)}/${matchingQuote}`;
};

const parseTickerMessage = (
  exchange: SupportedExchange,
  rawMessage: string
): MarketData | null => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawMessage) as unknown;
  } catch {
    return null;
  }

  if (parsed === null || typeof parsed !== 'object') {
    return null;
  }

  const payload = parsed as Record<string, unknown>;

  if (typeof payload.s !== 'string' || typeof payload.c !== 'string') {
    return null;
  }

  return {
    exchange,
    symbol: denormalizeSymbol(payload.s),
    price: Number(payload.c),
    bid: Number(typeof payload.b === 'string' ? payload.b : payload.c),
    ask: Number(typeof payload.a === 'string' ? payload.a : payload.c),
    change24h: Number(typeof payload.P === 'string' ? payload.P : 0),
    volume24h: Number(typeof payload.v === 'string' ? payload.v : 0),
    timestamp: new Date(
      typeof payload.E === 'number' ? payload.E : Date.now()
    ).toISOString()
  };
};

const defaultSocketFactory: WebSocketFactory = (url: string): WebSocketLike => {
  if (typeof globalThis.WebSocket !== 'function') {
    throw new ExchangeError(
      'EXCHANGE_UNAVAILABLE',
      'WebSocket is unavailable in the current runtime.',
      false
    );
  }

  return new globalThis.WebSocket(url) as unknown as WebSocketLike;
};

export class WebSocketManager {
  private readonly socketFactory: WebSocketFactory;
  private readonly reconnectDelayMs: number;
  private readonly maxReconnects: number;
  private readonly exchange: SupportedExchange;
  private readonly connectionMode: ConnectionMode;
  private socket: WebSocketLike | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private currentSymbol: string | null = null;
  private manualDisconnect = false;
  private state: MarketStreamState = 'idle';
  private readonly onMarketData: ((data: MarketData) => void) | undefined;
  private readonly onStateChange: ((state: MarketStreamState) => void) | undefined;

  public constructor(options: WebSocketManagerOptions) {
    this.exchange = options.exchange;
    this.connectionMode = options.connectionMode ?? DEFAULT_CONNECTION_MODE;
    this.socketFactory = options.socketFactory ?? defaultSocketFactory;
    this.reconnectDelayMs = options.reconnectDelayMs ?? DEFAULT_RECONNECT_DELAY_MS;
    this.maxReconnects = options.maxReconnects ?? DEFAULT_MAX_RECONNECTS;
    this.onMarketData = options.onMarketData;
    this.onStateChange = options.onStateChange;
  }

  public connect(symbol: string): void {
    this.manualDisconnect = false;
    this.currentSymbol = symbol;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.closeSocket();
    this.openSocket(symbol);
  }

  public disconnect(): void {
    this.manualDisconnect = true;
    this.currentSymbol = null;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.closeSocket();
    this.updateState('closed');
  }

  public getState(): MarketStreamState {
    return this.state;
  }

  private openSocket(symbol: string): void {
    const streamName = `${normalizeSymbol(symbol)}@ticker`;
    const streamUrl = `${buildBaseStreamUrl(this.exchange, this.connectionMode)}/${streamName}`;
    this.updateState(this.reconnectAttempts === 0 ? 'connecting' : 'reconnecting');
    const socket = this.socketFactory(streamUrl);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.updateState('connected');
    };

    socket.onmessage = (event) => {
      const marketData = parseTickerMessage(this.exchange, event.data);

      if (marketData !== null) {
        this.onMarketData?.(marketData);
      }
    };

    socket.onerror = () => {
      this.updateState('reconnecting');
    };

    socket.onclose = () => {
      this.socket = null;

      if (this.manualDisconnect || this.currentSymbol === null) {
        this.updateState('closed');
        return;
      }

      if (this.reconnectAttempts >= this.maxReconnects) {
        this.updateState('closed');
        return;
      }

      this.reconnectAttempts += 1;
      this.updateState('reconnecting');
      this.reconnectTimer = setTimeout(() => {
        if (this.currentSymbol !== null) {
          this.openSocket(this.currentSymbol);
        }
      }, this.reconnectDelayMs);
    };
  }

  private closeSocket(): void {
    if (this.socket === null) {
      return;
    }

    const socket = this.socket;
    this.socket = null;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer === null) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private updateState(state: MarketStreamState): void {
    this.state = state;
    this.onStateChange?.(state);
  }
}
