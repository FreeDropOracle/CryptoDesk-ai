// File: src/main/db/entities/audit.entity.ts
// Responsibility: Persistent audit record shape for SQLite storage.
// Security: Stores audit metadata while relying on logger redaction for sensitive fields.

export interface AuditEntity {
  id: string;
  action: string;
  severity: 'info' | 'warn' | 'error' | 'critical';
  message: string;
  metadata: string;
  timestamp: string;
}
