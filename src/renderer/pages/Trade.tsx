// File: src/renderer/pages/Trade.tsx
// Responsibility: Trade entry and recent execution history.
// Security: Order submission is routed through secure IPC only.

import { OrderForm } from '../components/trading/OrderForm';
import { usePortfolioStore } from '../stores/portfolio-store';
import { formatCurrency, formatTimestamp } from '../utils/formatters';

export const Trade = (): JSX.Element => {
  const recentTrades = usePortfolioStore((state) => state.recentTrades);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
      <OrderForm />
      <section
        style={{
          padding: 22,
          borderRadius: 24,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)'
        }}
      >
        <h2 style={{ marginTop: 0 }}>Recent Trades</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {recentTrades.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>No trades yet. Start in simulation mode.</div>
          ) : (
            recentTrades.map((trade) => (
              <article
                key={trade.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.52)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{trade.symbol}</strong>
                  <span>{trade.side.toUpperCase()}</span>
                </div>
                <div style={{ color: '#94a3b8', marginTop: 6 }}>
                  {trade.quantity} @ {formatCurrency(trade.price ?? 0)}
                </div>
                <div style={{ color: '#64748b', marginTop: 6, fontSize: 13 }}>
                  {formatTimestamp(trade.timestamp)}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
