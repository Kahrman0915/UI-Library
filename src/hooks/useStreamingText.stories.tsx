import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useStreamingText } from './useStreamingText';
import Chat, { ChatBubble, ChatMessage, ChatMessageList } from '../components/Chat/Chat';

/**
 * `useStreamingText` types out a target string progressively and reports
 * `isStreaming` — pair it with `ChatBubble`'s `streaming` caret for a live
 * "assistant is answering" effect. Press replay to restart.
 */
const meta: Meta = {
  title: 'Hooks/useStreamingText',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const ANSWER =
  'Sure — flexbox centers a child in two lines: set the parent to ' +
  'display: flex, then justify-content: center and align-items: center. ' +
  'Grid is even shorter: display: grid; place-items: center.';

const Demo = () => {
  const [nonce, setNonce] = useState(0);
  // Re-mount on replay so the reveal restarts from zero.
  return <Runner key={nonce} onReplay={() => setNonce((n) => n + 1)} />;
};

const Runner = ({ onReplay }: { onReplay: () => void }) => {
  const { text, isStreaming } = useStreamingText(ANSWER, {
    charsPerTick: 1,
    intervalMs: 18,
  });
  return (
    <div style={{ width: 520 }}>
      <div
        style={{
          height: 200,
          border: '1px solid var(--border)',
          borderRadius: 'var(--rounded-xl)',
          overflow: 'hidden',
          background: 'var(--background)',
          marginBottom: 'var(--p-3)',
        }}
      >
        <Chat style={{ height: '100%' }}>
          <ChatMessageList>
            <ChatMessage from="assistant">
              <ChatBubble streaming={isStreaming}>{text}</ChatBubble>
            </ChatMessage>
          </ChatMessageList>
        </Chat>
      </div>
      <button
        type="button"
        onClick={onReplay}
        className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
      >
        Replay
      </button>
    </div>
  );
};

export const Playground: Story = {
  render: () => <Demo />,
};
