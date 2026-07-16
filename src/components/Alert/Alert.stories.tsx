import type { Meta, StoryObj } from '@storybook/react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import Alert from './Alert';
import Button from '../Button';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'info', 'success', 'warning', 'error'],
    },
    style: {
      control: 'inline-radio',
      options: ['default', 'outline'],
    },
  },
  args: {
    id: 'story-alert',
    variant: 'default',
    style: 'default',
    title: 'Heads up!',
    description: 'You can add components to your app using the CLI.',
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert {...args} Icon={Terminal} />
    </div>
  ),
};

const iconFor = (variant: string) => {
  switch (variant) {
    case 'info':
      return Info;
    case 'success':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return AlertCircle;
    default:
      return Terminal;
  }
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      {(['default', 'info', 'success', 'warning', 'error'] as const).map(
        (v) => (
          <Alert
            key={v}
            id={`v-${v}`}
            variant={v}
            Icon={iconFor(v)}
            title={v.charAt(0).toUpperCase() + v.slice(1)}
            description="This is what a variant looks like when filled in."
          />
        ),
      )}
    </div>
  ),
};

export const AllOutlines: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      {(['default', 'info', 'success', 'warning', 'error'] as const).map(
        (v) => (
          <Alert
            key={v}
            id={`o-${v}`}
            variant={v}
            style="outline"
            Icon={iconFor(v)}
            title={v.charAt(0).toUpperCase() + v.slice(1)}
            description="Outline treatment — transparent background, tinted border."
          />
        ),
      )}
    </div>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      <Alert id="t1" variant="success" Icon={CheckCircle2} title="Saved" />
      <Alert
        id="t2"
        variant="error"
        Icon={AlertCircle}
        title="Something went wrong"
      />
    </div>
  ),
};

export const DescriptionOnly: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      <Alert
        id="d1"
        variant="info"
        Icon={Info}
        description="Your session expires in 5 minutes."
      />
      <Alert
        id="d2"
        variant="warning"
        Icon={AlertTriangle}
        description="This action is irreversible."
      />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="a1"
        variant="warning"
        Icon={AlertTriangle}
        title="Storage almost full"
        description="You've used 92% of your allocated storage."
        action={
          <Button
            id="alert-upgrade"
            label="Upgrade"
            style="outline"
            size="small"
          />
        }
      />
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="dismiss"
        variant="info"
        Icon={Info}
        title="Tip"
        description="Press ⌘K to open the command palette."
        onClose={() => {
          // eslint-disable-next-line no-console
          console.log('dismissed');
        }}
      />
    </div>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="no-icon"
        variant="success"
        title="Success!"
        description="Your changes have been saved."
      />
    </div>
  ),
};
