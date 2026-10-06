import type { Meta, StoryObj } from '@storybook/react';
import Stat from './Stat';
import Card, { CardBody } from '../Card';
import { Sparkline } from '../../charts';
import { SIZES } from '../../types/GlobalTypes';
import type { UiDocsParameters } from '../../types/DocsTypes';

const TREND = [412, 398, 440, 465, 431, 502, 548, 530, 590, 612, 604, 668];
const DOWN = [3.1, 3.4, 3.2, 3.8, 4.1, 4.0, 4.6, 4.4, 4.9, 5.2];

const meta: Meta<typeof Stat> = {
  title: 'Components/Stat',
  component: Stat,
  parameters: {
    ui: {
      description:
        'One number and what it means: a label, the value, an optional change against the last period, and an optional trend. ' +
        '**Content only** — it paints no surface, so it sits in a `Card`, a bento tile, a table cell or a toolbar alike.\n\n' +
        'The change is colored by whether it is **good**, not by which way it went. The arrow shows the direction; ' +
        '`goodDirection` decides green or red — days past SLA going up is red, requests closed going up is green. ' +
        'A screen reader hears one sentence: "Up 12% vs last month".',
      tags: ['data', 'kpi'],
      usage: {
        when: ['A headline number with context: a KPI row, the top of a dashboard, a summary tile.'],
        avoid: [
          'Many numbers compared with each other — that is a table or a chart.',
          'Coloring every value. `tone` is for the number that needs something; a count that asks nothing stays default.',
        ],
        notes: 'Pass `trend` a `Sparkline` for the shape behind the number. Format the value yourself; `change` is a signed number and `changeFormat` turns its size into text.',
      },
      changelog: [
        {
          date: '2026-10-05',
          summary: 'Initial build — a number, its change and its trend, for KPI tiles.',
          detail:
            'Replaces hand-rolled KPI cards. `change` + `goodDirection` color the change by verdict (success / error / muted), `tone` colors the value only, `trend` is a slot under the number (a `Sparkline`). `size` sm/default/lg moves the value only. Renders `role="group"` named by its label.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: { size: { control: 'select', options: SIZES.filter((s) => s !== 'xs') } },
};
export default meta;
type Story = StoryObj<typeof Stat>;

export const Playground: Story = {
  args: { id: 'stat-pg', label: 'Dashboard views', value: '668', change: 12, changeLabel: 'vs last month' },
  render: (args) => (
    <Card id="stat-pg-card" style={{ width: 280 }}>
      <CardBody>
        <Stat {...args} trend={<Sparkline id="stat-pg-spark" label="Views, last 12 weeks" data={TREND} variant="area" />} />
      </CardBody>
    </Card>
  ),
};

/** The change is colored by verdict: up can be bad, down can be good, flat is neutral. */
export const ChangeVerdicts: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 220px)', gap: 16 }}>
      <Card id="stat-v1"><CardBody><Stat id="stat-good-up" label="Requests closed" value="39" change={8} changeLabel="vs last month" /></CardBody></Card>
      <Card id="stat-v2"><CardBody><Stat id="stat-bad-up" label="Avg days in review" value="5.2" change={18} changeLabel="vs last month" goodDirection="down" trend={<Sparkline id="stat-v2-s" label="Days in review" data={DOWN} tone="error" />} /></CardBody></Card>
      <Card id="stat-v3"><CardBody><Stat id="stat-good-down" label="Controls overdue" value="2" change={-50} changeLabel="vs last month" goodDirection="down" /></CardBody></Card>
      <Card id="stat-v4"><CardBody><Stat id="stat-flat" label="Reports you own" value="5" change={0} changeLabel="vs last month" /></CardBody></Card>
    </div>
  ),
};

/** `tone` colors the value — only for a number that needs something. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <Stat id="stat-t-default" label="Open requests" value="6" />
      <Stat id="stat-t-warning" label="Pending your approval" value="2" tone="warning" description="nothing moves until you decide" />
      <Stat id="stat-t-error" label="Evergreen past due" value="1" tone="error" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
      <Stat id="stat-sm" size="sm" label="Small" value="1,284" change={4} />
      <Stat id="stat-md" label="Default" value="1,284" change={4} />
      <Stat id="stat-lg" size="lg" label="Large" value="1,284" change={4} />
    </div>
  ),
};
