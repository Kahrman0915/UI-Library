import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Dialog, { DialogHeader, DialogBody, DialogFooter } from './Dialog';
import Button from '../Button/Button';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: { layout: 'centered' },
  argTypes: {
    open: { control: 'boolean' },
    closeOnOutsideClick: { control: 'boolean' },
    inline: { control: 'boolean' },
    onClose: { action: 'closed' },
    children: { control: false, table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-basic"
          label="Open dialog"
          onClick={() => setOpen(true)}
        />
        <Dialog
          id="basic-dialog"
          open={open}
          onClose={() => setOpen(false)}
        >
          <DialogHeader
            id="basic-dialog"
            title="Delete report"
            description="This action can't be undone. The report will be permanently removed."
            onClose={() => setOpen(false)}
          />
          <DialogBody>
            <p>
              Once deleted, any dashboards linking to this report will show a
              broken reference. Team members with the direct link will get a
              404.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              id="basic-cancel"
              label="Cancel"
              style="ghost"
              onClick={() => setOpen(false)}
            />
            <Button
              id="basic-delete"
              label="Delete"
              variant="error"
              onClick={() => setOpen(false)}
            />
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const CenterAligned: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-center"
          label="Open centered dialog"
          onClick={() => setOpen(true)}
        />
        <Dialog
          id="center-dialog"
          open={open}
          onClose={() => setOpen(false)}
        >
          <DialogHeader
            id="center-dialog"
            title="You're all set"
            description="Your workspace is ready to go."
            alignment="center"
            onClose={() => setOpen(false)}
          />
          <DialogBody alignment="center">
            <p>Head to the dashboard to invite your team and build your first report.</p>
          </DialogBody>
          <DialogFooter>
            <Button
              id="center-primary"
              label="Go to dashboard"
              onClick={() => setOpen(false)}
            />
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-long"
          label="Open long dialog"
          onClick={() => setOpen(true)}
        />
        <Dialog
          id="long-dialog"
          open={open}
          onClose={() => setOpen(false)}
        >
          <DialogHeader
            id="long-dialog"
            title="Terms of service"
            description="Please review before continuing."
            onClose={() => setOpen(false)}
          />
          <DialogBody>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                Section {i + 1}. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo
                consequat.
              </p>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button
              id="long-decline"
              label="Decline"
              style="ghost"
              onClick={() => setOpen(false)}
            />
            <Button
              id="long-accept"
              label="Accept"
              onClick={() => setOpen(false)}
            />
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const OutsideClickToClose: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-outside"
          label="Open (click outside to close)"
          onClick={() => setOpen(true)}
        />
        <Dialog
          id="outside-dialog"
          open={open}
          onClose={() => setOpen(false)}
          closeOnOutsideClick
        >
          <DialogHeader
            id="outside-dialog"
            title="Click outside or press Escape"
            onClose={() => setOpen(false)}
          />
          <DialogBody>
            <p>This dialog closes when you click the overlay behind it.</p>
          </DialogBody>
        </Dialog>
      </>
    );
  },
};

export const NoCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button
          id="open-no-close"
          label="Open (footer close only)"
          onClick={() => setOpen(true)}
        />
        <Dialog
          id="no-close-dialog"
          open={open}
          onClose={() => setOpen(false)}
        >
          <DialogHeader
            id="no-close-dialog"
            title="Confirm your choice"
            description="Use the footer buttons to make a decision."
            showCloseButton={false}
          />
          <DialogBody>
            <p>
              We don't render the close-X in the header — the user has to pick
              an option.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              id="no-close-cancel"
              label="Cancel"
              style="ghost"
              onClick={() => setOpen(false)}
            />
            <Button
              id="no-close-confirm"
              label="Confirm"
              onClick={() => setOpen(false)}
            />
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

export const Inline: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <span
        style={{
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted-foreground)',
        }}
      >
        <code>inline</code> renders the panel without the fixed overlay — useful
        for embedding in page layouts.
      </span>
      <Dialog
        id="inline-dialog"
        open
        onClose={() => {}}
        inline
      >
        <DialogHeader
          id="inline-dialog"
          title="Inline dialog"
          description="No overlay, no aria-modal — just a card."
          showCloseButton={false}
        />
        <DialogBody>
          <p>Great for confirmation panels inside a settings page.</p>
        </DialogBody>
        <DialogFooter>
          <Button id="inline-cancel" label="Cancel" style="ghost" />
          <Button id="inline-save" label="Save" />
        </DialogFooter>
      </Dialog>
    </div>
  ),
};
