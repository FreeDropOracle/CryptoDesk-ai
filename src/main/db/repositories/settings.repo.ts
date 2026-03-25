// File: src/main/db/repositories/settings.repo.ts
// Responsibility: Stores and retrieves user settings using prepared statements.
// Security: Persists non-secret preferences only; credentials remain in the keychain.

import { DEFAULT_USER_SETTINGS, type UserSettings } from '@shared/public/ui.types';
import type { SettingEntity } from '../entities/settings.entity';
import { BaseRepository, type SqliteDatabase } from './base.repo';

const settingKeys = Object.keys(DEFAULT_USER_SETTINGS) as Array<keyof UserSettings>;

const parseStoredSetting = (settings: UserSettings, row: SettingEntity): void => {
  const parsedValue: unknown = JSON.parse(row.value);
  switch (row.key) {
    case 'locale':
      settings.locale =
        typeof parsedValue === 'string' ? parsedValue : DEFAULT_USER_SETTINGS.locale;
      break;
    case 'preferredQuoteCurrency':
      settings.preferredQuoteCurrency =
        typeof parsedValue === 'string'
          ? parsedValue
          : DEFAULT_USER_SETTINGS.preferredQuoteCurrency;
      break;
    case 'theme':
      settings.theme =
        parsedValue === 'system' || parsedValue === 'light' || parsedValue === 'dark'
          ? parsedValue
          : DEFAULT_USER_SETTINGS.theme;
      break;
    case 'tradingEnabled':
      settings.tradingEnabled =
        typeof parsedValue === 'boolean' ? parsedValue : DEFAULT_USER_SETTINGS.tradingEnabled;
      break;
    case 'aiAutoExecuteEnabled':
      settings.aiAutoExecuteEnabled =
        typeof parsedValue === 'boolean'
          ? parsedValue
          : DEFAULT_USER_SETTINGS.aiAutoExecuteEnabled;
      break;
    case 'simulationMode':
      settings.simulationMode =
        typeof parsedValue === 'boolean' ? parsedValue : DEFAULT_USER_SETTINGS.simulationMode;
      break;
    case 'riskAcknowledged':
      settings.riskAcknowledged =
        typeof parsedValue === 'boolean' ? parsedValue : DEFAULT_USER_SETTINGS.riskAcknowledged;
      break;
    case 'notificationsEnabled':
      settings.notificationsEnabled =
        typeof parsedValue === 'boolean'
          ? parsedValue
          : DEFAULT_USER_SETTINGS.notificationsEnabled;
      break;
  }
};

export class SettingsRepository extends BaseRepository<SettingEntity> {
  private readonly upsertStatement;
  private readonly listStatement;

  public constructor(db: SqliteDatabase) {
    super(db);
    this.upsertStatement = this.db.prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`
    );
    this.listStatement = this.db.prepare(
      `SELECT
        key,
        value,
        updated_at AS updatedAt
      FROM settings
      ORDER BY key ASC`
    );
  }

  public getSettings(): UserSettings {
    const storedRows = this.list() as SettingEntity[];
    const mergedSettings: UserSettings = { ...DEFAULT_USER_SETTINGS };

    for (const row of storedRows) {
      parseStoredSetting(mergedSettings, row);
    }

    return mergedSettings;
  }

  public updateSettings(patch: Partial<UserSettings>): UserSettings {
    const mergedSettings: UserSettings = {
      ...this.getSettings(),
      ...patch
    };
    const updatedAt = new Date().toISOString();

    this.runInTransaction(() => {
      for (const key of settingKeys) {
        const value = mergedSettings[key];
        this.upsertStatement.run(key, JSON.stringify(value), updatedAt);
      }
    });

    return mergedSettings;
  }

  public list(limit = 0): readonly SettingEntity[] {
    void limit;
    return this.listStatement.all() as SettingEntity[];
  }
}
