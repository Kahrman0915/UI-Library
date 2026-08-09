import { useMemo, useRef, useState } from 'react';
import {
  Copy,
  FileText,
  Paperclip,
  Pencil,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  X,
} from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import ChatMessageAction from './ChatMessageAction';
import ChatComposerMenu from './ChatComposerMenu';
import ChatArtifact, { ChatArtifactCard } from './ChatArtifact';
import ChatLayoutAside from './ChatLayoutAside';
import ChatModelPicker from './ChatModelPicker';
import ChatError from './ChatError';
import ChatDisclaimer from './ChatDisclaimer';
import Chat, {
  ChatBubble,
  ChatCitation,
  ChatComposer,
  ChatComposerActions,
  ChatComposerDictation,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatComposerSend,
  ChatGreeting,
  ChatLayout,
  ChatLayoutBody,
  ChatLayoutFooter,
  ChatLayoutHeader,
  ChatMarker,
  ChatMessage,
  ChatMessageActions,
  ChatMessageEdit,
  ChatMessageList,
  ChatMessageVersions,
  ChatReasoning,
  ChatSource,
  ChatSources,
  ChatSuggestion,
  ChatSuggestions,
  ChatToolCall,
  ChatToolCalls,
} from './Chat';
import { CodeBlock } from '../Code/Code';
import Attachment, {
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '../Attachment/Attachment';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Chat> = {
  title: 'Components/Chat',
  component: Chat,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'The Aiden assistant chat family — transcript, composer, tool calls, ' +
        'reasoning, citations and the full-page shell. Modelled on the Claude ' +
        'conversation UI: assistant turns are full-width bubble-less prose, user ' +
        'turns are contained bubbles on the trailing edge. Message content is yours ' +
        'to provide; there is no Markdown parser, which would mean a dependency.',
      tags: ['compound', 'aiden', '26 parts'],
      changelog: [
        {
          date: '2026-08-09',
          summary:
            'Three new parts: `ChatMessageAction` (the copy / regenerate / thumbs icon ' +
            'button the stories used to hand-roll), `ChatError` (a failed reply with ' +
            'Retry), and `ChatDisclaimer` (the caveat line under the composer).',
          detail:
            '`ChatMessageAction` rides the shared `.ui-icon-button` shell, takes ' +
            '`aria-pressed` toggle shape via `active`, and handles copy-to-clipboard ' +
            'itself via `copyValue` — CodeBlock\'s icon↔check pattern. `ChatError` is ' +
            '`role="alert"` on the `--error-light` tint, assistant-side per the ' +
            'transcript asymmetry. `ChatDisclaimer` is deliberately trivial — a ' +
            'paragraph on the right ramp, copy always consumer-provided.',
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
    density: {
      control: 'inline-radio',
      options: ['compact', 'balanced', 'spacious'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Chat>;

// A ghost action button for the hover row.

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

          <ChatMessage from="assistant">
            <ChatBubble>
              <p>The modern way is a flex or grid parent:</p>
              <CodeBlock
                id="center-div"
                language="css"
                code={`.parent {\n  display: grid;\n  place-items: center;\n}`}
              />
            </ChatBubble>
            <ChatMessageActions>
              <ChatMessageAction label="Copy" icon={Copy} copyValue="Of course — here's a runnable example." />
              <ChatMessageAction label="Regenerate" icon={RefreshCw} />
              <ChatMessageAction label="Good response" icon={ThumbsUp} />
            </ChatMessageActions>
          </ChatMessage>

          <ChatMessage from="user">
            <ChatBubble>Perfect — and for a single line of text?</ChatBubble>
          </ChatMessage>

          <ChatMessage from="assistant">
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
          <ChatMessage from="assistant">
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
          <ChatMessage from="assistant">
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
              <ChatMessage key={n} from="assistant">
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
    className="ui-icon-button ui-icon-button--fill ui-chat-composer__tool"
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
            <ChatMessage key={msg.id} from="assistant">
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

// ── AI parts: tool calls, suggestions, streaming ─────────────────────────────

export const ToolCalls: StoryObj = {
  render: () => (
    <div style={{ width: 480 }}>
      <ChatMessage from="assistant">
        <ChatBubble>
          <p>Looking into that now.</p>
          <ChatToolCalls style={{ marginTop: 'var(--p-3)' }}>
            <ChatToolCall name="web_search" status="success" defaultOpen>
              <CodeBlock
                id="tc-args"
                language="json"
                code={`{ "query": "how to center a div" }`}
              />
              <CodeBlock
                id="tc-result"
                language="json"
                code={`{ "results": 8, "top": "flexbox" }`}
              />
            </ChatToolCall>
            <ChatToolCall name="read_file" status="running" />
            <ChatToolCall name="write_file" status="error" statusLabel="Failed">
              <span style={{ color: 'var(--muted-foreground)' }}>
                Permission denied: /etc/hosts
              </span>
            </ChatToolCall>
          </ChatToolCalls>
        </ChatBubble>
      </ChatMessage>
    </div>
  ),
};

export const Suggestions: StoryObj = {
  render: () => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <div style={{ width: 520 }}>
        <ChatSuggestions>
          {['Summarize this page', 'Draft a reply', 'Explain the diff'].map(
            (s) => (
              <ChatSuggestion key={s} onClick={() => setPicked(s)}>
                {s}
              </ChatSuggestion>
            ),
          )}
          <ChatSuggestion onClick={() => setPicked('Brainstorm ideas')}>
            <Sparkles /> Brainstorm ideas
          </ChatSuggestion>
        </ChatSuggestions>
        <p
          style={{
            marginTop: 'var(--p-4)',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          {picked ? `Picked: ${picked}` : 'Pick a suggestion…'}
        </p>
      </div>
    );
  },
};

export const Streaming: StoryObj = {
  render: () => (
    <div style={{ width: 520 }}>
      <ChatMessage from="assistant">
        <ChatBubble streaming>
          The capital of France is Paris. It sits on the Seine and is known for
        </ChatBubble>
      </ChatMessage>
    </div>
  ),
};

// ── Full page layout: shell + all composer tools ─────────────────────────────

const LayoutDemo = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'm0', from: 'assistant', content: 'Hi — I’m Aiden. How can I help?' },
  ]);
  const [value, setValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
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
            ? { ...msg, pending: false, content: `You said: “${trimmed}”` }
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
        msg.pending ? { ...msg, pending: false, content: '(stopped)' } : msg,
      ),
    );
  };

  return (
    <div
      style={{
        width: 560,
        height: 560,
        border: '1px solid var(--border)',
        borderRadius: 'var(--rounded-xl)',
        overflow: 'hidden',
      }}
    >
      <ChatLayout>
        <ChatLayoutHeader>
          <strong style={{ fontSize: 'var(--text-sm)' }}>Aiden</strong>
        </ChatLayoutHeader>
        <ChatLayoutBody>
          <ChatMessageList>
            {messages.map((msg) =>
              msg.from === 'user' ? (
                <ChatMessage key={msg.id} from="user">
                  <ChatBubble>{msg.content}</ChatBubble>
                </ChatMessage>
              ) : (
                <ChatMessage key={msg.id} from="assistant">
                  <ChatBubble pending={msg.pending}>{msg.content}</ChatBubble>
                </ChatMessage>
              ),
            )}
          </ChatMessageList>
        </ChatLayoutBody>
        <ChatLayoutFooter>
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
              <ChatComposerDictation
                recording={recording}
                onClick={() => setRecording((r) => !r)}
              />
              <ChatComposerDrawer />
              <ChatComposerSend />
            </ChatComposerActions>
          </ChatComposer>
          <ChatDisclaimer>
            Aiden can make mistakes. Verify important information.
          </ChatDisclaimer>
        </ChatLayoutFooter>
      </ChatLayout>
    </div>
  );
};

export const FullLayout: StoryObj = {
  render: () => <LayoutDemo />,
};

// ── Batch 4: editing, versions, reasoning, citations, greeting ───────────────

export const Editing: StoryObj = {
  render: () => {
    const [content, setContent] = useState('How do I center a div in CSS?');
    const [editing, setEditing] = useState(false);
    return (
      <div style={{ width: 520 }}>
        <ChatMessage from="user">
          {editing ? (
            <ChatMessageEdit
              defaultValue={content}
              onSave={(v) => {
                setContent(v);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <ChatBubble>{content}</ChatBubble>
              <ChatMessageActions>
                <ChatMessageAction label="Edit" icon={Pencil} onClick={() => setEditing(true)} />
              </ChatMessageActions>
            </>
          )}
        </ChatMessage>
      </div>
    );
  },
};

export const Versions: StoryObj = {
  render: () => {
    const answers = [
      'Use flexbox: display: flex; justify-content: center; align-items: center.',
      'Or grid: display: grid; place-items: center — both axes at once.',
      'For a single line, text-align: center works too.',
    ];
    const [i, setI] = useState(0);
    return (
      <div style={{ width: 520 }}>
        <ChatMessage from="assistant">
          <ChatBubble>{answers[i]}</ChatBubble>
          <ChatMessageActions>
            <ChatMessageVersions
              index={i + 1}
              count={answers.length}
              onPrevious={() => setI((n) => Math.max(0, n - 1))}
              onNext={() => setI((n) => Math.min(answers.length - 1, n + 1))}
            />
            <ChatMessageAction label="Regenerate" icon={RefreshCw} />
          </ChatMessageActions>
        </ChatMessage>
      </div>
    );
  },
};

export const Reasoning: StoryObj = {
  render: () => (
    <div style={{ width: 520, display: 'flex', flexDirection: 'column', gap: 'var(--p-4)' }}>
      <ChatMessage from="assistant">
        <ChatReasoning thinking />
      </ChatMessage>
      <ChatMessage from="assistant">
        <ChatReasoning label="Thought for 3s" defaultOpen>
          The question is about centering. There are two robust approaches —
          flexbox and grid. Grid’s place-items is the most concise, so I’ll lead
          with that and mention flexbox as the alternative.
        </ChatReasoning>
        <ChatBubble>Use <code>display: grid; place-items: center;</code>.</ChatBubble>
      </ChatMessage>
    </div>
  ),
};

export const Citations: StoryObj = {
  render: () => (
    <div style={{ width: 520 }}>
      <ChatMessage from="assistant">
        <ChatBubble>
          <p>
            The Seine runs through Paris
            <ChatCitation href="#" index={1} />, and the city has been France’s
            capital since 508 AD
            <ChatCitation href="#" index={2} />.
          </p>
          <ChatSources label="Sources">
            <ChatSource
              href="#"
              index={1}
              title="Seine — Wikipedia"
              domain="en.wikipedia.org"
            />
            <ChatSource
              href="#"
              index={2}
              title="History of Paris"
              domain="paris.fr"
            />
          </ChatSources>
        </ChatBubble>
      </ChatMessage>
    </div>
  ),
};

/**
 * A reply that failed. `ChatError` renders assistant-side on the error tint
 * with `role="alert"` — announced when it appears — and the optional Retry
 * button. The transport and the retry are yours; the component only reports.
 */
export const ErrorState: StoryObj = {
  render: () => (
    <div style={{ width: 520 }}>
      <Chat>
        <ChatMessageList style={{ maxHeight: 360 }}>
          <ChatMessage from="user">
            <ChatBubble>Summarize the Q4 report for me.</ChatBubble>
          </ChatMessage>
          <ChatMessage from="assistant">
            <ChatError onRetry={() => {}}>
              Something went wrong while generating a response. Your message was
              not lost.
            </ChatError>
          </ChatMessage>
        </ChatMessageList>
      </Chat>
    </div>
  ),
};

/**
 * Type `/` at the start (commands) or `@` anywhere (mentions): the menu opens
 * above the composer and filters as you type. ↑↓ move, Enter/Tab insert,
 * Escape dismisses until the token changes. The textarea keeps focus
 * throughout — the keys arrive through the composer's interceptor, so
 * Enter-sends is suppressed while the menu is open.
 */
export const ComposerMenu: StoryObj = {
  render: function ComposerMenuStory() {
    const [value, setValue] = useState('');
    const [sent, setSent] = useState<string | null>(null);
    return (
      <div style={{ width: 560, display: 'grid', gap: 'var(--p-3)' }}>
        <ChatComposer
          id="menu-composer"
          value={value}
          onValueChange={setValue}
          onSubmit={(v) => {
            setSent(v);
            setValue('');
          }}
        >
          <ChatComposerInput
            placeholder="Try / for commands, @ for mentions…"
            aria-label="Message"
          />
          <ChatComposerActions>
            <ChatComposerSend id="menu-send" />
          </ChatComposerActions>
          <ChatComposerMenu
            slashItems={[
              { value: 'summarize', label: 'Summarize', description: 'Condense the conversation so far' },
              { value: 'table', label: 'Make a table', description: 'Turn the answer into a table' },
              { value: 'explain', label: 'Explain simply', description: 'Rewrite for a non-expert' },
              { value: 'translate', label: 'Translate', description: 'Translate the reply' },
            ]}
            mentionItems={[
              { value: 'ada', label: 'Ada Lovelace', description: 'ada@example.com' },
              { value: 'alan', label: 'Alan Turing', description: 'alan@example.com' },
              { value: 'grace', label: 'Grace Hopper', description: 'grace@example.com' },
            ]}
          />
        </ChatComposer>
        <p role="status" style={{ margin: 0, font: 'var(--text-xs)/var(--leading-4) var(--font-family)', color: 'var(--muted-foreground)' }}>
          {sent ? `Sent: "${sent}"` : 'Nothing sent yet.'}
        </p>
      </div>
    );
  },
};

/** The header slot ChatLayoutHeader always reserved, finally occupied. */
export const ModelPicker: StoryObj = {
  render: function ModelPickerStory() {
    const [model, setModel] = useState('balanced');
    return (
      <div style={{ width: 320 }}>
        <ChatModelPicker
          id="model-picker"
          value={model}
          onValueChange={setModel}
          models={[
            { value: 'fast', label: 'Fast', description: 'Quick answers for everyday tasks' },
            { value: 'balanced', label: 'Balanced', description: 'The default — capable and responsive' },
            { value: 'thorough', label: 'Thorough', description: 'Deeper reasoning, slower', badge: 'New' },
          ]}
        />
      </div>
    );
  },
};

/**
 * The split view: a `ChatArtifactCard` in the transcript opens a
 * `ChatLayoutAside` holding the `ChatArtifact` — conversation and composer
 * stay in the left column, the document takes the right, full height. Close
 * the artifact and the layout collapses back to a single column (the `:has()`
 * grid only exists while the aside is mounted).
 */
export const Artifacts: StoryObj = {
  render: function ArtifactsStory() {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState('');
    const DOC = [
      '# Launch plan',
      '',
      '## Week 1',
      '- Finalize the pricing page',
      '- Dry-run the migration',
      '',
      '## Week 2',
      '- Beta invites go out',
      '- Support rota confirmed',
    ].join('\n');
    return (
      <div style={{ height: 560, border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)', overflow: 'hidden' }}>
        <ChatLayout>
          <ChatLayoutHeader>
            <strong>Aiden</strong>
          </ChatLayoutHeader>
          <ChatLayoutBody>
            <ChatMessageList>
              <ChatMessage from="user">
                <ChatBubble>Draft a launch plan I can share.</ChatBubble>
              </ChatMessage>
              <ChatMessage from="assistant">
                <ChatBubble>
                  Here's a first pass — open it to review the full document.
                </ChatBubble>
                <ChatArtifactCard
                  title="Launch plan"
                  description={open ? 'Open in the panel' : 'Click to open'}
                  onClick={() => setOpen(true)}
                />
              </ChatMessage>
            </ChatMessageList>
          </ChatLayoutBody>
          <ChatLayoutFooter>
            <ChatComposer
              id="artifact-composer"
              value={value}
              onValueChange={setValue}
              onSubmit={() => setValue('')}
            >
              <ChatComposerInput placeholder="Ask for changes…" aria-label="Message" />
              <ChatComposerActions>
                <ChatComposerSend id="artifact-send" />
              </ChatComposerActions>
            </ChatComposer>
          </ChatLayoutFooter>
          {open && (
            <ChatLayoutAside>
              <ChatArtifact
                id="artifact-doc"
                title="Launch plan"
                badge="markdown"
                copyValue={DOC}
                onClose={() => setOpen(false)}
                footer="Draft · 2 sections"
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', font: 'var(--text-code)/var(--leading-5) var(--font-family-mono)', color: 'var(--foreground)' }}>
                  {DOC}
                </pre>
              </ChatArtifact>
            </ChatLayoutAside>
          )}
        </ChatLayout>
      </div>
    );
  },
};

export const Greeting: StoryObj = {
  render: () =>
    frame(
      <Chat style={{ flex: 1 }}>
        <ChatMessageList>
          <ChatGreeting
            icon={<Sparkles />}
            title="How can I help today?"
            description="Ask a question, or start from one of these."
          >
            <ChatSuggestions>
              <ChatSuggestion>Summarize a document</ChatSuggestion>
              <ChatSuggestion>Write some code</ChatSuggestion>
              <ChatSuggestion>Plan my week</ChatSuggestion>
            </ChatSuggestions>
          </ChatGreeting>
        </ChatMessageList>
      </Chat>,
    ),
};
