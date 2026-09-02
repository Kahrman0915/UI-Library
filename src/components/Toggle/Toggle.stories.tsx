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
      changelog: [
        {
          date: '2026-08-27',
          summary: 'Gained a trailing icon.',
          detail:
            'Adds `IconRight`, rendered after the label. Toggle was the only pill in the library without a trailing icon — Chip, Badge and Button all had one. Purely additive.',
        },
        {
          date: '2026-08-27',
          summary: 'Two quiet variants, `line` and `plain`, for filter bars where a segmented control shouts.',
          detail:
            'ToggleVariant goes from default|outline to default|outline|line|plain. Both new rungs are ' +
            'transparent with no border: `line` marks the pressed item with a --primary bar on its bottom ' +
            'edge, reusing the Tabs indicator geometry (--border-w-300 on --rounded-full); `plain` uses ' +
            '--foreground at --font-semibold against --muted-foreground. Presentation only — identical ' +
            'semantics, keyboard behaviour and aria. `plain` steps weight 500->600 rather than 400->600 ' +
            'because bold text is wider and a filter bar reflows on every selection change.',
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
    variant: { control: 'select', options: ['default', 'outline', 'line', 'plain'] },
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
      <Toggle id="v-line" variant="line" label="Line" defaultPressed />
      <Toggle id="v-plain" variant="plain" label="Plain" defaultPressed />
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
