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
