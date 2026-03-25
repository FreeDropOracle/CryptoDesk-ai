// File: src/renderer/pages/SimulationDashboard.tsx
// Responsibility: Presents virtual portfolio metrics and simulation history in one clear workspace.
// Security: Keeps simulation analytics visually distinct from real portfolio screens.

import { Button } from '../components/common/Button';
import { PhaseBadge } from '../components/common/PhaseBadge';
import { useTradeHistory } from '../hooks/useTradeHistory';
import { useUIStore } from '../stores/ui-store';
import { useVirtualPortfolioStore } from '../stores/virtual-portfolio-store';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { TradeHistory } from './TradeHistory';

export const SimulationDashboard = (): JSX.Element => {
  const setPage = useUIStore((state) => state.setPage);
  const balance = useVirtualPortfolioStore((state) => state.balance);
  const assets = useVirtualPortfolioStore((state) => state.assets);
  const totalPnl = useVirtualPortfolioStore((state) => state.totalPnl);
  const realizedPnl = useVirtualPortfolioStore((state) => state.realizedPnl);
  const totalValue = useVirtualPortfolioStore((state) => state.getTotalValue());
  const winRate = useVirtualPortfolioStore((state) => state.winRate);
  const tradeCount = useVirtualPortfolioStore((state) => state.tradeCount);
  const { refreshHistory, resetSimulationData, loading } = useTradeHistory();

  const handleReset = (): void => {
    if (
      !window.confirm('Reset all simulation data? This clears only local practice history.')
    ) {
      return;
    }

    void resetSimulationData();
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section
        style={{
          padding: 24,
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
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 20
          }}
        >
          <div>
            <h1 style={{ marginTop: 0, marginBottom: 10 }}>Simulation Dashboard</h1>
            <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.7 }}>
              Practice mode stays local, resets cleanly, and never touches a live exchange.
            </p>
          </div>
          <PhaseBadge phase="3" message="Practice mode only" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14
          }}
        >
          {[
            { label: 'Virtual Cash', value: formatCurrency(Number(balance.USDT)) },
            { label: 'Total Value', value: formatCurrency(totalValue) },
            { label: 'Total P&L', value: formatCurrency(totalPnl) },
            { label: 'Realized P&L', value: formatCurrency(realizedPnl) },
            { label: 'Win Rate', value: formatPercent(winRate) },
            { label: 'Trades Executed', value: tradeCount.toString() }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: 18,
                borderRadius: 18,
                background: 'rgba(30, 41, 59, 0.52)',
                border: '1px solid rgba(148, 163, 184, 0.14)'
              }}
            >
              <div style={{ color: '#94a3b8', marginBottom: 8, fontSize: 13 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          <Button
            variant="secondary"
            onClick={() => {
              void refreshHistory();
            }}
            disabled={loading}
          >
            Refresh Ledger
          </Button>
          <Button variant="ghost" onClick={handleReset} disabled={loading}>
            Reset Simulation
          </Button>
          <Button
            onClick={() => {
              setPage('trade');
            }}
          >
            New Trade
          </Button>
        </div>
      </section>
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
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}
        >
          <h2 style={{ margin: 0 }}>Virtual Holdings</h2>
          <div style={{ color: '#64748b' }}>Derived from simulation history</div>
        </div>
        {assets.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>No open virtual positions yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {assets.map((asset) => (
              <article
                key={asset.symbol}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr repeat(4, minmax(0, 1fr))',
                  gap: 12,
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.52)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{asset.symbol}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>
                    Avg buy {formatCurrency(asset.avgBuyPrice)}
                  </div>
                </div>
                <div>{asset.amount}</div>
                <div>{formatCurrency(asset.currentPrice)}</div>
                <div>{formatCurrency(asset.currentValue)}</div>
                <div style={{ color: asset.pnl >= 0 ? '#86efac' : '#fca5a5' }}>
                  {formatCurrency(asset.pnl)} ({formatPercent(asset.pnlPercent)})
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <TradeHistory onRefresh={refreshHistory} maxItems={12} />
    </div>
  );
};
