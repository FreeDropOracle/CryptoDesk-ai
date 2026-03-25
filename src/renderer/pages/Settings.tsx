// File: src/renderer/pages/Settings.tsx
// Responsibility: Security, preference, and feature configuration UI.
// Security: API keys are sent only through the secure preload bridge for local encryption.

import { useEffect, useState } from 'react';
import type { SupportedExchange } from '@shared/public/constants';
import type { UserSettings } from '@shared/public/ui.types';
import { Button } from '../components/common/Button';
import { LoadingPanel } from '../components/common/LoadingPanel';
import { PhaseBadge } from '../components/common/PhaseBadge';
import { Tooltip } from '../components/common/Tooltip';
import { useSecurity } from '../hooks/useSecurity';
import { useSettingsStore } from '../stores/settings-store';
import { t } from '../utils/i18n';

type ValueInputEvent = {
  target: {
    value: string;
  };
};

type ToggleInputEvent = {
  target: {
    checked: boolean;
  };
};

export const Settings = (): JSX.Element => {
  const settings = useSettingsStore((state) => state.settings);
  const loading = useSettingsStore((state) => state.loading);
  const error = useSettingsStore((state) => state.error);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const { saveApiKey, saving, error: securityError } = useSecurity();
  const [form, setForm] = useState<UserSettings>(settings);
  const [exchange, setExchange] = useState<SupportedExchange>('binance');
  const [keyId, setKeyId] = useState<string>('primary');
  const [secret, setSecret] = useState<string>('');
  const locale = form.locale;

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSaveSettings = async (): Promise<void> => {
    await updateSettings(form);
  };

  const handleSaveKey = async (): Promise<void> => {
    if (secret.trim().length === 0) {
      return;
    }

    const saved = await saveApiKey(exchange, keyId, secret);

    if (saved) {
      setSecret('');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <section
        style={{
          padding: 22,
          borderRadius: 24,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)'
        }}
      >
        <h2 style={{ marginTop: 0 }}>{t('settings_preferences_title', locale)}</h2>
        <div style={{ marginBottom: 14 }}>
          <PhaseBadge phase="5" message={t('settings_phase5_message', locale)} />
        </div>
        {loading ? (
          <div style={{ marginBottom: 14 }}>
            <LoadingPanel
              title={t('settings_loading_title', locale)}
              description={t('settings_loading_description', locale)}
              compact
            />
          </div>
        ) : null}
        <div style={{ display: 'grid', gap: 14 }}>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('settings_language_label', locale)}
            </div>
            <select
              value={form.locale}
              onChange={(event: ValueInputEvent) => {
                setForm({ ...form, locale: event.target.value });
              }}
              style={{ width: '100%', padding: 12, borderRadius: 12 }}
            >
              <option value="en">{t('settings_language_en', locale)}</option>
              <option value="ar">{t('settings_language_ar', locale)}</option>
            </select>
          </label>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('settings_quote_currency_label', locale)}
            </div>
            <input
              value={form.preferredQuoteCurrency}
              onChange={(event: ValueInputEvent) =>
                setForm({ ...form, preferredQuoteCurrency: event.target.value.toUpperCase() })
              }
              style={{ width: '100%', padding: 12, borderRadius: 12 }}
            />
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.simulationMode}
              onChange={(event: ToggleInputEvent) =>
                setForm({ ...form, simulationMode: event.target.checked })
              }
            />
            <Tooltip content={t('tooltip_simulation_mode', locale)} position="right">
              <span>{t('settings_simulation_mode_label', locale)}</span>
            </Tooltip>
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.tradingEnabled}
              onChange={(event: ToggleInputEvent) =>
                setForm({ ...form, tradingEnabled: event.target.checked })
              }
            />
            <Tooltip content={t('tooltip_live_trading', locale)} position="right">
              <span>{t('settings_live_trading_label', locale)}</span>
            </Tooltip>
          </label>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.aiAutoExecuteEnabled}
              onChange={(event: ToggleInputEvent) =>
                setForm({ ...form, aiAutoExecuteEnabled: event.target.checked })
              }
            />
            <Tooltip content={t('tooltip_ai_auto_execute', locale)} position="right">
              <span>{t('settings_ai_auto_execute_label', locale)}</span>
            </Tooltip>
          </label>
          {error !== null ? <div style={{ color: '#fca5a5' }}>{error.message}</div> : null}
          <Button onClick={() => void handleSaveSettings()} disabled={loading}>
            {loading ? t('settings_saving', locale) : t('settings_save_preferences', locale)}
          </Button>
        </div>
      </section>
      <section
        style={{
          padding: 22,
          borderRadius: 24,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)'
        }}
      >
        <h2 style={{ marginTop: 0 }}>{t('settings_api_storage_title', locale)}</h2>
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
          {t('settings_api_storage_description', locale)}
        </p>
        <div style={{ display: 'grid', gap: 14 }}>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('settings_exchange_label', locale)}
            </div>
            <Tooltip content={t('tooltip_exchange_testnet', locale)} position="right">
              <select
                value={exchange}
                onChange={(event: ValueInputEvent) =>
                  setExchange(event.target.value as SupportedExchange)
                }
                style={{ width: '100%', padding: 12, borderRadius: 12 }}
              >
                <option value="binance">binance</option>
                <option value="bybit">bybit</option>
              </select>
            </Tooltip>
          </label>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('settings_key_id_label', locale)}
            </div>
            <Tooltip content={t('tooltip_api_key_id', locale)} position="right">
              <input
                value={keyId}
                onChange={(event: ValueInputEvent) => setKeyId(event.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 12 }}
              />
            </Tooltip>
          </label>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('settings_secret_label', locale)}
            </div>
            <input
              value={secret}
              type="password"
              onChange={(event: ValueInputEvent) => setSecret(event.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 12 }}
            />
          </label>
          {securityError !== null ? (
            <div style={{ color: '#fca5a5' }}>{securityError.message}</div>
          ) : null}
          <Button onClick={() => void handleSaveKey()} disabled={saving}>
            {saving ? t('settings_saving', locale) : t('settings_store_api_key', locale)}
          </Button>
        </div>
      </section>
    </div>
  );
};
