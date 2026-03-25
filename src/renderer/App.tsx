// File: src/renderer/App.tsx
// Responsibility: Main renderer shell that composes navigation and pages.
// Security: Uses only public stores and preload-exposed APIs.

import { useEffect } from 'react';
import type { AppPage } from '@shared/public/ui.types';
import { Modal } from './components/common/Modal';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { BetaSignup } from './pages/BetaSignup';
import { Onboarding } from './pages/Onboarding';
import { Portfolio } from './pages/Portfolio';
import { Settings } from './pages/Settings';
import { Simulation } from './pages/Simulation';
import { Trade } from './pages/Trade';
import { useSettingsStore } from './stores/settings-store';
import { useUIStore } from './stores/ui-store';
import { getDirectionFromLocale, getLanguageFromLocale, t } from './utils/i18n';

const renderPage = (page: AppPage): JSX.Element => {
  switch (page) {
    case 'portfolio':
      return <Portfolio />;
    case 'trade':
      return <Trade />;
    case 'settings':
      return <Settings />;
    case 'onboarding':
      return <Onboarding />;
    case 'simulation':
      return <Simulation />;
    case 'beta-signup':
      return <BetaSignup />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
};

export const App = (): JSX.Element => {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const locale = useSettingsStore((state) => state.settings.locale);
  const riskAcknowledged = useSettingsStore((state) => state.settings.riskAcknowledged);
  const banner = useUIStore((state) => state.banner);
  const currentPage = useUIStore((state) => state.currentPage);
  const isSecurityModalOpen = useUIStore((state) => state.isSecurityModalOpen);
  const closeSecurityModal = useUIStore((state) => state.closeSecurityModal);
  const setPage = useUIStore((state) => state.setPage);
  const onboardingRiskAcknowledged = useUIStore((state) => state.onboardingRiskAcknowledged);
  const effectiveRiskAcknowledged = riskAcknowledged || onboardingRiskAcknowledged;
  const direction = getDirectionFromLocale(locale);
  const language = getLanguageFromLocale(locale);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const isAccessibleBeforeAcknowledgment =
      currentPage === 'onboarding' || currentPage === 'settings' || currentPage === 'beta-signup';

    if (!effectiveRiskAcknowledged && !isAccessibleBeforeAcknowledgment) {
      setPage('onboarding');
    }
  }, [effectiveRiskAcknowledged, currentPage, setPage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  const bannerToneStyles =
    banner?.tone === 'warning'
      ? {
          background: 'rgba(245, 158, 11, 0.16)',
          border: '1px solid rgba(251, 191, 36, 0.35)',
          color: '#fde68a'
        }
      : banner?.tone === 'error'
        ? {
            background: 'rgba(239, 68, 68, 0.16)',
            border: '1px solid rgba(248, 113, 113, 0.35)',
            color: '#fecaca'
          }
        : banner?.tone === 'success'
          ? {
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              color: '#bbf7d0'
            }
          : {
              background: 'rgba(59, 130, 246, 0.16)',
              border: '1px solid rgba(96, 165, 250, 0.35)',
              color: '#eff6ff'
            };

  return (
    <div
      className="app-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: direction === 'rtl' ? '1fr 260px' : '260px 1fr',
        background:
          'radial-gradient(circle at top left, #19324d 0%, #0d1726 45%, #081018 100%)',
        color: '#eff6ff',
        fontFamily: '"Segoe UI", sans-serif',
        direction
      }}
    >
      <Sidebar />
      <main className="app-main" style={{ padding: '28px 32px 36px', overflow: 'auto' }}>
        {banner !== null ? (
          <div
            style={{
              marginBottom: 18,
              padding: '12px 16px',
              borderRadius: 14,
              ...bannerToneStyles
            }}
          >
            {banner.message}
          </div>
        ) : null}
        {renderPage(currentPage)}
      </main>
      <Modal
        isOpen={isSecurityModalOpen}
        title={t('app_security_boundary_title', locale)}
        description={t('app_security_boundary_description', locale)}
        onClose={closeSecurityModal}
        closeLabel={t('modal_close', locale)}
      />
    </div>
  );
};
