// File: src/renderer/components/ai/AIMetricsCard.tsx
// Responsibility: Visualizes transparent advisory-AI performance metrics for the dashboard.
// Security: Shows renderer-only analytics and clearly explains the calculation methodology.

import { Button } from '../common/Button';
import { PhaseBadge } from '../common/PhaseBadge';
import { useAIMetricsStore } from '../../stores/ai-metrics-store';
import { formatPercent } from '../../utils/formatters';

export const AIMetricsCard = (): JSX.Element => {
  const metrics = useAIMetricsStore((state) => state.metrics);
  const filteredRate = useAIMetricsStore((state) => state.getFilteredRate());
  const reset = useAIMetricsStore((state) => state.reset);

  return (
    <section
      style={{
        padding: 20,
        borderRadius: 22,
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        display: 'grid',
        gap: 16
      }}
    >
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
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>AI Metrics</div>
          <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>
            Transparent scoring based on reviewed advisories only.
          </div>
        </div>
        <PhaseBadge phase="4" message="AI performance tracked transparently" />
      </div>
      {metrics === null ? (
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: 'rgba(30, 41, 59, 0.52)',
            color: '#94a3b8'
          }}
        >
          Metrics start after the first feedback review on an AI advisory.
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12
            }}
          >
            {[
              {
                label: 'Reviewed Signals',
                value: metrics.totalSignals.toString()
              },
              {
                label: 'Accuracy Rate',
                value: formatPercent(metrics.accuracyRate * 100)
              },
              {
                label: 'Filtered Rate',
                value: formatPercent(filteredRate * 100)
              },
              {
                label: 'Avg Confidence',
                value: formatPercent(metrics.avgConfidence * 100)
              }
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.52)'
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.16)',
              color: '#cbd5e1',
              lineHeight: 1.6
            }}
          >
            Accuracy = accurate reviews / reviewed non-filtered advisories. Filtered signals are
            tracked separately as protected outcomes, not counted as mistakes.
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              {`Last updated ${new Date(metrics.lastUpdated).toLocaleTimeString('en-US')}`}
            </div>
            <Button variant="ghost" onClick={reset}>
              Reset Metrics
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
