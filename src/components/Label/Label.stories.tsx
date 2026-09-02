import type { Meta, StoryObj } from '@storybook/react';
import Label from './Label';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'The shared label primitive: the text, an optional description and the ' +
        'required marker. Every form control renders one internally, so you rarely ' +
        'reach for it directly.',
      tags: ['form'],
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The required asterisk is a touch lighter in dark mode.',
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
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    children: 'Email address',
    size: 'default',
    required: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      <Label size="sm">Small label</Label>
      <Label size="default">Default label</Label>
      <Label size="lg">Large label</Label>
    </div>
  ),
};

export const Required: Story = {
  args: { children: 'Email address', required: true },
};

export const Disabled: Story = {
  args: { children: 'Email address', disabled: true },
};

export const WithDescription: Story = {
  args: {
    children: 'API key',
    description: 'Used to authenticate requests. Rotate every 90 days.',
    required: true,
  },
};

export const StandaloneUsage: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-2)', maxWidth: 320 }}>
      <Label htmlFor="external-email" required description="We'll never share this.">
        Work email
      </Label>
      <input
        id="external-email"
        type="email"
        placeholder="you@company.com"
        style={{
          padding: 'var(--p-2) var(--p-3)',
          border: 'var(--border-w-100) solid var(--border)',
          borderRadius: 'var(--rounded-md)',
          background: 'var(--bg-input-30)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-sm)',
        }}
      />
    </div>
  ),
};
