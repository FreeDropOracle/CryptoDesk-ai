// File: src/main/ai/alert-stream.ts
// Responsibility: Manages renderer AI alert subscriptions and fan-out delivery.
// Security: Sends validated advisory signals only, keeps per-window cleanup explicit, and never exposes execution controls.

import { IPC_CHANNELS } from '@shared/internal/ipc.channels';
import {
  DEFAULT_AI_ALERT_MIN_CONFIDENCE,
  type AIAlertSubscriptionStatus,
  type AISignal
} from '@shared/public/ai.types';

interface AIAlertTarget {
  send(channel: string, payload: unknown): void;
  once(event: 'destroyed', listener: () => void): void;
  off(event: 'destroyed', listener: () => void): void;
}

interface AIAlertSubscriptionRecord {
  subscriptionId: string;
  senderId: number;
  symbol: string;
  minConfidence: number;
  target: AIAlertTarget;
  onDestroyed: () => void;
  lastFingerprint: string | null;
}

export interface RegisterAIAlertSubscriptionInput {
  senderId: number;
  symbol: string;
  minConfidence?: number;
  target: AIAlertTarget;
}

const buildAlertChannel = (subscriptionId: string): string => {
  return `${IPC_CHANNELS.AI.ALERT}.${subscriptionId}`;
};

const clampConfidence = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_AI_ALERT_MIN_CONFIDENCE;
  }

  return Math.min(Math.max(value, 0), 1);
};

const buildSignalFingerprint = (signal: AISignal): string => {
  return [
    signal.action,
    Math.round(clampConfidence(signal.confidence) * 100),
    signal.filtered ? 'filtered' : 'direct',
    signal.filterReason ?? 'none',
    signal.modelVersion
  ].join(':');
};

export class AIAlertStreamService {
  private readonly subscriptions = new Map<string, AIAlertSubscriptionRecord>();

  private subscriptionCounter = 0;

  public register(input: RegisterAIAlertSubscriptionInput): AIAlertSubscriptionStatus {
    this.subscriptionCounter += 1;
    const subscriptionId = `ai-alert-${Date.now()}-${this.subscriptionCounter}`;
    const minConfidence = clampConfidence(
      input.minConfidence ?? DEFAULT_AI_ALERT_MIN_CONFIDENCE
    );
    const onDestroyed = (): void => {
      this.unregister(subscriptionId);
    };

    input.target.once('destroyed', onDestroyed);
    this.subscriptions.set(subscriptionId, {
      subscriptionId,
      senderId: input.senderId,
      symbol: input.symbol,
      minConfidence,
      target: input.target,
      onDestroyed,
      lastFingerprint: null
    });

    return {
      subscriptionId,
      symbol: input.symbol,
      minConfidence,
      subscribed: true
    };
  }

  public unregister(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);

    if (subscription === undefined) {
      return false;
    }

    subscription.target.off('destroyed', subscription.onDestroyed);
    return this.subscriptions.delete(subscriptionId);
  }

  public clearSender(senderId: number): void {
    const subscriptionIds = [...this.subscriptions.values()]
      .filter((subscription) => subscription.senderId === senderId)
      .map((subscription) => subscription.subscriptionId);

    for (const subscriptionId of subscriptionIds) {
      this.unregister(subscriptionId);
    }
  }

  public hasSubscribersForSymbol(symbol: string): boolean {
    return [...this.subscriptions.values()].some((subscription) => {
      return subscription.symbol === symbol;
    });
  }

  public publish(signal: AISignal): number {
    const fingerprint = buildSignalFingerprint(signal);
    let delivered = 0;

    for (const subscription of this.subscriptions.values()) {
      if (subscription.symbol !== signal.symbol) {
        continue;
      }

      if (signal.confidence < subscription.minConfidence) {
        continue;
      }

      if (subscription.lastFingerprint === fingerprint) {
        continue;
      }

      subscription.lastFingerprint = fingerprint;
      subscription.target.send(buildAlertChannel(subscription.subscriptionId), signal);
      delivered += 1;
    }

    return delivered;
  }
}
