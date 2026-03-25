// File: src/renderer/components/common/LoadingPanel.tsx
// Responsibility: Displays a consistent loading state for async renderer workflows.
// Security: Presentation-only helper with no side effects or privileged access.

interface LoadingPanelProps {
  title: string;
  description: string;
  compact?: boolean;
}

export const LoadingPanel = ({
  title,
  description,
  compact = false
}: LoadingPanelProps): JSX.Element => {
  return (
    <div
      style={{
        padding: compact ? 16 : 20,
        borderRadius: 18,
        background: 'rgba(30, 41, 59, 0.52)',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        display: 'grid',
        gap: 12
      }}
    >
      <div>
        <div style={{ fontWeight: 700, color: '#eff6ff', marginBottom: 6 }}>{title}</div>
        <div style={{ color: '#94a3b8', lineHeight: 1.6 }}>{description}</div>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(148, 163, 184, 0.12))'
          }}
        />
        <div
          style={{
            height: 10,
            width: '72%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.14), rgba(148, 163, 184, 0.1))'
          }}
        />
      </div>
    </div>
  );
};
