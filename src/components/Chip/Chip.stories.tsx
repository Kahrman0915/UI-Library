import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Check, Plus, X } from 'lucide-react';
import Chip from './Chip';
import type { ChipSize } from './Chip.types';
import type { UiDocsParameters } from '../../types/DocsTypes';

// The three rungs Chip renders. `xs`/`sm` are accepted aliases that normalize
// onto the first two — see utils/size.ts.
const sizes: ChipSize[] = ['xsmall', 'small', 'default'];
const sizeOptions: ChipSize[] = [...sizes, 'xs', 'sm'];

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A pressable pill for filters and tags where any number can be active at ' +
        'once. One standalone on/off control is a `Toggle`; one-of-N mutually ' +
        'exclusive options is a `ToggleGroup`.',
      tags: ['multi-select'],
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
    size: { control: 'select', options: sizeOptions },
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

/**
 * An `IconCenter` with no `label` renders alone in a squared, centred box —
 * the same rule Toggle and ToggleGroup use. `aria-label` is required by the
 * type in this shape, because there is no visible text to name the control.
 */
export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
          <Chip
            id={`icon-only-${size}`}
            size={size}
            IconCenter={Plus}
            aria-label={`Add filter (${size})`}
          />
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {size}
          </span>
        </div>
      ))}
      <Chip id="icon-only-active" IconCenter={Check} active aria-label="Selected" />
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
