/// <reference path="../../../types/jest-globals.d.ts" />

import { ExchangeService } from '../../../../src/main/trading/exchange';
import { ExchangeError } from '../../../../src/main/trading/types';

describe('ExchangeService.fetchPortfolioPreview', () => {
  const originalAppEnv = process.env.APP_ENV;

  it('returns a mock portfolio snapshot outside production', async () => {
    process.env.APP_ENV = 'development';

    const service = new ExchangeService();
    const snapshot = await service.fetchPortfolioPreview('binance');

    expect(snapshot.exchange).toBe('binance');
    expect(snapshot.balances[0]?.asset).toBe('BTC');
    expect(snapshot.balances[0]?.free).toMatch(/^\d+(\.\d+)?$/);
  });

  it('rejects production preview requests until credential wiring is completed', async () => {
    process.env.APP_ENV = 'production';

    const service = new ExchangeService();

    try {
      await service.fetchPortfolioPreview('binance');
      throw new Error('Expected production preview fetch to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(ExchangeError);

      const exchangeError = error as ExchangeError;
      expect(exchangeError.code).toBe('PORTFOLIO_FETCH_NOT_IMPLEMENTED_IN_PHASE_2');
    } finally {
      process.env.APP_ENV = originalAppEnv;
    }
  });
});
