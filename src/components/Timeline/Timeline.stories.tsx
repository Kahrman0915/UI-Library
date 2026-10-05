import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight, CircleCheck, Inbox } from 'lucide-react';
import Timeline, { TimelineItem } from './Timeline';
import Avatar from '../Avatar';
import Button from '../Button';
import FeaturedIcon from '../FeaturedIcon';
import Card, { CardBody, CardHeader } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  subcomponents: { TimelineItem },
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'An ordered run of events, each led by a marker: a request’s activity thread, an audit log, a status history. Every entry is a ' +
        'marker (an `Avatar`, an icon, or a small dot), a meta line (`author` · `time`), the body, and an optional `actions` row. ' +
        '`connector` joins the markers with a line, for a log that reads as one sequence.',
      tags: ['data display', 'no id'],
      usage: {
        when: [
          'A request or record’s activity thread — who said what, and when.',
          'An audit log or status history — with `connector`, and dots or icons for markers.',
        ],
        avoid: [
          'A live chat with a composer and streaming replies — that is the `Chat` family.',
          'A list of things that are not events (people, files, settings) — that is `Item`.',
        ],
        notes:
          'Pass `dateTime` (ISO 8601) alongside the visible `time` so the moment is unambiguous to assistive tech. Entries sit level 3 apart, ' +
          'the marker level 4 from its content. An `Avatar` at size `sm` is the marker for a person; a `FeaturedIcon` at `sm` for a system event.',
      },
      composition: [
        { name: 'Timeline', description: 'The `<ol>`. `connector` draws the line between markers.' },
        { name: 'TimelineItem', description: 'One entry: `marker`, `author`, `time` / `dateTime`, the body (children) and `actions`.' },
      ],
      a11y: {
        notes:
          'An `<ol>` of `<li>`s, so a screen reader announces how many entries there are and where it is in them. Label the list with ' +
          '`aria-label` when no heading names it. The " · " between author and time is `aria-hidden`; `time` renders in a `<time dateTime>` ' +
          'when `dateTime` is set. The default dot and the connector are decorative.',
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'Initial build. An ordered list of events with a marker, a meta line, a body and actions.',
          detail:
            '`Timeline` (`connector`) + `TimelineItem` (`marker`, `author`, `time`, `dateTime`, `actions`, children). The connector is a ' +
            '`::after` on each marker column, carried across the gap by a negative margin, so it needs no measuring. Replaces the two ' +
            'hand-built request threads in the DART Suite prototype (request detail and admin review).',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: { connector: { control: 'boolean' } },
  args: { connector: false },
};
export default meta;
type Story = StoryObj<typeof Timeline>;

const thread = (
  <>
    <TimelineItem
      marker={<Avatar id="tl-a1" size="sm" fallback="LO" />}
      author="Lena Ortiz"
      time="08/30/2026"
      dateTime="2026-08-30"
    >
      Can Aiden summarize a dashboard on request, or only from the panel?
    </TimelineItem>
    <TimelineItem
      marker={<Avatar id="tl-a2" size="sm" fallback="KM" />}
      author="Kahrman McKenzie (admin)"
      time="08/31/2026"
      dateTime="2026-08-31"
      actions={<Button id="tl-backlog" style="link" size="sm" label="Per-dashboard summaries" IconRight={ArrowRight} />}
    >
      Not yet — it is on the backlog. Follow it there for updates.
    </TimelineItem>
    <TimelineItem
      marker={<FeaturedIcon id="tl-sys" size="sm" Icon={CircleCheck} color="success" />}
      author="DART Central"
      time="08/31/2026"
      dateTime="2026-08-31"
    >
      Marked as answered.
    </TimelineItem>
  </>
);

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Timeline {...args} aria-label="Activity">
        {thread}
      </Timeline>
    </div>
  ),
};

/** A request thread: avatars for people, an icon for the system event, a link-out on one entry. */
export const Thread: Story = {
  render: () => (
    <Card id="tl-card" style={{ maxWidth: 'var(--max-w-lg)' }}>
      <CardHeader id="tl-card-header" title="Activity" />
      <CardBody>
        <Timeline aria-label="Activity">{thread}</Timeline>
      </CardBody>
    </Card>
  ),
};

/** `connector` with the default dot markers: a status history that reads as one sequence. */
export const Log: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Timeline connector aria-label="Status history">
        <TimelineItem author="Submitted" time="08/22/2026, 9:41 AM" dateTime="2026-08-22T09:41">
          Request #0412 was filed.
        </TimelineItem>
        <TimelineItem author="In review" time="08/23/2026" dateTime="2026-08-23">
          An admin opened it.
        </TimelineItem>
        <TimelineItem author="Awaiting reply" time="08/24/2026" dateTime="2026-08-24">
          More information was requested from the requester.
        </TimelineItem>
        <TimelineItem
          marker={<FeaturedIcon id="tl-log-in" size="sm" Icon={Inbox} />}
          author="Reply received"
          time="08/29/2026"
          dateTime="2026-08-29"
        >
          The requester answered; it is back in the queue.
        </TimelineItem>
      </Timeline>
    </div>
  ),
};
