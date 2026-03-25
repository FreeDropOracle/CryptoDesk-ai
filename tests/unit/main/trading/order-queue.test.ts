/// <reference path="../../../types/jest-globals.d.ts" />

import { RateLimitQueue } from '../../../../src/main/trading/order-queue';

describe('RateLimitQueue', () => {
  it('executes queued tasks in submission order', async () => {
    const queue = new RateLimitQueue({
      requestsPerInterval: 10,
      intervalMs: 1
    });
    const executionOrder: string[] = [];

    const firstTask = queue.schedule(async () => {
      executionOrder.push('first');
      return 'first';
    });

    const secondTask = queue.schedule(async () => {
      executionOrder.push('second');
      return 'second';
    });

    await firstTask;
    await secondTask;

    expect(executionOrder[0]).toBe('first');
    expect(executionOrder[1]).toBe('second');
  });
});
