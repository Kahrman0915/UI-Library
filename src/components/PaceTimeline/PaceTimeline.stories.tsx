import type { Meta, StoryObj } from '@storybook/react';
import PaceTimeline from './PaceTimeline';
import Card, { CardBody } from '../Card';
import Stat from '../Stat';
import Alert from '../Alert';
import type { UiDocsParameters } from '../../types/DocsTypes';

// Sprint 14: Mon Oct 12 – Fri Oct 23, 2026. Today is Thursday, day 4 of 10.
const START = new Date(2026, 9, 12);
const END = new Date(2026, 9, 23);
const TODAY = new Date(2026, 9, 15);

const meta: Meta<typeof PaceTimeline> = {
  title: 'Components/PaceTimeline',
  component: PaceTimeline,
  parameters: {
    ui: {
      description:
        'The working days of a period — a sprint, a release window — as a strip of cells, with two bars under it: **time used** and **work done**. ' +
        'A today marker runs down through both bars, so the distance between where the work stops and where the clock is reads as the pace.\n\n' +
        'Pass dates and counts; the component works out the rest. Past days fill, today is solid, the rest are outlined. ' +
        'Weekends are left out by default and a wider gap marks where they were. When work is behind time the work bar turns warning ' +
        'and the stretch it still owes is drawn as a softer segment up to the marker.',
      tags: ['data', 'date', 'progress'],
      usage: {
        when: [
          'A time-boxed period where the question is "are we on pace?" — a sprint, a release, a close.',
          'Beside a `Stat` (days left) and an `Alert` (what to do about it) in a summary card.',
        ],
        avoid: [
          'Picking a date — that is `Calendar` or `DatePicker`.',
          'A single amount of progress with no clock behind it — that is `Progress`.',
          'Periods longer than about three weeks: the cells get too narrow to read.',
        ],
        notes:
          '**Content only** — it paints no surface; put it in a `Card`. Give it room: at 10 working days it wants about 400px. ' +
          '`today` defaults to now and counts as used, so on day 4 of 10 time used is 40%.',
      },
      a11y: {
        notes:
          'The days are an ordered list; each cell is named by its full date and today carries `aria-current="date"`. ' +
          'Each bar is a `progressbar` named by its visible label. The marker and the behind-pace segment are decorative — the two values already say it.',
      },
      changelog: [
        {
          date: '2026-11-26',
          summary: 'The today marker no longer strikes through the "Work done" label early in a period.',
          detail:
            'The marker is now broken across the work bar\'s header row on every day, so its shape stays the same as it moves. The break is painted into the marker\'s `background` (a `--foreground` gradient with a transparent band), not a mask, so it stays on tokens. Its offsets (`--_break-start` / `--_break-end`) come from the layout\'s own rungs (`--p-1` + `--h-2` + `--p-3` − `--p-0-5`, one `--leading-4` tall); change them if those rungs change. A work label long enough to wrap to two lines would outgrow the break.',
        },
        {
          date: '2026-10-18',
          summary: 'Initial build — a sprint\'s working days over time-used and work-done bars, with a today marker.',
          detail:
            'Built for the Command Center sprint card, which had no way to show the calendar behind its two bars. `start`/`end`/`today` + `completed`/`total`; status (`on-pace` / `behind`) is derived and exposed on `data-pace`. Day math goes through `utils/date` (addDays / compareDays), never milliseconds. Shares reach CSS as `--ui-pace-time` / `--ui-pace-work`.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};
export default meta;
type Story = StoryObj<typeof PaceTimeline>;

export const Playground: Story = {
  args: {
    id: 'pace-pg',
    start: START,
    end: END,
    today: TODAY,
    completed: 6,
    total: 19,
    workLabel: 'Work done · 6 of 19 items',
  },
  render: (args) => (
    <div style={{ width: 520 }}>
      <PaceTimeline {...args} />
    </div>
  ),
};

/** Work at or ahead of the clock: the work bar is success and there is no gap segment. */
export const OnPace: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <PaceTimeline id="pace-on" start={START} end={END} today={TODAY} completed={9} total={19} workLabel="Work done · 9 of 19 items" />
    </div>
  ),
};

/** The start of the period, the middle, and the last day. */
export const AcrossTheSprint: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 40, width: 520 }}>
      <PaceTimeline id="pace-d1" start={START} end={END} today={START} completed={0} total={19} />
      <PaceTimeline id="pace-d6" start={START} end={END} today={new Date(2026, 9, 19)} completed={7} total={19} />
      <PaceTimeline id="pace-d10" start={START} end={END} today={END} completed={19} total={19} />
    </div>
  ),
};

/** The composition it was built for: days left, the timeline, and what to do about it. */
export const InASprintCard: Story = {
  render: () => (
    <Card id="pace-card" style={{ width: 1100 }}>
      <CardBody>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.2fr', gap: 24, alignItems: 'center' }}>
          <Stat id="pace-card-stat" label="Sprint 14 · Oct 12 – 23" value="6" description="working days left · review Fri Oct 23" />
          <PaceTimeline id="pace-card-tl" start={START} end={END} today={TODAY} completed={6} total={19} workLabel="Work done · 6 of 19 items" />
          <Alert
            id="pace-card-alert"
            variant="warning"
            title="About 1 day behind pace"
            description="13 items left in 6 days needs 2.2 a day. You are averaging 1.5, so about 9 finish and 4 slip past the sprint."
          />
        </div>
      </CardBody>
    </Card>
  ),
};
