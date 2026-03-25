// File: src/renderer/pages/Dashboard.tsx
// Responsibility: Presents market overview and AI insights.
// Security: Uses only renderer-safe market snapshots and AI recommendations.

import { PriceChart } from '../components/charts/PriceChart';
import { AISignalCard } from '../components/ai/AISignalCard';
import { AIMetricsCard } from '../components/ai/AIMetricsCard';
import { FeedbackButtons } from '../components/ai/FeedbackButtons';
import { LoadingPanel } from '../components/common/LoadingPanel';
import { getAISignalKey, useAISignals } from '../hooks/useAISignals';
import { useMarketData } from '../hooks/useMarketData';
import { useAIMetricsStore } from '../stores/ai-metrics-store';
import { formatCurrency, formatPercent, formatTimestamp } from '../utils/formatters';

const defaultSymbol = 'BTC/USDT';

export const Dashboard = (): JSX.Element => {
  const { ticker, loading: marketLoading, error: marketError } = useMarketData(defaultSymbol);
  const {
    signals,
    loading,
    error,
    refreshSignals,
    streamConnected,
    lastAlertAt
  } = useAISignals(defaultSymbol);
  const incrementSignal = useAIMetricsStore((state) => state.incrementSignal);
  const hasTrackedSignal = useAIMetricsStore((state) => state.hasTrackedSignal);

  const handleSignalFeedback = (signalIndex: number, wasAccurate: boolean): void => {
    const signal = signals[signalIndex];

    if (signal === undefined) {
      return;
    }

    incrementSignal({
      signalKey: getAISignalKey(signal),
      wasAccurate,
      wasFiltered: signal.filtered,
      confidence: signal.confidence
    });
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 1fr) minmax(220px, 1fr) minmax(300px, 1.2fr)',
          gap: 16
        }}
      >
        <div
          style={{
            padding: 20,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>Last Price</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {formatCurrency(ticker?.price ?? 0)}
          </div>
        </div>
        <div
          style={{
            padding: 20,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>24h Change</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {formatPercent(ticker?.change24h ?? 0)}
          </div>
        </div>
        <AIMetricsCard />
      </section>
      {marketError !== null ? (
        <div style={{ color: '#fca5a5' }}>{marketError.message}</div>
      ) : null}
      <PriceChart symbol={defaultSymbol} market={ticker ?? null} />
      <section style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>AI Signals</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: streamConnected ? '#86efac' : '#94a3b8' }}>
              {loading || marketLoading
                ? 'Refreshing...'
                : streamConnected
                  ? `Live alerts active (${signals.length})`
                  : `${signals.length} active`}
            </span>
            {lastAlertAt !== null ? (
              <span style={{ color: '#64748b', fontSize: 12 }}>
                {`Last alert ${formatTimestamp(lastAlertAt)}`}
              </span>
            ) : null}
            <button
              onClick={() => {
                void refreshSignals();
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid rgba(148, 163, 184, 0.16)',
                background: 'rgba(15, 23, 42, 0.56)',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
        </div>
        {error !== null ? (
          <div style={{ color: '#fca5a5' }}>{error.message}</div>
        ) : loading && signals.length === 0 ? (
          <LoadingPanel
            title="Preparing AI advisory feed"
            description="Loading explainable signals, confidence scores, and risk-filtered advisories for the current market."
          />
        ) : signals.length === 0 ? (
          <div
            style={{
              padding: 18,
              borderRadius: 18,
              background: 'rgba(30, 41, 59, 0.52)',
              color: '#94a3b8',
              lineHeight: 1.7
            }}
          >
            No AI advisories are available yet. Refresh the feed or wait for the next market-driven
            alert.
          </div>
        ) : null}
        <div
          style={{
            display: 'grid',
            gap: 14,
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
          }}
        >
          {signals.map((signal, index) => (
            <div
              key={getAISignalKey(signal)}
              style={{ display: 'grid', gap: 12 }}
            >
              <AISignalCard signal={signal} />
              <FeedbackButtons
                signal={signal}
                hasFeedback={hasTrackedSignal(getAISignalKey(signal))}
                onFeedback={(wasAccurate) => {
                  handleSignalFeedback(index, wasAccurate);
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
