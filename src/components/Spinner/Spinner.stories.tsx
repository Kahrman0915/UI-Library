import type { Meta, StoryObj } from '@storybook/react';
import Spinner from './Spinner';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'An indeterminate loading indicator. Deliberately keeps animating under ' +
        '`prefers-reduced-motion` — it is a status indicator, and a frozen one reads ' +
        'as “nothing is happening”.',
      tags: ['loading', 'status'],
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
    size: { control: { type: 'number', min: 8, max: 64, step: 2 } },
  },
  args: {
    id: 'story-spinner',
    size: 16,
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
        <Spinner id="sp-12" size={12} />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--muted-foreground)' }}>12</span>
      </div>
      <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
        <Spinner id="sp-16" size={16} />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--muted-foreground)' }}>16 (default)</span>
      </div>
      <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
        <Spinner id="sp-24" size={24} />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--muted-foreground)' }}>24</span>
      </div>
      <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
        <Spinner id="sp-40" size={40} />
        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--muted-foreground)' }}>40</span>
      </div>
    </div>
  ),
};

export const ColorInheritance: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ color: 'var(--muted-foreground)', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
        <Spinner id="sp-muted" />
        Loading
      </div>
      <div data-theme="db" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
        <Spinner id="sp-brand" />
        Publishing to DB
      </div>
      <div style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
        <Spinner id="sp-success" />
        Verifying
      </div>
      <div style={{ color: 'var(--error)', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
        <Spinner id="sp-error" />
        Retrying
      </div>
    </div>
  ),
};
