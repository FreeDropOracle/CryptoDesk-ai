// File: src/renderer/components/ai/FeedbackButtons.tsx
// Responsibility: Collects explicit user feedback about advisory AI quality.
// Security: Records renderer-only analytics feedback and never changes execution policy.

import type { AISignal } from '@shared/public/ai.types';
import { Button } from '../common/Button';

interface FeedbackButtonsProps {
  signal: AISignal;
  disabled?: boolean;
  hasFeedback: boolean;
  onFeedback(wasAccurate: boolean): void;
}

export const FeedbackButtons = ({
  signal,
  disabled = false,
  hasFeedback,
  onFeedback
}: FeedbackButtonsProps): JSX.Element => {
  if (signal.filtered) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ color: '#94a3b8', fontSize: 13 }}>
          Filtered advisories are tracked as protected outcomes, not counted as misses.
        </div>
        <Button
          variant="secondary"
          disabled={disabled || hasFeedback}
          onClick={() => {
            onFeedback(true);
          }}
        >
          {hasFeedback ? 'Protected Outcome Recorded' : 'Count Protected Outcome'}
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ color: '#94a3b8', fontSize: 13 }}>
        Review this advisory after observing the market move.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button
          disabled={disabled || hasFeedback}
          onClick={() => {
            onFeedback(true);
          }}
        >
          {hasFeedback ? 'Feedback Recorded' : 'Mark Accurate'}
        </Button>
        <Button
          variant="ghost"
          disabled={disabled || hasFeedback}
          onClick={() => {
            onFeedback(false);
          }}
        >
          Needs Review
        </Button>
      </div>
    </div>
  );
};
