import type { Meta, StoryObj } from '@storybook/react';
import StatusDot from './StatusDot';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  parameters: { layout: 'centered' },
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away', 'neutral'],
    },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    pulse: { control: 'boolean' },
  },
  args: { status: 'online', size: 'default', pulse: false },
};

export default meta;

type Story = StoryObj<typeof StatusDot>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      color: 'var(--foreground)',
    }}
  >
    {children}
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <Row>
      <StatusDot {...args} />
      <span>{args.status}</span>
    </Row>
  ),
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Row><StatusDot status="online" label="Online" /> Online</Row>
      <Row><StatusDot status="away" label="Away" /> Away</Row>
      <Row><StatusDot status="busy" label="Busy" /> Busy</Row>
      <Row><StatusDot status="offline" label="Offline" /> Offline</Row>
      <Row><StatusDot status="neutral" label="Unknown" /> Neutral</Row>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusDot status="online" size="sm" label="Small" />
      <StatusDot status="online" size="default" label="Default" />
      <StatusDot status="online" size="lg" label="Large" />
    </div>
  ),
};

export const Pulse: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <StatusDot status="online" pulse label="Live" />
      <StatusDot status="busy" pulse label="Recording" />
    </div>
  ),
};
