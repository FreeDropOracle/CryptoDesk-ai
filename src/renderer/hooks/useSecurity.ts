// File: src/renderer/hooks/useSecurity.ts
// Responsibility: Saves user-provided API credentials through the secure bridge.
// Security: Secrets are sent only to preload/main for local encryption and keychain storage.

import { useState } from 'react';
import type { SupportedExchange } from '@shared/public/constants';
import type { LocalizedError } from '@shared/public/ui.types';
import { useSettingsStore } from '../stores/settings-store';
import { ipcClient } from '../utils/ipc';
import { ERROR_MESSAGES, toLocalizedError } from '../utils/error-messages';

export const useSecurity = () => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<LocalizedError | null>(null);

  const saveApiKey = async (
    exchange: SupportedExchange,
    keyId: string,
    secret: string
  ): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      await ipcClient.saveApiKey(exchange, keyId, secret);
      return true;
    } catch (saveError) {
      setError(
        toLocalizedError(ERROR_MESSAGES.SECURITY.SAVE_KEY, saveError, {
          locale
        })
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveApiKey,
    saving,
    error
  };
};
