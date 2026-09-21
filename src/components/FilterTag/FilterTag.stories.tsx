import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SlidersHorizontal } from 'lucide-react';
import FilterTag, { FilterTagGroup } from './FilterTag';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof FilterTag> = {
  title: 'Components/FilterTag',
  component: FilterTag,
  subcomponents: { FilterTagGroup } as Meta['subcomponents'],
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'One applied filter with a control to remove it. The label is plain text and only the X is a button, ' +
        'so it announces as "Remove Category: Finance". `FilterTagGroup` lists them, adds an optional "Clear all", ' +
        'and moves focus to the next tag when one is removed.',
      tags: ['removable', 'filters'],
      usage: {
        when: [
          'Showing filters that are currently APPLIED to a list, each removable on its own.',
          'Under a page header or toolbar, after the user has chosen filters in a drawer or menu.',
        ],
        avoid: [
          'Choosing filters — that is `Chip` (any number on) or `ToggleGroup` (one of N). Those are toggles; this is a remove button.',
          'Status or category labels that cannot be removed — use `Badge`.',
        ],
        notes:
          '**Why this is not a removable Chip.** Chip is a toggle and renders `aria-pressed`: it means "click to switch this on or off". An applied filter is already on, and `aria-pressed="false"` on it would tell a screen reader the opposite. Chip is also a `<button>`, and a remove button cannot nest inside a button — the same reason TabBar\'s tab is a `div` around its close button.\n\n' +
          'Only the X removes. Clicking the label to remove a filter surprises people; if the label should do anything, it is to reopen the filter it came from, which is the caller\'s to wire.',
      },
      a11y: {
        keyboard: [
          { keys: ['Tab'], description: 'Moves between the remove buttons, then to Clear all. The tags themselves are not tab stops.' },
          { keys: ['Enter'], description: 'Removes the focused tag. Focus moves to the next tag, else the previous, else `returnFocusRef`.' },
          { keys: ['Space'], description: 'Same as Enter.' },
        ],
        notes:
          'The tags are a `ul` named by the group\'s label, so a screen reader announces "Active filters, list, 3 items". Each remove button is named `Remove ${label}` by default — a row of buttons all called "Close" is unusable by ear. Without the group, focus drops to the top of the page when a tag disappears; that is the one behavior `FilterTagGroup` exists to provide.',
      },
      changelog: [
        {
          date: '2026-09-18',
          summary: 'New `xs` rung (24 tall), and `size` on `FilterTagGroup` that sizes every tag and Clear all together.',
          detail:
            'The Browse original draws its applied filters at 24, and the smallest rung was 32. `FilterTagSize` is now Chip\'s full ramp — `xs` 24 / `sm` 32 / `default` 36 — so a FilterTag and a Chip line up in one row.\n\n' +
            '`xs` sits on a 16px line with `--p-1` padding rather than copying Chip\'s 12px line with `--p-1-5`: the same 24px height, but the label clips with an ellipsis and a 12px line box would cut the descenders off "g" and "y".\n\n' +
            'The group\'s `size` reaches each tag through the existing group context — a tag\'s own `size` still wins — and sizes Clear all at the matching Button rung. The tags keep `CloseButton` `sm` at every rung; its box is held to the label line by a negative block margin and its hit target stays 24px.',
        },
        {
          date: '2026-09-18',
          summary: 'Initial build — `FilterTag` and `FilterTagGroup`, the removable form of an applied filter.',
          detail:
            'Split out of Chip rather than added to it: Chip is a toggle (`aria-pressed`) and a `<button>`, so a removable Chip would have announced the wrong state and nested a button in a button. The root is a `span` holding the label and a `CloseButton` (`sm`, named `Remove ${label}`, overridable via `removeLabel`). Visually it takes Chip\'s RESTING outline — `--border`, `--bg-input-30`, `--muted-foreground` — with no pressed state, hover fill or press-scale, because the pill is not a control.\n\n' +
            '`FilterTagGroup` renders a visible label (or `hideLabel`), the tags as `li` items in a `ul` named by that label, and an optional ghost "Clear all". Each tag reports its index before calling `onRemove`; once the child count actually drops, a layout effect focuses the next remove button, else the previous, else `returnFocusRef`, else the group itself (`tabIndex=-1`, no ring). A parent that ignores `onRemove` does not have focus moved.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  args: {
    id: 'ft',
    label: 'Category: Finance',
    size: 'default',
    onRemove: () => {},
  },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'default'] },
    onRemove: { action: 'removed' },
  },
};

export default meta;
type Story = StoryObj<typeof FilterTag>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <FilterTag id="ft-xs" size="xs" label="Organization: Ops" onRemove={() => {}} />
      <FilterTag id="ft-sm" size="sm" label="Organization: Ops" onRemove={() => {}} />
      <FilterTag id="ft-df" label="Organization: Ops" onRemove={() => {}} />
    </div>
  ),
};

const START = ['Category: Finance', 'Organization: Ops', 'Tags: Revenue'];

/**
 * Live. Remove tags with the mouse or with Tab + Enter: focus moves to the next
 * remove button, and after the last one — or Clear all — back to the Filter
 * button that opened the filters, via `returnFocusRef`.
 */
export const Group: Story = {
  render: function GroupStory() {
    const [tags, setTags] = useState(START);
    const filterRef = useRef<HTMLButtonElement>(null);
    return (
      <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button
            ref={filterRef}
            id="ftg-filter"
            label="Filter"
            variant="neutral"
            style="outline"
            size="sm"
            IconLeft={SlidersHorizontal}
            count={tags.length || undefined}
            aria-label={tags.length ? `Filter, ${tags.length} active` : 'Filter'}
          />
          <Button id="ftg-reset" label="Reset demo" style="ghost" size="sm" onClick={() => setTags(START)} />
        </div>
        <FilterTagGroup
          id="ftg"
          size="xs"
          label="Active filters:"
          returnFocusRef={filterRef}
          onClearAll={() => setTags([])}
        >
          {tags.map((t) => (
            <FilterTag key={t} id={`ftg-${t.replace(/\W+/g, '-').toLowerCase()}`} label={t} onRemove={() => setTags((xs) => xs.filter((x) => x !== t))} />
          ))}
        </FilterTagGroup>
      </div>
    );
  },
};

/**
 * `size` on the group sizes every tag and the Clear all button together, so a
 * row cannot end up at mixed heights. xs is 24 tall — what the Browse original
 * draws its applied filters at.
 */
export const GroupSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {(['xs', 'sm', 'default'] as const).map((sz) => (
        <FilterTagGroup key={sz} id={`ftgs-${sz}`} size={sz} label={`${sz}:`} onClearAll={() => {}}>
          <FilterTag id={`ftgs-${sz}-1`} label="Category: Finance" onRemove={() => {}} />
          <FilterTag id={`ftgs-${sz}-2`} label="Tags: Revenue" onRemove={() => {}} />
        </FilterTagGroup>
      ))}
    </div>
  ),
};

/** The name is kept for screen readers; nothing is drawn. */
export const HiddenLabel: Story = {
  render: () => (
    <FilterTagGroup id="ftg-hidden" label="Active filters" hideLabel>
      <FilterTag id="fth-1" label="Category: Finance" onRemove={() => {}} />
      <FilterTag id="fth-2" label="Tags: Revenue" onRemove={() => {}} />
    </FilterTagGroup>
  ),
};
