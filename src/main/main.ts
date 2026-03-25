// File: src/main/main.ts
// Responsibility: Main Electron entrypoint for secure application startup.
// Security: Starts only after main-process initialization succeeds and preserves renderer isolation.

import { app, BrowserWindow } from 'electron';
import { initializeApplication } from './core/app-init';
import { logger } from './logger/secure-logger';

let started = false;

const startApplication = async (): Promise<void> => {
  if (started) {
    return;
  }

  started = true;

  try {
    const context = await initializeApplication();
    context.windowManager.createMainWindow();
    context.windowManager.createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        context.windowManager.createMainWindow();
      }

      context.windowManager.createTray();
    });
  } catch (error) {
    logger.error('Failed to initialize application.', {
      error: error instanceof Error ? error.message : 'Unknown startup failure.'
    });
    app.quit();
  }
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

void app.whenReady().then(startApplication);
