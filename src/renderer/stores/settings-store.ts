// File: src/renderer/stores/settings-store.ts
// Responsibility: Loads and updates renderer-safe user settings through IPC.
// Security: Settings writes stay behind preload and main-process validation.

import { create } from 'zustand';
import {
  DEFAULT_USER_SETTINGS,
  type LocalizedError,
  type UserSettings
} from '@shared/public/ui.types';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

interface SettingsState {
  settings: UserSettings;
  loading: boolean;
  error: LocalizedError | null;
  loadSettings(): Promise<void>;
  updateSettings(patch: Partial<UserSettings>): Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_USER_SETTINGS,
  loading: false,
  error: null,
  loadSettings: async () => {
    set({ loading: true, error: null });

    try {
      const settings = await ipcClient.getSettings();
      set({
        settings,
        loading: false,
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: toLocalizedError(ERROR_MESSAGES.SETTINGS.LOAD, error, {
          locale: get().settings.locale
        })
      });
    }
  },
  updateSettings: async (patch: Partial<UserSettings>) => {
    set({ loading: true, error: null });

    try {
      const settings = await ipcClient.updateSettings(patch);
      set({
        settings,
        loading: false,
        error: null
      });
    } catch (error) {
      const locale = typeof patch.locale === 'string' ? patch.locale : get().settings.locale;

      set({
        loading: false,
        error: toLocalizedError(ERROR_MESSAGES.SETTINGS.SAVE, error, {
          locale
        })
      });
    }
  }
}));
