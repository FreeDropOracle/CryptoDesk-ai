// File: src/main/db/repositories/audit.repo.ts
// Responsibility: Persists audit trail entries using prepared statements.
// Security: Stores structured metadata to support investigations without raw secrets.

import type { AuditEntity } from '../entities/audit.entity';
import { BaseRepository, type SqliteDatabase } from './base.repo';

export class AuditRepository extends BaseRepository<AuditEntity> {
  private readonly insertStatement;
  private readonly listStatement;

  public constructor(db: SqliteDatabase) {
    super(db);
    this.insertStatement = this.db.prepare(
      `INSERT INTO audit_log (id, action, severity, message, metadata, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    this.listStatement = this.db.prepare(
      `SELECT id, action, severity, message, metadata, timestamp
       FROM audit_log
       ORDER BY timestamp DESC
       LIMIT ?`
    );
  }

  public insert(entry: AuditEntity): void {
    this.insertStatement.run(
      entry.id,
      entry.action,
      entry.severity,
      entry.message,
      entry.metadata,
      entry.timestamp
    );
  }

  public list(limit = 100): readonly AuditEntity[] {
    return this.listStatement.all(limit) as AuditEntity[];
  }
}
