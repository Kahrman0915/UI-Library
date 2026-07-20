import type { Meta, StoryObj } from '@storybook/react';
import AspectRatio from './AspectRatio';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  parameters: { layout: 'padded' },
  argTypes: {
    ratio: { control: 'number' },
  },
};

export default meta;

type Story = StoryObj<typeof AspectRatio>;

const Fill = ({ label }: { label: string }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--muted)',
      color: 'var(--muted-foreground)',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      borderRadius: 'var(--rounded-md)',
    }}
  >
    {label}
  </div>
);

export const Playground: Story = {
  args: { ratio: 16 / 9 },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <AspectRatio {...args}>
        <Fill label="16 / 9" />
      </AspectRatio>
    </div>
  ),
};

export const Ratios: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 720 }}>
      <AspectRatio ratio={16 / 9}>
        <Fill label="16 / 9" />
      </AspectRatio>
      <AspectRatio ratio={4 / 3}>
        <Fill label="4 / 3" />
      </AspectRatio>
      <AspectRatio ratio={1}>
        <Fill label="1 / 1" />
      </AspectRatio>
      <AspectRatio ratio={3 / 4}>
        <Fill label="3 / 4" />
      </AspectRatio>
      <AspectRatio ratio={21 / 9}>
        <Fill label="21 / 9" />
      </AspectRatio>
      <AspectRatio ratio={2 / 3}>
        <Fill label="2 / 3" />
      </AspectRatio>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <AspectRatio ratio={16 / 9} style={{ borderRadius: 'var(--rounded-lg)' }}>
        <img
          src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800"
          alt="Landscape"
        />
      </AspectRatio>
    </div>
  ),
};
