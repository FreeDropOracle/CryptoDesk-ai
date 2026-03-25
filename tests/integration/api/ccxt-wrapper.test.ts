/// <reference path="../../types/jest-globals.d.ts" />

import { ExchangeService } from '../../../src/main/trading/exchange';
import { ExchangeError } from '../../../src/main/trading/types';
import { MockExchange } from '../../mocks/ccxt-mock';

class RateLimitedMockExchange extends MockExchange {
  public override async fetchTicker(_symbol: string): Promise<never> {
    throw new Error('rate limit exceeded');
  }
}

describe('ExchangeService (read-only connectivity)', () => {
  it('fetches a sanitized ticker from an injected exchange client', async () => {
    const exchange = new ExchangeService({
      clientOverrides: { binance: MockExchange },
      connectionMode: 'testnet',
      requestQueueOptions: {
        requestsPerInterval: 10,
        intervalMs: 1
      }
    });

    const ticker = await exchange.fetchTicker('binance', 'BTC/USDT');

    expect(ticker.symbol).toBe('BTC/USDT');
    expect(ticker.exchange).toBe('binance');
  });

  it('fetches a sanitized portfolio snapshot', async () => {
    const exchange = new ExchangeService({
      clientOverrides: { binance: MockExchange }
    });

    const snapshot = await exchange.fetchPortfolio({
      exchange: 'binance',
      clientId: 'test-client',
      apiKey: 'redacted',
      apiSecret: 'redacted'
    });

    expect(snapshot.exchange).toBe('binance');
    expect(snapshot.balances[0]?.asset).toBe('USDT');
  });

  it('normalizes rate limit failures into ExchangeError', async () => {
    const exchange = new ExchangeService({
      clientOverrides: { binance: RateLimitedMockExchange }
    });

    await expect(
      exchange.fetchTicker('binance', 'BTC/USDT')
    ).rejects.toBeInstanceOf(ExchangeError);
  });

  it('blocks live order placement during read-only phase', async () => {
    const exchange = new ExchangeService({
      clientOverrides: { binance: MockExchange }
    });

    await expect(
      exchange.placeOrder(
        {
          exchange: 'binance',
          symbol: 'BTC/USDT',
          side: 'buy',
          type: 'limit',
          quantity: 0.1,
          price: 65000
        },
        {
          exchange: 'binance',
          clientId: 'test-client',
          apiKey: 'redacted',
          apiSecret: 'redacted'
        }
      )
    ).rejects.toBeInstanceOf(ExchangeError);
  });
});
