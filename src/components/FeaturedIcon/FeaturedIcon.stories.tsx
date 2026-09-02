import type { Meta, StoryObj } from '@storybook/react';
import { Inbox, Sparkles, Check, TriangleAlert, CircleAlert, Info } from 'lucide-react';
import FeaturedIcon from './FeaturedIcon';
import type {
  FeaturedIconSize,
  FeaturedIconColor,
  FeaturedIconAppearance,
} from './FeaturedIcon.types';
import type { CategoryColor } from '../../types/GlobalTypes';
import type { UiDocsParameters } from '../../types/DocsTypes';

const sizes: FeaturedIconSize[] = ['sm', 'default', 'lg'];
const appearances: FeaturedIconAppearance[] = ['soft', 'solid'];
const colors: FeaturedIconColor[] = [
  'default',
  'success',
  'warning',
  'error',
  'info',
];
const categories: CategoryColor[] = [
  'red',
  'orange',
  'amber',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];
const colorIcon = {
  default: Inbox,
  success: Check,
  warning: TriangleAlert,
  error: CircleAlert,
  info: Info,
} as const;

const meta: Meta<typeof FeaturedIcon> = {
  title: 'Components/FeaturedIcon',
  component: FeaturedIcon,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'An icon inside a decorative container — the visual anchor at the top of an ' +
        'empty state, a dialog, or a feature row.',
      tags: ['decorative'],
      usage: {
        when: [
          'A tile that **means** something — a red one on a destructive confirm, amber on a warning — takes a semantic `color`.',
          'A tile that only has to be **distinct** — a request-type chooser, a topic grid, a category list — takes one of the 15 category hues.',
        ],
        avoid: [
          'Mixing the two families in one row. A `warning` tile beside an `amber` one asks the reader to tell a meaning apart from a label, and nothing on screen says which is which.',
        ],
        notes:
          '`color` and `appearance` are independent, the same way {@link Badge} models ' +
          'them: the colour publishes a palette and the appearance picks which half of ' +
          'it renders, so **every colour works with every appearance**.\n\n' +
          'Default to `soft`. Reach for `solid` when the tile is the loudest thing in ' +
          'its own block, or when a row of tiles IS the content rather than the ' +
          'decoration beside it.',
      },
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The `error` colour is a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text colour was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
        },
        {
          date: '2026-08-31',
          summary:
            '`brand` is gone — `default` IS the theme\'s primary now, matching Badge.',
          detail:
            'BREAKING. The component carried both a neutral `default` and a `brand` that read ' +
            '`--primary`, which is two ways to say the same thing: {@link Badge} has only ' +
            '`default`, and it themes. `default` now takes the whole `--primary` family ' +
            '(`--primary-light` / `--primary-text` / `--primary-border` soft, `--primary` / ' +
            '`--primary-foreground` solid) and `brand` no longer compiles — replace it with ' +
            '`default`, or drop the prop.\n\n' +
            'TWO CONSEQUENCES WORTH KNOWING. There is no neutral colour in the set any more: ' +
            'a tile that must stay slate inside a themed subtree has to say so itself. And ' +
            '`EmptyMedia variant="icon"` emits `--default`, so **every empty state now themes** ' +
            'and its unthemed tile goes from an opaque `--secondary` to the far fainter 6% ' +
            '`--primary-light`. On the main brand `--primary` is neutral slate, so an unthemed ' +
            'page still reads as chrome — it is just lighter.',
        },
        {
          date: '2026-08-31',
          summary:
            'New `appearance` prop (`soft` · `solid`) — every colour now has a filled option, not just `default`.',
          detail:
            'BREAKING (visual). `default` was the only filled tile in the set: it painted an ' +
            'opaque `--muted` with a border that resolved to the SAME value, so it read as a ' +
            'solid chip with no edge, while the five semantic colours were a 6% tint with a ' +
            '30% ring and the category hues a 10% one. Three treatments, no way to ask for any ' +
            'of them.\n\n' +
            '`color` and `appearance` are now independent, the mechanism Badge uses: the colour ' +
            'publishes `--_fill`/`--_on-fill` and `--_soft`/`--_soft-ink`/`--_soft-line`, and ' +
            'the appearance consumes one pair. `appearance` defaults to **`soft`**, so a tile ' +
            'with no `color` changes from the solid slate chip to a soft neutral tint — pass ' +
            '`appearance="solid"` for a filled tile. Both appearances measure the same 40×40 ' +
            'box with a 1px border — `solid` keeps the width and paints it transparent — so ' +
            'swapping one inside a row shifts nothing. `EmptyMedia variant="icon"` was ' +
            'updated to emit the new class and follows the same `soft` default. (The neutral ' +
            '`--muted` palette this entry originally described was superseded the same day by ' +
            'the `brand` removal above, which repointed `default` at `--primary`.)',
        },
        {
          date: '2026-08-31',
          summary:
            '`variant` is now `color`, and it accepts the 15 category hues as well as the six semantic ones.',
          detail:
            'Breaking rename: `variant` → `color` (`FeaturedIconVariant` → `FeaturedIconColor`), ' +
            'naming the axis for what it is and matching Badge. The union gains `CategoryColor`, ' +
            'so a tile can be told apart rather than ranked. Category tiles take the same ' +
            'three-part shape as the semantic ones — `--category-{c}-bg` tint, `--category-{c}-text` ' +
            'ink, and a new `--category-{c}-border` step added to tokens.scss for this (15 hues × ' +
            'both modes), at the same 0.3/0.4 alpha the semantic `-border` tokens use.',
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
    size: { control: 'select', options: sizes },
    shape: { control: 'select', options: ['square', 'circle'] },
    color: { control: 'select', options: [...colors, ...categories] },
    appearance: { control: 'inline-radio', options: appearances },
    Icon: { control: false, table: { disable: true } },
  },
  args: {
    Icon: Inbox,
    size: 'default',
    shape: 'square',
    color: 'default',
    appearance: 'soft',
  },
};

export default meta;
type Story = StoryObj<typeof FeaturedIcon>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {sizes.map((size) => (
        <FeaturedIcon key={size} Icon={Inbox} size={size} />
      ))}
    </div>
  ),
};

/**
 * The two fills, across every colour family. `soft` is the tint, its on-tint ink
 * and a soft ring; `solid` is the vivid fill with inverted ink and no ring —
 * an edge in the same hue as the fill is invisible, and one in a different hue
 * reads as a second object.
 *
 * They measure the same box. `solid` keeps the border width and paints it
 * transparent, so swapping one inside a row shifts nothing around it.
 */
export const Appearances: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      {appearances.map((appearance) => (
        <div key={appearance} style={{ display: 'grid', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {appearance}
          </span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {colors.map((color) => (
              <FeaturedIcon
                key={color}
                Icon={colorIcon[color as keyof typeof colorIcon]}
                color={color}
                appearance={appearance}
              />
            ))}
            {(['blue', 'amber', 'violet', 'emerald'] as const).map((color) => (
              <FeaturedIcon
                key={color}
                Icon={Sparkles}
                color={color}
                appearance={appearance}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {colors.map((color) => (
        <FeaturedIcon
          key={color}
          Icon={colorIcon[color as keyof typeof colorIcon]}
          color={color}
        />
      ))}
    </div>
  ),
};

/**
 * The tag palette. Same tile, same border weight, same ink relationship as the
 * semantic colours above — the difference is what the hue is *for*. Reach for
 * these when a set of tiles has to be told apart and none of them outranks
 * another.
 */
export const Categories: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', maxWidth: 560 }}>
      {categories.map((color) => (
        <FeaturedIcon key={color} Icon={Sparkles} color={color} label={color} />
      ))}
    </div>
  ),
};

export const Circle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {colors.map((color) => (
        <FeaturedIcon
          key={color}
          Icon={colorIcon[color as keyof typeof colorIcon]}
          color={color}
          shape="circle"
        />
      ))}
    </div>
  ),
};

export const Matrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {colors.map((color) => (
        <div key={color} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {sizes.map((size) => (
            <FeaturedIcon
              key={size}
              Icon={colorIcon[color as keyof typeof colorIcon]}
              size={size}
              color={color}
            />
          ))}
          {sizes.map((size) => (
            <FeaturedIcon
              key={`c-${size}`}
              Icon={colorIcon[color as keyof typeof colorIcon]}
              size={size}
              color={color}
              shape="circle"
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * `default` is the theme's primary, so it moves with a `data-theme` wrapper —
 * there is no separate `brand` colour to pick. On the main brand `--primary` is
 * neutral slate, which is why the first tile still reads as chrome.
 */
export const Themed: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {['', 'db', 'nb', 'ph', 'rm'].map((code) => (
        <div
          key={code || 'main'}
          data-theme={code || undefined}
          style={{ display: 'grid', gap: 6, justifyItems: 'center' }}
        >
          <FeaturedIcon Icon={Sparkles} size="lg" />
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {code || 'main'}
          </span>
        </div>
      ))}
    </div>
  ),
};
