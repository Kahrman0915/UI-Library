import type { Meta, StoryObj } from '@storybook/react';
import Avatar, { AvatarGroup } from './Avatar';
import Card, { CardHeader, CardBody } from '../Card/Card';
import HoverCard, { HoverCardTrigger, HoverCardContent } from '../HoverCard/HoverCard';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A person or entity’s picture, falling back to their initials when there is ' +
        'no image or it fails to load. `AvatarGroup` overlaps several into a stack ' +
        'with a `+N` overflow chip.',
      tags: ['3 sizes', 'fallback'],
      changelog: [
        {
          date: '2026-08-05',
          summary:
            'The fallback disc is now a solid slate chip instead of a pale tint, so an '+
            'avatar with no image stays visible on a `Card` and in a `HoverCard`.',
          detail:
            'New `--avatar-background` / `--avatar-foreground`. The disc used `--secondary`, '+
            'which is 1.23:1 against `--card` in light and 1.00:1 in dark — the circle was '+
            'invisible and the initials appeared to float. Light is slate-500, the lightest '+
            'step clearing 3:1 on every surface an avatar lands on. Dark INVERTS to '+
            'slate-300 rather than reusing it, because dark `--popover` is slate-600 and a '+
            'slate-500 disc would sit at 1.59:1 on the very HoverCard this fixes. The '+
            'count badge is unchanged — it carries no small text and wants the weight.',
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

/**
 * `spacing` names the visual gap, so it runs inversely to the overlap: `sm` is the
 * tightest cluster, `lg` the loosest. Nothing exercised this prop until 2026-07-25,
 * which is how `sm` and `default` stayed transposed — read top to bottom, the gap
 * should widen on every row.
 */
export const GroupSpacing: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {(['sm', 'default', 'lg'] as const).map((spacing) => (
        <div
          key={spacing}
          style={{ display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <span
            style={{
              width: 64,
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {spacing}
          </span>
          <AvatarGroup id={`g-sp-${spacing}`} spacing={spacing} max={3}>
            <Avatar id={`gsp-${spacing}-1`} fallback="AB" />
            <Avatar id={`gsp-${spacing}-2`} fallback="CD" />
            <Avatar id={`gsp-${spacing}-3`} fallback="EF" />
            <Avatar id={`gsp-${spacing}-4`} fallback="GH" />
            <Avatar id={`gsp-${spacing}-5`} fallback="IJ" />
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
};

/**
 * The group's `size` reaches direct `Avatar` children that haven't chosen their own,
 * so the generated `+N` chip can't end up the only large avatar. Neither group below
 * sets `size` on a child; both should be internally consistent.
 */
export const GroupSizeInheritance: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <AvatarGroup id="g-inh-lg" size="lg" max={3}>
        <Avatar id="gi-1" fallback="AB" />
        <Avatar id="gi-2" fallback="CD" />
        <Avatar id="gi-3" fallback="EF" />
        <Avatar id="gi-4" fallback="GH" />
        <Avatar id="gi-5" fallback="IJ" />
      </AvatarGroup>
      <AvatarGroup id="g-inh-sm" size="sm" max={3}>
        <Avatar id="gj-1" fallback="AB" />
        <Avatar id="gj-2" fallback="CD" />
        <Avatar id="gj-3" fallback="EF" />
        <Avatar id="gj-4" fallback="GH" />
      </AvatarGroup>
    </div>
  ),
};

/**
 * The reason `--avatar-background` exists. The fallback disc used `--secondary`,
 * which is 1.23:1 against `--card` in light and 1.00:1 in dark — so on the two
 * surfaces an avatar most often sits on, a user with no photo got an invisible
 * circle with floating initials.
 */
export const FallbackOnSurfaces: Story = {
  name: 'Fallback stays visible on Card and HoverCard',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)', maxWidth: 'var(--max-w-md)' }}>
      <Card id="av-card">
        <CardHeader id="av-card-header" title="On a Card" description="--card is the surface the disc used to disappear into." />
        <CardBody>
          <div style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}>
            <Avatar id="av-c1" fallback="AL" />
            <Avatar id="av-c2" fallback="GH" />
            <AvatarGroup id="av-cg" max={3}>
              <Avatar id="av-cg1" fallback="AT" />
              <Avatar id="av-cg2" fallback="KJ" />
              <Avatar id="av-cg3" fallback="ED" />
              <Avatar id="av-cg4" fallback="BL" />
            </AvatarGroup>
          </div>
        </CardBody>
      </Card>

      <HoverCard id="av-hc">
        <HoverCardTrigger>
          <span style={{ textDecoration: 'underline', cursor: 'default', fontSize: 'var(--text-sm)' }}>
            Hover for the HoverCard case
          </span>
        </HoverCardTrigger>
        <HoverCardContent>
          <div style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}>
            <Avatar id="av-h1" fallback="AL" />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ fontWeight: 'var(--font-medium)' }}>Ada Lovelace</div>
              <div style={{ color: 'var(--muted-foreground)' }}>--popover, and in dark it is slate-600</div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Every other surface an avatar can land on, for the 3:1 claim. */}
      <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
        {(['--background', '--muted', '--secondary', '--sidebar'] as const).map((surface) => (
          <div key={surface} style={{ background: `var(${surface})`, padding: 'var(--p-3)', borderRadius: 'var(--rounded-md)', display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}>
            <Avatar id={`av-s${surface}`} fallback="AL" />
            <code style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{surface}</code>
          </div>
        ))}
      </div>
    </div>
  ),
};
