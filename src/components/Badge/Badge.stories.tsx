import type { Meta, StoryObj } from '@storybook/react';
import { Check, Dot, X } from 'lucide-react';
import Badge from './Badge';
import type { BadgeVariant } from './Badge.types';

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
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: variants },
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
  'dr',
  'ec',
  'ir',
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
