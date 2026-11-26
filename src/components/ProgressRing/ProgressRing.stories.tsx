import type { Meta, StoryObj } from '@storybook/react';
import ProgressRing from './ProgressRing';
import Card, { CardBody } from '../Card';
import Stat from '../Stat';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof ProgressRing> = {
  title: 'Components/ProgressRing',
  component: ProgressRing,
  parameters: {
    ui: {
      description:
        'A share of a whole as a small ring — "69% of open items are moving". The circular sibling of `Progress`: same ' +
        '`value` / `max` / `variant`, same track and indicator colors, so a ring and a bar showing one share read alike.\n\n' +
        'Made for a stat tile, where it sits beside the number. It has no visible label, so `label` is required and is ' +
        'what a screen reader hears with the value.',
      tags: ['data', 'progress'],
      usage: {
        when: ['A percentage that is the point of a tile: capacity used, catalog health, items moving.'],
        avoid: [
          'Comparing several shares — rings are hard to compare side by side; use `Progress` bars in a list.',
          'Progress of a task with steps or a label above it — that is `Progress`.',
        ],
        notes: '`sm` hides the value (it does not fit); put the number next to it instead. Give the ring a `variant` only when the share means something good or bad.',
      },
      changelog: [
        {
          date: '2026-10-18',
          summary: 'Initial build — a percentage as a small ring for stat tiles.',
          detail:
            'Built for the Command Center KPI tiles (Work in flow, Load vs capacity, Team load, Catalog health). SVG circle with a circumference of 100 units, so the percentage is the dash length; starts at twelve o\'clock. `size` sm/default/lg (32/48/64), `variant` shares `ProgressVariant`. `role="progressbar"` with `aria-valuetext` from `valueFormatter`.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    variant: { control: 'select', options: ['default', 'success', 'warning', 'error', 'info'] },
  },
};
export default meta;
type Story = StoryObj<typeof ProgressRing>;

export const Playground: Story = {
  args: { id: 'ring-pg', label: 'Open items moving', value: 69 },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <ProgressRing id="ring-sm" label="Capacity used" value={78} size="sm" />
      <ProgressRing id="ring-default" label="Capacity used" value={78} />
      <ProgressRing id="ring-lg" label="Capacity used" value={78} size="lg" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <ProgressRing id="ring-v-default" label="Items moving" value={69} />
      <ProgressRing id="ring-v-success" label="Catalog health" value={91} variant="success" />
      <ProgressRing id="ring-v-warning" label="Team load" value={84} variant="warning" />
      <ProgressRing id="ring-v-error" label="Over capacity" value={112} max={100} variant="error" valueFormatter={() => '112%'} />
      <ProgressRing id="ring-v-info" label="Synced" value={40} variant="info" />
    </div>
  ),
};

/** The composition it was built for: the ring beside a Stat in a tile. */
export const InAStatTile: Story = {
  render: () => (
    <Card id="ring-tile" style={{ width: 280 }}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <Stat id="ring-tile-stat" label="Work in flow" value="69%" description="9 of 13 open items moving · 4 stuck" />
          <ProgressRing id="ring-tile-ring" label="Open items moving" value={9} max={13} />
        </div>
      </CardBody>
    </Card>
  ),
};
