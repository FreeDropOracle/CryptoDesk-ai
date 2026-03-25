/// <reference path="../../../types/jest-globals.d.ts" />

import type { WebSocketLike } from '../../../../src/main/trading/types';
import { WebSocketManager } from '../../../../src/main/trading/websocket-manager';

class FakeSocket implements WebSocketLike {
  public onopen: (() => void) | null = null;
  public onmessage: ((event: { data: string }) => void) | null = null;
  public onclose: ((event: { code?: number; reason?: string }) => void) | null = null;
  public onerror: ((event: unknown) => void) | null = null;

  public constructor(public readonly url: string) {}

  public close(): void {}

  public emitOpen(): void {
    this.onopen?.();
  }

  public emitMessage(payload: string): void {
    this.onmessage?.({ data: payload });
  }

  public emitClose(): void {
    this.onclose?.({ code: 1006, reason: 'network' });
  }
}

describe('WebSocketManager', () => {
  it('parses ticker payloads into market data', () => {
    const sockets: FakeSocket[] = [];
    const receivedSymbols: string[] = [];
    const manager = new WebSocketManager({
      exchange: 'binance',
      socketFactory: (url) => {
        const socket = new FakeSocket(url);
        sockets.push(socket);
        return socket;
      },
      onMarketData: (data) => {
        receivedSymbols.push(data.symbol);
      }
    });

    manager.connect('BTC/USDT');

    const socket = sockets[0];

    if (socket === undefined) {
      throw new Error('Expected a socket connection.');
    }

    socket.emitOpen();
    socket.emitMessage(
      JSON.stringify({
        s: 'BTCUSDT',
        c: '65000.00',
        b: '64990.00',
        a: '65010.00',
        P: '1.25',
        v: '1450.5',
        E: 1710000000000
      })
    );

    expect(receivedSymbols[0]).toBe('BTC/USDT');
    expect(manager.getState()).toBe('connected');
  });

  it('reconnects after an unexpected close', async () => {
    const sockets: FakeSocket[] = [];
    const states: string[] = [];
    const manager = new WebSocketManager({
      exchange: 'binance',
      reconnectDelayMs: 1,
      maxReconnects: 2,
      socketFactory: (url) => {
        const socket = new FakeSocket(url);
        sockets.push(socket);
        return socket;
      },
      onStateChange: (state) => {
        states.push(state);
      }
    });

    manager.connect('BTC/USDT');

    const firstSocket = sockets[0];

    if (firstSocket === undefined) {
      throw new Error('Expected the first socket to exist.');
    }

    firstSocket.emitOpen();
    firstSocket.emitClose();

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 5);
    });

    expect(states[states.length - 1]).toBe('reconnecting');
    expect(sockets[1]?.url).toBe('wss://stream.testnet.binance.vision/ws/btcusdt@ticker');
  });
});
