import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './Line';
import type { UiDocsParameters } from '#/types/DocsTypes';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const TWO = [
  { key: 'direct', label: 'Direct', data: [420, 512, 486, 640, 712, 690] },
  { key: 'referral', label: 'Referral', data: [280, 310, 402, 380, 460, 520] },
];

const meta: Meta<typeof LineChart> = {
  title: 'Charts/Line',
  component: LineChart,
  parameters: {
    layout: 'padded',
    ui: {
      description: 'Trend over time, or several series compared over the same x.\n\n' +
        'Smooth curves use **Fritsch–Carlson monotone cubic**, not Catmull–Rom. Catmull–Rom ' +
        'overshoots: a series that dips to zero gets a curve swinging below it, drawing values the ' +
        'data never contained. The `NoOvershoot` story is the proof.',
      tags: ['data', 'svg'],
      usage: {
        when: ['A trend over an ordered x.', 'Comparing the shape of several series.'],
        avoid: [
          'Unordered categories — a line between them implies a progression that does not exist.',
          'Two measures on different scales. There is deliberately no dual axis.',
        ],
        notes:
          '`null` is a GAP, not a zero: the line breaks rather than drawing a confident diagonal ' +
          'through missing data. Markers auto-hide past 24 categories so a dense line does not ' +
          'become a caterpillar.',
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
type Story = StoryObj<typeof LineChart>;

export const Playground: Story = {
  render: () => (
    <LineChart id="line-pg" title="Sessions by channel" categories={MONTHS} series={TWO} />
  ),
};

export const Curves: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <LineChart id="line-l" title="linear" categories={MONTHS} series={TWO} curve="linear" />
      <LineChart id="line-m" title="monotone" categories={MONTHS} series={TWO} curve="monotone" />
      <LineChart id="line-s" title="step" categories={MONTHS} series={TWO} curve="step" />
    </div>
  ),
};

export const NoOvershoot: Story = {
  name: 'Monotone curve does not overshoot',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <LineChart id="line-o1" title="A dip to zero stays at zero"
        description="Catmull–Rom would swing below the axis here."
        categories={['a', 'b', 'c', 'd', 'e']} curve="monotone"
        series={[{ key: 'v', label: 'Value', data: [0, 5, 0, 5, 0] }]} />
      <LineChart id="line-o2" title="A plateau stays flat"
        categories={['a', 'b', 'c', 'd', 'e']} curve="monotone"
        series={[{ key: 'v', label: 'Value', data: [10, 0, 0, 0, 10] }]} />
    </div>
  ),
};

export const Gaps: Story = {
  render: () => (
    <LineChart id="line-gap" title="Nulls break the line"
      description="Missing data is a hole, not a zero."
      categories={MONTHS}
      series={[{ key: 'up', label: 'Uptime', data: [98, 97, null, null, 96, 99] }]} />
  ),
};

export const Dense: Story = {
  render: () => (
    <LineChart id="line-dense" title="Forty points"
      description="Markers hide themselves past 24 categories; x labels thin rather than rotate."
      categories={Array.from({ length: 40 }, (_, i) => `d${i + 1}`)}
      series={[{ key: 'v', label: 'Requests', data: Array.from({ length: 40 }, (_, i) => 400 + Math.round(Math.sin(i / 3) * 120) + i * 6) }]} />
  ),
};
