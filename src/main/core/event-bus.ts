// File: src/main/core/event-bus.ts
// Responsibility: Typed internal event coordination across main-process domains.
// Security: Events carry sanitized payloads and never raw credentials.

import { EventEmitter } from 'node:events';
import type { AuditRecordInput } from '@shared/internal/secure.types';
import type { MarketData } from '@shared/public/market.types';
import type { AISignal, PublicTrade } from '@shared/public/trade.types';

interface AppEvents {
  'market:update': MarketData;
  'trade:queued': PublicTrade;
  'trade:completed': PublicTrade;
  'trade:cancelled': PublicTrade;
  'ai:signal': AISignal;
  'audit:recorded': AuditRecordInput;
}

export class EventBus {
  private readonly emitter = new EventEmitter();

  public on<K extends keyof AppEvents>(
    eventName: K,
    listener: (payload: AppEvents[K]) => void
  ): () => void {
    this.emitter.on(eventName, listener);
    return (): void => {
      this.emitter.off(eventName, listener);
    };
  }

  public emit<K extends keyof AppEvents>(eventName: K, payload: AppEvents[K]): void {
    this.emitter.emit(eventName, payload);
  }
}

export const eventBus = new EventBus();
