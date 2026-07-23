import { useMemo, useRef, useState } from 'react';
import {
  Copy,
  FileText,
  Paperclip,
  RefreshCw,
  ThumbsUp,
  X,
} from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Chat, {
  ChatBubble,
  ChatComposer,
  ChatComposerActions,
  ChatComposerInput,
  ChatComposerSend,
  ChatMarker,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
} from './Chat';
import Avatar from '../Avatar/Avatar';
import { CodeBlock } from '../Code/Code';
import Attachment, {
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '../Attachment/Attachment';

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

// ── Composer ─────────────────────────────────────────────────────────────────

const AttachButton = () => (
  <button
    type="button"
    aria-label="Attach file"
    className="ui-button ui-button--default ui-button--default-ghost ui-button--sz-small ui-button--icon-only"
  >
    <Paperclip />
  </button>
);

const ComposerDemo = ({
  streaming = false,
  withAttachment = false,
}: {
  streaming?: boolean;
  withAttachment?: boolean;
}) => {
  const [value, setValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(streaming);

  return (
    <div style={{ width: 520 }}>
      <ChatComposer
        value={value}
        onValueChange={setValue}
        onSubmit={() => {
          setValue('');
          setIsStreaming(true);
        }}
        isStreaming={isStreaming}
        onStop={() => setIsStreaming(false)}
      >
        {withAttachment && (
          <AttachmentGroup>
            <Attachment size="xs">
              <AttachmentMedia variant="icon">
                <FileText />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>q3-report.pdf</AttachmentTitle>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove attachment">
                  <X />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </AttachmentGroup>
        )}
        <ChatComposerInput
          placeholder="Message Aiden…"
          aria-label="Message Aiden"
        />
        <ChatComposerActions>
          <AttachButton />
          <ChatComposerSend />
        </ChatComposerActions>
      </ChatComposer>
    </div>
  );
};

export const Composer: StoryObj = {
  render: () => <ComposerDemo />,
};

export const ComposerWithAttachment: StoryObj = {
  render: () => <ComposerDemo withAttachment />,
};

export const ComposerStreaming: StoryObj = {
  render: () => <ComposerDemo streaming />,
};

// ── Assembled: a working chat (list + composer wired together) ────────────────

type Msg = {
  id: string;
  from: 'user' | 'assistant';
  content?: string;
  pending?: boolean;
};

const AssembledDemo = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'm0', from: 'assistant', content: "Hi — I'm Aiden. Ask me anything." },
  ]);
  const [value, setValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const idRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const pendingId = `m${idRef.current++}-a`;
    setMessages((m) => [
      ...m,
      { id: `m${idRef.current++}-u`, from: 'user', content: trimmed },
      { id: pendingId, from: 'assistant', pending: true },
    ]);
    setValue('');
    setStreaming(true);
    timerRef.current = setTimeout(() => {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingId
            ? { ...msg, pending: false, content: `You said: "${trimmed}"` }
            : msg,
        ),
      );
      setStreaming(false);
    }, 1600);
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStreaming(false);
    setMessages((m) =>
      m.map((msg) =>
        msg.pending
          ? { ...msg, pending: false, content: '(stopped)' }
          : msg,
      ),
    );
  };

  return frame(
    <Chat density="balanced" style={{ flex: 1 }}>
      <ChatMessageList>
        {messages.map((msg) =>
          msg.from === 'user' ? (
            <ChatMessage key={msg.id} from="user">
              <ChatBubble>{msg.content}</ChatBubble>
            </ChatMessage>
          ) : (
            <ChatMessage key={msg.id} from="assistant" avatar={aiden}>
              <ChatBubble pending={msg.pending}>{msg.content}</ChatBubble>
            </ChatMessage>
          ),
        )}
      </ChatMessageList>
      <div
        style={{
          padding: 'var(--p-3)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <ChatComposer
          value={value}
          onValueChange={setValue}
          onSubmit={send}
          isStreaming={streaming}
          onStop={stop}
        >
          <ChatComposerInput
            placeholder="Message Aiden…"
            aria-label="Message Aiden"
          />
          <ChatComposerActions>
            <AttachButton />
            <ChatComposerSend />
          </ChatComposerActions>
        </ChatComposer>
      </div>
    </Chat>,
  );
};

export const Assembled: StoryObj = {
  render: () => <AssembledDemo />,
};
