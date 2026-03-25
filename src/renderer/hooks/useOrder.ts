// File: src/renderer/hooks/useOrder.ts
// Responsibility: Prepares simulation orders for renderer forms and routes valid submissions through secure IPC.
// Security: Performs renderer-safe validation only; main-process validation remains authoritative.

import { useState } from 'react';
import type {
  SupportedExchange,
  SupportedOrderSide,
  SupportedOrderType
} from '@shared/public/constants';
import type { PublicTrade, PublicTradeInput } from '@shared/public/trade.types';
import type { LocalizedError } from '@shared/public/ui.types';
import { useFeatures } from './useFeatures';
import { useTrading } from './useTrading';
import { usePortfolioStore } from '../stores/portfolio-store';
import { assessLargeOrder } from '../utils/fat-finger-guard';
import { isPositiveNumber, isValidSymbol } from '../utils/validators';

export interface OrderDraft {
  exchange: SupportedExchange;
  symbol: string;
  side: SupportedOrderSide;
  type: SupportedOrderType;
  quantity: string;
  price: string;
  clientOrderId: string;
}

export interface OrderFieldIssue {
  field: 'exchange' | 'symbol' | 'quantity' | 'price' | 'simulationMode' | 'clientOrderId';
  message: string;
}

export interface OrderAssessment {
  valid: boolean;
  errors: readonly OrderFieldIssue[];
  normalizedOrder: PublicTradeInput | null;
  estimatedValue: number;
  requiresLargeOrderConfirmation: boolean;
  confirmationMessage: string | null;
}

interface OrderAssessmentContext {
  simulationMode: boolean;
  simulationBalance: number;
  referencePrice?: number;
}

const parsePositiveInput = (value: string): number | null => {
  const normalizedValue = value.trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return isPositiveNumber(parsedValue) ? parsedValue : null;
};

const normalizeClientOrderId = (value: string): string | null => {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

export const assessOrderDraft = (
  draft: OrderDraft,
  context: OrderAssessmentContext
): OrderAssessment => {
  const errors: OrderFieldIssue[] = [];
  const normalizedSymbol = draft.symbol.trim().toUpperCase();
  const quantity = parsePositiveInput(draft.quantity);
  const explicitPrice = parsePositiveInput(draft.price);
  const referencePrice =
    draft.type === 'limit'
      ? explicitPrice
      : explicitPrice ?? context.referencePrice ?? null;
  const clientOrderId = normalizeClientOrderId(draft.clientOrderId);

  if (!context.simulationMode) {
    errors.push({
      field: 'simulationMode',
      message: 'Phase 3 accepts simulation orders only. Enable simulation mode to continue.'
    });
  }

  if (!isValidSymbol(normalizedSymbol)) {
    errors.push({
      field: 'symbol',
      message: 'Use a market symbol like BTC/USDT.'
    });
  }

  if (quantity === null) {
    errors.push({
      field: 'quantity',
      message: 'Enter a positive quantity.'
    });
  }

  if (draft.type === 'limit' && explicitPrice === null) {
    errors.push({
      field: 'price',
      message: 'Limit orders require a positive price.'
    });
  }

  if (draft.type === 'market' && referencePrice === null) {
    errors.push({
      field: 'price',
      message: 'Wait for live market data or provide a reference price before simulating.'
    });
  }

  if (clientOrderId !== null && clientOrderId.length > 64) {
    errors.push({
      field: 'clientOrderId',
      message: 'Client order IDs must be 64 characters or less.'
    });
  }

  const estimatedValue =
    quantity !== null && referencePrice !== null ? quantity * referencePrice : 0;
  const largeOrderAssessment = assessLargeOrder(estimatedValue, context.simulationBalance);

  if (errors.length > 0 || quantity === null || referencePrice === null) {
    return {
      valid: false,
      errors,
      normalizedOrder: null,
      estimatedValue,
      requiresLargeOrderConfirmation: largeOrderAssessment.required,
      confirmationMessage: largeOrderAssessment.message
    };
  }

  const normalizedOrder: PublicTradeInput = {
    exchange: draft.exchange,
    symbol: normalizedSymbol,
    side: draft.side,
    type: draft.type,
    quantity,
    simulation: true,
    ...(draft.type === 'limit' || explicitPrice !== null ? { price: referencePrice } : {}),
    ...(clientOrderId !== null ? { clientOrderId } : {})
  };

  return {
    valid: true,
    errors: [],
    normalizedOrder,
    estimatedValue,
    requiresLargeOrderConfirmation: largeOrderAssessment.required,
    confirmationMessage: largeOrderAssessment.message
  };
};

interface UseOrderResult {
  assessOrder(draft: OrderDraft): OrderAssessment;
  simulateOrder(draft: OrderDraft): Promise<PublicTrade | null>;
  submitting: boolean;
  error: LocalizedError | null;
  lastTrade: PublicTrade | null;
  simulationBalance: number;
}

export const useOrder = (referencePrice?: number): UseOrderResult => {
  const { simulationMode } = useFeatures();
  const simulationBalance = usePortfolioStore((state) => state.simulationBalance);
  const { submitOrder, submitting, error } = useTrading();
  const [lastTrade, setLastTrade] = useState<PublicTrade | null>(null);

  const assessOrder = (draft: OrderDraft): OrderAssessment => {
    return assessOrderDraft(draft, {
      simulationMode,
      simulationBalance,
      ...(typeof referencePrice === 'number' ? { referencePrice } : {})
    });
  };

  const simulateOrder = async (draft: OrderDraft): Promise<PublicTrade | null> => {
    const assessment = assessOrder(draft);

    if (!assessment.valid || assessment.normalizedOrder === null) {
      return null;
    }

    const trade = await submitOrder(assessment.normalizedOrder);

    if (trade !== null) {
      setLastTrade(trade);
    }

    return trade;
  };

  return {
    assessOrder,
    simulateOrder,
    submitting,
    error,
    lastTrade,
    simulationBalance
  };
};
