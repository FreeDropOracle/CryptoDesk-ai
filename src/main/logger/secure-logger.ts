// File: src/main/logger/secure-logger.ts
// Responsibility: Central application logger with automatic sensitive-field redaction.
// Security: Redacts secrets, tokens, balances, and similar high-risk fields before writing logs.

import { createLogger, format } from 'winston';
import type { Logger } from 'winston';
import { buildTransports } from './transports';

const sensitiveFieldPattern = /(api.?key|secret|token|passphrase|password|balance|equity)/i;
const encodedSecretPattern = /^[A-Za-z0-9+/=]{32,}$/;

const redactValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (value !== null && typeof value === 'object') {
    const redactedObject: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      redactedObject[key] = sensitiveFieldPattern.test(key)
        ? '[REDACTED]'
        : redactValue(nestedValue);
    }

    return redactedObject;
  }

  if (typeof value === 'string' && encodedSecretPattern.test(value)) {
    return '[REDACTED]';
  }

  return value;
};

const internalLogger: Logger = createLogger({
  level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: buildTransports()
});

export class SecureLogger {
  public constructor(private readonly loggerInstance: Logger) {}

  public info(message: string, context?: Record<string, unknown>): void {
    this.loggerInstance.info(message, redactValue(context));
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.loggerInstance.warn(message, redactValue(context));
  }

  public error(message: string, context?: Record<string, unknown>): void {
    this.loggerInstance.error(message, redactValue(context));
  }

  public audit(action: string, context?: Record<string, unknown>): void {
    this.loggerInstance.info(`AUDIT:${action}`, redactValue(context));
  }
}

export const logger = new SecureLogger(internalLogger);
