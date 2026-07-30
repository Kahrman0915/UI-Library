import type { Meta, StoryObj } from '@storybook/react';
import { Info } from 'lucide-react';
import Tooltip, { TooltipTrigger, TooltipContent } from './Tooltip';
import Button from '../Button/Button';
import type { TooltipSide, TooltipAlign } from './Tooltip.types';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A short label describing what a control does, shown on hover or focus. For ' +
        'anything richer — or anything the user needs to click into — use `HoverCard` ' +
        'or `Popover`. Deliberately never picks up the brand theme.',
      tags: ['compound', '3 parts', 'portal'],
      motion: {
        notes:
          'The one component with a hand-rolled `closed → open → closing` state machine predating the shared ' +
          'overlay utility. It keeps the portal mounted through the exit so the tip does not vanish mid-fade.',
        moments: [
          { trigger: 'Open', description: 'Fades and slides `--motion-slide-sm` from the trigger, direction chosen by `side`.' },
          { trigger: 'Close', description: 'Plays the exit, then unmounts on `animationend` — backed by a duration timer, because that event never fires under reduced motion or on a backgrounded tab.' },
        ],
      },
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
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    sideOffset: { control: 'number' },
    delayDuration: { control: 'number' },
    disabled: { control: 'boolean' },
    children: { control: false, table: { disable: true } },
  },
  args: {
    id: 'story-tooltip',
    side: 'top',
    align: 'center',
    sideOffset: 6,
    delayDuration: 400,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger>
        <Button id="tooltip-btn" label="Hover me" />
      </TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  ),
};

const sides: TooltipSide[] = ['top', 'right', 'bottom', 'left'];

export const AllSides: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, auto)',
        gap: 96,
        placeItems: 'center',
      }}
    >
      {sides.map((side) => (
        <Tooltip key={side} id={`ts-${side}`} side={side} delayDuration={0}>
          <TooltipTrigger>
            <Button id={`tb-${side}`} label={side} style="outline" />
          </TooltipTrigger>
          <TooltipContent>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

const alignments: TooltipAlign[] = ['start', 'center', 'end'];

export const Alignments: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
      {alignments.map((align) => (
        <Tooltip
          key={align}
          id={`ta-${align}`}
          side="top"
          align={align}
          delayDuration={0}
        >
          <TooltipTrigger>
            <Button
              id={`ta-b-${align}`}
              label={`align="${align}"`}
              style="outline"
            />
          </TooltipTrigger>
          <TooltipContent>
            The quick brown fox jumps over the lazy dog.
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip id="long-tt" delayDuration={0}>
      <TooltipTrigger>
        <Button id="long-btn" label="Long tooltip" style="outline" />
      </TooltipTrigger>
      <TooltipContent>
        This is a longer tooltip message that wraps across multiple lines. It
        stays inside the max-width and remains anchored to the trigger.
      </TooltipContent>
    </Tooltip>
  ),
};

export const OnIcon: Story = {
  render: () => (
    <Tooltip id="icon-tt" delayDuration={0}>
      <TooltipTrigger>
        <Button
          id="info-btn"
          iconOnly
          IconCenter={Info}
          style="outline"
          size="sm"
          aria-label="More info"
        />
      </TooltipTrigger>
      <TooltipContent>Reports refresh every 5 minutes.</TooltipContent>
    </Tooltip>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tooltip id="dis-tt" disabled delayDuration={0}>
      <TooltipTrigger>
        <Button id="dis-btn" label="Tooltip disabled" style="outline" />
      </TooltipTrigger>
      <TooltipContent>You should not see me.</TooltipContent>
    </Tooltip>
  ),
};
