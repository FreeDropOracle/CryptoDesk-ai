import Database from 'better-sqlite3';
import { SettingsRepository } from '../../../src/main/db/repositories/settings.repo';

describe('SettingsRepository', () => {
  it('persists and reads settings in SQLite', () => {
    const db = new Database(':memory:');
    db.exec(
      'CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)'
    );

    const repo = new SettingsRepository(db);
    const updated = repo.updateSettings({ locale: 'fr', simulationMode: false });

    expect(updated.locale).toBe('fr');
    expect(repo.getSettings().simulationMode).toBe(false);
  });
});
