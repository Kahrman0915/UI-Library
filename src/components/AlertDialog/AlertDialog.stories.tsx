import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AlertDialog, {
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from './AlertDialog';
import Button from '../Button/Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A modal that asks the user to confirm or cancel before something ' +
        'consequential happens. A thin preset of `Dialog` with the two carve-outs the ' +
        'pattern requires: `role="alertdialog"`, and no way to dismiss it by clicking ' +
        'away or pressing an X — the user has to answer.',
      tags: ['compound', 'modal', 'portal'],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const Confirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button id="open-confirm" label="Leave page" onClick={() => setOpen(true)} />
        <AlertDialog id="confirm" open={open} onClose={() => setOpen(false)}>
          <AlertDialogHeader
            id="confirm"
            title="Discard changes?"
            description="You have unsaved changes. If you leave now, they'll be lost."
          />
          <AlertDialogFooter>
            <Button id="confirm-cancel" style="ghost" label="Stay" onClick={() => setOpen(false)} />
            <Button id="confirm-ok" label="Discard" onClick={() => setOpen(false)} />
          </AlertDialogFooter>
        </AlertDialog>
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button id="open-del" variant="error" label="Delete workspace" onClick={() => setOpen(true)} />
        <AlertDialog id="del" open={open} onClose={() => setOpen(false)}>
          <AlertDialogHeader
            id="del"
            title="Delete workspace"
            description="This permanently deletes all projects, files, and members. This can't be undone."
          />
          <AlertDialogBody>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Type the workspace name to confirm in the next step.
            </p>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button id="del-cancel" style="ghost" label="Cancel" onClick={() => setOpen(false)} />
            <Button id="del-ok" variant="error" label="Delete workspace" onClick={() => setOpen(false)} />
          </AlertDialogFooter>
        </AlertDialog>
      </>
    );
  },
};

// Inline variant for a static, always-open demo (no portal).
export const Inline: Story = {
  render: () => (
    <AlertDialog id="inline" open inline onClose={() => {}}>
      <AlertDialogHeader
        id="inline"
        title="Turn off two-factor auth?"
        description="Your account will be less secure. We recommend keeping it on."
      />
      <AlertDialogFooter>
        <Button id="inline-cancel" style="ghost" label="Keep it on" />
        <Button id="inline-ok" variant="warning" label="Turn off" />
      </AlertDialogFooter>
    </AlertDialog>
  ),
};
