export class MockExchange {
  public sandboxEnabled = false;

  public constructor(_options?: Record<string, unknown>) {}

  public async fetchTicker(symbol: string): Promise<{
    last: number;
    bid: number;
    ask: number;
    percentage: number;
    baseVolume: number;
    timestamp: number;
    symbol: string;
  }> {
    return {
      symbol,
      last: 65000,
      bid: 64990,
      ask: 65010,
      percentage: 1.2,
      baseVolume: 1450,
      timestamp: Date.now()
    };
  }

  public setSandboxMode(enabled: boolean): void {
    this.sandboxEnabled = enabled;
  }

  public async fetchBalance(): Promise<{
    total: Record<string, number>;
    free: Record<string, number>;
    used: Record<string, number>;
  }> {
    return {
      total: { USDT: 10000 },
      free: { USDT: 10000 },
      used: { USDT: 0 }
    };
  }
}
