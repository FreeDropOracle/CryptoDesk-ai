// File: src/main/trading/simulation-engine.ts
// Responsibility: Executes local-only simulation trades and maintains virtual balances.
// Security: Never touches exchange APIs or credentials; all state is local and non-custodial.

import { randomUUID } from 'node:crypto';
import {
  DEFAULT_QUOTE_CURRENCY,
  type SupportedExchange,
  type SupportedOrderSide,
  type SupportedOrderType
} from '@shared/public/constants';
import type {
  PortfolioBalance,
  PortfolioPosition,
  PortfolioSnapshot
} from '@shared/public/market.types';
import type { PublicTrade } from '@shared/public/trade.types';
import { resolveReferencePrice, type ValidatedOrder } from './order-validation';

export interface SimulationEngineOptions {
  defaultQuoteAsset?: string;
  initialQuoteBalance?: number;
  marketSlippageBps?: number;
  limitSlippageBps?: number;
}

export interface SimulationExecutionContext {
  referencePrice: number;
  timestamp?: string;
}

export interface SimulationSuccessResult {
  success: true;
  trade: PublicTrade;
  executedPrice: number;
  portfolio: PortfolioSnapshot;
}

export interface SimulationFailureResult {
  success: false;
  code: 'INSUFFICIENT_VIRTUAL_BALANCE' | 'INVALID_REFERENCE_PRICE';
  message: string;
  portfolio: PortfolioSnapshot;
}

export type SimulationExecutionResult =
  | SimulationSuccessResult
  | SimulationFailureResult;

const roundAssetBalance = (value: number): number => {
  return Number(value.toFixed(8));
};

const roundPrice = (value: number): number => {
  return Number(value.toFixed(2));
};

const parseSymbol = (symbol: string): { baseAsset: string; quoteAsset: string } => {
  const [baseAsset, quoteAsset] = symbol.split('/');

  return {
    baseAsset: baseAsset ?? '',
    quoteAsset: quoteAsset ?? ''
  };
};

export class SimulationEngine {
  private readonly defaultQuoteAsset: string;
  private readonly initialQuoteBalance: number;
  private readonly marketSlippageBps: number;
  private readonly limitSlippageBps: number;
  private readonly balancesByExchange = new Map<SupportedExchange, Map<string, number>>();
  private readonly lastKnownSymbolPrices = new Map<string, number>();
  private readonly historyByExchange = new Map<SupportedExchange, PublicTrade[]>();

  public constructor(options: SimulationEngineOptions = {}) {
    this.defaultQuoteAsset = options.defaultQuoteAsset ?? DEFAULT_QUOTE_CURRENCY;
    this.initialQuoteBalance = options.initialQuoteBalance ?? 10_000;
    this.marketSlippageBps = options.marketSlippageBps ?? 12;
    this.limitSlippageBps = options.limitSlippageBps ?? 4;
  }

  public getPortfolioSnapshot(exchange: SupportedExchange): PortfolioSnapshot {
    return this.buildPortfolioSnapshot(exchange, this.ensureExchangeState(exchange));
  }

  public getTradeHistory(exchange: SupportedExchange): readonly PublicTrade[] {
    return [...(this.historyByExchange.get(exchange) ?? [])];
  }

  public reset(exchange?: SupportedExchange): void {
    if (exchange === undefined) {
      this.balancesByExchange.clear();
      this.historyByExchange.clear();
      this.lastKnownSymbolPrices.clear();
      return;
    }

    this.balancesByExchange.delete(exchange);
    this.historyByExchange.delete(exchange);

    for (const priceKey of Array.from(this.lastKnownSymbolPrices.keys())) {
      if (priceKey.startsWith(`${exchange}:`)) {
        this.lastKnownSymbolPrices.delete(priceKey);
      }
    }
  }

  public async executeOrder(
    order: ValidatedOrder,
    context: SimulationExecutionContext
  ): Promise<SimulationExecutionResult> {
    const referencePrice = resolveReferencePrice(order, context.referencePrice);
    const balances = this.ensureExchangeState(order.exchange);

    if (referencePrice === null) {
      return {
        success: false,
        code: 'INVALID_REFERENCE_PRICE',
        message: 'A valid market reference price is required before simulation.',
        portfolio: this.buildPortfolioSnapshot(order.exchange, balances)
      };
    }

    const { baseAsset, quoteAsset } = parseSymbol(order.symbol);
    const executedPrice = this.applySlippage(referencePrice, order.side, order.type);
    const orderValue = order.quantity * executedPrice;

    if (order.side === 'buy') {
      const availableQuote = balances.get(quoteAsset) ?? 0;

      if (availableQuote < orderValue) {
        return {
          success: false,
          code: 'INSUFFICIENT_VIRTUAL_BALANCE',
          message: `Simulation balance is too low to buy ${order.quantity} ${baseAsset}.`,
          portfolio: this.buildPortfolioSnapshot(order.exchange, balances)
        };
      }

      balances.set(quoteAsset, roundAssetBalance(availableQuote - orderValue));
      balances.set(baseAsset, roundAssetBalance((balances.get(baseAsset) ?? 0) + order.quantity));
    } else {
      const availableBase = balances.get(baseAsset) ?? 0;

      if (availableBase < order.quantity) {
        return {
          success: false,
          code: 'INSUFFICIENT_VIRTUAL_BALANCE',
          message: `Simulation balance is too low to sell ${order.quantity} ${baseAsset}.`,
          portfolio: this.buildPortfolioSnapshot(order.exchange, balances)
        };
      }

      balances.set(baseAsset, roundAssetBalance(availableBase - order.quantity));
      balances.set(quoteAsset, roundAssetBalance((balances.get(quoteAsset) ?? 0) + orderValue));
    }

    const timestamp = context.timestamp ?? new Date().toISOString();
    this.lastKnownSymbolPrices.set(this.getPriceKey(order.exchange, order.symbol), executedPrice);

    const optionalFields: Partial<Pick<PublicTrade, 'clientOrderId' | 'price'>> = {
      price: executedPrice
    };

    if (typeof order.clientOrderId === 'string') {
      optionalFields.clientOrderId = order.clientOrderId;
    }

    const trade: PublicTrade = {
      id: randomUUID(),
      exchange: order.exchange,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      status: 'filled',
      simulation: true,
      timestamp,
      ...optionalFields
    };

    const tradeHistory = this.historyByExchange.get(order.exchange) ?? [];
    this.historyByExchange.set(order.exchange, [trade, ...tradeHistory].slice(0, 100));

    return {
      success: true,
      trade,
      executedPrice,
      portfolio: this.buildPortfolioSnapshot(order.exchange, balances)
    };
  }

  private ensureExchangeState(exchange: SupportedExchange): Map<string, number> {
    const existingState = this.balancesByExchange.get(exchange);

    if (existingState !== undefined) {
      return existingState;
    }

    const initialState = new Map<string, number>([
      [this.defaultQuoteAsset, this.initialQuoteBalance]
    ]);
    this.balancesByExchange.set(exchange, initialState);
    return initialState;
  }

  private applySlippage(
    referencePrice: number,
    side: SupportedOrderSide,
    type: SupportedOrderType
  ): number {
    const slippageBps = type === 'market' ? this.marketSlippageBps : this.limitSlippageBps;
    const direction = side === 'buy' ? 1 : -1;

    return roundPrice(referencePrice * (1 + (direction * slippageBps) / 10_000));
  }

  private buildPortfolioSnapshot(
    exchange: SupportedExchange,
    balances: Map<string, number>
  ): PortfolioSnapshot {
    const portfolioBalances = Array.from(balances.entries())
      .filter(([, total]) => total > 0)
      .sort(([leftAsset], [rightAsset]) => leftAsset.localeCompare(rightAsset))
      .map(([asset, total]) => {
        const totalRounded = roundAssetBalance(total);

        return {
          asset,
          free: totalRounded,
          used: 0,
          total: totalRounded,
          fiatValue: this.toFiatValue(exchange, asset, totalRounded)
        } satisfies PortfolioBalance;
      });

    const positions = portfolioBalances
      .filter((balance) => balance.asset !== this.defaultQuoteAsset && balance.total > 0)
      .map((balance) => {
        const symbol = `${balance.asset}/${this.defaultQuoteAsset}`;
        const marketPrice =
          this.lastKnownSymbolPrices.get(this.getPriceKey(exchange, symbol)) ?? 0;

        return {
          symbol,
          quantity: balance.total,
          averageEntryPrice: marketPrice,
          marketPrice,
          unrealizedPnl: 0
        } satisfies PortfolioPosition;
      });

    return {
      exchange,
      balances: portfolioBalances,
      positions,
      totalValue: portfolioBalances.reduce((sum, balance) => sum + balance.fiatValue, 0),
      timestamp: new Date().toISOString()
    };
  }

  private toFiatValue(
    exchange: SupportedExchange,
    asset: string,
    total: number
  ): number {
    if (asset === this.defaultQuoteAsset) {
      return roundPrice(total);
    }

    const symbol = `${asset}/${this.defaultQuoteAsset}`;
    const marketPrice = this.lastKnownSymbolPrices.get(this.getPriceKey(exchange, symbol));

    if (marketPrice === undefined) {
      return 0;
    }

    return roundPrice(total * marketPrice);
  }

  private getPriceKey(exchange: SupportedExchange, symbol: string): string {
    return `${exchange}:${symbol}`;
  }
}
