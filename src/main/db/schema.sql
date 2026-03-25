-- File: src/main/db/schema.sql
-- Responsibility: Reference schema for the local SQLite database.
-- Security: Tables exclude raw secrets and keep all sensitive storage in keychain.

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
