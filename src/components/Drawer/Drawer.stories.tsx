import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Drawer, { DrawerHeader, DrawerBody, DrawerFooter } from './Drawer';
import Button from '../Button/Button';
import Input from '../Input/Input';
import type { DrawerSide } from './Drawer.types';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A panel that slides in from any edge. Reuses Dialog’s focus trap, scroll ' +
        'lock and Escape handling, and unlike the other portals it animates out ' +
        'before unmounting.',
      tags: ['compound', 'modal', '4 sides'],
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
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'] satisfies DrawerSide[],
    },
    open: { table: { disable: true } },
    onClose: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: { id: 'story-drawer', side: 'right' },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-drawer"
          label="Open drawer"
          onClick={() => setOpen(true)}
        />
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <DrawerHeader
            id={args.id}
            title="Edit profile"
            description="Update your details and save when you're done."
            onClose={() => setOpen(false)}
          />
          <DrawerBody>
            <Input id="d-name" label="Name" placeholder="Ada Lovelace" />
            <Input id="d-email" label="Email" placeholder="ada@example.com" />
            <p>Changes are saved to your account immediately.</p>
          </DrawerBody>
          <DrawerFooter>
            <Button
              id="d-cancel"
              label="Cancel"
              style="ghost"
              onClick={() => setOpen(false)}
            />
            <Button
              id="d-save"
              label="Save changes"
              onClick={() => setOpen(false)}
            />
          </DrawerFooter>
        </Drawer>
      </>
    );
  },
};

export const Sides: Story = {
  render: () => {
    // `side` stays fixed on the last-opened edge so the slide-out animates back
    // the way it came in; `open` alone toggles visibility.
    const [side, setSide] = useState<DrawerSide>('right');
    const [open, setOpen] = useState(false);
    const sides: DrawerSide[] = ['top', 'right', 'bottom', 'left'];

    return (
      <div style={{ display: 'flex', gap: 'var(--p-3)', flexWrap: 'wrap' }}>
        {sides.map((s) => (
          <Button
            key={s}
            id={`open-${s}`}
            label={`From ${s}`}
            style="outline"
            onClick={() => {
              setSide(s);
              setOpen(true);
            }}
          />
        ))}
        <Drawer
          id="sides-drawer"
          side={side}
          open={open}
          onClose={() => setOpen(false)}
        >
          <DrawerHeader
            id="sides-drawer"
            title={`${side} drawer`}
            description="Slides in from the chosen edge."
            onClose={() => setOpen(false)}
          />
          <DrawerBody>
            <p>
              This panel slides in from the <strong>{side}</strong> edge and
              slides back out the same way on close. Press Escape or click the
              backdrop to dismiss.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button
              id="sides-close"
              label="Close"
              onClick={() => setOpen(false)}
            />
          </DrawerFooter>
        </Drawer>
      </div>
    );
  },
};

export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Only `DrawerBody` scrolls. The header and footer are `flex-shrink: 0` ' +
          'outside the scroll container, so they stay put without needing ' +
          '`position: sticky` — scroll to the bottom and neither moves. Same ' +
          'structure as `Dialog`.',
      },
    },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-long"
          label="Open long drawer"
          onClick={() => setOpen(true)}
        />
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <DrawerHeader
            id={args.id}
            title="Release notes"
            description="Stays pinned while the body scrolls."
            onClose={() => setOpen(false)}
          />
          <DrawerBody>
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i} style={{ margin: 0 }}>
                <strong>2026.{12 - i}</strong> — Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris.
              </p>
            ))}
          </DrawerBody>
          <DrawerFooter>
            <Button id="long-close" label="Done" onClick={() => setOpen(false)} />
          </DrawerFooter>
        </Drawer>
      </>
    );
  },
};

export const NoCloseButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Dropping the header X leaves Escape and the backdrop as the ways out — ' +
          'both still work, and focus still returns to the trigger. Use this when ' +
          'the footer carries the real decision, so the X can’t be mistaken for ' +
          '"cancel". If you want to remove *every* casual dismissal, use ' +
          '`AlertDialog` instead: it locks off both the X and the backdrop.',
      },
    },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-noclose"
          label="Open drawer"
          onClick={() => setOpen(true)}
        />
        <Drawer {...args} open={open} onClose={() => setOpen(false)}>
          <DrawerHeader
            id={args.id}
            title="Choose a plan"
            description="Pick one to continue."
            showCloseButton={false}
          />
          <DrawerBody>
            <p style={{ margin: 0 }}>
              There is no X in the header. Escape and the backdrop still close
              the panel.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button
              id="noclose-cancel"
              label="Not now"
              style="ghost"
              onClick={() => setOpen(false)}
            />
            <Button
              id="noclose-ok"
              label="Choose plan"
              onClick={() => setOpen(false)}
            />
          </DrawerFooter>
        </Drawer>
      </>
    );
  },
};
