// File: src/main/preload.ts
// Responsibility: Resolves the compiled preload bundle path for the BrowserWindow.
// Security: Centralizes preload resolution to avoid accidental untrusted scripts.

import path from 'node:path';

export const resolvePreloadPath = (): string => {
  return path.resolve(__dirname, '../preload/index.js');
};
