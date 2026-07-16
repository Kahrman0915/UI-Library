import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Progress, {
  ProgressLabel,
  ProgressValue,
  ProgressTrack,
  ProgressIndicator,
} from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    indeterminate: { control: 'boolean' },
    showValue: { control: 'boolean' },
  },
  args: {
    value: 60,
    size: 'default',
    variant: 'default',
    indeterminate: false,
    showValue: false,
  },
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <Progress {...args} />
    </div>
  ),
};

export const WithLabel: Story = {
  args: { value: 68, showValue: true, label: 'Uploading report.pdf' },
  render: (args) => (
    <div style={{ maxWidth: 380 }}>
      <Progress {...args} />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-4)',
        maxWidth: 380,
      }}
    >
      <Progress value={40} size="sm" label="Small" showValue />
      <Progress value={60} size="default" label="Default" showValue />
      <Progress value={80} size="lg" label="Large" showValue />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-4)',
        maxWidth: 380,
      }}
    >
      {(['default', 'success', 'warning', 'error', 'info'] as const).map(
        (v) => (
          <Progress
            key={v}
            value={65}
            variant={v}
            label={v.charAt(0).toUpperCase() + v.slice(1)}
            showValue
          />
        ),
      )}
    </div>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-4)',
        maxWidth: 380,
      }}
    >
      <Progress indeterminate label="Loading…" />
      <Progress indeterminate variant="info" label="Working…" />
      <Progress indeterminate size="lg" variant="info" label="Analyzing…" />
    </div>
  ),
};

export const Animated: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = window.setInterval(() => {
        setValue((v) => (v >= 100 ? 0 : v + 5));
      }, 400);
      return () => window.clearInterval(id);
    }, []);
    return (
      <div style={{ maxWidth: 380 }}>
        <Progress
          value={value}
          label="Uploading demo.mp4"
          showValue
          variant="default"
        />
      </div>
    );
  },
};

export const CustomFormatter: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 380 }}>
      <Progress
        value={2.4 * 1024 * 1024}
        max={10 * 1024 * 1024}
        label="Uploading big-file.zip"
        showValue
        valueFormatter={(_pct, v, m) =>
          `${(v / (1024 * 1024)).toFixed(1)} MB / ${(m / (1024 * 1024)).toFixed(0)} MB`
        }
      />
      <Progress
        value={3}
        max={7}
        label="Step 3 of 7"
        showValue
        valueFormatter={(_pct, v, m) => `${v} / ${m}`}
      />
    </div>
  ),
};

export const CompoundComposition: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <Progress value={72} variant="success">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 'var(--p-2)',
          }}
        >
          <ProgressLabel>Storage used</ProgressLabel>
          <ProgressValue>
            {/* Fully-custom node — takes precedence over the auto formatter. */}
            <span style={{ fontWeight: 'var(--font-medium)' }}>
              7.2 GB / 10 GB
            </span>
          </ProgressValue>
        </div>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  ),
};
