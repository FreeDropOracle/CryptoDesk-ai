// File: src/renderer/components/trading/OrderForm.tsx
// Responsibility: Secure order-entry form for simulation-first trade requests.
// Security: Validates locally, requires explicit large-order confirmation, and routes execution through preload only.

import { useState } from 'react';
import {
  DEFAULT_SYMBOL,
  SUPPORTED_EXCHANGES,
  type SupportedExchange,
  type SupportedOrderSide,
  type SupportedOrderType
} from '@shared/public/constants';
import { useMarketData } from '../../hooks/useMarketData';
import { useOrder, type OrderDraft } from '../../hooks/useOrder';
import { useSettingsStore } from '../../stores/settings-store';
import {
  LARGE_ORDER_CONFIRMATION_PHRASE,
  isLargeOrderConfirmationValid
} from '../../utils/fat-finger-guard';
import { formatCurrency } from '../../utils/formatters';
import { t } from '../../utils/i18n';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { PhaseBadge } from '../common/PhaseBadge';
import { Tooltip } from '../common/Tooltip';

type ValueInputEvent = {
  target: {
    value: string;
  };
};

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background: 'rgba(15, 23, 42, 0.64)',
  color: '#eff6ff'
} as const;

const DEFAULT_ORDER_DRAFT: OrderDraft = {
  exchange: 'binance',
  symbol: DEFAULT_SYMBOL,
  side: 'buy',
  type: 'limit',
  quantity: '0.01',
  price: '65000',
  clientOrderId: ''
};

const fieldErrorStyle = {
  marginTop: 6,
  color: '#fca5a5',
  fontSize: 13
} as const;

export const OrderForm = (): JSX.Element => {
  const [draft, setDraft] = useState<OrderDraft>(DEFAULT_ORDER_DRAFT);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [confirmationInput, setConfirmationInput] = useState<string>('');
  const locale = useSettingsStore((state) => state.settings.locale);
  const { ticker, loading: marketLoading, error: marketError } = useMarketData(draft.symbol);
  const { assessOrder, simulateOrder, submitting, error, lastTrade, simulationBalance } =
    useOrder(ticker?.price);

  const assessment = assessOrder(draft);
  const confirmationReady = isLargeOrderConfirmationValid(confirmationInput);
  const fallbackPrice = Number(draft.price);
  const displayPrice =
    typeof ticker?.price === 'number'
      ? ticker.price
      : Number.isFinite(fallbackPrice) && fallbackPrice > 0
        ? fallbackPrice
        : 0;

  const getFieldError = (
    field: 'symbol' | 'quantity' | 'price' | 'simulationMode' | 'clientOrderId'
  ): string | null => {
    const issue = assessment.errors.find((currentIssue) => currentIssue.field === field);
    return issue?.message ?? null;
  };

  const updateDraft = <TKey extends keyof OrderDraft>(
    field: TKey,
    value: OrderDraft[TKey]
  ): void => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
  };

  const closeConfirmation = (): void => {
    setIsConfirmationOpen(false);
    setConfirmationInput('');
  };

  const submitSimulationOrder = async (): Promise<void> => {
    const trade = await simulateOrder(draft);

    if (trade !== null) {
      closeConfirmation();
    }
  };

  const handlePrimarySubmit = async (): Promise<void> => {
    if (!assessment.valid) {
      return;
    }

    if (assessment.requiresLargeOrderConfirmation) {
      setIsConfirmationOpen(true);
      return;
    }

    await submitSimulationOrder();
  };

  return (
    <>
      <section
        style={{
          padding: 22,
          borderRadius: 24,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)'
        }}
      >
        <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h2 style={{ marginTop: 0, marginBottom: 8 }}>{t('order_form_title', locale)}</h2>
              <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>
                {t('order_form_description', locale)}
              </p>
            </div>
            <PhaseBadge phase="3" message={t('order_form_badge', locale)} />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12
            }}
          >
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'rgba(15, 118, 110, 0.16)',
                border: '1px solid rgba(45, 212, 191, 0.2)'
              }}
            >
              <div style={{ color: '#99f6e4', marginBottom: 6, fontSize: 13 }}>
                {t('order_form_reference_price', locale)}
              </div>
              <strong>
                {marketLoading && draft.type === 'market'
                  ? t('order_form_waiting_market', locale)
                  : formatCurrency(displayPrice)}
              </strong>
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'rgba(59, 130, 246, 0.14)',
                border: '1px solid rgba(96, 165, 250, 0.24)'
              }}
            >
              <div style={{ color: '#bfdbfe', marginBottom: 6, fontSize: 13 }}>
                {t('order_form_virtual_balance', locale)}
              </div>
              <strong>{formatCurrency(simulationBalance)}</strong>
            </div>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1px solid rgba(148, 163, 184, 0.18)'
              }}
            >
              <div style={{ color: '#cbd5e1', marginBottom: 6, fontSize: 13 }}>
                {t('order_form_estimated_notional', locale)}
              </div>
              <strong>{formatCurrency(assessment.estimatedValue)}</strong>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('order_form_exchange', locale)}
            </div>
            <select
              value={draft.exchange}
              onChange={(event: ValueInputEvent) => {
                updateDraft('exchange', event.target.value as SupportedExchange);
              }}
              style={inputStyle}
            >
              {SUPPORTED_EXCHANGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('order_form_symbol', locale)}
            </div>
            <input
              value={draft.symbol}
              onChange={(event: ValueInputEvent) => {
                updateDraft('symbol', event.target.value.toUpperCase());
              }}
              style={inputStyle}
            />
            {getFieldError('symbol') !== null ? (
              <div style={fieldErrorStyle}>{getFieldError('symbol')}</div>
            ) : null}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('order_form_side', locale)}
              </div>
              <select
                value={draft.side}
                onChange={(event: ValueInputEvent) => {
                  updateDraft('side', event.target.value as SupportedOrderSide);
                }}
                style={inputStyle}
              >
                <option value="buy">{t('order_form_buy_option', locale)}</option>
                <option value="sell">{t('order_form_sell_option', locale)}</option>
              </select>
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                <Tooltip
                  content={t(
                    draft.type === 'market' ? 'tooltip_market_order' : 'tooltip_limit_order',
                    locale
                  )}
                  position="right"
                >
                  <span>{t('order_form_type', locale)}</span>
                </Tooltip>
              </div>
              <select
                value={draft.type}
                onChange={(event: ValueInputEvent) => {
                  updateDraft('type', event.target.value as SupportedOrderType);
                }}
                style={inputStyle}
              >
                <option value="limit">{t('order_form_limit_option', locale)}</option>
                <option value="market">{t('order_form_market_option', locale)}</option>
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                {t('order_form_quantity', locale)}
              </div>
              <input
                value={draft.quantity}
                onChange={(event: ValueInputEvent) => {
                  updateDraft('quantity', event.target.value);
                }}
                style={inputStyle}
              />
              {getFieldError('quantity') !== null ? (
                <div style={fieldErrorStyle}>{getFieldError('quantity')}</div>
              ) : null}
            </label>
            <label>
              <div style={{ marginBottom: 6, color: '#94a3b8' }}>
                <Tooltip
                  content={t(
                    draft.type === 'limit' ? 'tooltip_limit_order' : 'tooltip_market_order',
                    locale
                  )}
                  position="right"
                >
                  <span>
                    {draft.type === 'limit'
                      ? t('order_form_limit_price', locale)
                      : t('order_form_fallback_price', locale)}
                  </span>
                </Tooltip>
              </div>
              <input
                value={draft.price}
                placeholder={
                  draft.type === 'market' ? t('order_form_market_price_placeholder', locale) : ''
                }
                onChange={(event: ValueInputEvent) => {
                  updateDraft('price', event.target.value);
                }}
                style={{
                  ...inputStyle,
                  opacity: draft.type === 'market' && typeof ticker?.price === 'number' ? 0.72 : 1
                }}
              />
              {getFieldError('price') !== null ? (
                <div style={fieldErrorStyle}>{getFieldError('price')}</div>
              ) : null}
            </label>
          </div>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              <Tooltip content={t('tooltip_client_order_id', locale)} position="right">
                <span>
                  {t('order_form_client_order_id', locale)}{' '}
                  <span style={{ color: '#64748b' }}>
                    ({t('order_form_optional', locale)})
                  </span>
                </span>
              </Tooltip>
            </div>
            <input
              value={draft.clientOrderId}
              onChange={(event: ValueInputEvent) => {
                updateDraft('clientOrderId', event.target.value);
              }}
              style={inputStyle}
            />
            {getFieldError('clientOrderId') !== null ? (
              <div style={fieldErrorStyle}>{getFieldError('clientOrderId')}</div>
            ) : null}
          </label>
          {assessment.requiresLargeOrderConfirmation && assessment.confirmationMessage !== null ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'rgba(245, 158, 11, 0.14)',
                border: '1px solid rgba(251, 191, 36, 0.22)',
                color: '#fde68a',
                lineHeight: 1.6
              }}
            >
              {assessment.confirmationMessage}
            </div>
          ) : null}
          {getFieldError('simulationMode') !== null ? (
            <div style={fieldErrorStyle}>{getFieldError('simulationMode')}</div>
          ) : null}
          {marketError !== null ? (
            <div style={{ color: '#fca5a5', fontSize: 14 }}>{marketError.message}</div>
          ) : null}
          {error !== null ? (
            <div style={{ color: '#fca5a5', fontSize: 14 }}>{error.message}</div>
          ) : null}
          {lastTrade !== null ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(52, 211, 153, 0.22)',
                color: '#bbf7d0'
              }}
            >
              {t('order_form_success', locale, {
                symbol: lastTrade.symbol,
                price: formatCurrency(lastTrade.price ?? 0)
              })}
            </div>
          ) : null}
          <Button
            onClick={() => {
              void handlePrimarySubmit();
            }}
            disabled={!assessment.valid || submitting}
            fullWidth
          >
            {submitting ? t('order_form_simulating', locale) : t('order_form_submit', locale)}
          </Button>
        </div>
      </section>
      <Modal
        isOpen={isConfirmationOpen}
        title={t('order_form_confirm_title', locale)}
        description={t('order_form_confirm_description', locale)}
        onClose={closeConfirmation}
        secondaryAction={{
          label: t('order_form_confirm_cancel', locale),
          onClick: closeConfirmation,
          variant: 'ghost'
        }}
        primaryAction={{
          label: t('order_form_confirm_primary', locale),
          onClick: () => {
            void submitSimulationOrder();
          },
          disabled: !confirmationReady || submitting
        }}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: 'rgba(30, 41, 59, 0.56)',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              color: '#cbd5e1',
              lineHeight: 1.6
            }}
          >
            <strong style={{ display: 'block', marginBottom: 8, color: '#eff6ff' }}>
              {t('order_form_summary_title', locale)}
            </strong>
            <div>{`${draft.side.toUpperCase()} ${draft.quantity} ${draft.symbol}`}</div>
            <div>
              {t('order_form_summary_value', locale, {
                value: formatCurrency(assessment.estimatedValue)
              })}
            </div>
          </div>
          <label>
            <div style={{ marginBottom: 6, color: '#94a3b8' }}>
              {t('order_form_confirm_phrase', locale, {
                phrase: LARGE_ORDER_CONFIRMATION_PHRASE
              })}
            </div>
            <input
              value={confirmationInput}
              onChange={(event: ValueInputEvent) => {
                setConfirmationInput(event.target.value);
              }}
              style={inputStyle}
            />
          </label>
        </div>
      </Modal>
    </>
  );
};
