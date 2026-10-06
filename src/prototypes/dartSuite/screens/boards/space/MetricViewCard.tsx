/* DartBoards · a metric, shown one way — the card a metric becomes on a space.

   A metric is added ONCE from the library and shaped on the canvas: as a
   number, a trend, or a breakdown (by org, region or product), over a pinned
   timeframe or the space's. The same metric can sit on a space several times
   with different views — a daily number beside a month-to-date breakdown.

   The caption under the title always says what drives the card ("Daily · pinned
   · Product: Cards, from the space"), so a space can never silently show two
   different periods. The numbers are generated: the prototype has no metrics API. */

import type { ReactNode } from 'react';
import Card, { CardBody, CardHeader } from '../../../../../components/Card';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import { BarChart, LineChart } from '../../../../../charts';
import { ChartLine } from 'lucide-react';
import type { Asset, MetricView, NativeFilters } from '../../../types';
import { PERIODS, PRODUCTS } from '../native/nativeData';

export const TIMEFRAME_LABEL: Record<MetricView['timeframe'], string> = { follow: 'Follows the space', day: 'Daily', week: 'Weekly', mtd: 'Month to date' };
export const BREAKDOWN_LABEL: Record<MetricView['breakdown'], string> = { org: 'Org', region: 'Region', product: 'Product' };
const BREAKDOWN_VALUES: Record<MetricView['breakdown'], string[]> = {
  org: ['Early collections', 'Hardship', 'Recoveries', 'Agency'],
  region: ['North', 'South', 'East', 'West'],
  product: ['Cards', 'Loans', 'Mortgages'],
};

const BASE: Record<string, number> = { 'm-roll-rate': 3.4, 'm-cure-rate': 41.2, 'm-ptp-kept': 68, 'm-first-response': 134 };
const PRODUCT_SCALE: Record<string, number> = { all: 1, cards: 1.08, loans: 1.21, mortgages: 0.34 };

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const noise = (key: string, i: number) => {
  const x = Math.sin(hash(key) + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const formatMetric = (a: Asset, v: number) =>
  a.metric?.unit === 'time' ? `${Math.floor(v / 60)}h ${Math.round(v % 60)}m` : a.metric?.unit === 'count' ? Math.round(v).toLocaleString('en-US') : `${v.toFixed(1)}%`;

/** The labels down the x-axis for a timeframe. A followed timeframe uses the bar's period, in weeks. */
function axis(view: MetricView, space: NativeFilters | null): string[] {
  const end = new Date(2026, 8, 30);
  const back = (n: number, step: number) =>
    Array.from({ length: n }, (_, i) => {
      const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (n - 1 - i) * step);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  if (view.timeframe === 'day') return back(14, 1);
  if (view.timeframe === 'mtd') return back(30, 1);
  if (view.timeframe === 'week') return back(13, 7);
  return back(PERIODS.find((p) => p.value === (space?.period ?? '13w'))!.weeks, 7);
}

/**
 * A metric's number as a NUMBER view shows it — the value now, and how it moved on the previous period.
 * One function, so any surface that shows the same metric with the same view and filters (a space, a
 * space pinned to Home) shows the same number.
 */
function numbers(asset: Asset, view: MetricView, space: NativeFilters | null) {
  const product = space?.product ?? 'all';
  const base = (BASE[asset.id] ?? 10) * PRODUCT_SCALE[product];
  const key = `${asset.id}-${view.timeframe}-${product}-${space?.period ?? ''}`;
  const now = base * (0.96 + noise(key, 1) * 0.08);
  const prev = base * (0.96 + noise(key, 2) * 0.08);
  return { base, key, now, prev };
}

export function metricNumber(asset: Asset, view: MetricView, space: NativeFilters | null) {
  const { now, prev } = numbers(asset, view, space);
  const delta = now - prev;
  const by = asset.metric?.unit === 'time' ? `${Math.abs(Math.round(delta))}m` : `${Math.abs(delta).toFixed(1)} pts`;
  const period = view.timeframe === 'day' ? 'day' : view.timeframe === 'mtd' ? 'month' : 'period';
  return { value: formatMetric(asset, now), change: `${delta >= 0 ? 'up' : 'down'} ${by}`, period };
}

/**
 * The shape behind a NUMBER view — `n` periods that END on its previous value and its value now, so a
 * sparkline beside the number finishes exactly where the number and its change say it does.
 */
export function metricTrend(asset: Asset, view: MetricView, space: NativeFilters | null, n = 12): number[] {
  const { base, key, now, prev } = numbers(asset, view, space);
  // A gentle drift into the previous value, not independent noise, so the line reads as a trend.
  const start = base * (0.94 + noise(`${key}-trend`, 0) * 0.12);
  const walk = Array.from({ length: n - 2 }, (_, i) => start + ((prev - start) * i) / (n - 2) + base * (noise(`${key}-trend`, i + 1) - 0.5) * 0.03);
  return [...walk.map((v) => +v.toFixed(2)), +prev.toFixed(2), +now.toFixed(2)];
}

/** What drives this card, in one line. */
export function metricCaption(view: MetricView, space: NativeFilters | null, origin: string | null = 'from the space'): string {
  const from = origin ? ` · ${origin}` : '';
  const time =
    view.timeframe === 'follow'
      ? `${PERIODS.find((p) => p.value === (space?.period ?? '13w'))!.label}${space ? from : ''}`
      : `${TIMEFRAME_LABEL[view.timeframe]}${origin ? ' · pinned' : ''}`;
  const product = space
    ? space.product === 'all'
      ? `All products${from}`
      : `${PRODUCTS.find((p) => p.value === space.product)!.label}${from}`
    : 'All products';
  return `${time} · ${product}`;
}

/** `origin` names where the filters came from ("from the space"); null on a page where the reader set them. */
export function MetricViewCard({ id, asset, view, space, action, origin = 'from the space' }: { id: string; asset: Asset; view: MetricView; space: NativeFilters | null; action?: ReactNode; origin?: string | null }) {
  const product = space?.product ?? 'all';
  const base = (BASE[asset.id] ?? 10) * PRODUCT_SCALE[product];
  const key = `${asset.id}-${view.timeframe}-${product}-${space?.period ?? ''}`;
  const fmt = (v: number) => formatMetric(asset, v);
  const title = view.display === 'breakdown' ? `${asset.name} by ${BREAKDOWN_LABEL[view.breakdown].toLowerCase()}` : asset.name;

  let body: ReactNode;
  if (view.display === 'number') {
    const n = metricNumber(asset, view, space);
    body = (
      <div className="ds-metric-number">
        <span className="ds-metric-number__value">{n.value}</span>
        <span className="ds-metric-number__change">
          {n.change} on the previous {n.period}
        </span>
      </div>
    );
  } else if (view.display === 'trend') {
    const cats = axis(view, space);
    body = (
      <LineChart
        id={`${id}-chart`}
        title={title}
        categories={cats}
        series={[{ key: 'v', label: asset.name, data: cats.map((_, i) => +(base * (0.88 + noise(key, i) * 0.24)).toFixed(2)) }]}
        valueFormatter={fmt}
        height={220}
        showLegend={false}
      />
    );
  } else {
    const cats = BREAKDOWN_VALUES[view.breakdown];
    body = (
      <BarChart
        id={`${id}-chart`}
        title={title}
        categories={cats}
        series={[{ key: 'v', label: asset.name, data: cats.map((_, i) => +(base * (0.7 + noise(`${key}-${view.breakdown}`, i) * 0.6)).toFixed(2)) }]}
        valueFormatter={fmt}
        height={220}
        showLegend={false}
      />
    );
  }

  return (
    <Card id={id} className={`ds-metric-card ds-metric-card--${view.display}`}>
      <CardHeader
        id={`${id}-header`}
        title={title}
        description={metricCaption(view, space, origin)}
        media={<FeaturedIcon Icon={ChartLine} size="sm" color="success" />}
        action={action}
      />
      <CardBody>{body}</CardBody>
    </Card>
  );
}

export const DEFAULT_METRIC_VIEW: MetricView = { display: 'number', timeframe: 'follow', breakdown: 'org' };
