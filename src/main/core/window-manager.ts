// File: src/main/core/window-manager.ts
// Responsibility: Creates and secures the main application window.
// Security: Enforces context isolation, navigation controls, and preload-only IPC.

import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  session,
  shell,
  Tray,
  type BrowserWindowConstructorOptions,
  type NativeImage
} from 'electron';
import { logger } from '../logger/secure-logger';
import type { AppConfig } from '../config/loader';
import { resolvePreloadPath } from '../preload';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;

  public constructor(private readonly config: AppConfig) {}

  public createMainWindow(): BrowserWindow {
    if (this.mainWindow !== null) {
      return this.mainWindow;
    }

    this.configureSession();
    const iconPath = this.resolveWindowIconPath();
    const windowOptions: BrowserWindowConstructorOptions = {
      width: 1440,
      height: 920,
      minWidth: 1180,
      minHeight: 760,
      show: false,
      backgroundColor: '#0b1220',
      webPreferences: {
        preload: resolvePreloadPath(),
        // The preload bridge imports local shared contracts, so it must run outside the
        // Chromium sandbox while the renderer itself remains isolated from Node.js.
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        devTools: this.config.env !== 'production'
      }
    };

    if (iconPath !== undefined) {
      windowOptions.icon = iconPath;
    }

    const window = new BrowserWindow(windowOptions);

    this.configureWebContents(window);
    void this.loadWindow(window).catch((error: unknown) => {
      logger.error('Failed to load the main application window.', {
        error: error instanceof Error ? error.message : 'Unknown renderer load failure.'
      });
    });

    window.once('ready-to-show', () => {
      window.show();
    });

    window.on('closed', () => {
      if (this.mainWindow === window) {
        this.mainWindow = null;
      }
    });

    this.mainWindow = window;
    return window;
  }

  public createTray(): void {
    if (this.tray !== null) {
      return;
    }

    const trayIcon = this.resolveTrayIcon();

    if (trayIcon === undefined) {
      logger.warn('Tray icon was not created because no icon asset was found.');
      return;
    }

    const tray = new Tray(trayIcon);
    tray.setToolTip('CryptoDesk AI');
    tray.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Open CryptoDesk AI',
          click: () => {
            const window = this.mainWindow ?? this.createMainWindow();
            window.show();
            window.focus();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ])
    );

    tray.on('click', () => {
      const window = this.mainWindow ?? this.createMainWindow();

      if (window.isVisible()) {
        window.hide();
        return;
      }

      window.show();
      window.focus();
    });

    this.tray = tray;
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  private configureSession(): void {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      void webContents;
      const allowedPermissions = new Set(['clipboard-sanitized-write']);
      callback(allowedPermissions.has(permission));
    });
  }

  private configureWebContents(window: BrowserWindow): void {
    window.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url);
      return { action: 'deny' };
    });

    window.webContents.on(
      'did-fail-load',
      (_event, errorCode, errorDescription, validatedUrl) => {
        logger.error('Renderer failed to load.', {
          errorCode,
          errorDescription,
          validatedUrl
        });
      }
    );

    window.webContents.on('render-process-gone', (_event, details) => {
      logger.error('Renderer process exited unexpectedly.', {
        reason: details.reason,
        exitCode: details.exitCode
      });
    });

    window.webContents.on('will-navigate', (event, url) => {
      const isLocalFile = url.startsWith('file://');
      const isAllowedDevUrl =
        this.config.rendererDevUrl !== undefined && url.startsWith(this.config.rendererDevUrl);

      if (!isLocalFile && !isAllowedDevUrl) {
        event.preventDefault();
        logger.warn('Blocked renderer navigation attempt.', { url });
      }
    });
  }

  private async loadWindow(window: BrowserWindow): Promise<void> {
    if (this.config.rendererDevUrl !== undefined) {
      await window.loadURL(this.config.rendererDevUrl);
      return;
    }

    await window.loadFile(this.config.rendererIndexPath);
  }

  private resolveWindowIconPath(): string | undefined {
    if (process.platform === 'win32') {
      return this.resolveFirstExistingIconPath(['icon.ico']);
    }

    if (process.platform === 'darwin') {
      return this.resolveFirstExistingIconPath(['icon.icns', 'icon_512x512.png']);
    }

    return this.resolveFirstExistingIconPath(['icon_512x512.png', 'icon_256x256.png']);
  }

  private resolveTrayIcon(): NativeImage | undefined {
    const preferredNames =
      process.platform === 'darwin'
        ? ['tray/icon-light.png', 'icon_16x16.png', 'icon_32x32.png']
        : ['tray/icon-dark.png', 'icon_16x16.png', 'icon_32x32.png'];
    const trayIconPath = this.resolveFirstExistingIconPath(preferredNames);

    if (trayIconPath === undefined) {
      return undefined;
    }

    const trayIcon = nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 });
    return trayIcon.isEmpty() ? undefined : trayIcon;
  }

  private resolveFirstExistingIconPath(fileNames: readonly string[]): string | undefined {
    for (const fileName of fileNames) {
      for (const iconDirectory of this.getIconDirectories()) {
        const candidate = path.join(iconDirectory, fileName);

        if (existsSync(candidate)) {
          return candidate;
        }
      }
    }

    return undefined;
  }

  private getIconDirectories(): string[] {
    return [
      path.join(app.getAppPath(), 'assets', 'icons'),
      path.resolve(__dirname, '../../../assets/icons'),
      path.resolve(process.cwd(), 'assets/icons')
    ];
  }
}
