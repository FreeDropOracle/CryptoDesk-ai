import { IPC_SCHEMAS } from '../../../src/shared/internal/ipc.schemas';
import { validateSchema } from '../../../src/main/security/validator';

describe('IPC validation', () => {
  it('accepts a valid trade payload', () => {
    const payload = validateSchema(IPC_SCHEMAS.trade.place, {
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      quantity: 0.1,
      price: 65000
    });

    expect(payload.symbol).toBe('BTC/USDT');
  });

  it('rejects an invalid symbol', () => {
    expect(() => {
      validateSchema(IPC_SCHEMAS.trade.place, {
        exchange: 'binance',
        symbol: 'btc-usdt',
        side: 'buy',
        type: 'limit',
        quantity: 0.1,
        price: 65000
      });
    }).toThrow();
  });
});
