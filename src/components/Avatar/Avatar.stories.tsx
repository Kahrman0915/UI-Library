import type { Meta, StoryObj } from '@storybook/react';
import Avatar, { AvatarGroup } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    src: { control: 'text' },
    fallback: { control: 'text' },
    alt: { control: 'text' },
    badge: { control: false, table: { disable: true } },
  },
  args: {
    id: 'story-avatar',
    fallback: 'KM',
    size: 'default',
    shape: 'circle',
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <Avatar id="sz-sm" size="sm" fallback="KM" />
      <Avatar id="sz-md" size="default" fallback="KM" />
      <Avatar id="sz-lg" size="lg" fallback="KM" />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar id="sh-c" shape="circle" fallback="AB" />
      <Avatar id="sh-s" shape="square" fallback="CD" />
    </div>
  ),
};

// Each avatar override its own fallback background via inline style on the
// fallback layer — demonstrated by wrapping in a scope-style div. Since our
// fallback uses `--muted` / `--muted-foreground`, we can remap those on a
// per-avatar element to color-code without extra props.
export const ColoredFallbacks: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const people: Array<{ id: string; initials: string; bg: string }> = [
      { id: 'c-sky', initials: 'AC', bg: 'var(--category-sky-bg)' },
      { id: 'c-emer', initials: 'BE', bg: 'var(--category-emerald-bg)' },
      { id: 'c-viol', initials: 'CV', bg: 'var(--category-violet-bg)' },
      { id: 'c-rose', initials: 'DR', bg: 'var(--category-rose-bg)' },
      { id: 'c-amber', initials: 'EA', bg: 'var(--category-amber-bg)' },
    ];
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        {people.map((p) => (
          <Avatar
            key={p.id}
            id={p.id}
            fallback={p.initials}
            style={{ '--muted': p.bg } as React.CSSProperties}
          />
        ))}
      </div>
    );
  },
};

export const WithStatusBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Avatar
        id="badge-online"
        size="lg"
        fallback="KM"
        badge={
          <span
            style={{
              width: 'var(--w-2-5)',
              height: 'var(--h-2-5)',
              borderRadius: 'var(--rounded-full)',
              background: 'var(--success)',
              display: 'block',
            }}
          />
        }
      />
      <Avatar
        id="badge-away"
        size="lg"
        fallback="AS"
        badge={
          <span
            style={{
              width: 'var(--w-2-5)',
              height: 'var(--h-2-5)',
              borderRadius: 'var(--rounded-full)',
              background: 'var(--warning)',
              display: 'block',
            }}
          />
        }
      />
      <Avatar
        id="badge-busy"
        size="lg"
        fallback="RB"
        badge={
          <span
            style={{
              width: 'var(--w-2-5)',
              height: 'var(--h-2-5)',
              borderRadius: 'var(--rounded-full)',
              background: 'var(--error)',
              display: 'block',
            }}
          />
        }
      />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup id="group-basic">
      <Avatar id="g-1" fallback="AB" />
      <Avatar id="g-2" fallback="CD" />
      <Avatar id="g-3" fallback="EF" />
      <Avatar id="g-4" fallback="GH" />
      <Avatar id="g-5" fallback="IJ" />
    </AvatarGroup>
  ),
};

export const GroupWithMax: Story = {
  render: () => (
    <AvatarGroup id="group-max" max={4}>
      <Avatar id="gm-1" fallback="AB" />
      <Avatar id="gm-2" fallback="CD" />
      <Avatar id="gm-3" fallback="EF" />
      <Avatar id="gm-4" fallback="GH" />
      <Avatar id="gm-5" fallback="IJ" />
      <Avatar id="gm-6" fallback="KL" />
      <Avatar id="gm-7" fallback="MN" />
    </AvatarGroup>
  ),
};

export const GroupSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <AvatarGroup id="g-sm" size="sm" max={3}>
        <Avatar id="gs-1" size="sm" fallback="AB" />
        <Avatar id="gs-2" size="sm" fallback="CD" />
        <Avatar id="gs-3" size="sm" fallback="EF" />
        <Avatar id="gs-4" size="sm" fallback="GH" />
        <Avatar id="gs-5" size="sm" fallback="IJ" />
      </AvatarGroup>
      <AvatarGroup id="g-md" size="default" max={3}>
        <Avatar id="gd-1" fallback="AB" />
        <Avatar id="gd-2" fallback="CD" />
        <Avatar id="gd-3" fallback="EF" />
        <Avatar id="gd-4" fallback="GH" />
      </AvatarGroup>
      <AvatarGroup id="g-lg" size="lg" max={3}>
        <Avatar id="gl-1" size="lg" fallback="AB" />
        <Avatar id="gl-2" size="lg" fallback="CD" />
        <Avatar id="gl-3" size="lg" fallback="EF" />
        <Avatar id="gl-4" size="lg" fallback="GH" />
        <Avatar id="gl-5" size="lg" fallback="IJ" />
      </AvatarGroup>
    </div>
  ),
};
