import type { Meta, StoryObj } from '@storybook/react';
import Skeleton from './Skeleton';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A placeholder in the shape of the content that is loading, so nothing jumps ' +
        'when the real thing arrives.',
      tags: ['3 shapes', 'loading'],
      motion: {
        notes:
          'A background-position sweep rather than an opacity pulse, so the shimmer reads as light travelling ' +
          'across the surface instead of the whole block blinking. `--duration-shimmer` is shared with Progress ' +
          'and Attachment so every loading surface on a page keeps time together.',
      },
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
    shape: { control: 'inline-radio', options: ['default', 'circle', 'text'] },
    width: { control: 'text' },
    height: { control: 'text' },
  },
  args: {
    shape: 'default',
    width: 200,
    height: 20,
  },
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Playground: Story = {};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Skeleton width={200} height={20} />
      <Skeleton shape="circle" width={40} />
      <Skeleton shape="text" width={160} />
    </div>
  ),
};

export const TextBlock: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, width: 480 }}>
      <Skeleton shape="text" width="100%" />
      <Skeleton shape="text" width="95%" />
      <Skeleton shape="text" width="90%" />
      <Skeleton shape="text" width="60%" />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 12,
        width: 300,
        padding: 16,
        border: 'var(--border-w-100) solid var(--border)',
        borderRadius: 'var(--rounded-md)',
        background: 'var(--card)',
      }}
    >
      <Skeleton width="100%" height={140} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton shape="circle" width={36} />
        <div style={{ display: 'grid', gap: 6, flex: 1 }}>
          <Skeleton shape="text" width="70%" />
          <Skeleton shape="text" width="45%" />
        </div>
      </div>
    </div>
  ),
};

export const ProfilePlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: 400 }}>
      <Skeleton shape="circle" width={64} />
      <div style={{ display: 'grid', gap: 8, flex: 1 }}>
        <Skeleton shape="text" width="60%" height={18} />
        <Skeleton shape="text" width="40%" />
      </div>
    </div>
  ),
};

export const TableRows: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 8,
        width: 640,
        padding: 16,
        border: 'var(--border-w-100) solid var(--border)',
        borderRadius: 'var(--rounded-md)',
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 100px 80px',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Skeleton shape="circle" width={32} />
          <Skeleton shape="text" width="80%" />
          <Skeleton shape="text" width="60%" />
          <Skeleton shape="text" width="70%" />
        </div>
      ))}
    </div>
  ),
};
