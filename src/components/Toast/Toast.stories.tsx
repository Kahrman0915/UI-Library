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
      motion: {
        notes:
          'Enters from the stack edge and, on dismiss, recedes rather than vanishing — the Toaster keeps the ' +
          'card mounted for `--duration-normal` so the exit can play before removal.',
        moments: [
          { trigger: 'Enter', description: 'Slides `--motion-slide-md` with a `--ease-spring` settle.' },
          { trigger: 'Dismiss', description: 'Fades and shrinks; `forwards` parks it invisible so there is no flash before unmount.' },
        ],
      },
      changelog: [
        {
          date: '2026-10-03',
          summary: 'New `@ui/lib/toast` import path for `toast()` and `<Toaster>`, so they can be imported without the package barrel.',
          detail: 'A third build entry (`src/toast.ts`) with its own `exports` key. It shares the toast store chunk with the main entry — verified in ESM and CJS that `toast` and `Toaster` from either path are the same functions — so a toast fired from one reaches a Toaster mounted from the other. Styles still come from `@ui/lib/styles.css`; no entry carries CSS.',
        },
        {
          date: '2026-10-03',
          summary: 'Portaled surfaces carry the theme of the section that opened them.',
          detail: 'The surface renders into `document.body`, outside the subtree that opened it, so a menu opened inside `<section data-theme="rm">` used to render in the page\'s theme. A hidden marker now sits where the component is and, while the surface is open, the nearest `data-mode` / `data-theme` / `data-tint` / `data-density` / `data-surface` above it is stamped on the portal root (`usePortalScope`). Values on `<html>` are skipped — the portal inherits those already. Spread before `...rest`, so a consumer\'s own `data-theme` still wins.',
        },
        {
          date: '2026-09-02',
          summary:
            'The `error` variant is a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text color was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
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
