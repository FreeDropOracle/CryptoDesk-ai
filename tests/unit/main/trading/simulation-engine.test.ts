/// <reference path="../../../types/jest-globals.d.ts" />

import type { ValidatedOrder } from '../../../../src/main/trading/order-validation';
import { SimulationEngine } from '../../../../src/main/trading/simulation-engine';

const createOrder = (
  overrides: Partial<ValidatedOrder> = {}
): ValidatedOrder => {
  return {
    exchange: 'binance',
    symbol: 'BTC/USDT',
    side: 'buy',
    type: 'limit',
    quantity: 0.05,
    price: 65000,
    simulation: true,
    ...overrides
  };
};

describe('SimulationEngine', () => {
  it('executes a buy order using virtual balances only', async () => {
    const engine = new SimulationEngine();
    const result = await engine.executeOrder(createOrder(), {
      referencePrice: 65000
    });

    expect(result.success).toBe(true);

    if (!result.success) {
      return;
    }

    const quoteBalance = result.portfolio.balances.find((balance) => balance.asset === 'USDT');
    const baseBalance = result.portfolio.balances.find((balance) => balance.asset === 'BTC');

    expect(result.trade.simulation).toBe(true);
    expect(result.trade.status).toBe('filled');
    expect(quoteBalance?.total).toBeLessThan(10000);
    expect(baseBalance?.total).toBeGreaterThan(0);
  });

  it('rejects a buy order that exceeds the virtual quote balance', async () => {
    const engine = new SimulationEngine();
    const result = await engine.executeOrder(
      createOrder({
        quantity: 10
      }),
      {
        referencePrice: 65000
      }
    );

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.code).toBe('INSUFFICIENT_VIRTUAL_BALANCE');
    expect(result.message).toContain('Simulation balance is too low');
  });

  it('credits quote balance back after a simulated sell', async () => {
    const engine = new SimulationEngine();

    await engine.executeOrder(createOrder(), {
      referencePrice: 65000
    });

    const sellResult = await engine.executeOrder(
      createOrder({
        side: 'sell',
        quantity: 0.02,
        price: 66000
      }),
      {
        referencePrice: 66000
      }
    );

    expect(sellResult.success).toBe(true);

    if (!sellResult.success) {
      return;
    }

    const quoteBalance = sellResult.portfolio.balances.find((balance) => balance.asset === 'USDT');
    const baseBalance = sellResult.portfolio.balances.find((balance) => balance.asset === 'BTC');

    expect(quoteBalance?.total).toBeGreaterThan(0);
    expect(baseBalance?.total).toBeGreaterThan(0);
    expect(engine.getTradeHistory('binance')).toHaveLength(2);
  });
});
