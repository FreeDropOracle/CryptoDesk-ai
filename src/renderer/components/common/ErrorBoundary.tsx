// File: src/renderer/components/common/ErrorBoundary.tsx
// Responsibility: Prevents renderer crashes from degrading into a blank screen.
// Security: Shows only minimal user-safe error details outside development mode.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

type SupportedBoundaryLocale = 'en' | 'ar';

const boundaryCopy: Record<
  SupportedBoundaryLocale,
  {
    title: string;
    description: string;
    reload: string;
    details: string;
    footer: string;
  }
> = {
  en: {
    title: 'Something went wrong',
    description: 'The interface hit an unexpected problem. You can reload the app and continue.',
    reload: 'Reload App',
    details: 'Technical details',
    footer: 'If this keeps happening, please report the issue with the steps that triggered it.'
  },
  ar: {
    title: 'حدث خطأ غير متوقع',
    description: 'واجهت الواجهة مشكلة غير متوقعة. يمكنك إعادة تحميل التطبيق والمتابعة.',
    reload: 'إعادة تحميل التطبيق',
    details: 'تفاصيل تقنية',
    footer: 'إذا استمرت المشكلة، يرجى الإبلاغ عنها مع الخطوات التي أدت إليها.'
  }
};

const getBoundaryLocale = (): SupportedBoundaryLocale => {
  if (typeof document === 'undefined') {
    return 'en';
  }

  return document.documentElement.lang.toLowerCase().startsWith('ar') ? 'ar' : 'en';
};

const getBoundaryDirection = (): 'ltr' | 'rtl' => {
  if (typeof document === 'undefined') {
    return 'ltr';
  }

  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';
};

const isDevelopmentRenderer = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol !== 'file:'
  );
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  public override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback !== undefined) {
      return this.props.fallback;
    }

    const locale = getBoundaryLocale();
    const direction = getBoundaryDirection();
    const copy = boundaryCopy[locale];
    const technicalDetails =
      this.state.error?.stack ??
      this.state.errorInfo?.componentStack ??
      'No additional diagnostic details were captured.';

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          background:
            'radial-gradient(circle at top, rgba(22, 33, 62, 0.95) 0%, rgba(11, 18, 32, 1) 62%)',
          color: '#eff6ff',
          direction,
          fontFamily: '"Segoe UI", system-ui, sans-serif'
        }}
      >
        <div
          style={{
            width: 'min(640px, 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(148, 163, 184, 0.24)',
            background: 'rgba(15, 23, 42, 0.88)',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.45)',
            padding: '32px'
          }}
        >
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '0.82rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#fca5a5'
            }}
          >
            Renderer Error
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '1.9rem', lineHeight: 1.2 }}>{copy.title}</h1>
          <p style={{ margin: '0 0 22px', color: '#cbd5e1', lineHeight: 1.7 }}>
            {this.state.error?.message ?? copy.description}
          </p>

          {isDevelopmentRenderer() ? (
            <details
              style={{
                marginBottom: '22px',
                borderRadius: '14px',
                border: '1px solid rgba(59, 130, 246, 0.22)',
                background: 'rgba(15, 23, 42, 0.92)',
                padding: '14px 16px'
              }}
            >
              <summary style={{ cursor: 'pointer', color: '#93c5fd', fontWeight: 600 }}>
                {copy.details}
              </summary>
              <pre
                style={{
                  margin: '14px 0 0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  color: '#cbd5e1'
                }}
              >
                {technicalDetails}
              </pre>
            </details>
          ) : null}

          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0f766e 0%, #155e75 100%)',
              color: '#f8fafc',
              fontSize: '0.95rem',
              fontWeight: 600,
              padding: '12px 18px',
              cursor: 'pointer'
            }}
          >
            {copy.reload}
          </button>

          <p style={{ margin: '18px 0 0', color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {copy.footer}
          </p>
        </div>
      </div>
    );
  }
}
