// File: src/renderer/pages/Portfolio.tsx
// Responsibility: Presents a read-only portfolio preview and market watchlist for Phase 2.
// Security: Shows only renderer-safe balances and market data, with no trade execution controls.

import type { SupportedExchange } from '@shared/public/constants';
import { Button } from '../components/common/Button';
import { LoadingPanel } from '../components/common/LoadingPanel';
import { PhaseBadge } from '../components/common/PhaseBadge';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMarketStore } from '../stores/market-store';
import { usePortfolioStore } from '../stores/portfolio-store';
import { formatCurrency, formatPercent, formatTimestamp } from '../utils/formatters';

export const Portfolio = (): JSX.Element => {
  const exchange: SupportedExchange = 'binance';
  const { snapshot, loading, error, notice, totalUsdValue, refreshPortfolio } =
    usePortfolio(exchange);
  const simulationBalance = usePortfolioStore((state) => state.simulationBalance);
  const recentTrades = usePortfolioStore((state) => state.recentTrades);
  const tickers = useMarketStore((state) => state.getAllTickers());
  const lastUpdate = useMarketStore((state) => state.lastUpdate);
  const streamError = useMarketStore((state) => state.error);

  const previewTimestamp =
    snapshot === null ? null : formatTimestamp(new Date(snapshot.timestamp).toISOString());
  const streamTimestamp =
    lastUpdate === null ? 'Waiting...' : formatTimestamp(new Date(lastUpdate).toISOString());

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <PhaseBadge
        phase="2"
        message={
          notice ?? 'Read-only preview. Trading and live credential execution open in Phase 3.'
        }
      />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}
      >
        <article
          style={{
            padding: 20,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>Read-Only Preview Total</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCurrency(totalUsdValue)}</div>
          <div style={{ color: '#cbd5e1', marginTop: 8 }}>
            Secure preview from the main process. No live execution path is exposed here.
          </div>
        </article>
        <article
          style={{
            padding: 20,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>Preview Exchange</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{exchange.toUpperCase()}</div>
          <div style={{ color: '#cbd5e1', marginTop: 8 }}>
            Portfolio preview requests cross IPC with `exchange` only. Credentials never enter the
            renderer payload.
          </div>
        </article>
        <article
          style={{
            padding: 20,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>Preview Status</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {previewTimestamp ?? (loading ? 'Loading...' : 'Standby')}
          </div>
          <div style={{ color: error === null ? '#cbd5e1' : '#fca5a5', marginTop: 8 }}>
            {error ??
              (snapshot === null
                ? 'Preview remains read-only until live credential wiring is approved.'
                : 'Portfolio preview hydrated successfully through the secure bridge.')}
          </div>
        </article>
        <article
          style={{
            padding: 20,
            borderRadius: 22,
            background: 'rgba(15, 23, 42, 0.72)',
            border: '1px solid rgba(148, 163, 184, 0.18)'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: 8 }}>Simulation Buying Power</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCurrency(simulationBalance)}</div>
          <div style={{ color: '#cbd5e1', marginTop: 8 }}>
            Local paper-trading balance stays isolated from exchange preview balances.
          </div>
        </article>
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
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>Portfolio Preview</h2>
            <div style={{ color: '#94a3b8' }}>
              Sanitized balances only. Trading and key management remain outside this view.
            </div>
          </div>
          <Button variant="secondary" onClick={() => void refreshPortfolio()}>
            Refresh Preview
          </Button>
        </div>

        {loading && snapshot === null ? (
          <LoadingPanel
            title="Preparing secure portfolio preview"
            description="Building a renderer-safe balance snapshot through the main process without exposing credentials."
          />
        ) : error !== null && snapshot === null ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ color: '#fca5a5' }}>{error}</div>
            <div>
              <Button variant="ghost" onClick={() => void refreshPortfolio()}>
                Retry Secure Preview
              </Button>
            </div>
          </div>
        ) : snapshot === null ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ color: '#94a3b8' }}>
              No preview snapshot has been loaded yet for this exchange.
            </div>
            <div>
              <Button variant="ghost" onClick={() => void refreshPortfolio()}>
                Load Preview
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {snapshot.balances.map((balance) => (
              <article
                key={balance.asset}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.52)',
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 1fr 1fr auto',
                  gap: 12,
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{balance.asset}</strong>
                  <div style={{ color: '#94a3b8', marginTop: 6 }}>
                    Updated {formatTimestamp(new Date(snapshot.timestamp).toISOString())}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>Available</div>
                  <div style={{ fontWeight: 700 }}>{balance.free}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>Locked / Est. USD</div>
                  <div style={{ fontWeight: 700 }}>
                    {balance.locked} /{' '}
                    {typeof balance.usdValue === 'number'
                      ? formatCurrency(balance.usdValue)
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <Button variant="ghost" disabled>
                    Trade in Phase 3
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          padding: 22,
          borderRadius: 24,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.18)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Market Watchlist</h2>
          <span style={{ color: '#94a3b8' }}>Display only</span>
        </div>
        <div style={{ color: streamError === null ? '#94a3b8' : '#fca5a5', marginBottom: 12 }}>
          {streamError ?? `Last market stream update: ${streamTimestamp}`}
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {tickers.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>
              No live tickers cached yet. Open the dashboard to begin a market subscription.
            </div>
          ) : (
            tickers.map((ticker) => (
              <article
                key={ticker.symbol}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: 'rgba(30, 41, 59, 0.52)',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr',
                  gap: 12
                }}
              >
                <div>
                  <strong>{ticker.symbol}</strong>
                  <div style={{ color: '#94a3b8', marginTop: 6 }}>
                    Updated {formatTimestamp(ticker.timestamp)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>Last Price</div>
                  <div style={{ fontWeight: 700 }}>{formatCurrency(ticker.price)}</div>
                </div>
                <div>
                  <div style={{ color: '#94a3b8' }}>24h Change</div>
                  <div style={{ fontWeight: 700 }}>{formatPercent(ticker.change24h)}</div>
                </div>
              </article>
            ))
          )}
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
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Recent Local Activity</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {recentTrades.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>
              No local trades recorded yet. This page intentionally exposes no trade buttons.
            </div>
          ) : (
            recentTrades.slice(0, 5).map((trade) => (
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
                  <span>{trade.status}</span>
                </div>
                <div style={{ color: '#94a3b8', marginTop: 6 }}>
                  {trade.quantity} units - {trade.side.toUpperCase()} -{' '}
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
