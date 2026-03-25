// File: src/main/db/repositories/base.repo.ts
// Responsibility: Shared repository utilities for prepared-statement based persistence.
// Security: Encourages prepared statements and explicit transaction boundaries.

export type { SqliteDatabase } from '../sqlite.types';
import type { SqliteDatabase } from '../sqlite.types';

export abstract class BaseRepository<TEntity> {
  protected constructor(protected readonly db: SqliteDatabase) {}

  protected runInTransaction<T>(operation: () => T): T {
    const transaction = this.db.transaction(operation);
    return transaction();
  }

  public abstract list(limit?: number): readonly TEntity[];
}
