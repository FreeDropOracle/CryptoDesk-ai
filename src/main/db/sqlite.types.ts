// File: src/main/db/sqlite.types.ts
// Responsibility: Centralizes the runtime SQLite instance type for repositories and connection management.
// Security: Keeps persistence typing explicit while avoiding secret storage concerns in type-only utilities.

import Database from 'better-sqlite3';

export type SqliteDatabase = InstanceType<typeof Database>;
