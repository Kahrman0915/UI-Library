import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, Copy } from 'lucide-react';
import ButtonGroup, {
  ButtonGroupSeparator,
  ButtonGroupText,
} from './ButtonGroup';
import Button from '../Button/Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'Joins adjacent buttons into a single unit, flattening the corners where they ' +
        'meet. Purely presentational — it has no selection state, so for one-of-N use ' +
        '`ToggleGroup`.',
      tags: ['compound', '3 parts'],
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
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    children: { control: false, table: { disable: true } },
  },
  args: {
    id: 'story-btn-group',
    orientation: 'horizontal',
  },
};

export default meta;

type Story = StoryObj<typeof ButtonGroup>;

export const Playground: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button id="pg-1" label="Left" />
      <Button id="pg-2" label="Middle" />
      <Button id="pg-3" label="Right" />
    </ButtonGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ButtonGroup id="og">
      <Button id="og-1" label="Day" style="outline" />
      <Button id="og-2" label="Week" style="outline" />
      <Button id="og-3" label="Month" style="outline" />
      <Button id="og-4" label="Year" style="outline" />
    </ButtonGroup>
  ),
};

export const Secondary: Story = {
  render: () => (
    <ButtonGroup id="sec">
      <Button id="sec-1" label="Draft" style="secondary" />
      <Button id="sec-2" label="Publish" style="secondary" />
      <Button id="sec-3" label="Archive" style="secondary" />
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup id="vert" orientation="vertical">
      <Button id="v-1" label="Home" style="outline" />
      <Button id="v-2" label="Reports" style="outline" />
      <Button id="v-3" label="Settings" style="outline" />
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup id="sep">
      <Button id="sep-a" label="Cut" style="outline" />
      <Button id="sep-b" label="Copy" style="outline" />
      <ButtonGroupSeparator id="sep-1" />
      <Button id="sep-c" label="Paste" style="outline" />
    </ButtonGroup>
  ),
};

export const SplitButton: Story = {
  render: () => (
    <ButtonGroup id="split">
      <Button id="split-a" label="Save changes" />
      <Button
        id="split-b"
        iconOnly
        IconCenter={ChevronDown}
        aria-label="More save options"
      />
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <ButtonGroup id="txt">
      <ButtonGroupText id="txt-label">Sort by</ButtonGroupText>
      <Button id="txt-a" label="Name" style="outline" />
      <Button id="txt-b" label="Date" style="outline" />
      <Button id="txt-c" label="Size" style="outline" />
    </ButtonGroup>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <ButtonGroup id="icn">
      <Button
        id="icn-a"
        style="outline"
        iconOnly
        IconCenter={Copy}
        aria-label="Copy"
      />
      <Button
        id="icn-b"
        style="outline"
        iconOnly
        IconCenter={Copy}
        aria-label="Duplicate"
      />
      <Button
        id="icn-c"
        style="outline"
        iconOnly
        IconCenter={Copy}
        aria-label="Fork"
      />
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      <ButtonGroup id="sz-sm">
        <Button id="sm-1" size="small" label="Left" style="outline" />
        <Button id="sm-2" size="small" label="Middle" style="outline" />
        <Button id="sm-3" size="small" label="Right" style="outline" />
      </ButtonGroup>
      <ButtonGroup id="sz-md">
        <Button id="md-1" size="default" label="Left" style="outline" />
        <Button id="md-2" size="default" label="Middle" style="outline" />
        <Button id="md-3" size="default" label="Right" style="outline" />
      </ButtonGroup>
      <ButtonGroup id="sz-lg">
        <Button id="lg-1" size="large" label="Left" style="outline" />
        <Button id="lg-2" size="large" label="Middle" style="outline" />
        <Button id="lg-3" size="large" label="Right" style="outline" />
      </ButtonGroup>
    </div>
  ),
};
