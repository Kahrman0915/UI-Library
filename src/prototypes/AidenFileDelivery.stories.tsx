import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Download,
  FileSpreadsheet,
  Paperclip,
  RefreshCw,
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
  ChatSuggestion,
  ChatSuggestions,
  ChatToolCall,
} from '../components/Chat/Chat';
import Attachment, {
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '../components/Attachment/Attachment';

/**
 * Aiden hands a file back. After a short exchange the user asks for an export;
 * Aiden "generates" it (a tool call) and delivers a **downloadable file as an
 * `Attachment` inside the assistant turn** — the same file-chip primitive used
 * for uploads, mirrored to the output side. Clicking the card (or the download
 * button) saves a real CSV.
 */
const meta: Meta = {
  title: 'Prototypes/Aiden File Delivery',
  parameters: { layout: 'centered' },
};

export default meta;

type Story = StoryObj;

const CSV = `quarter,revenue,growth
Q1,842000,0.04
Q2,915000,0.09
Q3,1024000,0.12
`;

const FILENAME = 'q3-revenue-report.csv';

type Turn = {
  id: string;
  role: 'user' | 'assistant';
  kind: 'text' | 'working' | 'file';
  content?: string;
};

const IconBtn = ({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.FC;
}) => (
  <button
    type="button"
    aria-label={label}
    className="ui-button ui-button--default ui-button--default-ghost ui-button--sz-xs ui-button--icon-only"
  >
    <Icon />
  </button>
);

const FileCard = ({
  url,
  onDownload,
}: {
  url: string | null;
  onDownload: () => void;
}) => (
  <div style={{ maxWidth: 340, marginTop: 'var(--p-3)' }}>
    <Attachment>
      <AttachmentMedia variant="icon">
        <FileSpreadsheet />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{FILENAME}</AttachmentTitle>
        <AttachmentDescription>CSV · 1.2 KB · generated now</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label={`Download ${FILENAME}`} onClick={onDownload}>
          <Download />
        </AttachmentAction>
      </AttachmentActions>
      {url && (
        <AttachmentTrigger href={url} download={FILENAME}>
          Download {FILENAME}
        </AttachmentTrigger>
      )}
    </Attachment>
  </div>
);

const frame = (children: React.ReactNode) => (
  <div
    style={{
      width: 560,
      height: 560,
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

const FileDelivery = () => {
  const [turns, setTurns] = useState<Turn[]>([
    { id: 'u0', role: 'user', kind: 'text', content: 'How did Q3 revenue come in?' },
    {
      id: 'a0',
      role: 'assistant',
      kind: 'text',
      content:
        'Q3 came in at $1.02M — up 12% over Q2, the strongest quarter this year. Want the full Q1–Q3 breakdown as a file?',
    },
  ]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const idRef = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // A real, downloadable blob for the generated file.
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(new Blob([CSV], { type: 'text/csv' }));
    setFileUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const downloadFile = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const deliver = () => {
    if (busy) return;
    setBusy(true);
    const aId = `a${idRef.current++}`;
    setTurns((t) => [
      ...t,
      {
        id: `u${idRef.current++}`,
        role: 'user',
        kind: 'text',
        content: 'Yes — export it as a CSV.',
      },
      { id: aId, role: 'assistant', kind: 'working' },
    ]);
    setValue('');
    timers.current.push(
      setTimeout(() => {
        setTurns((t) =>
          t.map((x) => (x.id === aId ? { ...x, kind: 'file' } : x)),
        );
        setBusy(false);
      }, 1700),
    );
  };

  return frame(
    <Chat density="balanced" style={{ flex: 1 }}>
      <ChatMessageList>
        <ChatMarker variant="divider">Today</ChatMarker>

        {turns.map((turn) => {
          if (turn.role === 'user') {
            return (
              <ChatMessage key={turn.id} from="user">
                <ChatBubble>{turn.content}</ChatBubble>
              </ChatMessage>
            );
          }
          if (turn.kind === 'text') {
            return (
              <ChatMessage key={turn.id} from="assistant">
                <ChatBubble>{turn.content}</ChatBubble>
                <ChatSuggestions>
                  <ChatSuggestion onClick={deliver}>
                    Export as CSV
                  </ChatSuggestion>
                </ChatSuggestions>
              </ChatMessage>
            );
          }
          if (turn.kind === 'working') {
            return (
              <ChatMessage key={turn.id} from="assistant">
                <ChatToolCall name="export_csv" status="running" />
              </ChatMessage>
            );
          }
          // kind === 'file'
          return (
            <ChatMessage key={turn.id} from="assistant">
              <ChatToolCall name="export_csv" status="success" />
              <ChatBubble>
                <p>
                  Done — here’s your Q3 revenue report (Q1–Q3, with revenue and
                  growth). Click to download:
                </p>
                <FileCard url={fileUrl} onDownload={downloadFile} />
              </ChatBubble>
              <ChatMessageActions>
                <IconBtn label="Copy" icon={Copy} />
                <IconBtn label="Regenerate" icon={RefreshCw} />
              </ChatMessageActions>
            </ChatMessage>
          );
        })}
      </ChatMessageList>

      <div style={{ padding: 'var(--p-3)', borderTop: '1px solid var(--border)' }}>
        <ChatComposer
          value={value}
          onValueChange={setValue}
          onSubmit={deliver}
          disabled={busy}
        >
          <ChatComposerInput
            placeholder="Message Aiden…"
            aria-label="Message Aiden"
          />
          <ChatComposerActions>
            <button
              type="button"
              aria-label="Attach file"
              className="ui-chat-composer__tool"
            >
              <Paperclip />
            </button>
            <ChatComposerSend />
          </ChatComposerActions>
        </ChatComposer>
      </div>
    </Chat>,
  );
};

export const Playground: Story = {
  render: () => <FileDelivery />,
};
