/* DartBoards · native dashboards — the prototype's data.

   A real native dashboard would query its own API with the suite's filters.
   Here every widget's numbers are generated from its metric and the filters,
   deterministically, so the same filters always draw the same chart and a
   change of filter visibly moves every chart that accepts it.

   `explain` is the point of the exercise: because DartBoards holds the numbers
   (not a picture of them), Aiden can say what a chart shows. */

import type { NativeFilters, NativeWidget } from '../../../types';

export const DEFAULT_NATIVE_FILTERS: NativeFilters = { period: '13w', product: 'all' };

export const PERIODS: { value: NativeFilters['period']; label: string; weeks: number }[] = [
  { value: '4w', label: 'Last 4 weeks', weeks: 4 },
  { value: '13w', label: 'Last 13 weeks', weeks: 13 },
  { value: '26w', label: 'Last 26 weeks', weeks: 26 },
];

export const PRODUCTS: { value: Exclude<NativeFilters['product'], 'all'>; label: string }[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'loans', label: 'Loans' },
  { value: 'mortgages', label: 'Mortgages' },
];

export const filterSummary = (f: NativeFilters) =>
  `${PERIODS.find((p) => p.value === f.period)?.label ?? ''} · ${f.product === 'all' ? 'All products' : PRODUCTS.find((p) => p.value === f.product)?.label}`;

/* ── A seeded wiggle ──────────────────────────────────────────────────────── */

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const noise = (key: string, i: number) => {
  const x = Math.sin(hash(key) + i * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0..1
};

/** A drifting weekly series: `base`, a gentle trend, and seeded noise. */
const walk = (key: string, n: number, base: number, trend: number, jitter: number) =>
  Array.from({ length: n }, (_, i) => +(base + trend * (i / Math.max(1, n - 1)) + (noise(key, i) - 0.5) * jitter).toFixed(2));

/** Week-ending labels, oldest first, ending on the prototype's "today" (Sep 26). */
const weekLabels = (n: number) => {
  const end = new Date(2026, 8, 26);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (n - 1 - i) * 7);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
};

const products = (f: NativeFilters) => (f.product === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.value === f.product));
const productScale = { cards: 1, loans: 0.62, mortgages: 1.9 } as const;
const money = (v: number) => `$${v >= 10 ? v.toFixed(0) : v.toFixed(1)}M`;
const pct = (v: number) => `${v.toFixed(1)}%`;

/* ── What each widget draws ───────────────────────────────────────────────── */

export type Kpi = { label: string; value: string; delta: string; good: boolean };
export type QueueRow = { id: string; queue: string; product: string; waiting: number; oldest: string };

export type WidgetData =
  | { kind: 'kpis'; kpis: Kpi[] }
  | { kind: 'line' | 'bar'; categories: string[]; series: { key: string; label: string; data: number[] }[]; format: (v: number) => string; unit: string }
  | { kind: 'table'; rows: QueueRow[] };

export function widgetData(w: NativeWidget, f: NativeFilters): WidgetData {
  const weeks = PERIODS.find((p) => p.value === f.period)!.weeks;
  const cats = weekLabels(weeks);
  const ps = products(f);
  const k = (p: string) => `${w.metric}-${p}-${f.period}`;

  switch (w.metric) {
    case 'headline': {
      const scale = ps.reduce((a, p) => a + productScale[p.value], 0);
      // The same number the "Balance in arrears" chart ends on, so the headline and the chart agree.
      const arrears = ps.reduce((a, p) => {
        const series = walk(`arrears-${p.value}-${f.period}`, weeks, 40 * productScale[p.value], -4 * productScale[p.value], 3);
        return a + series[series.length - 1];
      }, 0);
      return {
        kind: 'kpis',
        kpis: [
          { label: 'Balance in arrears', value: money(arrears), delta: '−3.1% vs prior period', good: true },
          { label: 'Accounts in arrears', value: Math.round(21400 * scale).toLocaleString('en-US'), delta: '−2.4%', good: true },
          { label: 'Cure rate', value: pct(38 + noise(`c-${f.product}`, 2) * 6), delta: '+1.2 pts', good: true },
          { label: 'Collected vs plan', value: pct(96 + noise(`p-${f.period}`, 3) * 6), delta: '−0.8 pts', good: false },
        ],
      };
    }
    case 'arrears':
      return {
        kind: 'line', categories: cats, format: money, unit: 'balance',
        series: ps.map((p) => ({ key: p.value, label: p.label, data: walk(k(p.value), weeks, 40 * productScale[p.value], -4 * productScale[p.value], 3) })),
      };
    case 'roll':
      return {
        kind: 'line', categories: cats, format: pct, unit: 'rate',
        series: ps.map((p) => ({ key: p.value, label: p.label, data: walk(k(p.value), weeks, { cards: 3.6, loans: 4.2, mortgages: 1.1 }[p.value], -0.4, 0.5) })),
      };
    case 'cure':
      return {
        kind: 'line', categories: cats, format: pct, unit: 'rate',
        series: ps.map((p) => ({ key: p.value, label: p.label, data: walk(k(p.value), weeks, { cards: 41, loans: 36, mortgages: 52 }[p.value], 2, 4) })),
      };
    case 'collected': {
      const stages = ['Early', 'Mid', 'Late', 'Recoveries'];
      const scale = ps.reduce((a, p) => a + productScale[p.value], 0) * (weeks / 13);
      const plan = [22, 14, 7, 3].map((v) => +(v * scale).toFixed(1));
      return {
        kind: 'bar', categories: stages, format: money, unit: 'dollars',
        series: [
          { key: 'collected', label: 'Collected', data: plan.map((v, i) => +(v * (0.9 + noise(`col-${f.product}-${f.period}`, i) * 0.18)).toFixed(1)) },
          { key: 'plan', label: 'Plan', data: plan },
        ],
      };
    }
    case 'buckets': {
      const buckets = ['1–30', '31–60', '61–90', '91–120', '120+'];
      return {
        kind: 'bar', categories: buckets, format: money, unit: 'balance',
        series: ps.map((p) => ({
          key: p.value,
          label: p.label,
          data: [38, 17, 9, 5, 4].map((v, i) => +(v * productScale[p.value] * (0.85 + noise(k(p.value), i) * 0.3)).toFixed(1)),
        })),
      };
    }
    case 'queues': {
      const all: QueueRow[] = [
        { id: 'q-early-cards', queue: 'Early stage · Cards', product: 'cards', waiting: 1240, oldest: '3 days' },
        { id: 'q-hardship', queue: 'Hardship review', product: 'loans', waiting: 318, oldest: '6 days' },
        { id: 'q-mortgage-loss', queue: 'Mortgage loss mitigation', product: 'mortgages', waiting: 142, oldest: '9 days' },
        { id: 'q-mid-loans', queue: 'Mid stage · Loans', product: 'loans', waiting: 610, oldest: '2 days' },
        { id: 'q-callbacks', queue: 'Promised callbacks', product: 'cards', waiting: 205, oldest: '1 day' },
      ];
      return { kind: 'table', rows: all.filter((r) => f.product === 'all' || r.product === f.product) };
    }
    default:
      return { kind: 'kpis', kpis: [] };
  }
}

/* ── What Aiden says about a chart ────────────────────────────────────────── */

/** Plain-language reading of a widget's numbers — the reply to "Ask Aiden about this chart". */
export function explain(w: NativeWidget, dashboardName: string, f: NativeFilters): string {
  const data = widgetData(w, f);
  const scope = `(${filterSummary(f)}, from ${dashboardName})`;

  if (data.kind === 'kpis') {
    const lines = data.kpis.map((k) => `${k.label} is ${k.value} (${k.delta}).`);
    const worst = data.kpis.find((k) => !k.good);
    return `${lines.join(' ')} ${worst ? `The one moving the wrong way is ${worst.label.toLowerCase()}.` : 'Everything is moving the right way.'} ${scope}`;
  }
  if (data.kind === 'table') {
    const top = [...data.rows].sort((a, b) => b.waiting - a.waiting)[0];
    return top
      ? `${data.rows.length} queues are past their service level. The biggest is ${top.queue} with ${top.waiting.toLocaleString('en-US')} accounts waiting; the oldest item there is ${top.oldest} old. ${scope}`
      : `No queues are past their service level. ${scope}`;
  }

  const fmt = data.format;
  if (data.kind === 'bar' && data.series.length === 2 && data.series[1].key === 'plan') {
    const [got, plan] = data.series;
    const gaps = data.categories.map((c, i) => ({ c, gap: got.data[i] - plan.data[i] }));
    const behind = gaps.filter((g) => g.gap < 0).sort((a, b) => a.gap - b.gap);
    return behind.length
      ? `Collections are behind plan in ${behind.map((g) => g.c.toLowerCase()).join(' and ')}, most in ${behind[0].c.toLowerCase()} (${fmt(-behind[0].gap)} short). ${gaps.length - behind.length} ${gaps.length - behind.length === 1 ? 'stage is' : 'stages are'} ahead. ${scope}`
      : `Every stage is at or ahead of plan. ${scope}`;
  }

  const parts = data.series.map((s) => {
    const first = s.data[0];
    const last = s.data[s.data.length - 1];
    const peak = Math.max(...s.data);
    const peakAt = data.categories[s.data.indexOf(peak)];
    const dir = last < first ? 'down' : last > first ? 'up' : 'flat';
    return data.kind === 'line'
      ? `${s.label} ${dir === 'flat' ? 'held at' : `is ${dir} from ${fmt(first)} to`} ${fmt(last)}, peaking at ${fmt(peak)} in the week of ${peakAt}.`
      : `${s.label} is largest in ${data.categories[s.data.indexOf(peak)]} days (${fmt(peak)}).`;
  });
  const lead =
    data.series.length > 1
      ? ` ${[...data.series].sort((a, b) => b.data[b.data.length - 1] - a.data[a.data.length - 1])[0].label} is highest at the end of the period.`
      : '';
  return `${parts.join(' ')}${lead} ${scope}`;
}
