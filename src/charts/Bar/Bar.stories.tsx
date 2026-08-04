import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './Bar';
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

const meta: Meta<typeof BarChart> = {
  title: 'Charts/Bar',
  component: BarChart,
  parameters: {
    layout: 'padded',
    ui: {
      description: 'Magnitude across categories. `layout` switches between grouped, stacked and 100% stacked.\n\n' +
        'Stacked segments are separated by a **2px surface gap**, and that gap is load-bearing rather ' +
        'than decorative: WCAG 1.4.11 wants 3:1 between adjacent graphical objects, which no ' +
        'categorical palette can deliver across six consecutive slots. Separating the marks converts ' +
        'the obligation into contrast-against-background, which the ramp does satisfy.',
      tags: ['data', 'svg'],
      usage: {
        when: [
          'Comparing magnitude across a handful of named categories.',
          'Part-to-whole per category (`stacked`), or share per category (`stacked100`).',
        ],
        avoid: [
          'A single value — that is a `StatTile`, not a one-bar chart.',
          'Long category names in vertical bars. Horizontal orientation is the fix and is not built yet.',
        ],
        notes:
          'The gap between stacked segments is clamped to `min(2px, 25% of the segment)` and dropped ' +
          'below 3px, so a thin segment stays visible rather than being eaten by its own gap.',
      },
      changelog: [
        {
          date: '2026-08-04',
          summary: 'Initial build.',
          detail:
            'Renders its own SVG with no charting dependency, so the chart is plain markup that ' +
            'themes through CSS and exports to static HTML. Shares the frame, scales and chrome ' +
            'with every other chart in `src/charts/Chart`.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj<typeof BarChart>;

export const Playground: Story = {
  render: () => (
    <BarChart id="bar-pg" title="Sessions by channel" description="Last six months."
      categories={MONTHS} series={TWO} />
  ),
};

export const Layouts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <BarChart id="bar-g" title="Grouped" categories={MONTHS} series={FOUR} />
      <BarChart id="bar-s" title="Stacked" categories={MONTHS} series={FOUR} layout="stacked" />
      <BarChart id="bar-p" title="100% stacked"
        description="The axis reads percentages; the tooltip and table keep the real figures."
        categories={MONTHS} series={FOUR} layout="stacked100" />
    </div>
  ),
};

export const MixedSigns: Story = {
  render: () => (
    <BarChart id="bar-neg" title="Gains and losses"
      description="Positives stack up from zero, negatives down, independently."
      categories={MONTHS} layout="stacked"
      series={[
        { key: 'gain', label: 'Gained', data: [40, 55, 30, 62, 48, 70] },
        { key: 'lost', label: 'Lost', data: [-22, -18, -41, -12, -30, -16] },
      ]} />
  ),
};

export const ThinSegments: Story = {
  name: 'Thin segments survive their own gap',
  render: () => (
    <BarChart id="bar-thin" title="A sliver against a slab"
      description="The 2px gap is clamped so a small segment is not eaten by it."
      categories={['a', 'b', 'c']} layout="stacked"
      series={[
        { key: 'big', label: 'Bulk', data: [1000, 1000, 1000] },
        { key: 'sliver', label: 'Sliver', data: [8, 4, 2] },
      ]} />
  ),
};
