// File: src/renderer/pages/TradeHistory.tsx
// Responsibility: Renders simulation trade history with explicit non-live labeling.
// Security: Displays simulation-only records and never suggests that trades touched a real exchange.

import { PhaseBadge } from '../components/common/PhaseBadge';
import { Button } from '../components/common/Button';
import { LoadingPanel } from '../components/common/LoadingPanel';
import { useTradeHistoryStore } from '../stores/trade-history-store';
import { formatCurrency, formatTimestamp } from '../utils/formatters';

interface TradeHistoryProps {
  title?: string;
  maxItems?: number;
  onRefresh?(): Promise<void>;
}

export const TradeHistory = ({
  title = 'Simulation Trade History',
  maxItems,
  onRefresh
}: TradeHistoryProps): JSX.Element => {
  const trades = useTradeHistoryStore((state) => state.trades);
  const loading = useTradeHistoryStore((state) => state.loading);
  const error = useTradeHistoryStore((state) => state.error);
  const lastSyncedAt = useTradeHistoryStore((state) => state.lastSyncedAt);
  const visibleTrades = typeof maxItems === 'number' ? trades.slice(0, maxItems) : trades;

  return (
    <section
      style={{
        padding: 22,
        borderRadius: 24,
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(148, 163, 184, 0.18)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 18
        }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
          <div style={{ color: '#94a3b8' }}>
            {lastSyncedAt === null
              ? 'Local simulation ledger not synced yet.'
              : `Last synced at ${new Date(lastSyncedAt).toLocaleTimeString('en-US')}`}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
          <PhaseBadge phase="3" message="Simulation-only history" />
          {onRefresh !== undefined ? (
            <Button
              variant="ghost"
              onClick={() => {
                void onRefresh();
              }}
            >
              Refresh
            </Button>
          ) : null}
        </div>
      </div>
      {error !== null ? (
        <div style={{ color: '#fca5a5', marginBottom: 14 }}>{error.message}</div>
      ) : null}
      {loading ? (
        <LoadingPanel
          title="Loading simulation history"
          description="Refreshing the local paper-trading ledger and rebuilding the virtual portfolio view."
          compact
        />
      ) : visibleTrades.length === 0 ? (
        <div style={{ color: '#94a3b8' }}>
          No simulation trades yet. Start practicing to build your local ledger.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {visibleTrades.map((trade) => (
            <article
              key={trade.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr repeat(4, minmax(0, 1fr))',
                gap: 12,
                alignItems: 'center',
                padding: 14,
                borderRadius: 16,
                background: 'rgba(30, 41, 59, 0.52)'
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{trade.symbol}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  {formatTimestamp(trade.timestamp)}
                </div>
              </div>
              <div style={{ color: trade.side === 'buy' ? '#86efac' : '#fca5a5' }}>
                {trade.side.toUpperCase()}
              </div>
              <div>{trade.type.toUpperCase()}</div>
              <div>{trade.quantity.toFixed(6)}</div>
              <div>{formatCurrency(trade.price ?? 0)}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
