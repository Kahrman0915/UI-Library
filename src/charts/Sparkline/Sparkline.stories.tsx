import type { Meta, StoryObj } from '@storybook/react';
import { Sparkline } from './Sparkline';
import type { UiDocsParameters } from '#/types/DocsTypes';

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
const VIEWS = [412, 398, 440, 465, 431, 502, 548, 530, 590, 612, 604, 668];
const DOWN = [88, 86, 84, 85, 80, 78, 74, 75, 71, 69, 66, 62];

const meta: Meta<typeof Sparkline> = {
  title: 'Charts/Sparkline',
  component: Sparkline,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A trend with no chrome — no axes, no title row, no legend — small enough for a stat tile or a table cell. ' +
        'It is read for its **shape**: going up, steady, something happened at the end.\n\n' +
        'It fills its container’s width without measuring, and the stroke stays a true 2px however wide it is ' +
        '(`vector-effect: non-scaling-stroke`). Like every chart it keeps a data table twin for assistive tech, and ' +
        'names itself with its first and last value, so the trend is heard as well as seen.',
      tags: ['data', 'svg'],
      usage: {
        when: ['Beside a number, to show where it is heading.', 'In a table cell, one trend per row.'],
        avoid: [
          'When the reader needs to read values off it — that is a LineChart, with axes.',
          'Comparing several series. One line per sparkline.',
        ],
        notes:
          '`label` is required and is the only name it has — say what the numbers ARE. Use `tone` only when the color ' +
          'means something (a measure that is good when it falls, shown red as it rises); the default is the chart ramp, like every chart.',
      },
      changelog: [
        {
          date: '2026-10-06',
          summary: 'Fixed a sparkline making the table or panel around it scroll.',
          detail:
            'The screen-reader data table was visually hidden with the shared sr-only mixin on the `<table>` itself, but a table ignores a 1px box and kept its full height, so every sparkline in a table cell grew the wrapper’s scroll area. The table now sits in a hidden `div` (`.ui-sparkline__sr`), which does clip. The root is a `div` rather than a `span`, since it holds a table; the ref is now an `HTMLDivElement`.',
        },
        {
          date: '2026-10-05',
          summary: 'Initial build — a chrome-free trend line for tiles and table cells.',
          detail:
            'Draws in a 0–100 viewBox with `preserveAspectRatio="none"` so it fills any width without a ResizeObserver; the end dot is an HTML span placed by percentage so the stretch cannot squash it. `null` breaks the line. `variant="area"` adds a 10% fill. Exported from `src/charts`.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

export const Playground: Story = {
  args: { id: 'spark-pg', label: 'Views, last 12 weeks', data: VIEWS, categories: WEEKS, variant: 'area' },
  render: (args) => (
    <div style={{ width: 240 }}>
      <Sparkline {...args} />
    </div>
  ),
};

/** Line or area; the default ramp or a tone that carries meaning. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 200px)', gap: 24 }}>
      <Sparkline id="spark-line" label="Views" data={VIEWS} />
      <Sparkline id="spark-area" label="Views" data={VIEWS} variant="area" />
      <Sparkline id="spark-good" label="Requests closed" data={VIEWS} variant="area" tone="success" />
      <Sparkline id="spark-bad" label="On-time refresh rate" data={DOWN} variant="area" tone="error" />
      <Sparkline id="spark-muted" label="Last year" data={DOWN} tone="muted" showEnd={false} />
      <Sparkline id="spark-gap" label="Views with a missing week" data={[412, 398, null, 465, 431, 502, 548]} />
    </div>
  ),
};

/** In a table cell, one trend per row — the shape beside the number. */
export const InATable: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse', font: 'inherit' }}>
      <tbody>
        {[
          ['Revenue by Region', VIEWS, '668'],
          ['Pipeline Health', DOWN, '62'],
          ['Campaign ROI', [10, 14, 12, 18, 22, 21, 26, 30, 28, 33, 35, 40], '40'],
        ].map(([name, data, now]) => (
          <tr key={name as string}>
            <td style={{ padding: '8px 16px 8px 0' }}>{name as string}</td>
            <td style={{ width: 120, padding: '8px 16px' }}>
              <Sparkline id={`spark-row-${name}`} label={`${name} views`} data={data as number[]} height={24} />
            </td>
            <td style={{ padding: '8px 0', textAlign: 'right' }}>{now as string}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
