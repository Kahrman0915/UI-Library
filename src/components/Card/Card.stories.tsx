import type { Meta, StoryObj } from '@storybook/react';
import Card, { CardHeader, CardBody, CardFooter } from './Card';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'centered' },
  argTypes: {
    children: { control: false, table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

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
