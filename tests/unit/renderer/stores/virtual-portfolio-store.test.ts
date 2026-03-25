/// <reference path="../../../types/jest-globals.d.ts" />

import type { PublicTrade } from '../../../../src/shared/public/trade.types';
import { useVirtualPortfolioStore } from '../../../../src/renderer/stores/virtual-portfolio-store';

const sampleTrades: readonly PublicTrade[] = [
  {
    id: 'trade-1',
    exchange: 'binance',
    symbol: 'BTC/USDT',
    side: 'buy',
    type: 'limit',
    quantity: 0.05,
    price: 65000,
    status: 'filled',
    simulation: true,
    timestamp: '2026-03-23T10:00:00.000Z'
  },
  {
    id: 'trade-2',
    exchange: 'binance',
    symbol: 'BTC/USDT',
    side: 'sell',
    type: 'limit',
    quantity: 0.02,
    price: 68000,
    status: 'filled',
    simulation: true,
    timestamp: '2026-03-23T11:00:00.000Z'
  }
];

describe('useVirtualPortfolioStore', () => {
  it('derives holdings and performance metrics from simulation trades', () => {
    useVirtualPortfolioStore.getState().reset();
    useVirtualPortfolioStore
      .getState()
      .applyTradeHistory(sampleTrades, new Map<string, number>([['BTC/USDT', 69000]]));

    const state = useVirtualPortfolioStore.getState();

    expect(state.tradeCount).toBe(2);
    expect(Number(state.balance.USDT)).toBeGreaterThan(0);
    expect(state.assets[0]?.symbol).toBe('BTC/USDT');
    expect(state.totalValue).toBeGreaterThan(0);
  });
});
