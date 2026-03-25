/// <reference path="../../../types/jest-globals.d.ts" />

import { Buffer } from 'node:buffer';

const keychainStore = new Map<string, string>();

jest.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => false,
    encryptString: (value: string) => Buffer.from(value, 'utf8'),
    decryptString: (buffer: Buffer) => buffer.toString('utf8')
  }
}));

jest.mock('keytar', () => ({
  __esModule: true,
  default: {
    setPassword: jest.fn(async (service: string, account: string, secret: string) => {
      keychainStore.set(`${service}:${account}`, secret);
    }),
    getPassword: jest.fn(async (service: string, account: string) => {
      return keychainStore.get(`${service}:${account}`) ?? null;
    }),
    deletePassword: jest.fn(async (service: string, account: string) => {
      return keychainStore.delete(`${service}:${account}`);
    })
  }
}));

import { EncryptionService } from '../../../../src/main/security/encryption';
import { KeychainService } from '../../../../src/main/security/keychain';

describe('EncryptionService', () => {
  it('encrypts and decrypts a secret locally', async () => {
    const keychain = new KeychainService('cryptodesk-ai-test');
    const encryption = new EncryptionService(keychain);
    const payload = await encryption.encryptString('super-secret-value');
    const decrypted = await encryption.decryptString(payload);

    expect(payload.algorithm).toBe('AES-256-GCM');
    expect(decrypted).toBe('super-secret-value');
  });

  it('rejects tampered payloads during decryption', async () => {
    const keychain = new KeychainService('cryptodesk-ai-test');
    const encryption = new EncryptionService(keychain);
    const payload = await encryption.encryptString('super-secret-value');

    await expect(
      encryption.decryptString({
        ...payload,
        authTag: Buffer.from('tampered-auth-tag').toString('base64')
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it('round-trips serialized encrypted payloads', async () => {
    const keychain = new KeychainService('cryptodesk-ai-test');
    const encryption = new EncryptionService(keychain);
    const payload = await encryption.encryptString('round-trip-secret');
    const serialized = encryption.serializePayload(payload);
    const restored = encryption.deserializePayload(serialized);

    expect(restored.algorithm).toBe('AES-256-GCM');
    expect(restored.keyVersion).toBe(1);
  });
});
