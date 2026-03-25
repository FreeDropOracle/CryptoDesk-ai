// File: src/main/db/repositories/trade.repo.ts
// Responsibility: Stores and queries local trade history using prepared statements.
// Security: Persists only sanitized trade metadata and simulation state.

import { BaseRepository, type SqliteDatabase } from './base.repo';
import type { TradeEntity } from '../entities/trade.entity';

interface TradeRow {
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

const mapTradeRow = (row: TradeRow): TradeEntity => {
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

export class TradeRepository extends BaseRepository<TradeEntity> {
  private readonly insertStatement;
  private readonly listStatement;
  private readonly listHistoryStatement;
  private readonly findByIdStatement;
  private readonly updateStatusStatement;

  public constructor(db: SqliteDatabase) {
    super(db);
    this.insertStatement = this.db.prepare(
      `INSERT INTO trades (
        id, exchange, symbol, side, type, quantity, price, status, simulation, timestamp, client_order_id
      ) VALUES (
        @id, @exchange, @symbol, @side, @type, @quantity, @price, @status, @simulation, @timestamp, @clientOrderId
      )`
    );
    this.listStatement = this.db.prepare(
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
      ORDER BY timestamp DESC
      LIMIT ?`
    );
    this.listHistoryStatement = this.db.prepare(
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
      WHERE (@exchange IS NULL OR exchange = @exchange)
        AND (@symbol IS NULL OR symbol = @symbol)
      ORDER BY timestamp DESC
      LIMIT @limit
      OFFSET @offset`
    );
    this.findByIdStatement = this.db.prepare(
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
      WHERE id = @id AND exchange = @exchange
      LIMIT 1`
    );
    this.updateStatusStatement = this.db.prepare(
      `UPDATE trades
       SET status = @status
       WHERE id = @id AND exchange = @exchange`
    );
  }

  public insert(trade: TradeEntity): void {
    this.insertStatement.run({
      id: trade.id,
      exchange: trade.exchange,
      symbol: trade.symbol,
      side: trade.side,
      type: trade.type,
      quantity: trade.quantity,
      price: trade.price,
      status: trade.status,
      simulation: trade.simulation ? 1 : 0,
      timestamp: trade.timestamp,
      clientOrderId: trade.clientOrderId
    });
  }

  public list(limit = 50): readonly TradeEntity[] {
    const rows = this.listStatement.all(limit) as TradeRow[];
    return rows.map((row) => mapTradeRow(row));
  }

  public findById(id: string, exchange: TradeEntity['exchange']): TradeEntity | null {
    const row = this.findByIdStatement.get({
      id,
      exchange
    }) as TradeRow | undefined;

    return row === undefined ? null : mapTradeRow(row);
  }

  public updateStatus(
    id: string,
    exchange: TradeEntity['exchange'],
    status: TradeEntity['status']
  ): TradeEntity | null {
    this.updateStatusStatement.run({
      id,
      exchange,
      status
    });

    return this.findById(id, exchange);
  }

  public listHistory(query: {
    exchange?: TradeEntity['exchange'];
    symbol?: string;
    limit: number;
    offset: number;
  }): readonly TradeEntity[] {
    const rows = this.listHistoryStatement.all({
      exchange: query.exchange ?? null,
      symbol: query.symbol ?? null,
      limit: query.limit,
      offset: query.offset
    }) as TradeRow[];

    return rows.map((row) => mapTradeRow(row));
  }
}
