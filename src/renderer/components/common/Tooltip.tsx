// File: src/renderer/components/common/Tooltip.tsx
// Responsibility: Lightweight contextual help for critical controls and labels.
// Security: Presentation-only helper that explains UI behavior without touching privileged APIs.

import { useState, type PropsWithChildren } from 'react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const getTooltipPositionStyle = (position: TooltipProps['position']) => {
  switch (position) {
    case 'bottom':
      return {
        top: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)'
      } as const;
    case 'left':
      return {
        top: '50%',
        right: 'calc(100% + 10px)',
        transform: 'translateY(-50%)'
      } as const;
    case 'right':
      return {
        top: '50%',
        left: 'calc(100% + 10px)',
        transform: 'translateY(-50%)'
      } as const;
    case 'top':
    default:
      return {
        bottom: 'calc(100% + 10px)',
        left: '50%',
        transform: 'translateX(-50%)'
      } as const;
  }
};

export const Tooltip = ({
  content,
  children,
  position = 'top'
}: PropsWithChildren<TooltipProps>): JSX.Element => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8 }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible((currentValue) => !currentValue)}
    >
      {children}
      {visible ? (
        <span
          className="tooltip-bubble"
          style={{
            position: 'absolute',
            zIndex: 20,
            width: 'min(240px, 70vw)',
            padding: '10px 12px',
            borderRadius: 12,
            background: '#081018',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            color: '#e2e8f0',
            fontSize: 12,
            lineHeight: 1.6,
            boxShadow: '0 18px 32px rgba(0, 0, 0, 0.28)',
            ...getTooltipPositionStyle(position)
          }}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
};
