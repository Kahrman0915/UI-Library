import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Check, Plus, X } from 'lucide-react';
import Chip from './Chip';
import type { ChipSize } from './Chip.types';

const sizes: ChipSize[] = ['xsmall', 'small', 'default'];

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: sizes },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    IconLeft: { control: false, table: { disable: true } },
    IconRight: { control: false, table: { disable: true } },
    IconCenter: { control: false, table: { disable: true } },
    onClick: { action: 'clicked' },
  },
  args: {
    id: 'story-chip',
    label: 'All',
    size: 'default',
    active: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Chip {...args} id="chip-xs" size="xsmall" label="xsmall" />
      <Chip {...args} id="chip-sm" size="small" label="small" />
      <Chip {...args} id="chip-md" size="default" label="default" />
    </div>
  ),
};

export const Active: Story = {
  args: { active: true, label: 'Selected' },
};

export const Disabled: Story = {
  args: { disabled: true, label: 'Disabled' },
};

export const WithIcons: Story = {
  args: {
    IconLeft: Check,
    IconRight: X,
    label: 'Filter',
  },
};

export const FilterGroup: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const options = ['All', 'Active', 'Draft', 'Archived', 'Deleted'];
    const [selected, setSelected] = useState<string>('All');
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((option) => (
          <Chip
            key={option}
            id={`filter-${option.toLowerCase()}`}
            label={option}
            active={selected === option}
            onClick={() => setSelected(option)}
          />
        ))}
      </div>
    );
  },
};

export const MultiSelectGroup: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const tags = ['Design', 'Engineering', 'Product', 'Research', 'Marketing'];
    const [selected, setSelected] = useState<Set<string>>(new Set(['Design']));
    const toggle = (tag: string) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            id={`tag-${tag.toLowerCase()}`}
            label={tag}
            IconLeft={selected.has(tag) ? Check : Plus}
            active={selected.has(tag)}
            onClick={() => toggle(tag)}
          />
        ))}
      </div>
    );
  },
};

export const BrandDB: Story = {
  name: 'Brand — DB (active uses primary)',
  parameters: { layout: 'padded' },
  render: () => {
    const options = ['Overview', 'Widgets', 'Data', 'Settings'];
    const [selected, setSelected] = useState<string>('Overview');
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
          }}
        >
          Chip active state reads <code>--primary</code>. Wrap in{' '}
          <code>data-theme</code> to restyle the active pill with the theme color.
        </span>
        <div data-theme="db" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {options.map((option) => (
            <Chip
              key={option}
              id={`db-${option.toLowerCase()}`}
              label={option}
              active={selected === option}
              onClick={() => setSelected(option)}
            />
          ))}
        </div>
      </div>
    );
  },
};

// Inside `data-surface="aiden"` the active chip takes Aiden's gradient (and its
// hover deepens it); inactive chips read violet. See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div data-surface="aiden" style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
      <Chip id="aiden-active" label="Active" active />
      <Chip id="aiden-inactive" label="Inactive" />
    </div>
  ),
};
