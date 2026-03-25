// File: src/main/db/entities/trade.entity.ts
// Responsibility: Persistent trade record shape for SQLite storage.
// Security: Stores only metadata needed for auditability and recovery.

import type {
  SupportedExchange,
  SupportedOrderSide,
  SupportedOrderType
} from '@shared/public/constants';
import type { TradeStatus } from '@shared/public/trade.types';

export interface TradeEntity {
  id: string;
  exchange: SupportedExchange;
  symbol: string;
  side: SupportedOrderSide;
  type: SupportedOrderType;
  quantity: number;
  price: number | null;
  status: TradeStatus;
  simulation: boolean;
  timestamp: string;
  clientOrderId: string | null;
}
