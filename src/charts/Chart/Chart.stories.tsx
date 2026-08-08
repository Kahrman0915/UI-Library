import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chart } from './Chart';
import { BarChart } from '../Bar/Bar';
import { LineChart } from '../Line/Line';
import { AreaChart } from '../Area/Area';
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
  title: 'Charts/Overview',
  component: Chart,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The shared frame every chart mounts on — sizing, scales, axes, grid, legend, tooltip, ' +
        'the table twin and the keyboard model. It renders its own SVG with no charting ' +
        'dependency, so a chart is plain markup that themes through CSS, exports to static HTML ' +
        'and server-renders.\n\n' +
        'The frame knows nothing about marks. A preset composes `<Chart>` with mark children, ' +
        'which is what lets `Bar`, `Line` and `Area` each own their folder and their stories.\n\n' +
        'Series colours come from `--chart-1` … `--chart-6`, assigned by series **identity** and ' +
        'never by position among the visible ones — hiding a series must never repaint the ' +
        'others. Past six, the tail folds to `--chart-muted` rather than inventing a seventh step.\n\n' +
        'The ramp is **neutral slate on purpose.** A chart that reads in grey is working on form, ' +
        'hierarchy, motion and interaction rather than leaning on hue — colour can flatter a weak ' +
        'chart. It is also the most colour-blind-safe palette obtainable, since lightness ' +
        'differences survive every CVD type intact. Per-brand colour is a later additive change; ' +
        'the searched palettes already exist, parked in the POC recipe.\n\n' +
        'Six slots separate cleanly in **sequence** — down a legend, up a stack — but not ' +
        '**simultaneously**, which is what a five- or six-line chart asks for. That is structural: ' +
        'six steps have to fit between the 3:1 contrast floor and the surface, so some pair is ' +
        'always close. `emphasis` is the answer, and it converts an impossible ask into an easy ' +
        'one — "tell six greys apart" becomes "tell one from the rest".',
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
          'Five or six series at equal weight. Reach for `emphasis` instead — the ramp separates ' +
            'in sequence but not simultaneously, and that limit is structural, not a tuning miss.',
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
          'the direct labels and table twin are the required mitigation.\n\n' +
          'A muted series under `emphasis` sits below 3:1 on the surface in light mode, and cannot ' +
          'not: a mute has to be lighter than every slot to recede, and the lightest slot is ' +
          'already near the floor. The mute therefore drops stroke weight as well as colour — a ' +
          'second, independent channel, the same redundant-encoding rule the rest of the library ' +
          'follows for status colour. Every muted value stays in the table twin and in the tooltip, ' +
          'and a standing emphasis is announced on its legend entry, so the subject is knowable ' +
          'without seeing the colours at all.',
      },
      changelog: [
        {
          date: '2026-08-08',
          summary:
            'Series colours now come from the active brand. Inside a `data-theme` scope ' +
            '`--chart-1..6` are that brand\'s palette instead of the neutral slate ramp, and the ' +
            'active line marker takes the brand\'s decorative highlight.',
          detail:
            'A SILENT BEHAVIOURAL CHANGE, and deliberate: no token is renamed and nothing errors, ' +
            'so a consumer expecting the slate ramp under a brand simply gets brand colour. ' +
            'Outside a theme scope nothing moves.\n\n' +
            'The marker is `fill: var(--decorative-hi, currentColor)` and the fallback is ' +
            'load-bearing — `--decorative-hi` does not exist outside a brand, so unthemed charts ' +
            'render exactly as before. The POC also sets an unguarded `stroke: var(--primary)` ' +
            'there; that WOULD change unthemed output, so it is deferred.\n\n' +
            '`npm run test:palette` now gates each brand palette (adjacent-slot dE >= 12, CVD ' +
            'dE >= 8). One finding is recorded rather than fixed: rm dark has an adjacent pair ' +
            '6.3 apart under protanopia. It prints on every run under "RECORDED, NOT FIXED" and ' +
            'is deferred to the charting rebuild. See docs/deeper-theming-v2-merge.md.',
        },
        {
          date: '2026-08-04',
          summary:
            'Added `emphasis` — foreground one series and demote the rest. Pointing at a legend ' +
            'entry does the same thing temporarily.',
          detail:
            'The subject renders exactly as it would unemphasised; the whole change lands on the ' +
            'others, because a mark that gains weight gains ink and ink reads as magnitude. ' +
            'Resolved once on the frame, so marks, legend swatches and tooltip keys all read one ' +
            'field and cannot disagree. Lines and unstacked areas repaint the subject last; stacks ' +
            'and grouped bars keep declaration order, since a stack\'s order is its meaning. ' +
            'Turn the hover behaviour off with `emphasisOnHover={false}`.',
        },
        {
          date: '2026-08-04',
          summary:
            'Retuned `--chart-muted`, which also changes how the folded "Other" series looks: ' +
            'more legible in light mode, and no longer colliding with a real series in dark.',
          detail:
            'The dark value sat ΔE 2.7 from `--chart-2` — close enough that a folded bucket read ' +
            'as that series, and emphasising it produced no visible emphasis at all. Now ΔE 15.4, ' +
            'the same floor adjacent slots are held to, at the cost of 3.07:1 → 1.79:1 on the ' +
            'surface: a mute that collides with a slot is a wrong chart, a faint one is only a ' +
            'quiet one. Light moved the other way, 1.48:1 → 2.06:1, being too pale to trace once ' +
            'the stroke thins. `npm run test:palette` now gates mute-vs-slot distinctness, which ' +
            'nothing measured before.',
        },
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

export const Anatomy: Story = {
  render: () => (
    <BarChart id="anat" title="Sessions by channel"
      description="Title, description, plot, axes, grid, legend — and a table twin you cannot see."
      categories={MONTHS} series={TWO} />
  ),
};

export const SeriesRamp: Story = {
  name: 'The six-slot ramp',
  render: () => (
    <LineChart id="ramp" title="Every slot"
      description="Neutral slate on purpose: a chart that reads in grey is working on form, not hue."
      categories={MONTHS}
      series={Array.from({ length: 6 }, (_, i) => ({
        key: `s${i}`, label: `Series ${i + 1}`,
        data: MONTHS.map((_, m) => 100 + i * 70 + m * (10 + i * 3)),
      }))} />
  ),
};

export const OverflowFolds: Story = {
  name: 'Past six, the tail folds',
  render: () => (
    <LineChart id="fold" title="Nine series"
      description="A seventh step is not invented — the tail renders muted."
      categories={MONTHS}
      series={Array.from({ length: 9 }, (_, i) => ({
        key: `s${i}`, label: `Series ${i + 1}`,
        data: MONTHS.map((_, m) => 80 + i * 45 + m * 10),
      }))} />
  ),
};

export const IdentityIsStable: Story = {
  name: 'Hiding a series does not repaint the others',
  render: function Filterable() {
    const [hidden, setHidden] = useState<string[]>([]);
    return (
      <BarChart id="ident" title="Toggle any legend entry"
        description="Colour follows the entity, never its rank among the visible ones."
        categories={MONTHS} series={FOUR} hiddenSeries={hidden}
        onSeriesToggle={(key, visible) =>
          setHidden((h) => (visible ? h.filter((k) => k !== key) : [...h, key]))} />
    );
  },
};

export const AbsentSeries: Story = {
  name: 'A series missing from the data — and the fix',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="abs-all" title="All four present" categories={MONTHS} series={FOUR} />

      <BarChart id="abs-some" title="Organic absent — Paid SHIFTS"
        description="Slots are assigned from the array as given, so dropping the third entry renumbers the fourth. This is the real behaviour, not the desired one."
        categories={MONTHS} series={FOUR.filter((s) => s.key !== 'organic')} />

      <BarChart id="abs-pin" title="Organic absent — Paid HOLDS"
        description="Pinning `slot` makes the assignment independent of array position. Use this whenever the data source can omit a series entirely, rather than passing the full list and hiding it."
        categories={MONTHS}
        series={FOUR.filter((s) => s.key !== 'organic').map((s) => ({
          ...s,
          slot: (FOUR.findIndex((f) => f.key === s.key) + 1) as 1 | 2 | 3 | 4 | 5 | 6,
        }))} />
    </div>
  ),
};

const SIX = Array.from({ length: 6 }, (_, i) => ({
  key: `r${i}`,
  label: ['North', 'South', 'East', 'West', 'Central', 'Islands'][i],
  data: MONTHS.map((_, m) => 300 + i * 40 + Math.round(Math.sin((m + i) / 1.6) * 90) + m * 12),
}));

export const Emphasis: Story = {
  name: 'Six lines, and the fix for six lines',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <LineChart id="emph-off" title="All six at equal weight"
        description="Every slot is distinct, and it still does not help: six greys can be told apart in sequence — down a legend, up a stack — but not all at once while they cross. The all-pairs worst case is dE 7.8 and no slot ordering moves it."
        categories={MONTHS} series={SIX} emphasisOnHover={false} />

      <LineChart id="emph-on" title="One subject, five as context"
        description="The same data with emphasis=&quot;East&quot;. Nothing was added to the subject — the others were demoted. Point at any legend entry to move the emphasis."
        categories={MONTHS} series={SIX} emphasis="r2" />
    </div>
  ),
};

export const EmphasisIsRemoval: Story = {
  name: 'Emphasis demotes the rest, it never inflates the subject',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <LineChart id="emph-w1" title="Unemphasised"
        categories={MONTHS} series={SIX.slice(0, 3)} emphasisOnHover={false} />
      <LineChart id="emph-w2" title="Emphasised — the subject line is byte-identical to the one above"
        description="A mark that gains weight gains ink, and ink reads as magnitude. Fattening the subject would make its data look bigger than it is, so the whole change lands on the other five."
        categories={MONTHS} series={SIX.slice(0, 3)} emphasis="r0" emphasisOnHover={false} />
    </div>
  ),
};

export const EmphasisAcrossMarks: Story = {
  name: 'Emphasis on bars and areas',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="emph-bar" title="Grouped bars"
        description="Bars keep declaration order — they never overlap, so there is nothing to sort."
        categories={MONTHS} series={FOUR} emphasis="organic" />
      <BarChart id="emph-stack" title="Stacked bars"
        description="A stack's order is its meaning, so it is never resorted either."
        categories={MONTHS} series={FOUR} layout="stacked" emphasis="organic" />
      <AreaChart id="emph-area" title="Overlapping areas"
        description="Unstacked areas DO overlap, so the subject is repainted last — otherwise the muting comes undone wherever a context band covers it."
        categories={MONTHS} series={FOUR.slice(0, 3)} emphasis="referral" />
    </div>
  ),
};

export const EmphasisGuards: Story = {
  name: 'A subject that cannot be shown is ignored',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <LineChart id="emph-miss" title="emphasis points at a key that does not exist"
        description="Renders plain rather than muting all six and foregrounding none. Same for a subject the consumer has hidden — the fallback is no emphasis, never an all-grey chart."
        categories={MONTHS} series={SIX.slice(0, 4)} emphasis="nope" emphasisOnHover={false} />
      <LineChart id="emph-hidden" title="emphasis points at a hidden series"
        categories={MONTHS} series={SIX.slice(0, 4)} emphasis="r1"
        hiddenSeries={['r1']} emphasisOnHover={false} />
    </div>
  ),
};

export const TableTwin: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="tt-both" title="view=both" description="The same numbers, twice."
        categories={MONTHS} series={TWO} view="both" />
      <BarChart id="tt-table" title="view=table" categories={MONTHS} series={TWO} view="table" />
    </div>
  ),
};

export const EdgeCases: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="e-flat" title="A flat series still draws"
        categories={MONTHS} series={[{ key: 'a', label: 'Flat', data: [5, 5, 5, 5, 5, 5] }]} />
      <BarChart id="e-one" title="One category" categories={['Only']}
        series={[{ key: 'a', label: 'Value', data: [42] }]} />
      <BarChart id="e-empty" title="No data" categories={[]} series={[]} />
    </div>
  ),
};
