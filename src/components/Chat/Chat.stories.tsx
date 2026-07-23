import { useMemo } from 'react';
import { Copy, RefreshCw, ThumbsUp } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Chat, {
  ChatBubble,
  ChatMarker,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
} from './Chat';
import Avatar from '../Avatar/Avatar';
import { CodeBlock } from '../Code/Code';

const meta: Meta<typeof Chat> = {
  title: 'Components/Chat',
  component: Chat,
  parameters: { layout: 'centered' },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['compact', 'balanced', 'spacious'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Chat>;

const aiden = (
  <Avatar id="aiden-av" fallback="AI" size="sm" aria-label="Aiden" />
);

// A ghost action button for the hover row.
const ActionButton = ({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.FC;
}) => (
  <button
    type="button"
    aria-label={label}
    className="ui-button ui-button--default ui-button--default-ghost ui-button--sz-xsmall ui-button--icon-only"
  >
    <Icon />
  </button>
);

const frame = (children: React.ReactNode) => (
  <div
    style={{
      width: 520,
      height: 520,
      border: '1px solid var(--border)',
      borderRadius: 'var(--rounded-xl)',
      background: 'var(--background)',
      overflow: 'hidden',
      display: 'flex',
    }}
  >
    {children}
  </div>
);

// ── A full conversation ──────────────────────────────────────────────────────

export const Conversation: Story = {
  args: { density: 'balanced' },
  render: (args) =>
    frame(
      <Chat {...args} style={{ flex: 1 }}>
        <ChatMessageList>
          <ChatMarker variant="divider">Today</ChatMarker>

          <ChatMessage from="user">
            <ChatBubble>How do I center a div in CSS?</ChatBubble>
          </ChatMessage>

          <ChatMessage from="assistant" avatar={aiden}>
            <ChatBubble>
              <p>The modern way is a flex or grid parent:</p>
              <CodeBlock
                id="center-div"
                language="css"
                code={`.parent {\n  display: grid;\n  place-items: center;\n}`}
              />
            </ChatBubble>
            <ChatMessageActions>
              <ActionButton label="Copy" icon={Copy} />
              <ActionButton label="Regenerate" icon={RefreshCw} />
              <ActionButton label="Good response" icon={ThumbsUp} />
            </ChatMessageActions>
          </ChatMessage>

          <ChatMessage from="user">
            <ChatBubble>Perfect — and for a single line of text?</ChatBubble>
          </ChatMessage>

          <ChatMessage from="assistant" avatar={aiden}>
            <ChatBubble>
              Same idea, or add <code>text-align: center</code> for inline
              content. Grid <code>place-items</code> handles both axes at once.
            </ChatBubble>
          </ChatMessage>

          <ChatMarker variant="status" status="online">
            Aiden is online
          </ChatMarker>
        </ChatMessageList>
      </Chat>,
    ),
};

// ── Pending (typing) bubble ──────────────────────────────────────────────────

export const Pending: Story = {
  render: () =>
    frame(
      <Chat style={{ flex: 1 }}>
        <ChatMessageList>
          <ChatMessage from="user">
            <ChatBubble>Summarise the last quarter for me.</ChatBubble>
          </ChatMessage>
          <ChatMessage from="assistant" avatar={aiden}>
            <ChatBubble pending />
          </ChatMessage>
        </ChatMessageList>
      </Chat>,
    ),
};

// ── Markers ──────────────────────────────────────────────────────────────────

export const Markers: Story = {
  render: () =>
    frame(
      <Chat style={{ flex: 1 }}>
        <ChatMessageList>
          <ChatMarker variant="divider">Yesterday</ChatMarker>
          <ChatMessage from="user">
            <ChatBubble>Earlier message</ChatBubble>
          </ChatMessage>
          <ChatMarker variant="system">
            Aiden switched to the research model
          </ChatMarker>
          <ChatMessage from="assistant" avatar={aiden}>
            <ChatBubble>Here with more depth now.</ChatBubble>
          </ChatMessage>
          <ChatMarker variant="status" status="away">
            Aiden is away
          </ChatMarker>
        </ChatMessageList>
      </Chat>,
    ),
};

// ── Long scroll → auto-stick + jump button ───────────────────────────────────

export const LongScroll: Story = {
  render: () => {
    const items = useMemo(
      () => Array.from({ length: 24 }, (_, i) => i),
      [],
    );
    return frame(
      <Chat style={{ flex: 1 }}>
        <ChatMessageList>
          {items.map((n) =>
            n % 2 === 0 ? (
              <ChatMessage key={n} from="user">
                <ChatBubble>User message #{n + 1}</ChatBubble>
              </ChatMessage>
            ) : (
              <ChatMessage key={n} from="assistant" avatar={aiden}>
                <ChatBubble>Assistant reply #{n + 1}</ChatBubble>
              </ChatMessage>
            ),
          )}
        </ChatMessageList>
      </Chat>,
    );
  },
};
