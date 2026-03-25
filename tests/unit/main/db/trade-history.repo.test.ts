/// <reference path="../../../types/jest-globals.d.ts" />

import Database from 'better-sqlite3';
import { TradeHistoryRepository } from '../../../../src/main/db/repositories/trade-history.repo';

describe('TradeHistoryRepository', () => {
  it('returns only simulation trades from the ledger', () => {
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE trades (
        id TEXT PRIMARY KEY,
        exchange TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL,
        status TEXT NOT NULL,
        simulation INTEGER NOT NULL DEFAULT 1,
        timestamp TEXT NOT NULL,
        client_order_id TEXT
      )
    `);

    db.prepare(
      `INSERT INTO trades (
        id, exchange, symbol, side, type, quantity, price, status, simulation, timestamp, client_order_id
      ) VALUES (
        @id, @exchange, @symbol, @side, @type, @quantity, @price, @status, @simulation, @timestamp, @clientOrderId
      )`
    ).run({
      id: 'sim-1',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      quantity: 0.01,
      price: 65000,
      status: 'filled',
      simulation: 1,
      timestamp: '2026-03-23T10:00:00.000Z',
      clientOrderId: null
    });

    db.prepare(
      `INSERT INTO trades (
        id, exchange, symbol, side, type, quantity, price, status, simulation, timestamp, client_order_id
      ) VALUES (
        @id, @exchange, @symbol, @side, @type, @quantity, @price, @status, @simulation, @timestamp, @clientOrderId
      )`
    ).run({
      id: 'live-1',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      quantity: 0.02,
      price: 66000,
      status: 'filled',
      simulation: 0,
      timestamp: '2026-03-23T11:00:00.000Z',
      clientOrderId: null
    });

    const repo = new TradeHistoryRepository(db);
    const history = repo.listSimulationHistory({
      symbol: 'BTC/USDT',
      limit: 10,
      offset: 0
    });

    expect(history.items).toHaveLength(1);
    expect(history.items[0]?.simulation).toBe(true);
    expect(history.total).toBe(1);
  });

  it('clears simulation trades without touching non-simulated rows', () => {
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE trades (
        id TEXT PRIMARY KEY,
        exchange TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity REAL NOT NULL,
        price REAL,
        status TEXT NOT NULL,
        simulation INTEGER NOT NULL DEFAULT 1,
        timestamp TEXT NOT NULL,
        client_order_id TEXT
      )
    `);

    const insert = db.prepare(
      `INSERT INTO trades (
        id, exchange, symbol, side, type, quantity, price, status, simulation, timestamp, client_order_id
      ) VALUES (
        @id, @exchange, @symbol, @side, @type, @quantity, @price, @status, @simulation, @timestamp, @clientOrderId
      )`
    );

    insert.run({
      id: 'sim-1',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'buy',
      type: 'limit',
      quantity: 0.01,
      price: 65000,
      status: 'filled',
      simulation: 1,
      timestamp: '2026-03-23T10:00:00.000Z',
      clientOrderId: null
    });
    insert.run({
      id: 'live-1',
      exchange: 'binance',
      symbol: 'BTC/USDT',
      side: 'sell',
      type: 'limit',
      quantity: 0.02,
      price: 67000,
      status: 'filled',
      simulation: 0,
      timestamp: '2026-03-23T11:00:00.000Z',
      clientOrderId: null
    });

    const repo = new TradeHistoryRepository(db);
    const cleared = repo.clearSimulationHistory();
    const remaining = db
      .prepare('SELECT COUNT(*) AS total FROM trades WHERE simulation = 0')
      .get() as { total: number };

    expect(cleared).toBe(1);
    expect(remaining.total).toBe(1);
  });
});
