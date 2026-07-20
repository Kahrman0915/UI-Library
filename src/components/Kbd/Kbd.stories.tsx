import type { Meta, StoryObj } from '@storybook/react';
import Kbd from './Kbd';

const meta: Meta<typeof Kbd> = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
  args: { size: 'default', children: 'K' },
};

export default meta;

type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Kbd size="sm">S</Kbd>
      <Kbd size="default">D</Kbd>
      <Kbd size="lg">L</Kbd>
    </div>
  ),
};

export const Combinations: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 12,
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--text-sm)',
        color: 'var(--muted-foreground)',
      }}
    >
      <div>
        <Kbd>⌘</Kbd> <Kbd>K</Kbd> — open command palette
      </div>
      <div>
        <Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>P</Kbd> — quick actions
      </div>
      <div>
        <Kbd>Ctrl</Kbd> <Kbd>C</Kbd> — copy
      </div>
      <div>
        Press <Kbd>Esc</Kbd> to close.
      </div>
    </div>
  ),
};
