// File: src/main/trading/portfolio.ts
// Responsibility: Provides a simple portfolio service over the exchange wrapper.
// Security: Portfolio access remains in the main process and returns sanitized snapshots only.

import type { SupportedExchange } from '@shared/public/constants';
import type { PortfolioAccountSnapshot, PortfolioSnapshot } from '@shared/public/market.types';
import type { ExchangeCredentials } from './types';
import { ExchangeService } from './exchange';

export class PortfolioService {
  public constructor(private readonly exchangeService: ExchangeService) {}

  public async getSnapshot(credentials: ExchangeCredentials): Promise<PortfolioSnapshot> {
    return this.exchangeService.fetchPortfolio(credentials);
  }

  public async getPreview(exchange: SupportedExchange): Promise<PortfolioAccountSnapshot> {
    return this.exchangeService.fetchPortfolioPreview(exchange);
  }
}
