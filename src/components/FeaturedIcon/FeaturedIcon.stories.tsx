import type { Meta, StoryObj } from '@storybook/react';
import { Inbox, Sparkles, Check, TriangleAlert, CircleAlert, Info } from 'lucide-react';
import FeaturedIcon from './FeaturedIcon';
import type { FeaturedIconSize, FeaturedIconVariant } from './FeaturedIcon.types';

const sizes: FeaturedIconSize[] = ['sm', 'default', 'lg'];
const variants: FeaturedIconVariant[] = [
  'default',
  'brand',
  'success',
  'warning',
  'error',
  'info',
];
const variantIcon = {
  default: Inbox,
  brand: Sparkles,
  success: Check,
  warning: TriangleAlert,
  error: CircleAlert,
  info: Info,
};

const meta: Meta<typeof FeaturedIcon> = {
  title: 'Components/FeaturedIcon',
  component: FeaturedIcon,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: sizes },
    shape: { control: 'select', options: ['square', 'circle'] },
    variant: { control: 'select', options: variants },
    Icon: { control: false, table: { disable: true } },
  },
  args: { Icon: Inbox, size: 'default', shape: 'square', variant: 'default' },
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

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {variants.map((variant) => (
        <FeaturedIcon
          key={variant}
          Icon={variantIcon[variant]}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const Circle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {variants.map((variant) => (
        <FeaturedIcon
          key={variant}
          Icon={variantIcon[variant]}
          variant={variant}
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
      {variants.map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {sizes.map((size) => (
            <FeaturedIcon
              key={size}
              Icon={variantIcon[variant]}
              size={size}
              variant={variant}
            />
          ))}
          {sizes.map((size) => (
            <FeaturedIcon
              key={`c-${size}`}
              Icon={variantIcon[variant]}
              size={size}
              variant={variant}
              shape="circle"
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

// Themed — the brand variant follows a data-theme wrapper.
export const BrandThemed: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {['', 'db', 'dr', 'ph', 'rm'].map((code) => (
        <div
          key={code || 'main'}
          data-theme={code || undefined}
          style={{ display: 'grid', gap: 6, justifyItems: 'center' }}
        >
          <FeaturedIcon Icon={Sparkles} variant="brand" size="lg" />
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
