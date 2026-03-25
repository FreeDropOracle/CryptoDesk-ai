// File: src/renderer/components/ai/AISignalCard.tsx
// Responsibility: Displays a single AI signal with confidence, reasoning, and filter transparency.
// Security: Frames every signal as advisory only and never as an execution command.

import type { AISignal } from '@shared/public/ai.types';
import { AI_ADVISORY_MESSAGE } from '@shared/public/ai.types';
import { PhaseBadge } from '../common/PhaseBadge';
import { formatPercent, formatTimestamp } from '../../utils/formatters';

interface AISignalCardProps {
  signal: AISignal;
}

export const AISignalCard = ({ signal }: AISignalCardProps): JSX.Element => {
  const accent =
    signal.filtered
      ? '#f59e0b'
      : signal.action === 'buy'
        ? '#22c55e'
        : signal.action === 'sell'
          ? '#ef4444'
          : '#38bdf8';

  return (
    <article
      style={{
        padding: 18,
        borderRadius: 20,
        background: 'rgba(15, 23, 42, 0.72)',
        border: `1px solid ${accent}55`,
        display: 'grid',
        gap: 14
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <strong>{signal.symbol}</strong>
        <PhaseBadge phase="4" message="AI advisory only" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ color: accent, textTransform: 'uppercase', fontWeight: 700 }}>
          {signal.action}
        </span>
        <div style={{ minWidth: 120 }}>
          <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>
            Confidence {formatPercent(signal.confidence * 100)}
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: 'rgba(148, 163, 184, 0.18)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.round(signal.confidence * 100)}%`,
                height: '100%',
                background: accent
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {signal.reasoning.map((reason) => (
          <div
            key={`${signal.symbol}-${reason}`}
            style={{
              color: '#cbd5e1',
              lineHeight: 1.5,
              padding: '10px 12px',
              borderRadius: 14,
              background: 'rgba(30, 41, 59, 0.5)'
            }}
          >
            {reason}
          </div>
        ))}
      </div>
      {signal.filtered ? (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.22)',
            color: '#fde68a'
          }}
        >
          This signal was filtered by risk controls ({signal.filterReason ?? 'policy'}).
        </div>
      ) : null}
      <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
        {AI_ADVISORY_MESSAGE}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8' }}>
        {`${signal.modelVersion} • ${signal.source.toUpperCase()} • ${formatTimestamp(signal.generatedAt)}`}
      </div>
    </article>
  );
};
