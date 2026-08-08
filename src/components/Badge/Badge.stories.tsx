import type { Meta, StoryObj } from '@storybook/react';
import { Check, Dot, X } from 'lucide-react';
import Badge from './Badge';
import type { BadgeVariant } from './Badge.types';
import type { CategoryColor } from '../../types/GlobalTypes';
import type { UiDocsParameters } from '../../types/DocsTypes';

const categories: CategoryColor[] = [
  'red', 'orange', 'amber', 'green', 'emerald', 'teal',
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
];

const variants: BadgeVariant[] = [
  'default',
  'outline',
  'error',
  'error-outline',
  'success',
  'success-outline',
  'warning',
  'warning-outline',
  'info',
  'info-outline',
  'aiden',
  'aiden-outline',
];

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A small label carrying a status, a count or a category. Twelve variants pair ' +
        'a solid fill with a transparent outline for each colour; `category` switches ' +
        'to the 15-hue tag palette for topics and labels that need to be told apart ' +
        'rather than ranked.',
      tags: ['12 variants', '15 category hues'],
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
    variant: { control: 'select', options: variants },
    category: { control: 'select', options: [undefined, ...categories] },
    categoryStyle: { control: 'inline-radio', options: ['soft', 'solid'] },
    IconLeft: { control: false, table: { disable: true } },
    IconRight: { control: false, table: { disable: true } },
    IconCenter: { control: false, table: { disable: true } },
    style: { control: false, table: { disable: true } },
  },
  args: {
    id: 'story-badge',
    label: 'Badge',
    variant: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        alignItems: 'start',
      }}
    >
      {variants.map((variant) => (
        <div
          key={variant}
          style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-family)',
            }}
          >
            {variant}
          </span>
          <Badge id={`badge-${variant}`} variant={variant} label={variant} />
        </div>
      ))}
    </div>
  ),
};

// The 15-hue category palette via the `category` prop (overrides `variant`).
// `categoryStyle="soft"` = tint + AA `-text`; `"solid"` = vivid fill + AA
// `-foreground`. Both cleared WCAG AA in both modes. For tags, labels, cells.
export const Categories: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 540 }}>
      {(['soft', 'solid'] as const).map((cs) => (
        <div key={cs} style={{ display: 'grid', gap: 8 }}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-family)',
            }}
          >
            categoryStyle=&quot;{cs}&quot;
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <Badge
                key={c}
                id={`cat-${cs}-${c}`}
                category={c}
                categoryStyle={cs}
                label={c}
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
    variant: 'success',
    label: 'Approved',
    IconLeft: Check,
  },
};

export const WithIconRight: Story = {
  args: {
    variant: 'error',
    label: 'Failed',
    IconRight: X,
  },
};

export const WithIconCenter: Story = {
  args: {
    variant: 'info',
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

const themedVariants: BadgeVariant[] = ['default', 'outline'];

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
        {themedVariants.map((variant) => (
          <Badge
            key={variant}
            id={`db-${variant}`}
            variant={variant}
            label={variant}
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
            {themedVariants.map((variant) => (
              <Badge
                key={variant}
                id={`${brand}-${variant}`}
                variant={variant}
                label={variant}
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
      <Badge id="aiden-default" variant="default" label="Default" />
      <Badge id="aiden-outline" variant="outline" label="Outline" />
    </div>
  ),
};
