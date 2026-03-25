/// <reference path="../../../types/jest-globals.d.ts" />

import { IPC_CHANNELS } from '../../../../src/shared/internal/ipc.channels';
import { IPC_INVOKE_SCHEMAS, IPC_SCHEMAS } from '../../../../src/shared/internal/ipc.schemas';
import { SecurityBoundaryError } from '../../../../src/main/security/types';
import { validateSchema } from '../../../../src/main/security/validator';

describe('IPC channel schemas', () => {
  it('accepts a valid trade placement payload', () => {
    const payload = validateSchema(IPC_SCHEMAS.trade.place, {
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      quantity: 0.25,
      price: 65000
    });

    expect(payload.symbol).toBe('BTC/USDT');
    expect(payload.type).toBe('limit');
  });

  it('rejects malformed market symbols', () => {
    let caughtError: unknown;

    try {
      validateSchema(IPC_SCHEMAS.trade.place, {
        exchange: 'binance',
        symbol: 'btc-usdt',
        side: 'buy',
        type: 'market',
        quantity: 0.25
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(SecurityBoundaryError);

    if (!(caughtError instanceof SecurityBoundaryError)) {
      throw new Error('Expected a SecurityBoundaryError for invalid trade symbols.');
    }

    expect(caughtError.code).toBe('VALIDATION_FAILED');
  });

  it('rejects limit orders without a price', () => {
    let caughtError: unknown;

    try {
      validateSchema(IPC_SCHEMAS.trade.place, {
        exchange: 'binance',
        symbol: 'BTC/USDT',
        side: 'sell',
        type: 'limit',
        quantity: 0.1
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(SecurityBoundaryError);
  });

  it('accepts partial settings updates at the boundary', () => {
    const payload = validateSchema(IPC_SCHEMAS.settings.update, {
      theme: 'dark',
      notificationsEnabled: false
    });

    expect(payload.theme).toBe('dark');
    expect(payload.notificationsEnabled).toBe(false);
  });

  it('maps channel constants to the correct invoke schema', () => {
    const payload = IPC_INVOKE_SCHEMAS[IPC_CHANNELS.SECURITY.SAVE_KEY].parse({
      exchange: 'binance',
      keyId: 'primary',
      encryptedKey: 'opaque-ciphertext'
    });

    expect(payload.exchange).toBe('binance');
    expect(payload.keyId).toBe('primary');
  });
});
