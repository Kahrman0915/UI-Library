import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import Button from './Button';
import type { ButtonVariant, ButtonStyle } from './Button.types';

const variants: ButtonVariant[] = [
  'default',
  'error',
  'info',
  'success',
  'warning',
  'aiden',
];

const styles: ButtonStyle[] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
];

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: variants },
    style: { control: 'select', options: styles },
    size: { control: 'select', options: ['small', 'default', 'large'] },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    IconLeft: { control: false, table: { disable: true } },
    IconRight: { control: false, table: { disable: true } },
    IconCenter: { control: false, table: { disable: true } },
    onClick: { action: 'clicked' },
  },
  args: {
    id: 'story-button',
    label: 'Click me',
    variant: 'default',
    style: 'default',
    size: 'default',
    disabled: false,
    isLoading: false,
    iconOnly: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant}>
          <h4
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              textTransform: 'capitalize',
            }}
          >
            {variant}
          </h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {styles.map((style) => (
              <Button
                {...args}
                key={style}
                id={`${variant}-${style}`}
                variant={variant}
                style={style}
                label={style}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} id="btn-sm" size="small" label="Small" />
      <Button {...args} id="btn-md" size="default" label="Default" />
      <Button {...args} id="btn-lg" size="large" label="Large" />
    </div>
  ),
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIcons: Story = {
  args: {
    IconLeft: ArrowLeft,
    IconRight: ArrowRight,
    label: 'Back and forth',
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    IconCenter: Plus,
    'aria-label': 'Add item',
  },
};

export const AidenIconOnly: Story = {
  args: {
    variant: 'aiden',
    iconOnly: true,
    IconCenter: Plus,
    'aria-label': 'Add with Aiden',
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
        Put <code>data-theme="db"</code> on any subtree — the default (primary)
        button takes DB's color automatically. Secondary / outline / ghost / link
        stay neutral slate.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {styles.map((style) => (
          <Button
            key={style}
            id={`db-${style}`}
            variant="default"
            style={style}
            label={style}
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
            {styles.map((style) => (
              <Button
                key={style}
                id={`${brand}-${style}`}
                variant="default"
                style={style}
                label={style}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
