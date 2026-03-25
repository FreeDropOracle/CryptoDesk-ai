// File: src/shared/internal/secure.types.ts
// Responsibility: Main/preload-only security and IPC result contracts.
// Security: Internal only; renderer must not import this module directly.

import type { SupportedExchange } from '../public/constants';

export type AuditSeverity = 'info' | 'warn' | 'error' | 'critical';

export interface EncryptedPayload {
  algorithm: 'AES-256-GCM';
  cipherText: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

export interface AuditRecordInput {
  action: string;
  severity: AuditSeverity;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface StoredSecretRecord {
  exchange: SupportedExchange;
  keyId: string;
  encryptedSecret: string;
  updatedAt: string;
}

export interface IpcSuccess<T> {
  ok: true;
  data: T;
}

export interface IpcFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export type IpcResult<T> = IpcSuccess<T> | IpcFailure;
