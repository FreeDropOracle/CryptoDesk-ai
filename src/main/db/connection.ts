// File: src/main/db/connection.ts
// Responsibility: Creates the local SQLite connection and applies the base schema.
// Security: Uses an app-local database path and never stores exchange secrets in SQLite.

import path from 'node:path';
import { mkdirSync } from 'node:fs';
import Database from 'better-sqlite3';
import type { SqliteDatabase } from './sqlite.types';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS trades (
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
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT NOT NULL,
  timestamp TEXT NOT NULL
);
`;

export class DatabaseConnection {
  private database: SqliteDatabase | null = null;

  public getDatabase(databasePath: string): SqliteDatabase {
    if (this.database !== null) {
      return this.database;
    }

    mkdirSync(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    database.pragma('journal_mode = WAL');
    database.pragma('foreign_keys = ON');
    database.exec(SCHEMA_SQL);
    this.database = database;
    return database;
  }
}

export const databaseConnection = new DatabaseConnection();
