import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Drawer, { DrawerHeader, DrawerBody, DrawerFooter } from './Drawer';
import Button from '../Button/Button';
import Input from '../Input/Input';
import type { DrawerSide } from './Drawer.types';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: { layout: 'centered' },
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
