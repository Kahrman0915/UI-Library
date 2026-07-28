import { Bold, Italic, Underline } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Toggle from './Toggle';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A single two-state button — bold, mute, show archived. Many-on is `Chip`; ' +
        'one-of-N is `ToggleGroup`.',
      tags: ['aria-pressed'],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    disabled: { control: 'boolean' },
    defaultPressed: { control: 'boolean' },
    IconLeft: { table: { disable: true } },
    IconCenter: { table: { disable: true } },
  },
  args: {
    id: 'story-toggle',
    label: 'Bold',
    variant: 'default',
    size: 'default',
    disabled: false,
    defaultPressed: false,
  },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle id="v-default" variant="default" label="Default" defaultPressed />
      <Toggle id="v-outline" variant="outline" label="Outline" defaultPressed />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Toggle id="s-sm" size="sm" label="Small" />
      <Toggle id="s-md" size="default" label="Default" />
      <Toggle id="s-lg" size="lg" label="Large" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Toggle id="i-bold" variant="outline" IconCenter={Bold} aria-label="Bold" defaultPressed />
      <Toggle id="i-italic" variant="outline" IconCenter={Italic} aria-label="Italic" />
      <Toggle id="i-underline" variant="outline" IconCenter={Underline} aria-label="Underline" />
    </div>
  ),
};

export const WithIconAndLabel: Story = {
  render: () => (
    <Toggle id="il" IconLeft={Bold} label="Bold" defaultPressed />
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Toggle id="d-off" label="Off" disabled />
      <Toggle id="d-on" label="On" disabled defaultPressed />
    </div>
  ),
};
