// File: src/main/db/entities/settings.entity.ts
// Responsibility: Persistent settings row shape for SQLite storage.
// Security: Stores only non-secret application settings.

import type { UserSettings } from '@shared/public/ui.types';

export interface SettingEntity {
  key: keyof UserSettings;
  value: string;
  updatedAt: string;
}
