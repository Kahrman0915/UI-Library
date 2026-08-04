import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart, BarChart, Chart, LineChart } from './Chart';
import type { UiDocsParameters } from '#/types/DocsTypes';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const TWO = [
  { key: 'direct', label: 'Direct', data: [420, 512, 486, 640, 712, 690] },
  { key: 'referral', label: 'Referral', data: [280, 310, 402, 380, 460, 520] },
];

const FOUR = [
  ...TWO,
  { key: 'organic', label: 'Organic', data: [180, 240, 220, 300, 340, 410] },
  { key: 'paid', label: 'Paid', data: [90, 120, 160, 140, 200, 260] },
];

const meta: Meta<typeof Chart> = {
  title: 'Components/Chart',
  component: Chart,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The chart frame and its three marks — bar, line and area. Renders its own SVG with no ' +
        'charting dependency, so a chart is plain markup that themes through CSS, exports to ' +
        'static HTML, and server-renders.\n\n' +
        'Series colours come from `--chart-1` … `--chart-6`, assigned by series **identity** and ' +
        'never by position among the visible ones — hiding a series must never repaint the ' +
        'others. Past six, the tail folds to `--chart-muted` rather than inventing a seventh step.\n\n' +
        'The ramp is **neutral slate on purpose.** A chart that reads in grey is working on form, ' +
        'hierarchy, motion and interaction rather than leaning on hue — colour can flatter a weak ' +
        'chart. It is also the most colour-blind-safe palette obtainable, since lightness ' +
        'differences survive every CVD type intact. Per-brand colour is a later additive change; ' +
        'the searched palettes already exist, parked in the POC recipe.',
      tags: ['data', 'svg', 'a11y'],
      usage: {
        when: [
          'Comparing magnitude across categories (`BarChart`).',
          'A trend over time, or several series compared over the same x (`LineChart`).',
          'Part-to-whole over time, or a single series where the filled volume is the point (`AreaChart`).',
        ],
        avoid: [
          'A single current number — that is a `StatTile`, not a one-bar bar chart.',
          'Two measures on different scales. There is deliberately no dual axis: the alignment ' +
            'of two y-scales is arbitrary, so the chart invents a correlation the data does not ' +
            'contain. Use two charts, or index both to a common base.',
          'More than about seven meaningful classes — past that, adjacent colours blur and a ' +
            'table serves the reader better.',
        ],
        notes:
          '`height` is the OUTER height and includes the x-axis band and legend gutter, so a chart ' +
          'never grows a nested scrollbar inside its card. `null` in `data` is a GAP, not a zero — ' +
          'the line breaks rather than drawing a confident diagonal through missing data. The table ' +
          'twin is always in the DOM; `view` only decides whether it is visible.',
      },
      a11y: {
        keyboard: [
          { keys: ['Tab'], description: 'Move into the plot. The whole plot is one tab stop.' },
          { keys: ['←'], description: 'Previous category. Focus shows exactly what hover shows.' },
          { keys: ['→'], description: 'Next category.' },
          { keys: ['Home'], description: 'Jump to the first category.' },
          { keys: ['End'], description: 'Jump to the last category.' },
          { keys: ['Esc'], description: 'Clear the active category.' },
        ],
        notes:
          'Marks are `aria-hidden` and the table twin is the accessible representation — announcing ' +
          'sixty `<rect>` elements is noise, and a table is what a screen-reader user can actually ' +
          'navigate. A live region mirrors the active category and every series value, so a keyboard ' +
          'user gets what a hovering user gets: tooltips enhance, they never gate a value. Two ' +
          'dark-mode series sit just under 3:1 on `--card`; that is the documented relief case, and ' +
          'the direct labels and table twin are the required mitigation.',
      },
      changelog: [
        {
          date: '2026-08-04',
          summary: 'Initial build — the chart frame, bar / line / area marks, legend, tooltip and table twin.',
          detail:
            'Renders its own SVG with zero runtime dependencies. Scale and path maths live in ' +
            '`src/utils/{scale,ticks,path,stack,series}.ts` as pure modules. Smooth curves use ' +
            'Fritsch–Carlson monotone cubic rather than Catmull–Rom, which overshoots and would ' +
            'draw values below zero on a series that dips to zero. Line draw-on uses ' +
            '`pathLength="1"` so it needs no `getTotalLength()` call and still animates in static HTML.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj<typeof Chart>;

export const Playground: Story = {
  render: () => (
    <BarChart id="pg" title="Sessions by channel" description="Last six months, thousands."
      categories={MONTHS} series={TWO} />
  ),
};

export const Marks: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="m-bar" title="Bar — grouped" categories={MONTHS} series={TWO} />
      <BarChart id="m-stack" title="Bar — stacked" categories={MONTHS} series={FOUR} layout="stacked" />
      <BarChart id="m-100" title="Bar — 100% stacked" categories={MONTHS} series={FOUR} layout="stacked100" />
      <LineChart id="m-line" title="Line" categories={MONTHS} series={TWO} />
      <LineChart id="m-curve" title="Line — monotone curve" categories={MONTHS} series={TWO} curve="monotone" />
      <AreaChart id="m-area" title="Area — stacked" categories={MONTHS} series={TWO} stacked />
    </div>
  ),
};

export const SixSeries: Story = {
  name: 'Six series — the full ramp',
  render: () => (
    <LineChart id="six" title="Every slot in the series ramp"
      description="Six evenly-stepped slots. Lightness differences survive every CVD type intact."
      categories={MONTHS}
      series={Array.from({ length: 6 }, (_, i) => ({
        key: `s${i}`,
        label: `Series ${i + 1}`,
        data: MONTHS.map((_, m) => 100 + i * 60 + m * (12 + i * 3)),
      }))} />
  ),
};

export const OverflowFolds: Story = {
  name: 'Overflow folds to "Other"',
  render: () => (
    <LineChart id="over" title="Nine series"
      description="Past six, the tail renders muted rather than inventing a seventh step."
      categories={MONTHS}
      series={Array.from({ length: 9 }, (_, i) => ({
        key: `s${i}`, label: `Series ${i + 1}`,
        data: MONTHS.map((_, m) => 80 + i * 40 + m * 10),
      }))} />
  ),
};

export const IdentityIsStable: Story = {
  name: 'Filtering does not repaint survivors',
  render: function Filterable() {
    const [hidden, setHidden] = useState<string[]>([]);
    return (
      <BarChart id="filter" title="Toggle a series in the legend"
        description="Every survivor keeps its own colour. Colour follows the entity, never its rank."
        categories={MONTHS} series={FOUR} hiddenSeries={hidden}
        onSeriesToggle={(key, visible) =>
          setHidden((h) => (visible ? h.filter((k) => k !== key) : [...h, key]))} />
    );
  },
};

export const EdgeCases: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <LineChart id="e-gap" title="Nulls are gaps, not zeros"
        description="The line breaks rather than drawing through missing data."
        categories={MONTHS}
        series={[{ key: 'a', label: 'Uptime', data: [98, 97, null, null, 96, 99] }]} />
      <LineChart id="e-over" title="Monotone curve does not overshoot"
        description="A dip to zero stays at zero — Catmull–Rom would swing below it."
        categories={['a', 'b', 'c', 'd', 'e']} curve="monotone"
        series={[{ key: 'a', label: 'Value', data: [0, 5, 0, 5, 0] }]} />
      <BarChart id="e-neg" title="Mixed signs"
        description="Positives stack up from zero, negatives down, independently."
        categories={MONTHS} layout="stacked"
        series={[
          { key: 'gain', label: 'Gained', data: [40, 55, 30, 62, 48, 70] },
          { key: 'lost', label: 'Lost', data: [-22, -18, -41, -12, -30, -16] },
        ]} />
      <BarChart id="e-flat" title="A flat series still draws"
        categories={MONTHS} series={[{ key: 'a', label: 'Flat', data: [5, 5, 5, 5, 5, 5] }]} />
      <BarChart id="e-one" title="One category" categories={['Only']}
        series={[{ key: 'a', label: 'Value', data: [42] }]} />
      <BarChart id="e-empty" title="Empty" categories={[]} series={[]} />
    </div>
  ),
};

export const TableTwin: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="t-both" title="view=both" description="The same numbers, twice."
        categories={MONTHS} series={TWO} view="both" />
      <BarChart id="t-table" title="view=table" categories={MONTHS} series={TWO} view="table" />
    </div>
  ),
};
