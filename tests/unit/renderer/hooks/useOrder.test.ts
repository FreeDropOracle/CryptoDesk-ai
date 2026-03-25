/// <reference path="../../../types/jest-globals.d.ts" />

import type { OrderDraft } from '../../../../src/renderer/hooks/useOrder';
import { assessOrderDraft } from '../../../../src/renderer/hooks/useOrder';

const baseDraft: OrderDraft = {
  exchange: 'binance',
  symbol: 'BTC/USDT',
  side: 'buy',
  type: 'limit',
  quantity: '0.01',
  price: '65000',
  clientOrderId: ''
};

describe('assessOrderDraft', () => {
  it('normalizes a valid simulation order', () => {
    const result = assessOrderDraft(baseDraft, {
      simulationMode: true,
      simulationBalance: 10000,
      referencePrice: 65000
    });

    expect(result.valid).toBe(true);
    expect(result.normalizedOrder?.symbol).toBe('BTC/USDT');
    expect(result.normalizedOrder?.simulation).toBe(true);
  });

  it('requires market reference pricing for market orders', () => {
    const result = assessOrderDraft(
      {
        ...baseDraft,
        type: 'market',
        price: ''
      },
      {
        simulationMode: true,
        simulationBalance: 10000
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((issue) => issue.field === 'price')).toBe(true);
  });

  it('flags large orders for explicit confirmation', () => {
    const result = assessOrderDraft(
      {
        ...baseDraft,
        quantity: '0.5',
        price: '65000'
      },
      {
        simulationMode: true,
        simulationBalance: 10000,
        referencePrice: 65000
      }
    );

    expect(result.requiresLargeOrderConfirmation).toBe(true);
    expect(result.confirmationMessage).toContain('CONFIRM');
  });
});
