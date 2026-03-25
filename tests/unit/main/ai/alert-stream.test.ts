/// <reference path="../../../types/jest-globals.d.ts" />

import type { AISignal } from '../../../../src/shared/public/ai.types';
import { AIAlertStreamService } from '../../../../src/main/ai/alert-stream';

class MockAlertTarget {
  public readonly sent: Array<{
    channel: string;
    payload: unknown;
  }> = [];

  private destroyedListener: (() => void) | null = null;

  public send(channel: string, payload: unknown): void {
    this.sent.push({ channel, payload });
  }

  public once(event: 'destroyed', listener: () => void): void {
    if (event === 'destroyed') {
      this.destroyedListener = listener;
    }
  }

  public off(event: 'destroyed', listener: () => void): void {
    if (event === 'destroyed' && this.destroyedListener === listener) {
      this.destroyedListener = null;
    }
  }

  public destroy(): void {
    this.destroyedListener?.();
  }
}

const buildSignal = (overrides: Partial<AISignal> = {}): AISignal => {
  return {
    symbol: 'BTC/USDT',
    action: 'buy',
    confidence: 0.82,
    reasoning: ['Momentum remains constructive.'],
    riskScore: 0.28,
    generatedAt: '2026-03-23T12:00:00.000Z',
    source: 'heuristic',
    modelVersion: 'v1.0.0-rules',
    filtered: false,
    filterReason: null,
    advisory: 'human-in-the-loop',
    ...overrides
  };
};

describe('AIAlertStreamService', () => {
  it('delivers only alerts that satisfy the subscription threshold', () => {
    const service = new AIAlertStreamService();
    const target = new MockAlertTarget();
    const subscription = service.register({
      senderId: 1,
      symbol: 'BTC/USDT',
      minConfidence: 0.7,
      target
    });

    const lowConfidenceDeliveries = service.publish(
      buildSignal({
        confidence: 0.62
      })
    );
    const matchingDeliveries = service.publish(buildSignal());

    expect(subscription.subscribed).toBe(true);
    expect(lowConfidenceDeliveries).toBe(0);
    expect(matchingDeliveries).toBe(1);
    expect(target.sent[0]?.channel).toContain(subscription.subscriptionId);
  });

  it('suppresses duplicate fingerprints and clears destroyed senders', () => {
    const service = new AIAlertStreamService();
    const target = new MockAlertTarget();

    service.register({
      senderId: 9,
      symbol: 'BTC/USDT',
      target
    });

    const firstDelivery = service.publish(buildSignal());
    const duplicateDelivery = service.publish(buildSignal());

    expect(firstDelivery).toBe(1);
    expect(duplicateDelivery).toBe(0);

    target.destroy();

    const postDestroyDelivery = service.publish(
      buildSignal({
        generatedAt: '2026-03-23T12:05:00.000Z',
        confidence: 0.91,
        action: 'sell'
      })
    );

    expect(postDestroyDelivery).toBe(0);
  });
});
