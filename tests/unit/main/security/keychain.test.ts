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

import { KeychainService } from '../../../../src/main/security/keychain';

describe('KeychainService', () => {
  it('saves an encrypted credential reference', async () => {
    const service = new KeychainService('cryptodesk-ai-test');
    const result = await service.saveCredential({
      exchange: 'binance',
      keyId: 'primary',
      encryptedSecret: '{"cipherText":"abc"}'
    });

    expect(result.exchange).toBe('binance');
    expect(result.keyId).toBe('primary');
    expect(result.updatedAt).toMatch(/T/);
  });

  it('reads and deletes raw secrets by account name', async () => {
    const service = new KeychainService('cryptodesk-ai-test');

    await service.saveSecret('custom-account', 'opaque-secret');

    await expect(service.getSecret('custom-account')).resolves.toBe('opaque-secret');
    await expect(service.deleteSecret('custom-account')).resolves.toBe(true);
  });
});
