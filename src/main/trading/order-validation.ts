// File: src/main/trading/order-validation.ts
// Responsibility: Applies trading-domain validation after IPC schema parsing and before execution.
// Security: Rejects malformed or out-of-policy order shapes before simulation or live routing.

import { z } from 'zod';
import {
  SUPPORTED_EXCHANGES,
  SUPPORTED_ORDER_SIDES,
  SUPPORTED_ORDER_TYPES
} from '@shared/public/constants';

const ORDER_SYMBOL_PATTERN = /^[A-Z0-9]+\/[A-Z0-9]+$/;
const MAX_ORDER_QUANTITY = 1_000_000;

export const ValidatedOrderSchema = z
  .object({
    exchange: z.enum(SUPPORTED_EXCHANGES),
    symbol: z
      .string()
      .min(3)
      .max(24)
      .regex(ORDER_SYMBOL_PATTERN, 'Symbol must be formatted like BTC/USDT.'),
    side: z.enum(SUPPORTED_ORDER_SIDES),
    type: z.enum(SUPPORTED_ORDER_TYPES),
    quantity: z.number().positive().finite().max(MAX_ORDER_QUANTITY),
    price: z.number().positive().finite().optional(),
    simulation: z.boolean().optional(),
    clientOrderId: z.string().min(1).max(64).optional()
  })
  .strict()
  .superRefine((value, context) => {
    if (value.type === 'limit' && typeof value.price !== 'number') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Limit orders require a price.'
      });
    }
  });

export type ValidatedOrder = z.infer<typeof ValidatedOrderSchema>;

export interface OrderValidationIssue {
  field: string;
  message: string;
}

export interface OrderValidationSuccess {
  valid: true;
  data: ValidatedOrder;
}

export interface OrderValidationFailure {
  valid: false;
  errors: readonly OrderValidationIssue[];
}

export type OrderValidationResult = OrderValidationSuccess | OrderValidationFailure;

export const validateOrder = (input: unknown): OrderValidationResult => {
  const result = ValidatedOrderSchema.safeParse(input);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map((issue) => ({
        field:
          issue.path !== undefined && issue.path.length > 0
            ? issue.path.join('.')
            : 'order',
        message: issue.message
      }))
    };
  }

  return {
    valid: true,
    data: result.data
  };
};

export const resolveReferencePrice = (
  order: Pick<ValidatedOrder, 'type' | 'price'>,
  fallbackPrice: number
): number | null => {
  if (order.type === 'limit') {
    return typeof order.price === 'number' ? order.price : null;
  }

  if (typeof order.price === 'number') {
    return order.price;
  }

  return Number.isFinite(fallbackPrice) && fallbackPrice > 0 ? fallbackPrice : null;
};

export const estimateOrderNotional = (
  order: Pick<ValidatedOrder, 'quantity' | 'type' | 'price'>,
  fallbackPrice: number
): number => {
  const referencePrice = resolveReferencePrice(order, fallbackPrice);

  if (referencePrice === null) {
    return 0;
  }

  return order.quantity * referencePrice;
};
