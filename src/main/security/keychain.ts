// File: src/main/security/keychain.ts
// Responsibility: Persists encrypted secrets in the OS keychain.
// Security: Secrets never touch localStorage, IndexedDB, or remote infrastructure.

import keytar from 'keytar';
import type { SupportedExchange } from '@shared/public/constants';
import type { KeychainCredentialInput, StoredKeyReference } from './types';
import { SecurityBoundaryError } from './types';

interface StoredCredentialPayload {
  encryptedSecret: string;
  updatedAt: string;
}

const buildAccountName = (exchange: string, keyId: string): string => {
  return `${exchange}:${keyId}`;
};

const isStoredCredentialPayload = (value: unknown): value is StoredCredentialPayload => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.encryptedSecret === 'string' &&
    candidate.encryptedSecret.length > 0 &&
    typeof candidate.updatedAt === 'string' &&
    candidate.updatedAt.length > 0
  );
};

export class KeychainService {
  public constructor(private readonly serviceName: string) {}

  public async saveCredential(input: KeychainCredentialInput): Promise<StoredKeyReference> {
    try {
      const updatedAt = new Date().toISOString();
      const payload = JSON.stringify({
        encryptedSecret: input.encryptedSecret,
        updatedAt
      });

      await keytar.setPassword(
        this.serviceName,
        buildAccountName(input.exchange, input.keyId),
        payload
      );

      return {
        exchange: input.exchange,
        keyId: input.keyId,
        updatedAt
      };
    } catch (error) {
      throw new SecurityBoundaryError(
        'KEYCHAIN_ERROR',
        error instanceof Error ? error.message : 'Failed to save credential.'
      );
    }
  }

  public async saveSecret(account: string, secret: string): Promise<void> {
    try {
      await keytar.setPassword(this.serviceName, account, secret);
    } catch (error) {
      throw new SecurityBoundaryError(
        'KEYCHAIN_ERROR',
        error instanceof Error ? error.message : 'Failed to save secret.'
      );
    }
  }

  public async getSecret(account: string): Promise<string | null> {
    try {
      return await keytar.getPassword(this.serviceName, account);
    } catch (error) {
      throw new SecurityBoundaryError(
        'KEYCHAIN_ERROR',
        error instanceof Error ? error.message : 'Failed to read secret.'
      );
    }
  }

  public async deleteSecret(account: string): Promise<boolean> {
    try {
      return await keytar.deletePassword(this.serviceName, account);
    } catch (error) {
      throw new SecurityBoundaryError(
        'KEYCHAIN_ERROR',
        error instanceof Error ? error.message : 'Failed to delete secret.'
      );
    }
  }

  public async getCredentialReference(
    exchange: SupportedExchange,
    keyId: string
  ): Promise<StoredKeyReference | null> {
    const serializedPayload = await this.getSecret(buildAccountName(exchange, keyId));

    if (serializedPayload === null) {
      return null;
    }

    let parsedPayload: unknown;

    try {
      parsedPayload = JSON.parse(serializedPayload) as unknown;
    } catch {
      throw new SecurityBoundaryError(
        'KEYCHAIN_ERROR',
        'Stored credential metadata is malformed.'
      );
    }

    if (!isStoredCredentialPayload(parsedPayload)) {
      throw new SecurityBoundaryError(
        'KEYCHAIN_ERROR',
        'Stored credential metadata is malformed.'
      );
    }

    return {
      exchange,
      keyId,
      updatedAt: parsedPayload.updatedAt
    };
  }

  public async deleteCredential(
    exchange: SupportedExchange,
    keyId: string
  ): Promise<boolean> {
    return this.deleteSecret(buildAccountName(exchange, keyId));
  }
}
