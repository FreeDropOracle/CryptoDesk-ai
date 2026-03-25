// File: src/renderer/hooks/usePortfolio.ts
// Responsibility: Bridges secure portfolio preview IPC into the renderer store.
// Security: Accepts only public portfolio snapshot types and keeps all credential access in main.

import { useEffect } from 'react';
import type { SupportedExchange } from '@shared/public/constants';
import type { PortfolioAccountSnapshot } from '@shared/public/market.types';
import { usePortfolioStore } from '../stores/portfolio-store';
import { useSettingsStore } from '../stores/settings-store';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

export const PORTFOLIO_PREVIEW_NOTICE =
  'Phase 2 read-only preview sourced through the secure main-process bridge.';
export const PORTFOLIO_DEFERRED_NOTICE =
  'Production portfolio preview stays disabled until Phase 3 credential wiring is complete.';

interface PortfolioClient {
  fetchPortfolio(exchange: SupportedExchange): Promise<PortfolioAccountSnapshot>;
  subscribeToPortfolio(
    exchange: SupportedExchange,
    callback: (snapshot: PortfolioAccountSnapshot) => void
  ): () => void;
}

interface PortfolioActions {
  setSnapshot(snapshot: PortfolioAccountSnapshot): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setNotice(notice: string | null): void;
  resetPreview(): void;
}

export const isDeferredPortfolioPreviewError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    error.message.includes('PORTFOLIO_FETCH_NOT_IMPLEMENTED_IN_PHASE_2')
  );
};

export const loadPortfolioPreview = async (
  exchange: SupportedExchange,
  actions: PortfolioActions,
  client: PortfolioClient = ipcClient,
  locale?: string
): Promise<void> => {
  actions.setLoading(true);
  actions.setError(null);

  try {
    const snapshot = await client.fetchPortfolio(exchange);
    actions.setSnapshot(snapshot);
    actions.setNotice(PORTFOLIO_PREVIEW_NOTICE);
  } catch (error) {
    if (isDeferredPortfolioPreviewError(error)) {
      actions.setError(null);
      actions.setNotice(PORTFOLIO_DEFERRED_NOTICE);
      return;
    }

    const localized = toLocalizedError(
      ERROR_MESSAGES.PORTFOLIO.LOAD_PREVIEW,
      error,
      locale === undefined ? undefined : { locale }
    );

    actions.setNotice(null);
    actions.setError(localized.message);
  } finally {
    actions.setLoading(false);
  }
};

export const subscribeToPortfolioPreview = (
  exchange: SupportedExchange,
  actions: PortfolioActions,
  client: PortfolioClient = ipcClient,
  locale?: string
): (() => void) => {
  try {
    return client.subscribeToPortfolio(exchange, (snapshot) => {
      actions.setSnapshot(snapshot);
      actions.setNotice(PORTFOLIO_PREVIEW_NOTICE);
    });
  } catch (error) {
    const localized = toLocalizedError(
      ERROR_MESSAGES.PORTFOLIO.SUBSCRIBE_PREVIEW,
      error,
      locale === undefined ? undefined : { locale }
    );

    actions.setError(localized.message);
    return (): void => undefined;
  }
};

export const usePortfolio = (exchange: SupportedExchange) => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const snapshot = usePortfolioStore((state) => state.snapshot);
  const loading = usePortfolioStore((state) => state.loading);
  const error = usePortfolioStore((state) => state.error);
  const notice = usePortfolioStore((state) => state.notice);
  const totalUsdValue = usePortfolioStore((state) => state.getTotalUsdValue());
  const getAssetBalance = usePortfolioStore((state) => state.getAssetBalance);
  const setSnapshot = usePortfolioStore((state) => state.setSnapshot);
  const setLoading = usePortfolioStore((state) => state.setLoading);
  const setError = usePortfolioStore((state) => state.setError);
  const setNotice = usePortfolioStore((state) => state.setNotice);
  const resetPreview = usePortfolioStore((state) => state.resetPreview);

  useEffect(() => {
    resetPreview();

    const actions: PortfolioActions = {
      setSnapshot,
      setLoading,
      setError,
      setNotice,
      resetPreview
    };
    const dispose = subscribeToPortfolioPreview(exchange, actions, ipcClient, locale);

    void loadPortfolioPreview(exchange, actions, ipcClient, locale);

    return () => {
      dispose();
      resetPreview();
    };
  }, [exchange, setSnapshot, setLoading, setError, setNotice, resetPreview, locale]);

  return {
    snapshot,
    loading,
    error,
    notice,
    totalUsdValue,
    getAssetBalance,
    refreshPortfolio: (): Promise<void> => {
      return loadPortfolioPreview(exchange, {
        setSnapshot,
        setLoading,
        setError,
        setNotice,
        resetPreview
      }, ipcClient, locale);
    }
  };
};
