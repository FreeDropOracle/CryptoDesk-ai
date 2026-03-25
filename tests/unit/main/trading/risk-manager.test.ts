import { RiskManager } from '../../../../src/main/trading/risk-manager';

describe('RiskManager', () => {
  it('allows an order within configured exposure', () => {
    const manager = new RiskManager({
      maxDailyLossPercent: 5,
      maxPositionSizePercent: 20,
      minConfidenceForAutoAlert: 0.75,
      maxOrdersPerMinute: 5
    });

    const decision = manager.evaluateOrder(
      {
        exchange: 'binance',
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 0.01,
        price: 65000
      },
      {
        exchange: 'binance',
        balances: [],
        positions: [],
        totalValue: 10000,
        timestamp: new Date().toISOString()
      },
      65000
    );

    expect(decision.allowed).toBe(true);
  });

  it('blocks an oversized position', () => {
    const manager = new RiskManager({
      maxDailyLossPercent: 5,
      maxPositionSizePercent: 10,
      minConfidenceForAutoAlert: 0.75,
      maxOrdersPerMinute: 5
    });

    const decision = manager.evaluateOrder(
      {
        exchange: 'binance',
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 1,
        price: 65000
      },
      {
        exchange: 'binance',
        balances: [],
        positions: [],
        totalValue: 10000,
        timestamp: new Date().toISOString()
      },
      65000
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reasons[0]).toContain('max position size');
  });
});
