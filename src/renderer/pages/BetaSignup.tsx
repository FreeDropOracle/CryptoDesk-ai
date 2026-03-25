// File: src/renderer/pages/BetaSignup.tsx
// Responsibility: Presents a launch-prep beta intake preview and acceptance guidance.
// Security: Local-only renderer form with no network submission or privileged access.

import { useState } from 'react';
import { APP_NAME } from '@shared/public/constants';
import { Button } from '../components/common/Button';
import { PhaseBadge } from '../components/common/PhaseBadge';
import { useSettingsStore } from '../stores/settings-store';
import { useUIStore } from '../stores/ui-store';
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

type BetaExperience = 'beginner' | 'intermediate' | 'advanced' | 'professional';
type BetaExchangeOption = 'binance' | 'bybit' | 'coinbase' | 'kraken' | 'other';
type BetaOperatingSystem = 'windows' | 'mac-intel' | 'mac-silicon' | 'linux';
type BetaInterest =
  | 'ai-signals'
  | 'simulation'
  | 'portfolio'
  | 'alerts'
  | 'multi-exchange';
type BetaFeedbackLevel = 'active' | 'passive' | 'observer';

interface BetaSignupFormState {
  name: string;
  email: string;
  discord: string;
  country: string;
  experience: BetaExperience;
  primaryExchange: BetaExchangeOption;
  customExchange: string;
  operatingSystem: BetaOperatingSystem;
  motivation: string;
  interests: readonly BetaInterest[];
  feedbackLevel: BetaFeedbackLevel;
  agreeBeta: boolean;
  agreeNoAdvice: boolean;
  agreeNda: boolean;
  agreeRisk: boolean;
}

const INITIAL_BETA_SIGNUP_FORM: BetaSignupFormState = {
  name: '',
  email: '',
  discord: '',
  country: '',
  experience: 'intermediate',
  primaryExchange: 'binance',
  customExchange: '',
  operatingSystem: 'windows',
  motivation: '',
  interests: ['simulation'],
  feedbackLevel: 'active',
  agreeBeta: false,
  agreeNoAdvice: false,
  agreeNda: false,
  agreeRisk: false
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBetaSignupReady = (form: BetaSignupFormState): boolean => {
  const hasCoreFields =
    form.name.trim().length > 1 &&
    emailPattern.test(form.email.trim()) &&
    form.country.trim().length > 1 &&
    form.motivation.trim().length > 12;
  const hasExchange =
    form.primaryExchange !== 'other' || form.customExchange.trim().length > 1;
  const hasInterest = form.interests.length > 0;
  const hasAgreements =
    form.agreeBeta && form.agreeNoAdvice && form.agreeNda && form.agreeRisk;

  return hasCoreFields && hasExchange && hasInterest && hasAgreements;
};

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.45)',
  color: '#eff6ff'
} as const;

export const BetaSignup = (): JSX.Element => {
  const locale = useSettingsStore((state) => state.settings.locale);
  const setBanner = useUIStore((state) => state.setBanner);
  const [form, setForm] = useState<BetaSignupFormState>(INITIAL_BETA_SIGNUP_FORM);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const benefitCards: readonly { title: string; description: string }[] = [
    {
      title: t('beta_signup_benefit_early_title', locale),
      description: t('beta_signup_benefit_early_description', locale)
    },
    {
      title: t('beta_signup_benefit_product_title', locale),
      description: t('beta_signup_benefit_product_description', locale)
    },
    {
      title: t('beta_signup_benefit_safety_title', locale),
      description: t('beta_signup_benefit_safety_description', locale)
    }
  ];

  const interestOptions: readonly { id: BetaInterest; label: string }[] = [
    { id: 'ai-signals', label: t('beta_signup_interest_ai', locale) },
    { id: 'simulation', label: t('beta_signup_interest_simulation', locale) },
    { id: 'portfolio', label: t('beta_signup_interest_portfolio', locale) },
    { id: 'alerts', label: t('beta_signup_interest_alerts', locale) },
    {
      id: 'multi-exchange',
      label: t('beta_signup_interest_multi_exchange', locale)
    }
  ];

  const selectionCards: readonly { title: string; description: string; accent: string }[] = [
    {
      title: t('beta_signup_selection_accept_title', locale),
      description: t('beta_signup_selection_accept_description', locale),
      accent: '#86efac'
    },
    {
      title: t('beta_signup_selection_waitlist_title', locale),
      description: t('beta_signup_selection_waitlist_description', locale),
      accent: '#fde68a'
    },
    {
      title: t('beta_signup_selection_reject_title', locale),
      description: t('beta_signup_selection_reject_description', locale),
      accent: '#fca5a5'
    }
  ];

  const faqItems: readonly { question: string; answer: string }[] = [
    {
      question: t('beta_signup_faq_1_q', locale),
      answer: t('beta_signup_faq_1_a', locale)
    },
    {
      question: t('beta_signup_faq_2_q', locale),
      answer: t('beta_signup_faq_2_a', locale)
    },
    {
      question: t('beta_signup_faq_3_q', locale),
      answer: t('beta_signup_faq_3_a', locale)
    }
  ];

  const handleInterestToggle = (interest: BetaInterest, checked: boolean): void => {
    setForm((currentValue) => {
      if (checked) {
        return {
          ...currentValue,
          interests: [...currentValue.interests, interest]
        };
      }

      return {
        ...currentValue,
        interests: currentValue.interests.filter((item) => item !== interest)
      };
    });
  };

  const handleSubmit = (): void => {
    if (!isBetaSignupReady(form)) {
      setSubmitted(false);
      setBanner({
        id: 'beta-signup-incomplete',
        tone: 'warning',
        message: t('beta_signup_validation_error', locale)
      });
      return;
    }

    setSubmitted(true);
    setBanner({
      id: 'beta-signup-ready',
      tone: 'success',
      message: t('beta_signup_success', locale)
    });
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section
        style={{
          padding: 26,
          borderRadius: 28,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          display: 'grid',
          gap: 18
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <div style={{ color: '#38bdf8', letterSpacing: 1.2, marginBottom: 10 }}>
              {APP_NAME}
            </div>
            <h1 style={{ margin: 0, fontSize: 34 }}>{t('beta_signup_title', locale)}</h1>
            <p style={{ marginTop: 12, color: '#cbd5e1', lineHeight: 1.8 }}>
              {t('beta_signup_subtitle', locale)}
            </p>
          </div>
          <PhaseBadge phase="5" message={t('beta_signup_badge', locale)} />
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(96, 165, 250, 0.18)',
            color: '#dbeafe',
            lineHeight: 1.7
          }}
        >
          {t('beta_signup_local_notice', locale)}
        </div>

        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
          }}
        >
          {benefitCards.map((item) => (
            <article
              key={item.title}
              style={{
                padding: 18,
                borderRadius: 18,
                background: 'rgba(30, 41, 59, 0.52)',
                display: 'grid',
                gap: 8
              }}
            >
              <strong>{item.title}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{item.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 1fr)',
          gap: 20
        }}
      >
        <article
          style={{
            padding: 24,
            borderRadius: 24,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            display: 'grid',
            gap: 18
          }}
        >
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>{t('beta_signup_form_title', locale)}</h2>
            <div style={{ color: '#94a3b8', lineHeight: 1.7 }}>
              {t('beta_signup_form_description', locale)}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14
            }}
          >
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_name_label', locale)}
              </div>
              <input
                value={form.name}
                onChange={(event: ValueInputEvent) => {
                  setForm({ ...form, name: event.target.value });
                }}
                style={inputStyle}
              />
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_email_label', locale)}
              </div>
              <input
                value={form.email}
                onChange={(event: ValueInputEvent) => {
                  setForm({ ...form, email: event.target.value });
                }}
                style={inputStyle}
              />
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_discord_label', locale)}
              </div>
              <input
                value={form.discord}
                onChange={(event: ValueInputEvent) => {
                  setForm({ ...form, discord: event.target.value });
                }}
                style={inputStyle}
              />
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_country_label', locale)}
              </div>
              <input
                value={form.country}
                onChange={(event: ValueInputEvent) => {
                  setForm({ ...form, country: event.target.value });
                }}
                style={inputStyle}
              />
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_experience_label', locale)}
              </div>
              <select
                value={form.experience}
                onChange={(event: ValueInputEvent) => {
                  setForm({ ...form, experience: event.target.value as BetaExperience });
                }}
                style={inputStyle}
              >
                <option value="beginner">{t('beta_signup_experience_beginner', locale)}</option>
                <option value="intermediate">
                  {t('beta_signup_experience_intermediate', locale)}
                </option>
                <option value="advanced">{t('beta_signup_experience_advanced', locale)}</option>
                <option value="professional">
                  {t('beta_signup_experience_professional', locale)}
                </option>
              </select>
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_exchange_label', locale)}
              </div>
              <select
                value={form.primaryExchange}
                onChange={(event: ValueInputEvent) => {
                  setForm({
                    ...form,
                    primaryExchange: event.target.value as BetaExchangeOption
                  });
                }}
                style={inputStyle}
              >
                <option value="binance">{t('beta_signup_exchange_binance', locale)}</option>
                <option value="bybit">{t('beta_signup_exchange_bybit', locale)}</option>
                <option value="coinbase">{t('beta_signup_exchange_coinbase', locale)}</option>
                <option value="kraken">{t('beta_signup_exchange_kraken', locale)}</option>
                <option value="other">{t('beta_signup_exchange_other', locale)}</option>
              </select>
            </label>
            {form.primaryExchange === 'other' ? (
              <label>
                <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                  {t('beta_signup_other_exchange_label', locale)}
                </div>
                <input
                  value={form.customExchange}
                  onChange={(event: ValueInputEvent) => {
                    setForm({ ...form, customExchange: event.target.value });
                  }}
                  style={inputStyle}
                />
              </label>
            ) : null}
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_os_label', locale)}
              </div>
              <select
                value={form.operatingSystem}
                onChange={(event: ValueInputEvent) => {
                  setForm({
                    ...form,
                    operatingSystem: event.target.value as BetaOperatingSystem
                  });
                }}
                style={inputStyle}
              >
                <option value="windows">{t('beta_signup_os_windows', locale)}</option>
                <option value="mac-intel">{t('beta_signup_os_mac_intel', locale)}</option>
                <option value="mac-silicon">
                  {t('beta_signup_os_mac_silicon', locale)}
                </option>
                <option value="linux">{t('beta_signup_os_linux', locale)}</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('beta_signup_motivation_label', locale)}
              </div>
              <textarea
                value={form.motivation}
                onChange={(event: ValueInputEvent) => {
                  setForm({ ...form, motivation: event.target.value });
                }}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>
          </div>

          <div>
            <div style={{ marginBottom: 10, color: '#94a3b8' }}>
              {t('beta_signup_interests_label', locale)}
            </div>
            <div
              style={{
                display: 'grid',
                gap: 10,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
              }}
            >
              {interestOptions.map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: 12,
                    borderRadius: 14,
                    background: 'rgba(30, 41, 59, 0.52)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.interests.includes(item.id)}
                    onChange={(event: ToggleInputEvent) => {
                      handleInterestToggle(item.id, event.target.checked);
                    }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('beta_signup_feedback_label', locale)}
            </div>
            <select
              value={form.feedbackLevel}
              onChange={(event: ValueInputEvent) => {
                setForm({ ...form, feedbackLevel: event.target.value as BetaFeedbackLevel });
              }}
              style={inputStyle}
            >
              <option value="active">{t('beta_signup_feedback_active', locale)}</option>
              <option value="passive">{t('beta_signup_feedback_passive', locale)}</option>
              <option value="observer">{t('beta_signup_feedback_observer', locale)}</option>
            </select>
          </label>

          <div style={{ display: 'grid', gap: 10 }}>
            <strong>{t('beta_signup_agreements_title', locale)}</strong>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={form.agreeBeta}
                onChange={(event: ToggleInputEvent) => {
                  setForm({ ...form, agreeBeta: event.target.checked });
                }}
              />
              <span>{t('beta_signup_agreement_beta', locale)}</span>
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={form.agreeNoAdvice}
                onChange={(event: ToggleInputEvent) => {
                  setForm({ ...form, agreeNoAdvice: event.target.checked });
                }}
              />
              <span>{t('beta_signup_agreement_no_advice', locale)}</span>
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={form.agreeNda}
                onChange={(event: ToggleInputEvent) => {
                  setForm({ ...form, agreeNda: event.target.checked });
                }}
              />
              <span>{t('beta_signup_agreement_nda', locale)}</span>
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={form.agreeRisk}
                onChange={(event: ToggleInputEvent) => {
                  setForm({ ...form, agreeRisk: event.target.checked });
                }}
              />
              <span>{t('beta_signup_agreement_risk', locale)}</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button onClick={handleSubmit}>{t('beta_signup_submit', locale)}</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSubmitted(false);
                setBanner(null);
                setForm(INITIAL_BETA_SIGNUP_FORM);
              }}
            >
              {t('beta_signup_reset', locale)}
            </Button>
          </div>

          {submitted ? (
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                display: 'grid',
                gap: 8
              }}
            >
              <strong>{t('beta_signup_submitted_title', locale)}</strong>
              <span style={{ color: '#cbd5e1', lineHeight: 1.7 }}>
                {t('beta_signup_submitted_description', locale)}
              </span>
            </div>
          ) : null}
        </article>

        <div style={{ display: 'grid', gap: 20 }}>
          <article
            style={{
              padding: 24,
              borderRadius: 24,
              background: 'rgba(15, 23, 42, 0.72)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              display: 'grid',
              gap: 14
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>
              {t('beta_signup_selection_title', locale)}
            </h2>
            {selectionCards.map((item) => (
              <div
                key={item.title}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.52)',
                  border: `1px solid ${item.accent}33`,
                  display: 'grid',
                  gap: 6
                }}
              >
                <strong style={{ color: item.accent }}>{item.title}</strong>
                <span style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{item.description}</span>
              </div>
            ))}
          </article>

          <article
            style={{
              padding: 24,
              borderRadius: 24,
              background: 'rgba(15, 23, 42, 0.72)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              display: 'grid',
              gap: 14
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>{t('beta_signup_faq_title', locale)}</h2>
            {faqItems.map((item) => (
              <div key={item.question} style={{ display: 'grid', gap: 6 }}>
                <strong>{item.question}</strong>
                <span style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{item.answer}</span>
              </div>
            ))}
          </article>
        </div>
      </section>
    </div>
  );
};
