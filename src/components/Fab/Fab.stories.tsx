import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MessageSquarePlus, Plus, Sparkles } from 'lucide-react';
import Fab from './Fab';
import CloseButton from '../CloseButton/CloseButton';
import Avatar from '../Avatar/Avatar';
import StatusDot from '../StatusDot/StatusDot';
import {
  ChatBubble,
  ChatComposer,
  ChatComposerActions,
  ChatComposerInput,
  ChatComposerSend,
  ChatMessage,
  ChatMessageList,
} from '../Chat/Chat';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Fab> = {
  title: 'Components/Fab',
  component: Fab,
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The floating action button — a viewport-pinned launcher for the one action ' +
        'that should always be within reach. Carries the Aiden gradient, which is ' +
        'rather the point of it.',
      tags: ['aiden', 'floating'],
      motion: {
        notes:
          'The pulse is three filled discs on staggered negative delays, so all three are mid-flight at once. ' +
          'They paint BENEATH the button face, which is a `::before` layer — a child otherwise paints over its ' +
          'parent background and the halo washes across the button on every cycle.',
        moments: [
          { trigger: 'Pulse', description: 'Rings expand and fade over `--duration-pulse`. Suppressed entirely when disabled — advertising an action you cannot take is worse than no halo.' },
          { trigger: 'Hover', description: 'Lifts to `scale(1.05)` and deepens to `--shadow-xl`.' },
        ],
      },
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The `error` fill is a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text colour was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
        },
        {
          date: '2026-07-30',
          summary:
            'Fixed the pulse washing a solid disc across the button on every cycle, and the previews that showed an empty card instead of the button.',
          detail:
            'The button face moved to a `::before` layer so the rings paint beneath it — a child always paints over its parent background, so filled rings at `inset: 0` covered the face, most visibly under `data-surface="aiden"` where the face is a gradient and the ring is solid. Stories now frame the FAB with `contain: layout`; `position: relative` never established a containing block for a fixed child, so every preview escaped its card. Note the flip side: `.ui-fab` must itself stay a containing block, so a specimen that needs the FAB in flow overrides to `position: relative` (with `inset: auto`), never `static`.',
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
    position: { control: 'inline-radio', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] },
    size: { control: 'inline-radio', options: ['default', 'lg'] },
    pulse: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Fab>;

// A FAB is `position: fixed`, so it anchors to the VIEWPORT unless an ancestor
// establishes a containing block. `position: relative` does NOT do that — only
// transform / filter / perspective / contain do. Without this every story's FAB
// escaped its example card and piled up in the corner of the Storybook iframe,
// leaving the cards looking empty. `contain: layout` is the cheapest opt-in.
// The width matters as much as the containment: the docs stage centres each story
// in a flex row, so a wrapper whose only content is an absolutely-positioned FAB
// shrinks to 0 and the "corner" it anchors to is a degenerate box. An explicit
// width with `maxWidth: 100%` gives it a real frame at any stage size.
const FRAME: React.CSSProperties = {
  position: 'relative',
  contain: 'layout',
  overflow: 'hidden',
  width: 560,
  maxWidth: '100%',
  borderRadius: 'var(--rounded-lg)',
};

// A light mock "host app" behind the FAB, so the launcher reads in context.
const HostApp = ({ children }: { children: React.ReactNode }) => (
  <div style={{ ...FRAME, minHeight: 460, background: 'var(--muted)' }}>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--p-8)', display: 'grid', gap: 'var(--p-4)' }}>
      <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' }}>
        Dartboards
      </h1>
      <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
        A host application. Aiden rides along in the corner — tap it to chat without leaving the page.
      </p>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 96,
            background: 'var(--card)',
            border: 'var(--border-w-100) solid var(--border)',
            borderRadius: 'var(--rounded-lg)',
          }}
        />
      ))}
    </div>
    {children}
  </div>
);

// ── The Aiden launcher: FAB opens an embedded chat window ─────────────────────

function AidenChatWidget({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('');
  return (
    <div
      data-surface="aiden"
      style={{
        position: 'fixed',
        bottom: 'var(--p-6)',
        right: 'var(--p-6)',
        width: 380,
        height: 520,
        zIndex: 'var(--z-80)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--popover)',
        color: 'var(--popover-foreground)',
        border: 'var(--border-w-100) solid var(--border)',
        borderRadius: 'var(--rounded-xl)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-2)',
          padding: 'var(--p-3) var(--p-4)',
          borderBottom: 'var(--border-w-100) solid var(--border)',
          flexShrink: 0,
        }}
      >
        <Avatar id="widget-aiden" fallback="AI" size="sm" aria-label="Aiden" />
        <strong style={{ flex: 1, fontSize: 'var(--text-sm)' }}>Aiden</strong>
        <StatusDot status="online" label="Online" />
        <CloseButton id="widget-close" onClick={onClose} ariaLabel="Close Aiden" />
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <ChatMessageList>
          <ChatMessage from="assistant">
            <ChatBubble>Hi! I’m Aiden. Ask me anything about this page — I can search, run tools, and hand back files.</ChatBubble>
          </ChatMessage>
          <ChatMessage from="user">
            <ChatBubble>What does this dashboard track?</ChatBubble>
          </ChatMessage>
          <ChatMessage from="assistant">
            <ChatBubble>This space tracks phone-analytics KPIs — call volume, average handle time, and CSAT — refreshed hourly.</ChatBubble>
          </ChatMessage>
        </ChatMessageList>
      </div>

      <footer style={{ padding: 'var(--p-3)', borderTop: 'var(--border-w-100) solid var(--border)', flexShrink: 0 }}>
        <ChatComposer value={value} onValueChange={setValue} onSubmit={() => setValue('')}>
          <ChatComposerInput placeholder="Message Aiden…" aria-label="Message Aiden" />
          <ChatComposerActions>
            <ChatComposerSend />
          </ChatComposerActions>
        </ChatComposer>
      </footer>
    </div>
  );
}

export const AidenLauncher: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <HostApp>
        <div data-surface="aiden">
          {!open && (
            <Fab
              id="aiden-fab"
              position="bottom-right"
              pulse
              badge="2"
              aria-label="Ask Aiden — 2 new messages"
              onClick={() => setOpen(true)}
            >
              <Sparkles />
            </Fab>
          )}
        </div>
        {open && <AidenChatWidget onClose={() => setOpen(false)} />}
      </HostApp>
    );
  },
};

// ── Reference / states ───────────────────────────────────────────────────────

export const Playground: Story = {
  args: { id: 'fab-pg', position: 'bottom-right', size: 'lg', pulse: true, badge: '2' },
  render: (args) => (
    <HostApp>
      <div data-surface="aiden">
        <Fab {...args} aria-label="Ask Aiden">
          <Sparkles />
        </Fab>
      </div>
    </HostApp>
  ),
};

export const NeutralVsAiden: Story = {
  name: 'Neutral vs Aiden',
  render: () => (
    <div style={{ ...FRAME, minHeight: 460, background: 'var(--background)' }}>
      {/* Neutral (host brand primary) — bottom-left */}
      <Fab id="fab-neutral" position="bottom-left" aria-label="New message">
        <MessageSquarePlus />
      </Fab>
      {/* Aiden gradient + pulse — bottom-right */}
      <div data-surface="aiden">
        <Fab id="fab-aiden" position="bottom-right" pulse badge="2" aria-label="Ask Aiden">
          <Sparkles />
        </Fab>
      </div>
      <p style={{ padding: 'var(--p-8)', margin: 0, color: 'var(--muted-foreground)', maxWidth: 480 }}>
        Same component. Left: neutral, reads the host brand’s <code>--primary</code>. Right: wrapped in{' '}
        <code>data-surface=&quot;aiden&quot;</code> — the gradient fill + pulsing rings are Aiden’s signature.
      </p>
    </div>
  ),
};

export const Plain: Story = {
  name: 'Plain (no pulse / badge)',
  render: () => (
    <div style={{ ...FRAME, minHeight: 460, background: 'var(--background)' }}>
      <Fab id="fab-plain" position="bottom-right" size="default" aria-label="Add">
        <Plus />
      </Fab>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'A disabled FAB dims and stops responding, and `pulse` stops with it — ' +
          'sonar rings advertising an action you can’t take are worse than no rings ' +
          'at all. Since the FAB is usually the page’s single always-available ' +
          'action, prefer keeping it live and explaining the blocker on activation; ' +
          'reach for `disabled` only while something is genuinely in flight.',
      },
    },
  },
  // NB: the FABs below are laid out in flow so the two states sit side by side.
  // Use `position: relative`, never `static` — the face, rings and badge are
  // absolutely positioned against the button, and a static element is not a
  // containing block, so they escape and stretch to fill this wrapper instead.
  // `inset: auto` cancels the bottom/right offsets the --pos-* modifier sets.
  render: () => (
    <div
      style={{
        position: 'relative',
        height: 'var(--h-64)',
        display: 'flex',
        gap: 'var(--p-8)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'grid', gap: 'var(--p-2)', justifyItems: 'center' }}>
        <Fab
          id="fab-live"
          aria-label="Ask Aiden"
          pulse
          style={{ position: 'relative', inset: 'auto' }}
        >
          <Sparkles />
        </Fab>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          live
        </span>
      </div>
      <div style={{ display: 'grid', gap: 'var(--p-2)', justifyItems: 'center' }}>
        <Fab
          id="fab-disabled"
          aria-label="Ask Aiden (unavailable)"
          pulse
          disabled
          style={{ position: 'relative', inset: 'auto' }}
        >
          <Sparkles />
        </Fab>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          disabled
        </span>
      </div>
    </div>
  ),
};
