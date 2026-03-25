/// <reference path="../../../types/jest-globals.d.ts" />

const keytarStore = new Map<string, string>();

jest.mock('keytar', () => ({
  __esModule: true,
  default: {
    setPassword: jest.fn(async (service: string, account: string, secret: string) => {
      keytarStore.set(`${service}:${account}`, secret);
    }),
    getPassword: jest.fn(async (service: string, account: string) => {
      return keytarStore.get(`${service}:${account}`) ?? null;
    }),
    deletePassword: jest.fn(async (service: string, account: string) => {
      return keytarStore.delete(`${service}:${account}`);
    })
  }
}));

import { IPC_SCHEMAS } from '../../../../src/shared/internal/ipc.schemas';
import { KeychainService } from '../../../../src/main/security/keychain';
import { SecurityBoundaryError } from '../../../../src/main/security/types';
import { validateSchema } from '../../../../src/main/security/validator';

describe('security IPC contracts', () => {
  it('returns credential metadata without exposing encrypted payloads', async () => {
    const service = new KeychainService('cryptodesk-ai-test');

    await service.saveCredential({
      exchange: 'binance',
      keyId: 'primary',
      encryptedSecret: 'opaque-ciphertext'
    });

    const metadata = await service.getCredentialReference('binance', 'primary');

    if (metadata === null) {
      throw new Error('Expected stored credential metadata.');
    }

    expect(metadata.exchange).toBe('binance');
    expect(metadata.keyId).toBe('primary');
    expect(metadata.updatedAt).toMatch(/T/);
    expect('encryptedSecret' in metadata).toBe(false);
  });

  it('rejects delete requests without explicit confirmation', () => {
    let caughtError: unknown;

    try {
      validateSchema(IPC_SCHEMAS.security.deleteKey, {
        exchange: 'binance',
        keyId: 'primary',
        confirmationCode: 'NOPE'
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(SecurityBoundaryError);
  });

  it('accepts confirmed delete requests', () => {
    const payload = validateSchema(IPC_SCHEMAS.security.deleteKey, {
      exchange: 'binance',
      keyId: 'primary',
      confirmationCode: 'DELETE'
    });

    expect(payload.confirmationCode).toBe('DELETE');
  });

  it('rejects oversized trade history requests', () => {
    let caughtError: unknown;

    try {
      validateSchema(IPC_SCHEMAS.trade.history, {
        exchange: 'binance',
        limit: 101,
        offset: 0
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(SecurityBoundaryError);
  });

  it('accepts paginated trade history requests', () => {
    const payload = validateSchema(IPC_SCHEMAS.trade.history, {
      exchange: 'binance',
      symbol: 'BTC/USDT',
      limit: 25,
      offset: 0
    });

    expect(payload.limit).toBe(25);
    expect(payload.offset).toBe(0);
  });
});
