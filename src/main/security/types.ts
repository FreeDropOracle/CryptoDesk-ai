// File: src/main/security/types.ts
// Responsibility: Security service contracts and normalized security-domain errors.
// Security: Establishes explicit error codes for auditable failure handling.

import type { EncryptedPayload } from '@shared/internal/secure.types';
import type { SupportedExchange } from '@shared/public/constants';

export type SecurityErrorCode =
  | 'VALIDATION_FAILED'
  | 'FEATURE_DISABLED'
  | 'KEYCHAIN_ERROR'
  | 'ENCRYPTION_ERROR'
  | 'TRADING_RESTRICTED'
  | 'AI_TIMEOUT'
  | 'INTERNAL_ERROR';

export interface KeychainCredentialInput {
  exchange: SupportedExchange;
  keyId: string;
  encryptedSecret: string;
}

export interface StoredKeyReference {
  exchange: SupportedExchange;
  keyId: string;
  updatedAt: string;
}

export interface EncryptionServiceContract {
  encryptString(plainText: string): Promise<EncryptedPayload>;
  decryptString(payload: EncryptedPayload): Promise<string>;
  serializePayload(payload: EncryptedPayload): string;
  deserializePayload(serializedPayload: string): EncryptedPayload;
}

export class SecurityBoundaryError extends Error {
  public constructor(
    public readonly code: SecurityErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SecurityBoundaryError';
  }
}

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unexpected internal error.';
};
