// File: src/main/security/audit-log.ts
// Responsibility: Records security-relevant events to both logs and persistent storage.
// Security: Ensures failures at trust boundaries are auditable without leaking secrets.

import { randomUUID } from 'node:crypto';
import type { AuditRecordInput, AuditSeverity } from '@shared/internal/secure.types';
import { logger } from '../logger/secure-logger';

export interface AuditEntry {
  id: string;
  action: string;
  severity: AuditSeverity;
  message: string;
  metadata: string;
  timestamp: string;
}

export interface AuditSink {
  insert(entry: AuditEntry): void;
}

export class AuditLogService {
  public constructor(private readonly sink?: AuditSink) {}

  public record(entry: AuditRecordInput): void {
    const timestamp = new Date().toISOString();
    const persistedEntry: AuditEntry = {
      id: randomUUID(),
      action: entry.action,
      severity: entry.severity,
      message: entry.message,
      metadata: JSON.stringify(entry.metadata ?? {}),
      timestamp
    };

    logger.audit(entry.action, {
      severity: entry.severity,
      message: entry.message,
      metadata: entry.metadata,
      timestamp
    });

    this.sink?.insert(persistedEntry);
  }
}
