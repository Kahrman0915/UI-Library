import type { Meta, StoryObj } from '@storybook/react';
import { Rocket } from 'lucide-react';
import Card, { CardHeader, CardMedia, CardBody, CardFooter } from './Card';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import Avatar from '../Avatar/Avatar';
import StatusDot from '../StatusDot/StatusDot';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A surface that gathers related content into one unit. The header is ' +
        'prop-driven (`title`, `description`, `action`), and `interactive` opts into ' +
        'the hover lift for cards that are themselves clickable.',
      tags: ['compound', '5 parts'],
      changelog: [
        {
          date: '2026-08-08',
          summary:
            'New `CardMedia` part — a full-bleed cover image, video or chart, for the ' +
            'vertical card layout (cover on top, then header, then description).',
          detail:
            '`CardHeader`\'s existing `media` prop is a LEADING visual on the title\'s own ' +
            'line — an avatar or status dot beside the heading. It could never be a cover: it ' +
            'is `flex-shrink: 0` inside the header\'s flex row and floored at one line of ' +
            'title. `CardMedia` is the other thing.\n\n' +
            'It is a sibling part placed by the caller, not a `media` prop on `Card`, because a ' +
            'prop would have to choose an order — this way the cover can sit above the header, ' +
            'between header and body, or under the footer.\n\n' +
            'It composes `AspectRatio` and defaults to `16 / 9`, so a row of cards keeps a level ' +
            'top edge and does not jump as images load. It declares no radius of its own: ' +
            '`.ui-card` is `overflow: hidden`, so a cover touching an edge inherits the card\'s ' +
            'rounding for free, and adding one would show as a hairline of card background in ' +
            'the corners.',
        },
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    children: { control: false, table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

/**
 * The vertical layout: a full-bleed cover, then the header, then the body.
 * `CardMedia` composes `AspectRatio` (default `16 / 9`) so a grid of these keeps
 * a level top edge and nothing shifts as the images load.
 *
 * The cover declares no rounding — `.ui-card` clips, so it inherits the card's
 * radius. Put it anywhere: above the header, between header and body, or last.
 */
export const WithCover: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 'var(--p-4)' }}>
      {[
        { t: 'Quarterly review', d: 'Revenue, retention and pipeline.', h: 200 },
        { t: 'Release notes', d: 'What shipped in 4.2.', h: 260 },
      ].map((c) => (
        <Card id={`cover-${c.h}`} key={c.t} interactive>
          <CardMedia>
            {/* A plain block stands in for the image, so the story has no network
                dependency and the ratio box is what you actually see. */}
            <div style={{ width: '100%', height: '100%', background: 'var(--muted)' }} />
          </CardMedia>
          <CardHeader id={`cover-${c.h}-h`} title={c.t} description={c.d} />
        </Card>
      ))}
    </div>
  ),
};

/**
 * `media` is the leading visual slot — a featured icon, an avatar, a status
 * dot. It renders before the title and shrinks to its content, so a two-line
 * description doesn't drag it out of line with the heading.
 */
export const WithMedia: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
      <Card id="m-icon" style={{ width: 320 }}>
        <CardHeader
          id="m-icon-h"
          media={<Rocket />}
          title="Deploy preview"
          description="Ships to a throwaway URL on every push."
        />
        <CardBody>Builds finish in about 40 seconds.</CardBody>
      </Card>
      <Card id="m-avatar" style={{ width: 320 }}>
        <CardHeader
          id="m-avatar-h"
          media={<Avatar id="m-avatar-a" fallback="KM" />}
          title="Kahrman McKenzie"
          description="Owner"
          action={<Badge id="m-avatar-b" variant="outline" label="Admin" />}
        />
        <CardBody>Full access to every workspace setting.</CardBody>
      </Card>
      <Card id="m-status" style={{ width: 320 }}>
        <CardHeader
          id="m-status-h"
          media={<StatusDot status="online" />}
          title="Production"
          description="All systems nominal."
        />
        <CardBody>Last incident 94 days ago.</CardBody>
      </Card>
    </div>
  ),
};

export const Playground: Story = {
  render: () => (
    <Card id="pg" style={{ width: 400 }}>
      <CardHeader
        id="pg"
        title="Q4 revenue"
        description="Last 90 days across all products"
      />
      <CardBody>
        <p>
          Revenue is trending up 12% quarter-over-quarter, driven primarily by
          the new enterprise tier.
        </p>
      </CardBody>
      <CardFooter>
        <Button id="pg-cancel" label="Dismiss" style="ghost" />
        <Button id="pg-view" label="View report" />
      </CardFooter>
    </Card>
  ),
};

// Opt-in `interactive` prop — border strengthens to --border-hover on hover.
// For clickable cards; static cards leave it off.
export const Interactive: Story = {
  render: () => (
    <Card id="int" interactive style={{ width: 400 }}>
      <CardHeader
        id="int"
        title="Enterprise plan"
        description="Hover the card — the border strengthens to signal it's clickable."
      />
      <CardBody>
        <p>Unlimited seats, SSO, and priority support.</p>
      </CardBody>
    </Card>
  ),
};

export const HeaderOnly: Story = {
  render: () => (
    <Card id="ho" style={{ width: 360 }}>
      <CardHeader
        id="ho"
        title="Simple card"
        description="Header + body, no footer needed."
      />
      <CardBody>
        <p>Body content here.</p>
      </CardBody>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  render: () => (
    <Card id="wa" style={{ width: 420 }}>
      <CardHeader
        id="wa"
        title="Dashboard sharing"
        description="Manage who can access this dashboard"
        action={<Badge id="wa-badge" variant="success" label="Live" />}
      />
      <CardBody>
        <p>
          Your dashboard is currently public. Anyone with the link can view it.
        </p>
      </CardBody>
      <CardFooter>
        <Button id="wa-manage" label="Manage" style="outline" />
      </CardFooter>
    </Card>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Card id="to" style={{ width: 320 }}>
      <CardHeader id="to" title="Reports" />
      <CardBody>
        <p>You have 3 pending reports.</p>
      </CardBody>
    </Card>
  ),
};

export const StatCard: Story = {
  render: () => (
    <Card id="stat" style={{ width: 280 }}>
      <CardHeader
        id="stat"
        title="Active users"
        description="Past 24 hours"
        action={<Badge id="stat-badge" variant="outline" label="+12%" />}
      />
      <CardBody>
        <span
          style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--foreground)',
            lineHeight: 'var(--leading-10)',
          }}
        >
          14,382
        </span>
      </CardBody>
    </Card>
  ),
};

export const CardGrid: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--p-4)',
      }}
    >
      {[
        { id: 'g1', title: 'Reports', desc: 'Published this month', value: '24' },
        { id: 'g2', title: 'Data sources', desc: 'Connected', value: '11' },
        { id: 'g3', title: 'Team members', desc: 'Active', value: '38' },
      ].map((c) => (
        <Card key={c.id} id={c.id}>
          <CardHeader id={c.id} title={c.title} description={c.desc} />
          <CardBody>
            <span
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--foreground)',
              }}
            >
              {c.value}
            </span>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};
