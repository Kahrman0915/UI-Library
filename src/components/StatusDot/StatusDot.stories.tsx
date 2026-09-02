import type { Meta, StoryObj } from '@storybook/react';
import StatusDot from './StatusDot';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A presence or status dot — online, busy, away, offline. `pulse` adds a ring ' +
        'for states that are live right now.',
      tags: ['status'],
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The `busy` dot is a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text colour was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
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
