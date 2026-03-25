// File: src/renderer/components/common/PhaseBadge.tsx
// Responsibility: Communicates phased capability boundaries clearly inside the UI.
// Security: Presentation-only hint that reinforces read-only behavior.

interface PhaseBadgeProps {
  phase: '2' | '3' | '4' | '5';
  message: string;
}

export const PhaseBadge = ({ phase, message }: PhaseBadgeProps): JSX.Element => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'rgba(14, 165, 233, 0.14)',
        border: '1px solid rgba(56, 189, 248, 0.28)',
        color: '#dbeafe',
        fontSize: 14,
        fontWeight: 600
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.65)'
        }}
      />
      <span>{`Phase ${phase}: ${message}`}</span>
    </div>
  );
};
