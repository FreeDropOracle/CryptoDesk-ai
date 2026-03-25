// File: src/renderer/components/common/Modal.tsx
// Responsibility: Minimal modal for security and workflow messaging.
// Security: Presentation-only component.

import type { PropsWithChildren } from 'react';
import { Button } from './Button';

interface ModalAction {
  label: string;
  onClick(): void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  title: string;
  description: string;
  onClose(): void;
  closeLabel?: string;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
}

export const Modal = ({
  isOpen,
  title,
  description,
  onClose,
  closeLabel = 'Close',
  primaryAction,
  secondaryAction,
  children
}: ModalProps): JSX.Element | null => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 15, 26, 0.72)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 40
      }}
    >
      <div
        style={{
          width: 'min(480px, calc(100vw - 32px))',
          borderRadius: 22,
          padding: 24,
          background: '#0f1b2d',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.28)'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h2>
        <p style={{ marginTop: 0, marginBottom: 20, color: '#cbd5e1', lineHeight: 1.6 }}>
          {description}
        </p>
        {children}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 20
          }}
        >
          {primaryAction !== undefined || secondaryAction !== undefined ? (
            <>
              {secondaryAction !== undefined ? (
                <Button
                  onClick={secondaryAction.onClick}
                  variant={secondaryAction.variant ?? 'ghost'}
                  disabled={secondaryAction.disabled ?? false}
                >
                  {secondaryAction.label}
                </Button>
              ) : null}
              {primaryAction !== undefined ? (
                <Button
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant ?? 'primary'}
                  disabled={primaryAction.disabled ?? false}
                >
                  {primaryAction.label}
                </Button>
              ) : null}
            </>
          ) : (
            <Button onClick={onClose}>{closeLabel}</Button>
          )}
        </div>
      </div>
    </div>
  );
};
