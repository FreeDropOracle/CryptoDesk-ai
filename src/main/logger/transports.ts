// File: src/main/logger/transports.ts
// Responsibility: Creates persistent and development-friendly log transports.
// Security: Logs stay local and are written to app-owned directories only.

import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { app } from 'electron';
import { transports } from 'winston';
import type Transport from 'winston-transport';

const resolveLogDirectory = (): string => {
  const baseDirectory = app.isReady() ? app.getPath('userData') : process.cwd();
  return path.join(baseDirectory, 'logs');
};

export const buildTransports = (): Transport[] => {
  const logDirectory = resolveLogDirectory();
  mkdirSync(logDirectory, { recursive: true });

  const configuredTransports: Transport[] = [
    new transports.File({
      filename: path.join(logDirectory, 'app.log'),
      level: 'info'
    }),
    new transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error'
    })
  ];

  if (process.env.APP_ENV !== 'production') {
    configuredTransports.push(new transports.Console({ level: 'debug' }));
  }

  return configuredTransports;
};
