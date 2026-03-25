// File: src/main/trading/risk-manager.ts
// Responsibility: Applies conservative trading guardrails before order execution.
// Security: Blocks orders that exceed configured exposure or require unavailable pricing context.

import type { PortfolioSnapshot } from '@shared/public/market.types';
import type { AISignal } from '@shared/public/trade.types';
import type { PlaceOrderRequest } from '@shared/internal/ipc.schemas';
import type { TradingLimits } from '../config/loader';
import type { RiskDecision } from './types';

export class RiskManager {
  public constructor(private readonly limits: TradingLimits) {}

  public evaluateOrder(
    order: PlaceOrderRequest,
    portfolio: PortfolioSnapshot,
    referencePrice: number
  ): RiskDecision {
    const reasons: string[] = [];

    if (referencePrice <= 0) {
      reasons.push('A positive reference price is required for risk checks.');
    }

    const orderValue = order.quantity * referencePrice;
    const portfolioBase = portfolio.totalValue > 0 ? portfolio.totalValue : 1;
    const projectedExposurePercent = (orderValue / portfolioBase) * 100;

    if (projectedExposurePercent > this.limits.maxPositionSizePercent) {
      reasons.push(
        `Order exceeds max position size of ${this.limits.maxPositionSizePercent}%.`
      );
    }

    return {
      allowed: reasons.length === 0,
      reasons,
      estimatedOrderValue: orderValue,
      projectedExposurePercent
    };
  }

  public shouldSurfaceSignal(signal: AISignal): boolean {
    return (
      signal.action === 'hold' ||
      signal.confidence >= this.limits.minConfidenceForAutoAlert
    );
  }
}
