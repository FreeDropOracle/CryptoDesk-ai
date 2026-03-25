// File: src/renderer/components/layout/Sidebar.tsx
// Responsibility: Main navigation for the desktop application shell.
// Security: Presentation-only; actions route through stores and safe UI handlers.

import type { AppPage } from '@shared/public/ui.types';
import { Button } from '../common/Button';
import { useSettingsStore } from '../../stores/settings-store';
import { useUIStore } from '../../stores/ui-store';
import { t } from '../../utils/i18n';

export const Sidebar = (): JSX.Element => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const riskAcknowledged = useSettingsStore((state) => state.settings.riskAcknowledged);
  const currentPage = useUIStore((state) => state.currentPage);
  const setPage = useUIStore((state) => state.setPage);
  const setBanner = useUIStore((state) => state.setBanner);
  const openSecurityModal = useUIStore((state) => state.openSecurityModal);
  const onboardingRiskAcknowledged = useUIStore((state) => state.onboardingRiskAcknowledged);
  const isAcknowledged = riskAcknowledged || onboardingRiskAcknowledged;
  const pages: readonly { id: AppPage; label: string; description: string }[] = [
    {
      id: 'dashboard',
      label: t('sidebar_dashboard_label', locale),
      description: t('sidebar_dashboard_description', locale)
    },
    {
      id: 'portfolio',
      label: t('sidebar_portfolio_label', locale),
      description: t('sidebar_portfolio_description', locale)
    },
    {
      id: 'trade',
      label: t('sidebar_trade_label', locale),
      description: t('sidebar_trade_description', locale)
    },
    {
      id: 'simulation',
      label: t('sidebar_simulation_label', locale),
      description: t('sidebar_simulation_description', locale)
    },
    {
      id: 'settings',
      label: t('sidebar_settings_label', locale),
      description: t('sidebar_settings_description', locale)
    },
    {
      id: 'beta-signup',
      label: t('sidebar_beta_label', locale),
      description: t('sidebar_beta_description', locale)
    },
    {
      id: 'onboarding',
      label: t('sidebar_onboarding_label', locale),
      description: t('sidebar_onboarding_description', locale)
    }
  ];

  const navigateTo = (page: AppPage): void => {
    const requiresAcknowledgment =
      page !== 'onboarding' && page !== 'settings' && page !== 'beta-signup';

    if (requiresAcknowledgment && !isAcknowledged) {
      setBanner({
        id: 'risk-acknowledgment-required',
        tone: 'warning',
        message: t('banner_acknowledge_risk', locale)
      });
      setPage('onboarding');
      return;
    }

    setBanner(null);
    setPage(page);
  };

  return (
    <aside
      className="app-sidebar"
      style={{
        padding: '28px 20px',
        borderRight: '1px solid rgba(148, 163, 184, 0.14)',
        background: 'rgba(5, 10, 18, 0.66)',
        backdropFilter: 'blur(18px)'
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, letterSpacing: 1.4, color: '#38bdf8' }}>CRYPTODESK AI</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>
          {t('sidebar_title', locale)}
        </div>
        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
          {t('sidebar_subtitle', locale)}
        </p>
      </div>
      <nav style={{ display: 'grid', gap: 10 }}>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => navigateTo(page.id)}
            style={{
              textAlign: locale.startsWith('ar') ? 'right' : 'left',
              padding: '14px 16px',
              borderRadius: 16,
              border:
                currentPage === page.id
                  ? '1px solid rgba(56, 189, 248, 0.45)'
                  : '1px solid rgba(148, 163, 184, 0.12)',
              background:
                currentPage === page.id
                  ? 'rgba(14, 165, 233, 0.16)'
                  : 'rgba(15, 23, 42, 0.35)',
              color: '#eff6ff',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontWeight: 700 }}>{page.label}</div>
            <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 13 }}>
              {page.description}
            </div>
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 24 }}>
        <Button variant="secondary" fullWidth onClick={openSecurityModal}>
          {t('sidebar_security_model', locale)}
        </Button>
      </div>
    </aside>
  );
};
