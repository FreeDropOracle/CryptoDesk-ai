// File: src/renderer/utils/fat-finger-guard.ts
// Responsibility: Detects oversized simulation orders and enforces explicit human confirmation.
// Security: Reduces accidental large trades before they reach the secure IPC boundary.

import { formatCurrency, formatPercent } from './formatters';

export const LARGE_ORDER_THRESHOLD_RATIO = 0.1;
export const LARGE_ORDER_CONFIRMATION_PHRASE = 'CONFIRM';

export interface LargeOrderAssessment {
  required: boolean;
  orderValue: number;
  thresholdValue: number;
  shareOfBalance: number;
  message: string | null;
}

export const assessLargeOrder = (
  orderValue: number,
  simulationBalance: number
): LargeOrderAssessment => {
  const safeOrderValue = Number.isFinite(orderValue) && orderValue > 0 ? orderValue : 0;
  const safeBalance =
    Number.isFinite(simulationBalance) && simulationBalance > 0 ? simulationBalance : 0;
  const thresholdValue = safeBalance * LARGE_ORDER_THRESHOLD_RATIO;
  const shareOfBalance = safeBalance > 0 ? safeOrderValue / safeBalance : 0;

  if (safeOrderValue < thresholdValue || thresholdValue <= 0) {
    return {
      required: false,
      orderValue: safeOrderValue,
      thresholdValue,
      shareOfBalance,
      message: null
    };
  }

  return {
    required: true,
    orderValue: safeOrderValue,
    thresholdValue,
    shareOfBalance,
    message: `This order is ${formatPercent(
      shareOfBalance * 100
    )} of the virtual balance (${formatCurrency(
      safeOrderValue
    )}). Type ${LARGE_ORDER_CONFIRMATION_PHRASE} to continue.`
  };
};

export const isLargeOrderConfirmationValid = (value: string): boolean => {
  return value.trim().toUpperCase() === LARGE_ORDER_CONFIRMATION_PHRASE;
};
