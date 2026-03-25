// File: src/renderer/components/common/Button.tsx
// Responsibility: Small reusable button with intentional visual states.
// Security: Presentation-only component.

import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
    color: '#eff6ff'
  },
  secondary: {
    background: 'rgba(148, 163, 184, 0.14)',
    color: '#e2e8f0',
    border: '1px solid rgba(148, 163, 184, 0.3)'
  },
  ghost: {
    background: 'transparent',
    color: '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.22)'
  }
};

export const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  style,
  ...props
}: PropsWithChildren<ButtonProps>): JSX.Element => {
  return (
    <button
      {...props}
      style={{
        padding: '12px 16px',
        borderRadius: 12,
        border: 'none',
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.65 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'transform 160ms ease, opacity 160ms ease',
        ...variantStyles[variant],
        ...style
      }}
    >
      {children}
    </button>
  );
};
