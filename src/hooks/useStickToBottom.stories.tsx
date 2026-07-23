import { useState } from 'react';
import { ArrowDown } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import { useStickToBottom } from './useStickToBottom';
import '../components/Button/Button.scss';

/**
 * `useStickToBottom` keeps a scroll container pinned to the newest content as
 * it grows — the chat-transcript behaviour. Scroll up and it lets go (exposing
 * `isPinned=false` so you can show a jump button); scroll back down and it
 * re-pins. It powers `ChatMessageList`.
 */
const meta: Meta = {
  title: 'Hooks/useStickToBottom',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const note = (children: React.ReactNode) => (
  <p
    style={{
      margin: '0 0 12px 0',
      fontFamily: 'var(--font-family)',
      fontSize: 'var(--text-sm)',
      lineHeight: 1.6,
      color: 'var(--muted-foreground)',
      maxWidth: 520,
    }}
  >
    {children}
  </p>
);

const Demo = () => {
  const [lines, setLines] = useState<number[]>(
    Array.from({ length: 12 }, (_, i) => i),
  );
  const { ref, isPinned, scrollToBottom } = useStickToBottom<HTMLDivElement>([
    lines.length,
  ]);

  return (
    <div style={{ maxWidth: 420 }}>
      {note(
        <>
          Add lines — the view follows the bottom while pinned. Scroll up, then
          add more: it stays put and the jump button appears (
          <code>isPinned={String(isPinned)}</code>).
        </>,
      )}
      <div style={{ position: 'relative' }}>
        <div
          ref={ref}
          style={{
            height: 220,
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rounded-lg)',
            padding: 'var(--p-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--p-2)',
            background: 'var(--card)',
          }}
        >
          {lines.map((n) => (
            <div
              key={n}
              style={{
                fontFamily: 'var(--font-family)',
                fontSize: 'var(--text-sm)',
                color: 'var(--foreground)',
                padding: 'var(--p-2) var(--p-3)',
                borderRadius: 'var(--rounded-md)',
                background: 'var(--secondary)',
              }}
            >
              Message {n + 1}
            </div>
          ))}
        </div>
        {!isPinned && (
          <button
            type="button"
            aria-label="Scroll to latest"
            onClick={() => scrollToBottom()}
            className="ui-button ui-button--default ui-button--default-default ui-button--sz-small"
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              gap: 6,
            }}
          >
            <ArrowDown style={{ width: 14, height: 14 }} /> Latest
          </button>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setLines((l) => [...l, l.length])}
          className="ui-button ui-button--default ui-button--default-outline ui-button--sz-default"
        >
          Add message
        </button>
      </div>
    </div>
  );
};

export const Playground: Story = {
  render: () => <Demo />,
};
