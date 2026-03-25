// File: src/renderer/hooks/useFeatures.ts
// Responsibility: Exposes feature state derived from local settings.
// Security: Reflects only safe renderer-visible flags.

import { useSettingsStore } from '../stores/settings-store';

export const useFeatures = () => {
  const settings = useSettingsStore((state) => state.settings);

  return {
    tradingEnabled: settings.tradingEnabled,
    aiAutoExecuteEnabled: settings.aiAutoExecuteEnabled,
    simulationMode: settings.simulationMode
  };
};
