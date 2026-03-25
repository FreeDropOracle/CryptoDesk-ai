// File: src/renderer/components/charts/PriceChart.tsx
// Responsibility: Lightweight market chart visualization for the renderer.
// Security: Uses only market data already exposed through preload.

import { useEffect, useRef } from 'react';
import {
  ColorType,
  createChart,
  type IChartApi,
  type LineData,
  type UTCTimestamp
} from 'lightweight-charts';
import type { MarketData } from '@shared/public/market.types';

interface PriceChartProps {
  symbol: string;
  market: MarketData | null;
}

const buildSeriesData = (price: number): LineData[] => {
  const currentTime = Math.floor(Date.now() / 1000) as UTCTimestamp;

  return Array.from({ length: 12 }, (_, index) => ({
    time: (currentTime - (11 - index) * 60) as UTCTimestamp,
    value: price + (index - 5) * 4
  }));
};

export const PriceChart = ({ symbol, market }: PriceChartProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi['addLineSeries']> | null>(null);

  useEffect(() => {
    if (containerRef.current === null || chartRef.current !== null) {
      return;
    }

    const chart = createChart(containerRef.current, {
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(9, 17, 29, 0.88)' },
        textColor: '#cbd5e1'
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.08)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.08)' }
      }
    });

    const series = chart.addLineSeries({
      color: '#38bdf8',
      lineWidth: 3
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current === null) {
      return;
    }

    seriesRef.current.setData(buildSeriesData(market?.price ?? 65000));
  }, [market]);

  return (
    <section
      style={{
        padding: 20,
        borderRadius: 24,
        background: 'rgba(15, 23, 42, 0.72)',
        border: '1px solid rgba(148, 163, 184, 0.18)'
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, color: '#94a3b8' }}>Market Chart</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{symbol}</div>
      </div>
      <div ref={containerRef} />
    </section>
  );
};
