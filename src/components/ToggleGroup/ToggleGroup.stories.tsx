import {
  TextAlignStart,
  TextAlignCenter,
  TextAlignEnd,
  Bold,
  Italic,
  Underline,
} from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import ToggleGroup, { ToggleGroupItem } from './ToggleGroup';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A segmented control: exactly one of N selected, or explicitly multiple. The ' +
        'right pick for view switchers and status filters.',
      tags: ['compound', 'segmented'],
      changelog: [
        {
          date: '2026-08-27',
          summary: 'Gained a trailing icon.',
          detail:
            'ToggleGroupItem gains `IconRight` alongside `IconLeft`, matching Toggle. Purely additive.',
        },
        {
          date: '2026-08-27',
          summary:
            'Supports the new `line` and `plain` Toggle variants, which drop the segmented look ' +
            'and sit on a gap instead.',
          detail:
            'The root now carries data-variant (not a modifier class — `ui-toggle-group--default` ' +
            'would select nothing). The border-collapse and radius-flattening rules are scoped OFF ' +
            'for line/plain, which have no borders to share and would otherwise have their labels ' +
            'pulled together by the negative margin. Those two sit on a --p-4 gap, matching the Tabs ' +
            'line list so a filter bar built from either lines up identically.',
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
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

/**
 * The quiet rungs, for a filter bar. `line` marks the selection with a `--primary`
 * bar; `plain` uses weight and colour alone. Both drop the segmented borders and
 * sit on a gap, so they read as a row of labels rather than a control.
 *
 * Re-clicking the active item clears it — for a filter that means "no filter", so
 * a second group needs no explicit "All".
 */
export const QuietVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-8)' }}>
      <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          variant=&quot;line&quot;
        </span>
        <ToggleGroup id="apps-line" type="single" variant="line" defaultValue="all">
          <ToggleGroupItem value="all" label="All" />
          <ToggleGroupItem value="dc" label="DART Central" />
          <ToggleGroupItem value="db" label="Dartboards" />
          <ToggleGroupItem value="aiden" label="Aiden" />
        </ToggleGroup>
      </div>

      <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          variant=&quot;plain&quot;
        </span>
        <ToggleGroup id="apps-plain" type="single" variant="plain" defaultValue="all">
          <ToggleGroupItem value="all" label="All" />
          <ToggleGroupItem value="dc" label="DART Central" />
          <ToggleGroupItem value="db" label="Dartboards" />
          <ToggleGroupItem value="aiden" label="Aiden" />
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const Single: Story = {
  render: () => (
    <ToggleGroup id="align" type="single" defaultValue="left" variant="outline">
      <ToggleGroupItem value="left" IconCenter={TextAlignStart} aria-label="Align left" />
      <ToggleGroupItem value="center" IconCenter={TextAlignCenter} aria-label="Align center" />
      <ToggleGroupItem value="right" IconCenter={TextAlignEnd} aria-label="Align right" />
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup id="format" type="multiple" defaultValue={['bold']} variant="outline">
      <ToggleGroupItem value="bold" IconCenter={Bold} aria-label="Bold" />
      <ToggleGroupItem value="italic" IconCenter={Italic} aria-label="Italic" />
      <ToggleGroupItem value="underline" IconCenter={Underline} aria-label="Underline" />
    </ToggleGroup>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <ToggleGroup id="view" type="single" defaultValue="board" variant="outline">
      <ToggleGroupItem value="list" label="List" />
      <ToggleGroupItem value="board" label="Board" />
      <ToggleGroupItem value="calendar" label="Calendar" />
    </ToggleGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup
      id="v-align"
      type="single"
      defaultValue="center"
      variant="outline"
      orientation="vertical"
    >
      <ToggleGroupItem value="left" IconCenter={TextAlignStart} aria-label="Align left" />
      <ToggleGroupItem value="center" IconCenter={TextAlignCenter} aria-label="Align center" />
      <ToggleGroupItem value="right" IconCenter={TextAlignEnd} aria-label="Align right" />
    </ToggleGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup id="dis" type="single" defaultValue="left" variant="outline" disabled>
      <ToggleGroupItem value="left" IconCenter={TextAlignStart} aria-label="Align left" />
      <ToggleGroupItem value="center" IconCenter={TextAlignCenter} aria-label="Align center" />
      <ToggleGroupItem value="right" IconCenter={TextAlignEnd} aria-label="Align right" />
    </ToggleGroup>
  ),
};
