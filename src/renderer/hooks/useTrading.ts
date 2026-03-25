// File: src/renderer/hooks/useTrading.ts
// Responsibility: Places orders through secure IPC and updates renderer stores.
// Security: Renderer submits typed orders only; main process remains the enforcement point.

import { useState } from 'react';
import type { PublicTrade, PublicTradeInput } from '@shared/public/trade.types';
import type { LocalizedError } from '@shared/public/ui.types';
import { usePortfolioStore } from '../stores/portfolio-store';
import { useSettingsStore } from '../stores/settings-store';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

export const useTrading = () => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const addTrade = usePortfolioStore((state) => state.addTrade);
  const recentTrades = usePortfolioStore((state) => state.recentTrades);
  const simulationBalance = usePortfolioStore((state) => state.simulationBalance);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<LocalizedError | null>(null);

  const submitOrder = async (order: PublicTradeInput): Promise<PublicTrade | null> => {
    setSubmitting(true);
    setError(null);

    try {
      const trade = await ipcClient.placeOrder(order);
      addTrade(trade);
      return trade;
    } catch (submitError) {
      setError(
        toLocalizedError(ERROR_MESSAGES.TRADING.SUBMIT_ORDER, submitError, {
          locale,
          preferSafeRawMessage: true
        })
      );
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitOrder,
    submitting,
    error,
    recentTrades,
    simulationBalance
  };
};
