import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Dialog, { DialogHeader, DialogBody, DialogFooter } from './Dialog';
import Button from '../Button/Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A modal window that interrupts the page for one focused task. Traps focus, ' +
        'locks scroll, closes on Escape or an outside click, and returns focus to ' +
        'whatever opened it. For a plain confirm/cancel prompt use `AlertDialog`.',
      tags: ['compound', 'modal', 'portal'],
      changelog: [
        {
          date: '2026-10-03',
          summary: '`DialogHeader` takes its ids from the `Dialog`, so its `id` is optional and can no longer leave the dialog unnamed.',
          detail: 'Dialog shares its own `id` through context, and DialogHeader seeds `{id}-title` / `{id}-description` from it — the ids the Dialog\'s `aria-labelledby` / `aria-describedby` look for. A header given a different id used to produce a dialog with no accessible name and no warning. DialogHeaderProps\' `id` is now optional and only used outside a Dialog. New story: HeaderIdFromDialog.',
        },
        {
          date: '2026-10-03',
          summary: 'Portaled surfaces carry the theme of the section that opened them.',
          detail: 'The surface renders into `document.body`, outside the subtree that opened it, so a menu opened inside `<section data-theme="rm">` used to render in the page\'s theme. A hidden marker now sits where the component is and, while the surface is open, the nearest `data-mode` / `data-theme` / `data-tint` / `data-density` / `data-surface` above it is stamped on the portal root (`usePortalScope`). Values on `<html>` are skipped — the portal inherits those already. Spread before `...rest`, so a consumer\'s own `data-theme` still wins.',
        },
        {
          date: '2026-09-09',
          summary:
            'New part: `DialogMedia`, the full-bleed media region for a clip or image.',
          detail:
            'Composes `AspectRatio` (default `16 / 9`) and is placed by the caller, so media can sit above the header, between header and body, or last. It touches the panel edges and inherits the panel rounding from `.ui-dialog`\'s `overflow: hidden`; media followed by a body or footer draws the same hairline a header carries downward. Same contract as `CardMedia`. `Announcement` is the first consumer.',
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

/**
 * The header takes its ids from the Dialog, so it needs no `id` of its own — and a
 * mismatched one can no longer leave the dialog unnamed. The title here is still
 * the dialog's accessible name (`header-id-dialog-title`).
 */
export const HeaderIdFromDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button id="open-header-id" label="Open dialog" onClick={() => setOpen(true)} />
        <Dialog id="header-id-dialog" open={open} onClose={() => setOpen(false)}>
          <DialogHeader title="Rename space" description="The new name shows everywhere the space is listed." onClose={() => setOpen(false)} />
          <DialogBody>
            <p>No id on the header: it reads the Dialog&apos;s.</p>
          </DialogBody>
          <DialogFooter>
            <Button id="header-id-cancel" label="Cancel" style="ghost" onClick={() => setOpen(false)} />
            <Button id="header-id-save" label="Save" onClick={() => setOpen(false)} />
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};

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
