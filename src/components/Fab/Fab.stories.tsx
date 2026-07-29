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

// A light mock "host app" behind the FAB, so the launcher reads in context.
const HostApp = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', background: 'var(--muted)' }}>
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
    <div style={{ minHeight: '100vh', background: 'var(--background)', position: 'relative' }}>
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
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
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
          style={{ position: 'static' }}
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
          style={{ position: 'static' }}
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
