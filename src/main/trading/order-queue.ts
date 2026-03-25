// File: src/main/trading/order-queue.ts
// Responsibility: Provides rate-limited task execution plus serialized order handling.
// Security: Prevents bursty exchange traffic and keeps side effects ordered and observable.

import type { PublicTrade } from '@shared/public/trade.types';
import type { PlaceOrderRequest } from '@shared/internal/ipc.schemas';
import type { RateLimitQueueOptions } from './types';

type OrderExecutor = (order: PlaceOrderRequest) => Promise<PublicTrade>;

const delay = async (durationMs: number): Promise<void> => {
  if (durationMs <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs);
  });
};

export class RateLimitQueue {
  private readonly queue: Array<() => Promise<void>> = [];
  private readonly requestsPerInterval: number;
  private readonly intervalMs: number;
  private readonly executionTimestamps: number[] = [];
  private processing = false;

  public constructor(options: RateLimitQueueOptions = {}) {
    this.requestsPerInterval = options.requestsPerInterval ?? 10;
    this.intervalMs = options.intervalMs ?? 1000;
  }

  public schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Queued task failed.'));
        }
      });

      void this.drain();
    });
  }

  public getSize(): number {
    return this.queue.length;
  }

  private async drain(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        await this.waitForCapacity();

        const nextTask = this.queue.shift();

        if (nextTask === undefined) {
          continue;
        }

        this.executionTimestamps.push(Date.now());
        await nextTask();
      }
    } finally {
      this.processing = false;

      if (this.queue.length > 0) {
        void this.drain();
      }
    }
  }

  private async waitForCapacity(): Promise<void> {
    if (this.requestsPerInterval <= 0) {
      throw new Error('Rate limit configuration must allow at least one request.');
    }

    const now = Date.now();
    const activeTimestamps = this.executionTimestamps.filter((timestamp) => {
      return now - timestamp < this.intervalMs;
    });

    this.executionTimestamps.length = 0;
    this.executionTimestamps.push(...activeTimestamps);

    if (activeTimestamps.length < this.requestsPerInterval) {
      return;
    }

    const oldestTimestamp = activeTimestamps[0];

    if (oldestTimestamp === undefined) {
      return;
    }

    await delay(Math.max(this.intervalMs - (now - oldestTimestamp), 0));
  }
}

export class OrderQueue {
  private readonly queue = new RateLimitQueue({
    requestsPerInterval: 1,
    intervalMs: 1
  });

  public enqueue(order: PlaceOrderRequest, executor: OrderExecutor): Promise<PublicTrade> {
    return this.queue.schedule(async () => {
      return executor(order);
    });
  }

  public getSize(): number {
    return this.queue.getSize();
  }
}
