import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChartColumn, FileText, Globe, Heart, Leaf, Sparkles, Zap } from 'lucide-react';
import Mark from './Mark';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Mark> = {
  title: 'Components/Mark',
  component: Mark,
  argTypes: {
    size: { options: ['sm', 'default', 'lg', 'xl'], control: 'inline-radio' },
    motion: { options: ['none', 'ambient', 'tilt'], control: 'inline-radio' },
  },
  args: {
    id: 'mark-playground',
    Icon: ChartColumn,
    title: 'Analytics',
    description: 'Product suite',
    size: 'lg',
    motion: 'ambient',
  },
  parameters: {
    ui: {
      description:
        'The application mark — a brand\'s gradient tile under a stack of glass, ' +
        'optionally locked up with the application\'s name.\n\n' +
        'It is the only piece of chrome that carries a brand\'s FULL identity. Every ' +
        'other themed component reads the single `--primary`; the mark paints ' +
        '`--decorative-gradient`, which is all three of a brand\'s anchors — highlight, ' +
        'primary and deep — in one ramp. That is why a rail carrying a mark does not ' +
        'need to shout: the identity is already on the page.',
      tags: ['identity', 'themed', 'motion'],
      usage: {
        when: [
          'The application\'s own identity, in a sidebar header, a top bar, or an app ' +
            'switcher.',
          'A launch or start screen, at `xl`, where the mark IS the page.',
          'A row in a list of applications — one `Mark` per row, each in its own ' +
            '`data-theme` subtree.',
        ],
        avoid: [
          'A generic tinted icon tile. That is {@link FeaturedIcon} — it takes a ' +
            'semantic `variant` and costs nothing. The mark is expensive glass and ' +
            'means "this application".',
          'A person or an account. That is {@link Avatar}.',
          'Anything clickable on its own. Put the mark INSIDE a button or a link ' +
            'rather than making it one — it has no press state, and its hover already ' +
            'belongs to the glass.',
        ],
        notes:
          'There is no `brand` prop, on purpose. The mark reads the theme it is ' +
          'standing in, exactly like every other themed component: wrap it in ' +
          '`data-theme="rm"` and it is that application\'s mark, wrap it in ' +
          '`data-surface="aiden"` and it is Aiden\'s. With no scope at all it paints the ' +
          'main brand.\n\n' +
          '**All three motion levels render the same colours.** `motion` gates ' +
          'animation and nothing else, so turning it off never changes what the mark ' +
          'looks like standing still.',
      },
      a11y: {
        notes:
          'With a `title`, the lockup is a single `role="img"` named by the text it ' +
          'already renders, via `aria-labelledby` — so the accessible name cannot ' +
          'drift from what is on screen — and the tile itself is hidden. Without a ' +
          'title, pass `label` to name the bare tile; with neither, the mark is ' +
          'decorative and hidden entirely, which is correct when a heading beside it ' +
          'already says the application\'s name.\n\n' +
          'Under `prefers-reduced-motion` every loop stops outright rather than ' +
          'shortening, and `usePointerTilt` never attaches, so `motion="tilt"` ' +
          'degrades to a still tile with nothing to undo.',
      },
      changelog: [
        {
          date: '2026-08-08',
          summary: 'Initial build complete.',
          detail:
            'Promoted out of the deeper-theming-v2 prototype. The glass stack, its ' +
            'lighting model and `usePointerTilt` are the POC\'s, unchanged in ' +
            'behaviour; what is new is that the paint no longer depends on the motion ' +
            'level, the thirteen glass literals moved into `tokens.scss` as the ' +
            '`--mark-*` family, and the tile scales on a `size` union rather than a ' +
            'free pixel number.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof Mark>;

const APPS: { code: string; name: string; suite: string; Icon: LucideIcon }[] = [
  { code: 'db', name: 'Analytics', suite: 'Reporting', Icon: ChartColumn },
  { code: 'dc', name: 'Atlas', suite: 'Geo', Icon: Globe },
  { code: 'ec', name: 'Canopy', suite: 'Sustainability', Icon: Leaf },
  { code: 'nb', name: 'Ledger', suite: 'Documents', Icon: FileText },
  { code: 'ph', name: 'Surge', suite: 'Operations', Icon: Zap },
  { code: 'rm', name: 'Pulse', suite: 'Wellbeing', Icon: Heart },
];

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--p-8)', alignItems: 'center' };
const GRID: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--p-6)' };
const CAPTION: CSSProperties = {
  display: 'block',
  marginBottom: 'var(--p-2)',
  fontFamily: 'var(--font-family-mono)',
  fontSize: 'var(--text-xs)',
  color: 'var(--muted-foreground)',
};

export const Playground: Story = {};

/**
 * One component, six applications. Nothing about the mark changes between these
 * — each is simply standing in a different `data-theme` subtree, and the tile
 * picks up that brand's whole three-anchor ramp.
 */
export const Brands: Story = {
  render: () => (
    <div style={GRID}>
      {APPS.map(({ code, name, suite, Icon }) => (
        <div key={code} data-theme={code}>
          <span style={CAPTION}>data-theme=&quot;{code}&quot;</span>
          <Mark id={`mark-brand-${code}`} Icon={Icon} title={name} description={suite} size="lg" />
        </div>
      ))}
    </div>
  ),
};

/** Aiden is a surface, not a theme — it layers inside whatever brand it sits in. */
export const AidenSurface: Story = {
  render: () => (
    <div style={ROW}>
      <div>
        <span style={CAPTION}>main brand</span>
        <Mark id="mark-aiden-main" Icon={Sparkles} title="Assistant" size="lg" />
      </div>
      <div data-surface="aiden">
        <span style={CAPTION}>data-surface=&quot;aiden&quot;</span>
        <Mark id="mark-aiden-surface" Icon={Sparkles} title="Aiden" description="Ask anything" size="lg" />
      </div>
      <div data-theme="rm" data-surface="aiden">
        <span style={CAPTION}>aiden inside data-theme=&quot;rm&quot;</span>
        <Mark id="mark-aiden-nested" Icon={Sparkles} title="Aiden" description="in Pulse" size="lg" />
      </div>
    </div>
  ),
};

/** Everything is a percentage, so one rule serves 24px and 64px. */
export const Sizes: Story = {
  render: () => (
    <div style={ROW}>
      {(['sm', 'default', 'lg', 'xl'] as const).map((size) => (
        <div key={size}>
          <span style={CAPTION}>{size}</span>
          <Mark id={`mark-size-${size}`} Icon={ChartColumn} title="Analytics" description="Product suite" size={size} />
        </div>
      ))}
    </div>
  ),
};

/**
 * The three motion levels, side by side. Hover each one — `none` is inert,
 * `ambient` lifts and sweeps, `tilt` also turns to follow the pointer.
 *
 * They are deliberately identical standing still.
 */
export const Motion: Story = {
  render: () => (
    <div style={ROW}>
      {(['none', 'ambient', 'tilt'] as const).map((motion) => (
        <div key={motion}>
          <span style={CAPTION}>motion=&quot;{motion}&quot;</span>
          <Mark id={`mark-motion-${motion}`} Icon={ChartColumn} title="Analytics" motion={motion} size="xl" />
        </div>
      ))}
    </div>
  ),
};

/** Without a `title` the mark is the bare tile — what a collapsed rail wants. */
export const TileOnly: Story = {
  render: () => (
    <div style={ROW}>
      {APPS.map(({ code, name, Icon }) => (
        <div key={code} data-theme={code}>
          <Mark id={`mark-tile-${code}`} Icon={Icon} label={name} size="lg" />
        </div>
      ))}
    </div>
  ),
};

/** The mark in the place it was designed for: the head of an application's rail. */
export const InARail: Story = {
  render: () => (
    <div data-theme="ec" style={{ display: 'flex', height: 260, border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)', overflow: 'hidden' }}>
      <div
        style={{
          width: 'var(--sidebar-width)',
          padding: 'var(--p-3)',
          background: 'var(--sidebar)',
          borderRight: 'var(--border-w-100) solid var(--sidebar-border)',
        }}
      >
        <Mark id="mark-rail" Icon={Leaf} title="Canopy" description="Sustainability" />
      </div>
      <div style={{ flex: 1, padding: 'var(--p-6)', color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
        The rail carries the mark, so the rail itself does not have to shout. Try it
        against <code>data-tint=&quot;rail&quot;</code> in the toolbar.
      </div>
    </div>
  ),
};
