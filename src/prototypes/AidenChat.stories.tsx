import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  FileText,
  Paperclip,
  Pencil,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import {
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
} from '../components/Chat/Chat';
import Avatar from '../components/Avatar/Avatar';
import StatusDot from '../components/StatusDot/StatusDot';
import Attachment, {
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '../components/Attachment/Attachment';
import Code, { CodeBlock } from '../components/Code/Code';
import { useStreamingText } from '../hooks/useStreamingText';

/**
 * A working Aiden chat — one prototype that exercises the whole Chat family.
 * Send a message (or tap a suggestion) to watch a scripted answer: the model
 * "thinks", calls a tool, streams its reply, then resolves citations, sources,
 * response versions and follow-ups. Your own turns are editable; the composer
 * has attach / dictation / expand-drawer / send.
 */
const meta: Meta = {
  title: 'Prototypes/Aiden Chat',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// ── Canned content for the scripted answer ───────────────────────────────────

const REASONING =
  'The user wants to center an element. The two robust, modern approaches are ' +
  'flexbox and CSS grid — grid’s place-items is the most concise, so I’ll lead ' +
  'with that and mention flexbox as the familiar alternative.';

const TOOL_ARGS = `{
  "query": "center a div in css"
}`;

const TOOL_RESULT = `{
  "results": 6,
  "top": "flexbox / grid place-items"
}`;

const ANSWER_TEXT =
  'You have two clean options. With flexbox, set the parent to display: flex, ' +
  'then justify-content: center and align-items: center. With grid it’s even ' +
  'shorter — display: grid; place-items: center — which centers on both axes at once.';

const SOURCES = [
  { index: 1, title: 'Centering in CSS — MDN', domain: 'developer.mozilla.org' },
  { index: 2, title: 'A Complete Guide to Flexbox', domain: 'css-tricks.com' },
];

// Response variants for the ‹ 1/3 › pager (rendered when the turn is done).
const ANSWERS = [
  <p key="grid">
    You have two clean options. With grid it’s shortest —{' '}
    <Code>display: grid; place-items: center</Code> — which centers on both axes
    at once<ChatCitation href="#" index={1} />. Flexbox works too
    <ChatCitation href="#" index={2} />.
  </p>,
  <p key="flex">
    With flexbox, set the parent to <Code>display: flex</Code>, then{' '}
    <Code>justify-content: center</Code> and <Code>align-items: center</Code>
    <ChatCitation href="#" index={2} />.
  </p>,
  <p key="text">
    For a single line of inline text, <Code>text-align: center</Code> plus a{' '}
    <Code>line-height</Code> equal to the height is the classic trick.
  </p>,
];

const STARTERS = [
  'How do I center a div?',
  'Explain CSS grid',
  'Review my snippet',
];
const FOLLOWUPS = ['Show a live example', 'What about older browsers?'];

// ── Shared bits ──────────────────────────────────────────────────────────────

const IconBtn = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="ui-button ui-button--default ui-button--default-ghost ui-button--sz-xsmall ui-button--icon-only"
  >
    {children}
  </button>
);

type Turn = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  phase?: number; // 0 thinking · 1 tool running · 2 streaming · 3 done
  version?: number;
};

// The streaming reply — types out the answer, then reports done.
const StreamingAnswer = ({
  id,
  onDone,
}: {
  id: string;
  onDone: (id: string) => void;
}) => {
  const { text, isStreaming, isDone } = useStreamingText(ANSWER_TEXT, {
    charsPerTick: 2,
    intervalMs: 16,
  });
  const doneRef = useRef(false);
  useEffect(() => {
    if (isDone && !doneRef.current) {
      doneRef.current = true;
      onDone(id);
    }
  }, [isDone, onDone, id]);
  return <ChatBubble streaming={isStreaming}>{text}</ChatBubble>;
};

// A user turn — editable in place.
const UserTurn = ({
  turn,
  onEdit,
}: {
  turn: Turn;
  onEdit: (id: string, text: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  return (
    <ChatMessage from="user">
      {editing ? (
        <ChatMessageEdit
          defaultValue={turn.text}
          onSave={(v) => {
            onEdit(turn.id, v);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <ChatBubble>{turn.text}</ChatBubble>
          <ChatMessageActions>
            <IconBtn label="Edit" onClick={() => setEditing(true)}>
              <Pencil />
            </IconBtn>
            <IconBtn label="Copy">
              <Copy />
            </IconBtn>
          </ChatMessageActions>
        </>
      )}
    </ChatMessage>
  );
};

// An assistant turn — progresses thinking → tool → streaming → done.
const AssistantTurn = ({
  turn,
  onStreamDone,
  onVersion,
  onFollowup,
}: {
  turn: Turn;
  onStreamDone: (id: string) => void;
  onVersion: (id: string, delta: number) => void;
  onFollowup: (text: string) => void;
}) => {
  const p = turn.phase ?? 0;
  const version = turn.version ?? 0;
  return (
    <>
      <ChatMessage from="assistant">
        <ChatReasoning
          thinking={p === 0}
          label={p === 0 ? undefined : 'Thought for 2s'}
        >
          {REASONING}
        </ChatReasoning>

        {p >= 1 && (
          <ChatToolCalls>
            <ChatToolCall
              name="web_search"
              status={p === 1 ? 'running' : 'success'}
            >
              <CodeBlock
                id={`${turn.id}-args`}
                language="json"
                code={TOOL_ARGS}
              />
              {p >= 2 && (
                <CodeBlock
                  id={`${turn.id}-res`}
                  language="json"
                  code={TOOL_RESULT}
                />
              )}
            </ChatToolCall>
          </ChatToolCalls>
        )}

        {p === 2 && <StreamingAnswer id={turn.id} onDone={onStreamDone} />}

        {p === 3 && (
          <>
            <ChatBubble>{ANSWERS[version]}</ChatBubble>
            <ChatSources label="Sources">
              {SOURCES.map((s) => (
                <ChatSource key={s.index} href="#" {...s} />
              ))}
            </ChatSources>
            <ChatMessageActions>
              <ChatMessageVersions
                index={version + 1}
                count={ANSWERS.length}
                onPrevious={() => onVersion(turn.id, -1)}
                onNext={() => onVersion(turn.id, 1)}
              />
              <IconBtn label="Copy">
                <Copy />
              </IconBtn>
              <IconBtn label="Regenerate">
                <RefreshCw />
              </IconBtn>
              <IconBtn label="Good response">
                <ThumbsUp />
              </IconBtn>
              <IconBtn label="Bad response">
                <ThumbsDown />
              </IconBtn>
            </ChatMessageActions>
          </>
        )}
      </ChatMessage>

      {p === 3 && (
        <ChatSuggestions>
          {FOLLOWUPS.map((s) => (
            <ChatSuggestion key={s} onClick={() => onFollowup(s)}>
              {s}
            </ChatSuggestion>
          ))}
        </ChatSuggestions>
      )}
    </>
  );
};

// ── The app ──────────────────────────────────────────────────────────────────

const AidenChat = () => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [value, setValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const idRef = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const setPhase = (id: string, phase: number) =>
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, phase } : t)));

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const aId = `a${idRef.current++}`;
    setTurns((prev) => [
      ...prev,
      { id: `u${idRef.current++}`, role: 'user', text: trimmed },
      { id: aId, role: 'assistant', phase: 0, version: 0 },
    ]);
    setValue('');
    setAttachments([]);
    setStreaming(true);
    clearTimers();
    timers.current.push(setTimeout(() => setPhase(aId, 1), 1100));
    timers.current.push(setTimeout(() => setPhase(aId, 2), 2400));
  };

  const stop = () => {
    clearTimers();
    setStreaming(false);
    setTurns((prev) =>
      prev.map((t) =>
        t.role === 'assistant' && (t.phase ?? 0) < 3 ? { ...t, phase: 3 } : t,
      ),
    );
  };

  const onStreamDone = (id: string) => {
    setPhase(id, 3);
    setStreaming(false);
  };

  const onVersion = (id: string, delta: number) =>
    setTurns((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              version: Math.max(
                0,
                Math.min(ANSWERS.length - 1, (t.version ?? 0) + delta),
              ),
            }
          : t,
      ),
    );

  const editUser = (id: string, text: string) =>
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));

  return (
    <div style={{ height: '100vh' }}>
      <ChatLayout>
        <ChatLayoutHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
            <Avatar id="aiden-hdr" fallback="AI" size="sm" aria-label="Aiden" />
            <strong style={{ fontSize: 'var(--text-sm)' }}>Aiden</strong>
            <StatusDot status="online" label="Online" />
          </div>
        </ChatLayoutHeader>

        <ChatLayoutBody>
          <ChatMessageList>
            {turns.length === 0 ? (
              <ChatGreeting
                icon={<Sparkles />}
                title="How can I help today?"
                description="Ask a question, or start from one of these."
              >
                <ChatSuggestions>
                  {STARTERS.map((s) => (
                    <ChatSuggestion key={s} onClick={() => send(s)}>
                      {s}
                    </ChatSuggestion>
                  ))}
                </ChatSuggestions>
              </ChatGreeting>
            ) : (
              <>
                <ChatMarker variant="divider">Today</ChatMarker>
                {turns.map((turn) =>
                  turn.role === 'user' ? (
                    <UserTurn key={turn.id} turn={turn} onEdit={editUser} />
                  ) : (
                    <AssistantTurn
                      key={turn.id}
                      turn={turn}
                      onStreamDone={onStreamDone}
                      onVersion={onVersion}
                      onFollowup={send}
                    />
                  ),
                )}
              </>
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
            {attachments.length > 0 && (
              <AttachmentGroup>
                {attachments.map((name) => (
                  <Attachment key={name} size="xs">
                    <AttachmentMedia variant="icon">
                      <FileText />
                    </AttachmentMedia>
                    <AttachmentContent>
                      <AttachmentTitle>{name}</AttachmentTitle>
                    </AttachmentContent>
                    <AttachmentActions>
                      <AttachmentAction
                        aria-label="Remove attachment"
                        onClick={() =>
                          setAttachments((a) => a.filter((n) => n !== name))
                        }
                      >
                        <X />
                      </AttachmentAction>
                    </AttachmentActions>
                  </Attachment>
                ))}
              </AttachmentGroup>
            )}
            <ChatComposerInput
              placeholder="Message Aiden…"
              aria-label="Message Aiden"
            />
            <ChatComposerActions>
              <button
                type="button"
                aria-label="Attach file"
                onClick={() => setAttachments(['project-brief.pdf'])}
                className="ui-chat-composer__tool"
              >
                <Paperclip />
              </button>
              <ChatComposerDictation
                recording={recording}
                onClick={() => setRecording((r) => !r)}
              />
              <ChatComposerDrawer />
              <ChatComposerSend />
            </ChatComposerActions>
          </ChatComposer>
        </ChatLayoutFooter>
      </ChatLayout>
    </div>
  );
};

export const Playground: Story = {
  render: () => <AidenChat />,
};
