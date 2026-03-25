// File: src/main/security/validator.ts
// Responsibility: Shared schema validation helpers for main-process boundaries.
// Security: Fails closed on malformed or unexpected IPC payloads.

import { ZodError, type ZodType } from 'zod';
import { SecurityBoundaryError } from './types';

const flattenZodIssues = (error: ZodError): string => {
  return error.issues.map((issue) => issue.message).join('; ');
};

export const validateSchema = <T>(schema: ZodType<T>, input: unknown): T => {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new SecurityBoundaryError(
      'VALIDATION_FAILED',
      flattenZodIssues(result.error)
    );
  }

  return result.data;
};
