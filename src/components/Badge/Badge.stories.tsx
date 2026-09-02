import type { Meta, StoryObj } from '@storybook/react';
import { Check, Dot, X } from 'lucide-react';
import Badge from './Badge';
import type { BadgeColor, BadgeAppearance } from './Badge.types';
import type { CategoryColor } from '../../types/GlobalTypes';
import type { UiDocsParameters } from '../../types/DocsTypes';

const categories: CategoryColor[] = [
  'red', 'orange', 'amber', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];

const colors: BadgeColor[] = ['default', 'error', 'success', 'warning', 'info', 'aiden'];
const appearances: BadgeAppearance[] = ['solid', 'soft', 'outline'];

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A small label carrying a status, a count or a category. Each colour comes as ' +
        'a `{solid, soft, outline}` trio — a filled base, a tinted `-soft` surface with ' +
        'on-tint text, and a transparent bordered outline; `category` switches to the ' +
        '15-hue tag palette for topics and labels that need to be told apart rather ' +
        'than ranked.\n\n' +
        'Reach for `soft` when a badge sits beside a `category` tag: both are a tint ' +
        'plus on-tint text with no border, so they read as siblings. A solid or ' +
        'outline badge next to a soft category tag will not.',
      tags: ['18 variants', '15 category hues'],
      changelog: [
        {
          date: '2026-08-27',
          summary:
            'BREAKING — `variant`, `category` and `categoryStyle` are replaced by two ' +
            'independent axes, `color` and `appearance`.',
          detail:
            'Every colour now works with every fill, which the flat variant list could not ' +
            'express: the 15 category hues gain `outline`, and the semantic colours gain ' +
            '`soft`. A colour class sets a local palette (--_fill/--_on-fill, --_soft/' +
            '--_soft-ink, --_line/--_line-ink) and the appearance class consumes it. ' +
            'Migration: variant="error-outline" -> color="error" appearance="outline"; ' +
            'variant="outline" -> color="default" appearance="outline"; category="red" ' +
            'categoryStyle="solid" -> color="red" appearance="solid". `appearance` defaults ' +
            'to solid, so category badges — which defaulted to soft — must now say so. ' +
            'BadgeVariant is gone; BadgeColor and BadgeAppearance replace it.',
        },
        {
          date: '2026-08-27',
          summary:
            'Every colour gained a tinted `soft` variant, so a brand or semantic badge ' +
            'can sit beside a category tag and read as the same kind of thing.',
          detail:
            'Adds soft, error-soft, success-soft, warning-soft, info-soft and aiden-soft ' +
            '(12 -> 18 variants). Each is a `-soft` tint with the new on-tint `-text` ' +
            'colour and no border, matching the shape of a soft `category` badge. Brand ' +
            'soft uses --primary-soft (8% light / 10% dark) rather than --primary-light ' +
            '(6%), which reads washed out at pill size beside a category tag — this makes ' +
            'Badge the second consumer of --primary-soft after the filled secondary ' +
            'button. Semantic soft variants read new --error-text / --success-text / ' +
            '--warning-text / --info-text tokens; the raw hue measured 4.07:1 on a tinted ' +
            'card in dark mode. aiden-soft carries the --aiden-secondary gradient.',
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
    color: { control: 'select', options: [...colors, ...categories] },
    appearance: { control: 'inline-radio', options: appearances },
    IconLeft: { control: false, table: { disable: true } },
    IconRight: { control: false, table: { disable: true } },
    IconCenter: { control: false, table: { disable: true } },
    style: { control: false, table: { disable: true } },
  },
  args: {
    id: 'story-badge',
    label: 'Badge',
    color: 'default',
    appearance: 'solid',
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      {colors.map((color) => (
        <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
          <span
            style={{
              width: 72,
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {color}
          </span>
          {appearances.map((appearance) => (
            <Badge
              key={appearance}
              id={`badge-${color}-${appearance}`}
              color={color}
              appearance={appearance}
              label={appearance}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Categories: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      {appearances.map((appearance) => (
        <div key={appearance} style={{ display: 'grid', gap: 'var(--p-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
            appearance=&quot;{appearance}&quot;
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--p-2)' }}>
            {categories.map((hue) => (
              <Badge
                key={hue}
                id={`cat-${hue}-${appearance}`}
                color={hue}
                appearance={appearance}
                label={hue}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const WithIconLeft: Story = {
  args: {
    color: 'success',
    label: 'Approved',
    IconLeft: Check,
  },
};

export const WithIconRight: Story = {
  args: {
    color: 'error',
    label: 'Failed',
    IconRight: X,
  },
};

export const WithIconCenter: Story = {
  args: {
    color: 'info',
    label: 'Live',
    IconCenter: Dot,
  },
};

const productBrands = [
  'db',
  'dc',
  'ec',
  'nb',
  'ph',
  'rm',
] as const;

const themedAppearances: BadgeAppearance[] = ['solid', 'soft', 'outline'];

export const ThemeDB: Story = {
  name: 'Theme — DB',
  parameters: { layout: 'padded' },
  render: () => (
    <div data-theme="db" style={{ display: 'grid', gap: 12 }}>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted-foreground)',
        }}
      >
        Put <code>data-theme="db"</code> on any subtree — badges reading{' '}
        <code>--primary</code> (default / outline) take DB's
        color automatically.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {themedAppearances.map((appearance) => (
          <Badge
            key={appearance}
            id={`db-${appearance}`}
            appearance={appearance}
            label={appearance}
          />
        ))}
      </div>
    </div>
  ),
};

export const ThemesShowcase: Story = {
  name: 'Theme — All Products',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {productBrands.map((brand) => (
        <div
          key={brand}
          data-theme={brand}
          style={{ display: 'grid', gap: 8 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            data-theme=&quot;{brand}&quot;
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {themedAppearances.map((appearance) => (
              <Badge
                key={appearance}
                id={`${brand}-${appearance}`}
                appearance={appearance}
                label={appearance}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

// Inside `data-surface="aiden"` the default badge takes Aiden's violet→blue
// gradient and the outline badge its solid violet — the AI-surface identity,
// which holds even inside a brand theme. See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div data-surface="aiden" style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
      <Badge id="aiden-default" color="default" label="Default" />
      <Badge id="aiden-outline" color="default" appearance="outline" label="Outline" />
    </div>
  ),
};
