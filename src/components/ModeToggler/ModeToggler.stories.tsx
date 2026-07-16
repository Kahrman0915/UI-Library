import type { Meta, StoryObj } from '@storybook/react';
import ModeToggler from './ModeToggler';

const meta: Meta<typeof ModeToggler> = {
  title: 'Components/ModeToggler',
  component: ModeToggler,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    disableAnimation: { control: 'boolean' },
  },
  args: {
    id: 'story-mode-toggler',
    variant: 'ghost',
    size: 'default',
    disableAnimation: false,
  },
};

export default meta;

type Story = StoryObj<typeof ModeToggler>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <ModeToggler {...args} id="mt-default" variant="default" />
      <ModeToggler {...args} id="mt-outline" variant="outline" />
      <ModeToggler {...args} id="mt-ghost" variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <ModeToggler {...args} id="mt-sm" size="sm" variant="outline" />
      <ModeToggler {...args} id="mt-md" size="default" variant="outline" />
      <ModeToggler {...args} id="mt-lg" size="lg" variant="outline" />
    </div>
  ),
};

export const InAToolbar: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 'var(--rounded-lg)',
        border: 'var(--border-w-100) solid var(--border)',
        background: 'var(--card)',
      }}
    >
      <span style={{ fontWeight: 'var(--font-semibold)', marginRight: 'auto' }}>
        @ui/lib
      </span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
        Docs
      </span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
        Components
      </span>
      <ModeToggler {...args} id="mt-toolbar" variant="ghost" />
    </div>
  ),
};

export const InstantFlip: Story = {
  args: { disableAnimation: true, variant: 'outline' },
  parameters: {
    docs: {
      description: {
        story:
          'With `disableAnimation`, or when the browser lacks the View Transitions API / the user prefers reduced motion, the mode flips instantly.',
      },
    },
  },
};
