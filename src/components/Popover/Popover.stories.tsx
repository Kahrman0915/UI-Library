import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Settings2 } from 'lucide-react';
import Popover, { PopoverTrigger, PopoverContent, PopoverClose } from './Popover';
import Button from '../Button';
import Input from '../Input';
import Label from '../Label';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A floating panel anchored to a trigger, for content the user clicks open — a ' +
        'small form, a filter, a set of options too rich for a menu.',
      tags: ['compound', '4 parts', 'portal'],
    } satisfies UiDocsParameters,
  },
  args: {
    id: 'story-popover',
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Playground: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger>
        <Button id="pg-trigger" label="Open popover" />
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
          <div
            style={{
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)',
            }}
          >
            Popover title
          </div>
          <div style={{ color: 'var(--muted-foreground)' }}>
            Anything can live inside a popover — text, form fields, buttons.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover id="dimensions">
      <PopoverTrigger>
        <Button
          id="dim-trigger"
          label="Dimensions"
          style="outline"
          IconLeft={Settings2}
        />
      </PopoverTrigger>
      <PopoverContent>
        <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
          <div>
            <div
              style={{
                fontWeight: 'var(--font-medium)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Dimensions
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
              }}
            >
              Set the box size.
            </div>
          </div>
          <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                alignItems: 'center',
                gap: 'var(--p-2)',
              }}
            >
              <Label htmlFor="w">Width</Label>
              <Input id="w" defaultValue="100%" />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr',
                alignItems: 'center',
                gap: 'var(--p-2)',
              }}
            >
              <Label htmlFor="h">Height</Label>
              <Input id="h" defaultValue="25px" />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--p-2)',
            }}
          >
            <PopoverClose>
              <Button id="dim-cancel" label="Cancel" style="ghost" />
            </PopoverClose>
            <PopoverClose>
              <Button id="dim-save" label="Save" />
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 'var(--p-4)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-sm)' }}>
          External state: <strong>{open ? 'open' : 'closed'}</strong>
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'center' }}>
          <Button
            id="ctrl-toggle"
            label={open ? 'Force close' : 'Force open'}
            style="outline"
            onClick={() => setOpen(!open)}
          />
          <Popover id="ctrl" open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <Button id="ctrl-anchor" label="Anchor" />
            </PopoverTrigger>
            <PopoverContent>
              This popover's open state is fully controlled by the parent.
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  },
};

export const AllSides: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-4)',
        gridTemplateColumns: 'repeat(2, 1fr)',
        maxWidth: 'var(--max-w-md)',
        margin: '120px auto',
      }}
    >
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side} id={`side-${side}`}>
          <PopoverTrigger>
            <Button id={`side-t-${side}`} label={side} style="outline" />
          </PopoverTrigger>
          <PopoverContent side={side}>
            Anchored on the <strong>{side}</strong> of the trigger.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const AllAlignments: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--p-4)',
        justifyContent: 'center',
        margin: '80px 0',
      }}
    >
      {(['start', 'center', 'end'] as const).map((align) => (
        <Popover key={align} id={`align-${align}`}>
          <PopoverTrigger>
            <Button
              id={`align-t-${align}`}
              label={`align: ${align}`}
              style="outline"
            />
          </PopoverTrigger>
          <PopoverContent align={align}>
            Aligned to the <strong>{align}</strong>.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
