import type { Meta, StoryObj } from '@storybook/react';
import { AreaChart } from './Area';
import type { UiDocsParameters } from '#/types/DocsTypes';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const TWO = [
  { key: 'direct', label: 'Direct', data: [420, 512, 486, 640, 712, 690] },
  { key: 'referral', label: 'Referral', data: [280, 310, 402, 380, 460, 520] },
];

const meta: Meta<typeof AreaChart> = {
  title: 'Charts/Area',
  component: AreaChart,
  parameters: {
    layout: 'padded',
    ui: {
      description: 'A line with the volume beneath it filled. Use it when the magnitude under the curve is the ' +
        'point, or `stacked` for part-to-whole over time.',
      tags: ['data', 'svg'],
      usage: {
        when: ['One series where the filled volume carries meaning.', 'Part-to-whole over an ordered x (`stacked`).'],
        avoid: [
          'Several unstacked series — the fills occlude each other. Use `LineChart`.',
          'Any series that can go negative while stacked; the bands cross and stop meaning anything.',
        ],
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
type Story = StoryObj<typeof AreaChart>;

export const Playground: Story = {
  render: () => (
    <AreaChart id="area-pg" title="Ingest volume" categories={MONTHS}
      series={[TWO[0]]} />
  ),
};

export const Stacked: Story = {
  render: () => (
    <AreaChart id="area-s" title="Stacked" description="Bands sum; the top edge is the total."
      categories={MONTHS} series={TWO} stacked />
  ),
};

export const Curved: Story = {
  render: () => (
    <AreaChart id="area-c" title="Monotone" categories={MONTHS} series={TWO} stacked curve="monotone" />
  ),
};
