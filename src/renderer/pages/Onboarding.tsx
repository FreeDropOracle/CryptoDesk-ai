// File: src/renderer/pages/Onboarding.tsx
// Responsibility: First-run orientation for new users.
// Security: Reinforces non-custodial and simulation-first expectations.

import { useEffect, useState } from 'react';
import type { AppPage } from '@shared/public/ui.types';
import { Button } from '../components/common/Button';
import { PhaseBadge } from '../components/common/PhaseBadge';
import { useSettingsStore } from '../stores/settings-store';
import { useUIStore } from '../stores/ui-store';
import { t } from '../utils/i18n';

export type OnboardingStepId =
  | 'welcome'
  | 'disclaimer'
  | 'api-setup'
  | 'security'
  | 'tutorial'
  | 'complete';

interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  eyebrow: string;
}

export const buildOnboardingSteps = (locale: string): readonly OnboardingStepDefinition[] => {
  return [
    {
      id: 'welcome',
      title: t('onboarding_step_welcome_title', locale),
      eyebrow: t('onboarding_step_welcome_eyebrow', locale)
    },
    {
      id: 'disclaimer',
      title: t('onboarding_step_disclaimer_title', locale),
      eyebrow: t('onboarding_step_disclaimer_eyebrow', locale)
    },
    {
      id: 'api-setup',
      title: t('onboarding_step_api_setup_title', locale),
      eyebrow: t('onboarding_step_api_setup_eyebrow', locale)
    },
    {
      id: 'security',
      title: t('onboarding_step_security_title', locale),
      eyebrow: t('onboarding_step_security_eyebrow', locale)
    },
    {
      id: 'tutorial',
      title: t('onboarding_step_tutorial_title', locale),
      eyebrow: t('onboarding_step_tutorial_eyebrow', locale)
    },
    {
      id: 'complete',
      title: t('onboarding_step_complete_title', locale),
      eyebrow: t('onboarding_step_complete_eyebrow', locale)
    }
  ] as const;
};

export const canAdvanceOnboardingStep = (
  stepId: OnboardingStepId,
  riskAcknowledged: boolean
): boolean => {
  return stepId !== 'disclaimer' || riskAcknowledged;
};

export const canAccessOnboardingStep = (
  stepId: OnboardingStepId,
  riskAcknowledged: boolean
): boolean => {
  return stepId === 'welcome' || stepId === 'disclaimer' || riskAcknowledged;
};

const statusPillStyle = (isReady: boolean) => {
  return {
    padding: '10px 12px',
    borderRadius: 14,
    background: isReady ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
    border: isReady
      ? '1px solid rgba(52, 211, 153, 0.22)'
      : '1px solid rgba(251, 191, 36, 0.22)',
    color: isReady ? '#bbf7d0' : '#fde68a'
  } as const;
};

type CheckboxInputEvent = {
  target: {
    checked: boolean;
  };
};

export const Onboarding = (): JSX.Element => {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const setPage = useUIStore((state) => state.setPage);
  const setBanner = useUIStore((state) => state.setBanner);
  const openSecurityModal = useUIStore((state) => state.openSecurityModal);
  const onboardingRiskAcknowledged = useUIStore((state) => state.onboardingRiskAcknowledged);
  const setOnboardingRiskAcknowledged = useUIStore((state) => state.setOnboardingRiskAcknowledged);
  const locale = settings.locale;
  const riskAcknowledged = settings.riskAcknowledged || onboardingRiskAcknowledged;
  const onboardingSteps = buildOnboardingSteps(locale);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep =
    onboardingSteps[currentStepIndex] ??
    onboardingSteps[0] ?? {
      id: 'welcome',
      title: t('onboarding_step_welcome_title', locale),
      eyebrow: t('onboarding_step_welcome_eyebrow', locale)
    };
  const progress = ((currentStepIndex + 1) / onboardingSteps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === onboardingSteps.length - 1;
  const eyebrowLabel = locale.startsWith('ar') ? currentStep.eyebrow : currentStep.eyebrow.toUpperCase();

  useEffect(() => {
    if (!canAccessOnboardingStep(currentStep.id, riskAcknowledged)) {
      setCurrentStepIndex(1);
    }
  }, [currentStep.id, riskAcknowledged]);

  const navigateTo = (page: AppPage): void => {
    setBanner(null);
    setPage(page);
  };

  const showRiskBanner = (): void => {
    setBanner({
      id: 'risk-acknowledgment-required',
      tone: 'warning',
      message: t('banner_acknowledge_risk', locale)
    });
  };

  const acknowledgeRisk = async (): Promise<void> => {
    setOnboardingRiskAcknowledged(true);
    setBanner(null);

    if (!settings.riskAcknowledged) {
      await updateSettings({ riskAcknowledged: true });
    }
  };

  const renderStepContent = (): JSX.Element => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <h1 style={{ margin: 0, fontSize: 38 }}>{t('onboarding_welcome_heading', locale)}</h1>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8, maxWidth: 760, margin: 0 }}>
              {t('onboarding_welcome_body', locale)}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14
              }}
            >
              {[
                t('onboarding_welcome_point_1', locale),
                t('onboarding_welcome_point_2', locale),
                t('onboarding_welcome_point_3', locale)
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: 'rgba(30, 41, 59, 0.52)',
                    color: '#cbd5e1',
                    lineHeight: 1.6
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      case 'disclaimer':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0 }}>{t('onboarding_disclaimer_heading', locale)}</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                t('onboarding_disclaimer_point_1', locale),
                t('onboarding_disclaimer_point_2', locale),
                t('onboarding_disclaimer_point_3', locale)
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(96, 165, 250, 0.18)',
                    color: '#dbeafe',
                    lineHeight: 1.7
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={riskAcknowledged}
                onChange={(event: CheckboxInputEvent) => {
                  if (event.target.checked) {
                    void acknowledgeRisk();
                  }
                }}
              />
              <span style={{ color: '#e2e8f0', lineHeight: 1.7 }}>
                {t('onboarding_disclaimer_checkbox', locale)}
              </span>
            </label>
          </div>
        );
      case 'api-setup':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0 }}>{t('onboarding_api_heading', locale)}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
              {t('onboarding_api_body', locale)}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  navigateTo('settings');
                }}
              >
                {t('onboarding_open_settings', locale)}
              </Button>
              <Button variant="secondary" onClick={openSecurityModal}>
                {t('onboarding_review_security_model', locale)}
              </Button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0 }}>{t('onboarding_security_heading', locale)}</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14
              }}
            >
              <div style={statusPillStyle(settings.simulationMode)}>
                <strong style={{ display: 'block', marginBottom: 6 }}>
                  {t('onboarding_security_simulation_title', locale)}
                </strong>
                <span>
                  {settings.simulationMode
                    ? t('onboarding_security_simulation_ready', locale)
                    : t('onboarding_security_simulation_warning', locale)}
                </span>
              </div>
              <div style={statusPillStyle(!settings.tradingEnabled)}>
                <strong style={{ display: 'block', marginBottom: 6 }}>
                  {t('onboarding_security_trading_title', locale)}
                </strong>
                <span>
                  {settings.tradingEnabled
                    ? t('onboarding_security_trading_warning', locale)
                    : t('onboarding_security_trading_ready', locale)}
                </span>
              </div>
              <div style={statusPillStyle(!settings.aiAutoExecuteEnabled)}>
                <strong style={{ display: 'block', marginBottom: 6 }}>
                  {t('onboarding_security_ai_title', locale)}
                </strong>
                <span>
                  {settings.aiAutoExecuteEnabled
                    ? t('onboarding_security_ai_warning', locale)
                    : t('onboarding_security_ai_ready', locale)}
                </span>
              </div>
            </div>
          </div>
        );
      case 'tutorial':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0 }}>{t('onboarding_tutorial_heading', locale)}</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {[
                t('onboarding_tutorial_step_1', locale),
                t('onboarding_tutorial_step_2', locale),
                t('onboarding_tutorial_step_3', locale),
                t('onboarding_tutorial_step_4', locale)
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: 'rgba(30, 41, 59, 0.52)',
                    color: '#cbd5e1',
                    lineHeight: 1.7
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      case 'complete':
      default:
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <h2 style={{ margin: 0 }}>{t('onboarding_complete_heading', locale)}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
              {t('onboarding_complete_body', locale)}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  navigateTo('dashboard');
                }}
              >
                {t('onboarding_open_dashboard', locale)}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  navigateTo('simulation');
                }}
              >
                {t('onboarding_start_simulation', locale)}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <section
      style={{
        padding: 28,
        borderRadius: 28,
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(148, 163, 184, 0.18)'
      }}
    >
      <div style={{ display: 'grid', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div style={{ color: '#38bdf8', letterSpacing: 1.2, marginBottom: 10 }}>
              {eyebrowLabel}
            </div>
            <div style={{ color: '#94a3b8' }}>
              {t('onboarding_step_counter', locale, {
                current: currentStepIndex + 1,
                total: onboardingSteps.length
              })}
            </div>
          </div>
          <PhaseBadge phase="5" message={t('onboarding_wizard_badge', locale)} />
        </div>

        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: 'rgba(30, 41, 59, 0.7)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #38bdf8, #2563eb)'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap'
          }}
        >
          {onboardingSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                if (!canAccessOnboardingStep(step.id, riskAcknowledged)) {
                  showRiskBanner();
                  return;
                }

                setBanner(null);
                setCurrentStepIndex(index);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                border:
                  currentStepIndex === index
                    ? '1px solid rgba(56, 189, 248, 0.32)'
                    : '1px solid rgba(148, 163, 184, 0.12)',
                background:
                  currentStepIndex === index
                    ? 'rgba(14, 165, 233, 0.14)'
                    : 'rgba(15, 23, 42, 0.4)',
                color: '#e2e8f0',
                cursor: 'pointer',
                opacity: canAccessOnboardingStep(step.id, riskAcknowledged) ? 1 : 0.6
              }}
            >
              {step.title}
            </button>
          ))}
        </div>

        {renderStepContent()}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            disabled={isFirstStep}
            onClick={() => {
              setCurrentStepIndex((currentValue) => Math.max(currentValue - 1, 0));
            }}
          >
            {t('onboarding_previous', locale)}
          </Button>
          <Button
            disabled={!canAdvanceOnboardingStep(currentStep.id, riskAcknowledged)}
            onClick={() => {
              if (!canAdvanceOnboardingStep(currentStep.id, riskAcknowledged)) {
                showRiskBanner();
                return;
              }

              if (isLastStep) {
                navigateTo('dashboard');
                return;
              }

              setCurrentStepIndex((currentValue) =>
                Math.min(currentValue + 1, onboardingSteps.length - 1)
              );
            }}
          >
            {isLastStep ? t('onboarding_finish', locale) : t('onboarding_next', locale)}
          </Button>
          <Button
            variant="secondary"
            disabled={!riskAcknowledged}
            onClick={() => {
              if (!riskAcknowledged) {
                showRiskBanner();
                return;
              }

              navigateTo('dashboard');
            }}
          >
            {t('onboarding_skip', locale)}
          </Button>
        </div>
      </div>
    </section>
  );
};
