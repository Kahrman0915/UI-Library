import type { Meta, StoryObj } from '@storybook/react';
import { CircleCheck, Info, TriangleAlert, CircleX } from 'lucide-react';
import Toaster from './Toaster';
import { toast } from './toast';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toast',
  component: Toaster,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'Transient notifications, driven imperatively: render `<Toaster>` once, then ' +
        'call `toast()` from anywhere. For a message that belongs beside the thing it ' +
        'describes, use `Alert`.',
      tags: ['imperative', 'portal'],
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
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    visibleToasts: { control: { type: 'number', min: 1, max: 6 } },
    gap: { control: { type: 'number', min: 0, max: 32 } },
  },
  args: {
    position: 'bottom-right',
    visibleToasts: 3,
    gap: 8,
  },
};

export default meta;

type Story = StoryObj<typeof Toaster>;

// Shared launch pad — every story renders <Toaster/> plus a row of buttons.
const Buttons = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>
);

const Btn = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    style={{
      padding: '8px 12px',
      borderRadius: 8,
      border: 'var(--border-w-100) solid var(--border)',
      background: 'var(--background)',
      color: 'var(--foreground)',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      cursor: 'pointer',
    }}
  />
);

export const Playground: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons>
        <Btn onClick={() => toast('Event saved.')}>Default</Btn>
        <Btn
          onClick={() =>
            toast('Event saved.', {
              description: 'Kickoff synced to your calendar.',
            })
          }
        >
          With description
        </Btn>
      </Buttons>
    </>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons>
        <Btn
          onClick={() =>
            toast.success('Draft published.', {
              Icon: CircleCheck,
              description: '2 minutes ago · main',
            })
          }
        >
          Success
        </Btn>
        <Btn
          onClick={() =>
            toast.info('New version 4.1 is available.', {
              Icon: Info,
              description: 'Reload to pick up the update.',
            })
          }
        >
          Info
        </Btn>
        <Btn
          onClick={() =>
            toast.warning('Usage at 92%.', {
              Icon: TriangleAlert,
              description: 'You are approaching the monthly quota.',
            })
          }
        >
          Warning
        </Btn>
        <Btn
          onClick={() =>
            toast.error('Failed to publish.', {
              Icon: CircleX,
              description: 'Check the console for details.',
            })
          }
        >
          Error
        </Btn>
      </Buttons>
    </>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons>
        <Btn
          onClick={() =>
            toast('Email archived.', {
              description: 'You can restore this from Trash.',
              action: {
                label: 'Undo',
                onClick: () => toast.success('Restored to inbox.'),
              },
            })
          }
        >
          With undo
        </Btn>
        <Btn
          onClick={() =>
            toast.warning('Delete this project?', {
              Icon: TriangleAlert,
              cancel: { label: 'Cancel' },
              action: {
                label: 'Delete',
                onClick: () => toast.error('Deleted.'),
              },
              duration: Infinity,
            })
          }
        >
          Confirm action
        </Btn>
      </Buttons>
    </>
  ),
};

export const PromiseFlow: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons>
        <Btn
          onClick={() =>
            toast.promise(
              new Promise((resolve: (v: string) => void) =>
                setTimeout(() => resolve('report.pdf'), 1500),
              ),
              {
                loading: 'Rendering report…',
                success: (name) => `Rendered ${name}.`,
                error: 'Failed to render.',
              },
            )
          }
        >
          Fire promise (resolves)
        </Btn>
        <Btn
          onClick={() =>
            toast.promise(
              new Promise(
                (_resolve: (v: unknown) => void, reject: (err: Error) => void) =>
                  setTimeout(() => reject(new Error('boom')), 1500),
              ),
              {
                loading: 'Uploading…',
                success: 'Uploaded.',
                error: (err) =>
                  err instanceof Error ? err.message : 'Failed.',
              },
            )
          }
        >
          Fire promise (rejects)
        </Btn>
      </Buttons>
    </>
  ),
};

export const WithProgress: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons>
        <Btn
          onClick={() => {
            let pct = 0;
            toast('Uploading assets…', {
              id: 'upload-progress',
              progress: 0,
              duration: Infinity,
            });
            const timer = setInterval(() => {
              pct += 10;
              if (pct >= 100) {
                clearInterval(timer);
                toast.success('Upload complete.', { id: 'upload-progress' });
                return;
              }
              toast('Uploading assets…', {
                id: 'upload-progress',
                description: `${pct}% of 24 MB`,
                progress: pct,
                duration: Infinity,
              });
            }, 400);
          }}
        >
          Simulate upload
        </Btn>
      </Buttons>
    </>
  ),
};

export const StackOverflow: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Buttons>
        <Btn
          onClick={() => {
            for (let i = 1; i <= 6; i++) {
              setTimeout(
                () => toast(`Notification #${i}`, { description: 'Stacking…' }),
                i * 120,
              );
            }
          }}
        >
          Fire 6 in quick succession
        </Btn>
        <Btn onClick={() => toast.dismiss()}>Dismiss all</Btn>
      </Buttons>
    </>
  ),
};

export const AllPositions: Story = {
  args: { position: 'top-right' },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <>
      <Toaster position="top-left" />
      <Toaster position="top-center" />
      <Toaster position="top-right" />
      <Toaster position="bottom-left" />
      <Toaster position="bottom-center" />
      <Toaster position="bottom-right" />
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          padding: 24,
        }}
      >
        <Btn
          onClick={() =>
            toast.success('This fires once — all 6 Toasters catch it.', {
              description: 'Only mount one Toaster per page in real apps.',
            })
          }
        >
          Fire a toast (renders in every corner)
        </Btn>
      </div>
    </>
  ),
};
