// File: src/main/security/encryption.ts
// Responsibility: Performs local AES-256-GCM encryption for high-risk secrets.
// Security: Uses a per-device master key stored in the OS keychain, optionally wrapped by Electron safeStorage.

import { Buffer } from 'node:buffer';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { safeStorage } from 'electron';
import type { EncryptedPayload } from '@shared/internal/secure.types';
import type { EncryptionServiceContract } from './types';
import { KeychainService } from './keychain';
import { SecurityBoundaryError } from './types';

const MASTER_KEY_ACCOUNT = '__cryptodesk_master_key__';
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;
const KEY_VERSION = 1;

const encodeMasterKey = (masterKeyBase64: string): string => {
  if (safeStorage.isEncryptionAvailable()) {
    const encryptedBuffer = safeStorage.encryptString(masterKeyBase64);
    return `safe:${encryptedBuffer.toString('base64')}`;
  }

  return `plain:${masterKeyBase64}`;
};

const decodeMasterKey = (storedValue: string): string => {
  if (storedValue.startsWith('safe:')) {
    const buffer = Buffer.from(storedValue.slice(5), 'base64');
    return safeStorage.decryptString(buffer);
  }

  if (storedValue.startsWith('plain:')) {
    return storedValue.slice(6);
  }

  throw new SecurityBoundaryError('ENCRYPTION_ERROR', 'Unsupported master key format.');
};

const decodeBase64 = (
  encodedValue: string,
  fieldName: string,
  expectedLength?: number
): Buffer => {
  try {
    const buffer = Buffer.from(encodedValue, 'base64');

    if (expectedLength !== undefined && buffer.length !== expectedLength) {
      throw new SecurityBoundaryError(
        'ENCRYPTION_ERROR',
        `${fieldName} has an invalid length.`
      );
    }

    return buffer;
  } catch (error) {
    if (error instanceof SecurityBoundaryError) {
      throw error;
    }

    throw new SecurityBoundaryError(
      'ENCRYPTION_ERROR',
      `${fieldName} is not valid base64 data.`
    );
  }
};

const isEncryptedPayload = (value: unknown): value is EncryptedPayload => {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    payload.algorithm === 'AES-256-GCM' &&
    typeof payload.cipherText === 'string' &&
    typeof payload.iv === 'string' &&
    typeof payload.authTag === 'string' &&
    typeof payload.keyVersion === 'number'
  );
};

export class EncryptionService implements EncryptionServiceContract {
  public constructor(private readonly keychainService: KeychainService) {}

  public async encryptString(plainText: string): Promise<EncryptedPayload> {
    let key: Buffer | null = null;
    let iv: Buffer | null = null;

    try {
      key = await this.getOrCreateMasterKey();
      iv = randomBytes(IV_LENGTH_BYTES);
      const cipher = createCipheriv(ALGORITHM, key, iv);
      const cipherTextBuffer = Buffer.concat([
        cipher.update(plainText, 'utf8'),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag();

      return {
        algorithm: 'AES-256-GCM',
        cipherText: cipherTextBuffer.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyVersion: KEY_VERSION
      };
    } catch (error) {
      throw new SecurityBoundaryError(
        'ENCRYPTION_ERROR',
        error instanceof Error ? error.message : 'Failed to encrypt secret.'
      );
    } finally {
      EncryptionService.wipeBuffer(key);
      EncryptionService.wipeBuffer(iv);
    }
  }

  public async decryptString(payload: EncryptedPayload): Promise<string> {
    let key: Buffer | null = null;
    let iv: Buffer | null = null;
    let authTag: Buffer | null = null;

    try {
      key = await this.getOrCreateMasterKey();
      iv = decodeBase64(payload.iv, 'Initialization vector', IV_LENGTH_BYTES);
      authTag = decodeBase64(payload.authTag, 'Authentication tag', AUTH_TAG_LENGTH_BYTES);
      const cipherText = decodeBase64(payload.cipherText, 'Cipher text');
      const decipher = createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      const plainTextBuffer = Buffer.concat([
        decipher.update(cipherText),
        decipher.final()
      ]);
      const plainText = plainTextBuffer.toString('utf8');
      EncryptionService.wipeBuffer(cipherText);
      EncryptionService.wipeBuffer(plainTextBuffer);
      return plainText;
    } catch (error) {
      throw new SecurityBoundaryError(
        'ENCRYPTION_ERROR',
        error instanceof Error ? error.message : 'Failed to decrypt secret.'
      );
    } finally {
      EncryptionService.wipeBuffer(key);
      EncryptionService.wipeBuffer(iv);
      EncryptionService.wipeBuffer(authTag);
    }
  }

  public serializePayload(payload: EncryptedPayload): string {
    return JSON.stringify(payload);
  }

  public deserializePayload(serializedPayload: string): EncryptedPayload {
    const parsedPayload: unknown = (() => {
      try {
        return JSON.parse(serializedPayload) as unknown;
      } catch {
        throw new SecurityBoundaryError(
          'ENCRYPTION_ERROR',
          'Encrypted payload is not valid JSON.'
        );
      }
    })();

    if (!isEncryptedPayload(parsedPayload)) {
      throw new SecurityBoundaryError(
        'ENCRYPTION_ERROR',
        'Encrypted payload has an invalid structure.'
      );
    }

    if (parsedPayload.keyVersion !== KEY_VERSION) {
      throw new SecurityBoundaryError(
        'ENCRYPTION_ERROR',
        'Encrypted payload key version is unsupported.'
      );
    }

    return parsedPayload;
  }

  public static wipeBuffer(buffer: Buffer | null): void {
    try {
      if (buffer !== null) {
        buffer.fill(0);
      }
    } catch {
      // Ignore wipe failures so cleanup never masks the original security error.
    }
  }

  private async getOrCreateMasterKey(): Promise<Buffer> {
    const existingValue = await this.keychainService.getSecret(MASTER_KEY_ACCOUNT);

    if (existingValue !== null) {
      const decoded = decodeBase64(
        decodeMasterKey(existingValue),
        'Stored master key',
        KEY_LENGTH_BYTES
      );
      if (decoded.length !== KEY_LENGTH_BYTES) {
        throw new SecurityBoundaryError(
          'ENCRYPTION_ERROR',
          'Stored master key has an invalid length.'
        );
      }

      return decoded;
    }

    const generatedKey = randomBytes(KEY_LENGTH_BYTES);
    const encodedValue = encodeMasterKey(generatedKey.toString('base64'));
    await this.keychainService.saveSecret(MASTER_KEY_ACCOUNT, encodedValue);
    return generatedKey;
  }
}
