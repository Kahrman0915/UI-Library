import type { Meta, StoryObj } from '@storybook/react';
import Separator from './Separator';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A hairline divider, with an optional label sitting in the middle of it.',
      tags: ['layout'],
      changelog: [
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
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    orientation: 'horizontal',
    decorative: false,
  },
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Separator {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, width: 380, fontSize: 'var(--text-sm)' }}>
      <div>
        <div style={{ fontWeight: 'var(--font-semibold)' }}>Design Lab</div>
        <div style={{ color: 'var(--muted-foreground)' }}>An open-source UI component library.</div>
      </div>
      <Separator />
      <div style={{ display: 'flex', gap: 16 }}>
        <span>Blog</span>
        <span>Docs</span>
        <span>Source</span>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 32,
        fontSize: 'var(--text-sm)',
      }}
    >
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Guides</span>
      <Separator orientation="vertical" />
      <span>Changelog</span>
    </div>
  ),
};

export const WithLabel: Story = {
  args: { label: 'or' },
  render: (args) => (
    <div style={{ width: 380 }}>
      <Separator {...args} />
    </div>
  ),
};

export const InAForm: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 380 }}>
      <button
        type="button"
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: 'var(--border-w-100) solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Continue with SSO
      </button>
      <Separator label="or" />
      <button
        type="button"
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: 'var(--border-w-100) solid var(--border)',
          background: 'var(--background)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-sm)',
        }}
      >
        Continue with email
      </button>
    </div>
  ),
};
