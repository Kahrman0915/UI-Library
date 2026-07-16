import type { Meta, StoryObj } from '@storybook/react';
import ScrollArea from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: { layout: 'centered' },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
    },
    type: { control: 'select', options: ['auto', 'hover'] },
    children: { control: false, table: { disable: true } },
  },
  args: {
    id: 'story-scroll-area',
    orientation: 'vertical',
    type: 'auto',
  },
};

export default meta;

type Story = StoryObj<typeof ScrollArea>;

const tags = [
  'Design',
  'Engineering',
  'Product',
  'Research',
  'Marketing',
  'Sales',
  'Support',
  'Operations',
  'Finance',
  'Legal',
  'HR',
  'Security',
  'Data',
  'Analytics',
  'Growth',
  'Content',
  'Brand',
  'Community',
  'Partnerships',
  'Recruiting',
];

const paneStyle: React.CSSProperties = {
  height: 240,
  width: 320,
  border: '1px solid var(--border)',
  borderRadius: 'var(--rounded-lg)',
  background: 'var(--card)',
  padding: 'var(--p-4)',
  fontFamily: 'var(--font-family)',
  color: 'var(--foreground)',
};

const rowStyle: React.CSSProperties = {
  padding: 'var(--p-2) 0',
  borderBottom: '1px solid var(--border-subtle)',
  fontSize: 'var(--text-sm)',
};

export const Playground: Story = {
  render: (args) => (
    <ScrollArea {...args} style={paneStyle}>
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
        }}
      >
        Tags
      </h3>
      {tags.map((tag) => (
        <div key={tag} style={rowStyle}>
          {tag}
        </div>
      ))}
    </ScrollArea>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <ScrollArea {...args} style={paneStyle}>
      {tags.map((tag) => (
        <div key={tag} style={rowStyle}>
          {tag}
        </div>
      ))}
    </ScrollArea>
  ),
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <ScrollArea
      {...args}
      style={{
        ...paneStyle,
        height: 140,
        width: 400,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '4px 0',
          fontSize: 'var(--text-sm)',
        }}
      >
        {tags.map((tag) => (
          <div
            key={tag}
            style={{
              flex: '0 0 auto',
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rounded-md)',
              background: 'var(--bg-input-30)',
              whiteSpace: 'nowrap',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const Both: Story = {
  args: { orientation: 'both' },
  render: (args) => (
    <ScrollArea {...args} style={{ ...paneStyle, width: 320, height: 200 }}>
      <div
        style={{
          width: 640,
          fontSize: 'var(--text-sm)',
        }}
      >
        {tags.map((tag) => (
          <div
            key={tag}
            style={{
              display: 'flex',
              gap: 16,
              padding: 'var(--p-2) 0',
              borderBottom: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ width: 120 }}>{tag}</span>
            <span style={{ width: 200, color: 'var(--muted-foreground)' }}>
              Team ・ {tag.toLowerCase()}@example.com
            </span>
            <span style={{ width: 100 }}>Active</span>
            <span style={{ width: 100 }}>Owner</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HoverType: Story = {
  args: { type: 'hover' },
  render: (args) => (
    <ScrollArea {...args} style={paneStyle}>
      <h3
        style={{
          margin: '0 0 12px 0',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-semibold)',
        }}
      >
        Hover for scrollbar
      </h3>
      {tags.map((tag) => (
        <div key={tag} style={rowStyle}>
          {tag}
        </div>
      ))}
    </ScrollArea>
  ),
};
