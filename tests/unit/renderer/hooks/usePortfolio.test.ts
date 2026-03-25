/// <reference path="../../../types/jest-globals.d.ts" />

import type { PortfolioAccountSnapshot } from '../../../../src/shared/public/market.types';
import {
  PORTFOLIO_DEFERRED_NOTICE,
  PORTFOLIO_PREVIEW_NOTICE,
  loadPortfolioPreview
} from '../../../../src/renderer/hooks/usePortfolio';
import { usePortfolioStore } from '../../../../src/renderer/stores/portfolio-store';

const sampleSnapshot: PortfolioAccountSnapshot = {
  exchange: 'binance',
  balances: [
    {
      asset: 'BTC',
      free: '0.001',
      locked: '0',
      usdValue: 50
    }
  ],
  totalUsdValue: 50,
  timestamp: Date.now()
};

const getPortfolioActions = () => {
  const state = usePortfolioStore.getState();

  return {
    setSnapshot: state.setSnapshot,
    setLoading: state.setLoading,
    setError: state.setError,
    setNotice: state.setNotice,
    resetPreview: state.resetPreview
  };
};

describe('loadPortfolioPreview', () => {
  it('stores a valid portfolio preview snapshot', async () => {
    usePortfolioStore.getState().resetPreview();

    await loadPortfolioPreview('binance', getPortfolioActions(), {
      fetchPortfolio: async () => sampleSnapshot,
      subscribeToPortfolio: () => (): void => undefined
    });

    expect(usePortfolioStore.getState().snapshot?.exchange).toBe('binance');
    expect(usePortfolioStore.getState().getAssetBalance('BTC')).toBe('0.001');
    expect(usePortfolioStore.getState().notice).toBe(PORTFOLIO_PREVIEW_NOTICE);
  });

  it('treats deferred production preview errors as a notice', async () => {
    usePortfolioStore.getState().resetPreview();

    await loadPortfolioPreview('binance', getPortfolioActions(), {
      fetchPortfolio: async () => {
        throw new Error('PORTFOLIO_FETCH_NOT_IMPLEMENTED_IN_PHASE_2');
      },
      subscribeToPortfolio: () => (): void => undefined
    });

    expect(usePortfolioStore.getState().error === null).toBe(true);
    expect(usePortfolioStore.getState().notice).toBe(PORTFOLIO_DEFERRED_NOTICE);
    expect(usePortfolioStore.getState().loading).toBe(false);
  });
});
