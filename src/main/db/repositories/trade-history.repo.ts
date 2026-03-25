// File: src/main/db/repositories/trade-history.repo.ts
// Responsibility: Reads and clears simulation-only trade history through prepared statements.
// Security: Enforces `simulation = 1` at the repository layer so training history never mixes with live records.

import { BaseRepository, type SqliteDatabase } from './base.repo';
import type { TradeEntity } from '../entities/trade.entity';

interface TradeHistoryRow {
  id: string;
  exchange: TradeEntity['exchange'];
  symbol: string;
  side: TradeEntity['side'];
  type: TradeEntity['type'];
  quantity: number;
  price: number | null;
  status: TradeEntity['status'];
  simulation: number;
  timestamp: string;
  client_order_id: string | null;
}

const mapTradeHistoryRow = (row: TradeHistoryRow): TradeEntity => {
  return {
    id: row.id,
    exchange: row.exchange,
    symbol: row.symbol,
    side: row.side,
    type: row.type,
    quantity: row.quantity,
    price: row.price,
    status: row.status,
    simulation: row.simulation === 1,
    timestamp: row.timestamp,
    clientOrderId: row.client_order_id
  };
};

export class TradeHistoryRepository extends BaseRepository<TradeEntity> {
  private readonly listSimulationHistoryStatement;
  private readonly countSimulationHistoryStatement;
  private readonly clearSimulationHistoryStatement;
  private readonly clearSimulationHistoryByExchangeStatement;

  public constructor(db: SqliteDatabase) {
    super(db);
    this.listSimulationHistoryStatement = this.db.prepare(
      `SELECT
        id,
        exchange,
        symbol,
        side,
        type,
        quantity,
        price,
        status,
        simulation,
        timestamp,
        client_order_id
      FROM trades
      WHERE simulation = 1
        AND (@exchange IS NULL OR exchange = @exchange)
        AND (@symbol IS NULL OR symbol = @symbol)
      ORDER BY timestamp DESC
      LIMIT @limit
      OFFSET @offset`
    );
    this.countSimulationHistoryStatement = this.db.prepare(
      `SELECT COUNT(*) AS total
      FROM trades
      WHERE simulation = 1
        AND (@exchange IS NULL OR exchange = @exchange)
        AND (@symbol IS NULL OR symbol = @symbol)`
    );
    this.clearSimulationHistoryStatement = this.db.prepare(
      'DELETE FROM trades WHERE simulation = 1'
    );
    this.clearSimulationHistoryByExchangeStatement = this.db.prepare(
      'DELETE FROM trades WHERE simulation = 1 AND exchange = ?'
    );
  }

  public list(limit = 50): readonly TradeEntity[] {
    return this.listSimulationHistory({
      limit,
      offset: 0
    }).items;
  }

  public listSimulationHistory(query: {
    exchange?: TradeEntity['exchange'];
    symbol?: string;
    limit: number;
    offset: number;
  }): {
    items: readonly TradeEntity[];
    total: number;
  } {
    const rows = this.listSimulationHistoryStatement.all({
      exchange: query.exchange ?? null,
      symbol: query.symbol ?? null,
      limit: query.limit,
      offset: query.offset
    }) as TradeHistoryRow[];
    const totalRow = this.countSimulationHistoryStatement.get({
      exchange: query.exchange ?? null,
      symbol: query.symbol ?? null
    }) as { total: number } | undefined;

    return {
      items: rows.map((row) => mapTradeHistoryRow(row)),
      total: totalRow?.total ?? 0
    };
  }

  public clearSimulationHistory(exchange?: TradeEntity['exchange']): number {
    const result =
      exchange === undefined
        ? this.clearSimulationHistoryStatement.run()
        : this.clearSimulationHistoryByExchangeStatement.run(exchange);

    return result.changes;
  }
}
