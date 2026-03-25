// File: src/main/trading/exchange.ts
// Responsibility: Wraps CCXT for read-only market and portfolio access with safe defaults.
// Security: Stays testnet-first, rate-limited, and intentionally blocks live trade execution.

import ccxt from 'ccxt';
import type {
  MarketData,
  PortfolioAccountSnapshot,
  PortfolioBalance,
  PortfolioSnapshot
} from '@shared/public/market.types';
import { toPortfolioAccountSnapshot } from '@shared/public/market.types';
import type { SupportedExchange } from '@shared/public/constants';
import type { PlaceOrderRequest } from '@shared/internal/ipc.schemas';
import type {
  ConnectionMode,
  ExchangeBalanceSnapshot,
  ExchangeClient,
  ExchangeClientFactory,
  ExchangeCredentials,
  ExchangeServiceOptions,
  ExchangeTickerSnapshot
} from './types';
import { ExchangeError } from './types';
import { RateLimitQueue } from './order-queue';

const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_CONNECTION_MODE: ConnectionMode = 'testnet';
const defaultExchangeConstructors: Record<SupportedExchange, ExchangeClientFactory> = {
  binance: ccxt.binance as unknown as ExchangeClientFactory,
  bybit: ccxt.bybit as unknown as ExchangeClientFactory
};

const sanitizeTicker = (
  exchange: SupportedExchange,
  symbol: string,
  ticker: ExchangeTickerSnapshot
): MarketData => {
  return {
    exchange,
    symbol,
    price: Number(ticker.last ?? 0),
    bid: Number(ticker.bid ?? ticker.last ?? 0),
    ask: Number(ticker.ask ?? ticker.last ?? 0),
    change24h: Number(ticker.percentage ?? 0),
    volume24h: Number(ticker.baseVolume ?? 0),
    timestamp: new Date(ticker.timestamp ?? Date.now()).toISOString()
  };
};

const sanitizeBalance = (
  exchange: SupportedExchange,
  balance: ExchangeBalanceSnapshot
): PortfolioSnapshot => {
  const totalEntries = Object.entries(balance.total ?? {});
  const balances: PortfolioBalance[] = totalEntries
    .filter(([, total]) => Number(total ?? 0) > 0)
    .map(([asset, total]) => {
      const free = Number(balance.free?.[asset] ?? 0);
      const used = Number(balance.used?.[asset] ?? 0);
      const totalValue = Number(total ?? 0);

      return {
        asset,
        free,
        used,
        total: totalValue,
        fiatValue: totalValue
      };
    });

  return {
    exchange,
    balances,
    positions: [],
    totalValue: balances.reduce((sum, item) => sum + item.fiatValue, 0),
    timestamp: new Date().toISOString()
  };
};

const buildMockPortfolioPreview = (
  exchange: SupportedExchange
): PortfolioAccountSnapshot => {
  const balances: PortfolioAccountSnapshot['balances'] = [
    {
      asset: 'BTC',
      free: '0.00100000',
      locked: '0',
      usdValue: 50
    },
    {
      asset: 'USDT',
      free: '100.00000000',
      locked: '0',
      usdValue: 100
    }
  ];

  return toPortfolioAccountSnapshot({
    exchange,
    balances,
    totalUsdValue: balances.reduce((sum, item) => sum + (item.usdValue ?? 0), 0),
    timestamp: Date.now()
  });
};

const toExchangeError = (action: string, error: unknown): ExchangeError => {
  const message = error instanceof Error ? error.message : 'Unknown exchange failure.';
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('rate limit')) {
    return new ExchangeError('RATE_LIMITED', `${action} hit an exchange rate limit.`, true, {
      cause: error
    });
  }

  if (
    normalizedMessage.includes('network') ||
    normalizedMessage.includes('timeout') ||
    normalizedMessage.includes('fetch')
  ) {
    return new ExchangeError(
      'NETWORK_ERROR',
      `${action} failed because the exchange is unreachable.`,
      true,
      {
        cause: error
      }
    );
  }

  return new ExchangeError('EXCHANGE_UNAVAILABLE', `${action} failed.`, false, {
    cause: error
  });
};

export class ExchangeService {
  private readonly clients = new Map<string, ExchangeClient>();
  private readonly connectionMode: ConnectionMode;
  private readonly timeoutMs: number;
  private readonly requestQueue: RateLimitQueue;
  private readonly exchangeConstructors: Record<SupportedExchange, ExchangeClientFactory>;

  public constructor(options: ExchangeServiceOptions = {}) {
    this.connectionMode = options.connectionMode ?? DEFAULT_CONNECTION_MODE;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
    this.requestQueue = new RateLimitQueue(options.requestQueueOptions);
    this.exchangeConstructors = {
      ...defaultExchangeConstructors,
      ...options.clientOverrides
    };
  }

  public async fetchTicker(
    exchange: SupportedExchange,
    symbol: string,
    credentials?: ExchangeCredentials
  ): Promise<MarketData> {
    return this.requestQueue.schedule(async () => {
      try {
        const client = this.getClient(exchange, credentials);
        const ticker = await client.fetchTicker(symbol);
        return sanitizeTicker(exchange, symbol, ticker);
      } catch (error) {
        throw toExchangeError(`Fetching ticker for ${symbol}`, error);
      }
    });
  }

  public async fetchMarketData(
    exchange: SupportedExchange,
    symbol: string,
    credentials?: ExchangeCredentials
  ): Promise<MarketData> {
    return this.fetchTicker(exchange, symbol, credentials);
  }

  public async fetchPortfolio(credentials: ExchangeCredentials): Promise<PortfolioSnapshot> {
    return this.requestQueue.schedule(async () => {
      try {
        const client = this.getClient(credentials.exchange, credentials);
        const balance = await client.fetchBalance();
        return sanitizeBalance(credentials.exchange, balance);
      } catch (error) {
        throw toExchangeError(
          `Fetching portfolio for ${credentials.exchange}`,
          error
        );
      }
    });
  }

  public async fetchPortfolioPreview(
    exchange: SupportedExchange
  ): Promise<PortfolioAccountSnapshot> {
    return this.requestQueue.schedule(async () => {
      if (process.env.APP_ENV !== 'production') {
        return buildMockPortfolioPreview(exchange);
      }

      throw new ExchangeError(
        'PORTFOLIO_FETCH_NOT_IMPLEMENTED_IN_PHASE_2',
        'Authenticated portfolio fetching is deferred until Phase 3 credential wiring.',
        false
      );
    });
  }

  public async placeOrder(
    input: PlaceOrderRequest,
    credentials: ExchangeCredentials
  ): Promise<never> {
    void input;
    void credentials;

    throw new ExchangeError(
      'READ_ONLY_MODE',
      'Trade execution is disabled during Phase 2 read-only connectivity work.',
      false
    );
  }

  private getClient(
    exchange: SupportedExchange,
    credentials?: ExchangeCredentials
  ): ExchangeClient {
    const cacheKey = credentials === undefined ? `public:${exchange}` : credentials.clientId;
    const cachedClient = this.clients.get(cacheKey);

    if (cachedClient !== undefined) {
      return cachedClient;
    }

    const ExchangeConstructor = this.exchangeConstructors[exchange];
    const client = new ExchangeConstructor({
      apiKey: credentials?.apiKey,
      secret: credentials?.apiSecret,
      enableRateLimit: true,
      timeout: this.timeoutMs
    });

    if (
      this.connectionMode === 'testnet' &&
      typeof client.setSandboxMode === 'function'
    ) {
      client.setSandboxMode(true);
    }

    this.clients.set(cacheKey, client);
    return client;
  }
}
