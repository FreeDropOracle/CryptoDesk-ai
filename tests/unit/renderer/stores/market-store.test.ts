/// <reference path="../../../types/jest-globals.d.ts" />

import type { TickerData } from '../../../../src/shared/public/market.types';
import { useMarketStore } from '../../../../src/renderer/stores/market-store';

const sampleTicker: TickerData = {
  exchange: 'binance',
  symbol: 'BTC/USDT',
  price: 65000,
  bid: 64990,
  ask: 65010,
  change24h: 1.25,
  volume24h: 1450,
  timestamp: new Date().toISOString()
};

describe('useMarketStore', () => {
  it('stores validated ticker data', () => {
    useMarketStore.getState().reset();
    useMarketStore.getState().updateTicker(sampleTicker);

    const storedTicker = useMarketStore.getState().getTicker('BTC/USDT');

    expect(storedTicker?.symbol).toBe('BTC/USDT');
  });

  it('ignores invalid ticker payloads', () => {
    useMarketStore.getState().reset();
    useMarketStore.getState().updateTicker({
      ...sampleTicker,
      price: -1
    });

    const storedTicker = useMarketStore.getState().getTicker('BTC/USDT');

    expect(storedTicker === undefined).toBe(true);
    expect(useMarketStore.getState().error).toBe('Invalid market data was ignored.');
  });

  it('tracks subscriptions without touching the IPC bridge', () => {
    useMarketStore.getState().reset();
    useMarketStore.getState().subscribe('eth/usdt');

    expect(useMarketStore.getState().subscriptions.has('ETH/USDT')).toBe(true);

    useMarketStore.getState().unsubscribe('ETH/USDT');

    expect(useMarketStore.getState().subscriptions.has('ETH/USDT')).toBe(false);
  });
});
