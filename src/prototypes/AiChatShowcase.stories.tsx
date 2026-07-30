import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Copy,
  Download,
  FileCode,
  Paperclip,
  Pencil,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
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
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '../components/Attachment/Attachment';
import Code, { CodeBlock } from '../components/Code/Code';

// ─────────────────────────────────────────────────────────────────────────────
// Test-drive screen #5: a full AI chat, two views — the empty Landing view and
// an active Conversation — composing EVERY Chat component the library exports,
// including an assistant-delivered downloadable Attachment. Static (all states
// shown at once) so the whole surface is visible in one screen.
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Prototypes/AI Chat Showcase',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// Small ghost icon-button for message action rows.
const IconBtn = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <button
    type="button"
    aria-label={label}
    className="ui-button ui-button--default ui-button--default-ghost ui-button--sz-xs ui-button--icon-only"
  >
    {children}
  </button>
);

const Header = () => (
  <ChatLayoutHeader>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
      <Avatar id="aiden-hdr" fallback="AI" size="sm" aria-label="Aiden" />
      <strong style={{ fontSize: 'var(--text-sm)' }}>Aiden</strong>
      <StatusDot status="online" label="Online" />
    </div>
  </ChatLayoutHeader>
);

// A composer with the full toolbar (attach / dictation / expand / send).
const Composer = () => {
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);
  return (
    <ChatLayoutFooter>
      <ChatComposer value={value} onValueChange={setValue} onSubmit={() => setValue('')}>
        <ChatComposerInput placeholder="Message Aiden…" aria-label="Message Aiden" />
        <ChatComposerActions>
          <button type="button" aria-label="Attach file" className="ui-chat-composer__tool">
            <Paperclip />
          </button>
          <ChatComposerDictation recording={recording} onClick={() => setRecording((r) => !r)} />
          <ChatComposerDrawer />
          <ChatComposerSend />
        </ChatComposerActions>
      </ChatComposer>
    </ChatLayoutFooter>
  );
};

// ── View 1 — Landing / empty state ───────────────────────────────────────────

function Landing() {
  return (
    <div style={{ height: '100vh' }}>
      <ChatLayout>
        <Header />
        <ChatLayoutBody>
          <ChatMessageList>
            <ChatGreeting
              icon={<Sparkles />}
              title="How can I help today?"
              description="Ask a question, or start from one of these. Aiden can search the web, run tools, and cite its sources."
            >
              <ChatSuggestions>
                <ChatSuggestion>How do I center a div?</ChatSuggestion>
                <ChatSuggestion>Summarise this PDF</ChatSuggestion>
                <ChatSuggestion>Write a SQL query</ChatSuggestion>
                <ChatSuggestion>Explain CSS grid</ChatSuggestion>
              </ChatSuggestions>
            </ChatGreeting>
          </ChatMessageList>
        </ChatLayoutBody>
        <Composer />
      </ChatLayout>
    </div>
  );
}

// ── View 2 — Active conversation (every component) ───────────────────────────

function Conversation() {
  return (
    <div style={{ height: '100vh' }}>
      <ChatLayout>
        <Header />
        <ChatLayoutBody>
          <ChatMessageList>
            <ChatMarker variant="divider">Today</ChatMarker>

            {/* User turn — with edit/copy actions */}
            <ChatMessage from="user">
              <ChatBubble>How do I center a div, and can you cite sources?</ChatBubble>
              <ChatMessageActions>
                <IconBtn label="Edit">
                  <Pencil />
                </IconBtn>
                <IconBtn label="Copy">
                  <Copy />
                </IconBtn>
              </ChatMessageActions>
            </ChatMessage>

            {/* Assistant turn — reasoning + tool call + answer + citations + sources + versions */}
            <ChatMessage from="assistant">
              <ChatReasoning label="Thought for 3s">
                The user wants to center an element and cited sources. Grid’s place-items is the
                most concise; I’ll lead with that, mention flexbox, and attach references.
              </ChatReasoning>

              <ChatToolCalls>
                <ChatToolCall name="web_search" status="success">
                  <CodeBlock id="tc-args" language="json" code={'{\n  "query": "center a div in css"\n}'} />
                  <CodeBlock id="tc-res" language="json" code={'{\n  "results": 6,\n  "top": "grid place-items"\n}'} />
                </ChatToolCall>
              </ChatToolCalls>

              <ChatBubble>
                <p>
                  You have two clean options. With grid it’s shortest —{' '}
                  <Code>display: grid; place-items: center</Code> — which centers on both axes at
                  once<ChatCitation href="#" index={1} />. Flexbox works too:{' '}
                  <Code>justify-content: center</Code> + <Code>align-items: center</Code>
                  <ChatCitation href="#" index={2} />.
                </p>
              </ChatBubble>

              <ChatSources label="Sources">
                <ChatSource href="#" index={1} title="Centering in CSS — MDN" domain="developer.mozilla.org" />
                <ChatSource href="#" index={2} title="A Complete Guide to Flexbox" domain="css-tricks.com" />
              </ChatSources>

              <ChatMessageActions>
                <ChatMessageVersions index={2} count={3} onPrevious={() => {}} onNext={() => {}} />
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
            </ChatMessage>

            {/* Follow-up suggestions */}
            <ChatSuggestions>
              <ChatSuggestion>Show a live example</ChatSuggestion>
              <ChatSuggestion>What about older browsers?</ChatSuggestion>
            </ChatSuggestions>

            {/* System marker */}
            <ChatMarker variant="system">Aiden switched to GPT-4o</ChatMarker>

            {/* User asks for a file */}
            <ChatMessage from="user">
              <ChatBubble>Can you send me that as a downloadable file?</ChatBubble>
            </ChatMessage>

            {/* Assistant delivers a downloadable attachment (streaming caret shown) */}
            <ChatMessage from="assistant">
              <ChatBubble streaming>Absolutely — here’s the snippet as a ready-to-use file.</ChatBubble>
              <Attachment>
                <AttachmentMedia variant="icon">
                  <FileCode />
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>centering.css</AttachmentTitle>
                  <AttachmentDescription>1.2 KB · CSS</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  <AttachmentAction aria-label="Download centering.css">
                    <Download />
                  </AttachmentAction>
                </AttachmentActions>
              </Attachment>
            </ChatMessage>

            {/* A user turn shown mid-edit (inline editor) */}
            <ChatMessage from="user">
              <ChatMessageEdit
                defaultValue="Actually, make it work in a flex row too"
                onSave={() => {}}
                onCancel={() => {}}
              />
            </ChatMessage>

            {/* Assistant is composing a reply — pending typing dots */}
            <ChatMessage from="assistant">
              <ChatBubble pending />
            </ChatMessage>
          </ChatMessageList>
        </ChatLayoutBody>
        <Composer />
      </ChatLayout>
    </div>
  );
}

export const Landing_: Story = { name: 'Landing', render: () => <Landing /> };
export const Conversation_: Story = { name: 'Conversation', render: () => <Conversation /> };
