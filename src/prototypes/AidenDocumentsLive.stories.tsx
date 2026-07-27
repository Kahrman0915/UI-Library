import { useEffect, useRef, useState } from 'react';
import {
  Download,
  FileBraces,
  FileExclamationPoint,
  FileSpreadsheet,
  FileText,
  Lock,
  RotateCw,
} from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import Chat, {
  ChatBubble,
  ChatMessage,
  ChatMessageList,
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
import Empty, {
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../components/Empty/Empty';
import Spinner from '../components/Spinner/Spinner';
import Checkbox from '../components/Checkbox/Checkbox';

/**
 * The **live** version of the document-delivery flow. On load (and on Replay)
 * Aiden "generates" the documents: every row starts in `generating`, then each
 * settles to `ready` or `failed` on a timer while the ready-count ticks up.
 * Ready docs download real Blob files. Flip **Authorized** to gate downloads;
 * flip **Simulate failure** so every doc fails → the whole list collapses to the
 * Empty error state.
 *
 * (The sibling "Aiden Documents" story is the static showcase — every state at
 * once, for design review. This one is the sequence, for the experience.)
 */
const meta: Meta = {
  title: 'Prototypes/Aiden Documents — Live',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const CSV = `quarter,revenue,growth
Q1,842000,0.04
Q2,915000,0.09
Q3,1024000,0.12
`;

type DocStatus = 'generating' | 'ready' | 'failed';
type Plan = {
  id: string;
  name: string;
  type: 'csv' | 'pdf' | 'xlsx' | 'json';
  label: string;
  size: string;
  at: number; // ms until it settles
  outcome: 'ready' | 'failed';
};

const PLAN: Plan[] = [
  { id: 'd1', name: 'q3-revenue-report.csv', type: 'csv', label: 'CSV', size: '1.2 MB', at: 1500, outcome: 'ready' },
  { id: 'd2', name: 'q3-summary.pdf', type: 'pdf', label: 'PDF', size: '842 KB', at: 2500, outcome: 'ready' },
  { id: 'd3', name: 'forecast-model.xlsx', type: 'xlsx', label: 'XLSX', size: '2.1 MB', at: 3600, outcome: 'ready' },
  { id: 'd4', name: 'raw-export.json', type: 'json', label: 'JSON', size: '—', at: 4300, outcome: 'failed' },
];

const TYPE_ICON: Record<Plan['type'], React.FC> = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pdf: FileText,
  json: FileBraces,
};

const STATE = { generating: 'processing', ready: 'done', failed: 'error' } as const;

const metaLine = (doc: Plan, status: DocStatus) => {
  if (status === 'generating') return 'Generating…';
  if (status === 'failed') return 'Couldn’t generate';
  return `${doc.label} · ${doc.size} · Updated just now`;
};

const DocRow = ({
  doc,
  status,
  authorized,
  url,
  onDownload,
}: {
  doc: Plan;
  status: DocStatus;
  authorized: boolean;
  url?: string;
  onDownload: () => void;
}) => {
  const Icon = TYPE_ICON[doc.type];
  return (
    <Attachment state={STATE[status]}>
      <AttachmentMedia variant="icon">
        <Icon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{doc.name}</AttachmentTitle>
        <AttachmentDescription>{metaLine(doc, status)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        {status === 'generating' && <Spinner id={`${doc.id}-sp`} size={16} />}
        {status === 'failed' && (
          <AttachmentAction aria-label={`Retry ${doc.name}`}>
            <RotateCw />
          </AttachmentAction>
        )}
        {status === 'ready' &&
          (authorized ? (
            <AttachmentAction
              aria-label={`Download ${doc.name}`}
              onClick={onDownload}
            >
              <Download />
            </AttachmentAction>
          ) : (
            <span
              title="Only authorized users can download"
              aria-label="Locked — only authorized users can download"
              role="img"
              style={{ display: 'inline-flex', color: 'var(--muted-foreground)' }}
            >
              <Lock style={{ width: 'var(--w-4)', height: 'var(--h-4)' }} />
            </span>
          ))}
      </AttachmentActions>
      {status === 'ready' && authorized && url && (
        <AttachmentTrigger href={url} download={doc.name}>
          Download {doc.name}
        </AttachmentTrigger>
      )}
    </Attachment>
  );
};

const frame = (children: React.ReactNode) => (
  <div
    style={{
      width: 560,
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

const AidenDocumentsLive = () => {
  const [authorized, setAuthorized] = useState(true);
  const [failAll, setFailAll] = useState(false);
  const [runId, setRunId] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, DocStatus>>({});
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const urls = useRef<Record<string, string>>({});

  // Drive the sequence on mount, on Replay (runId), and when the failure sim
  // toggles.
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    Object.values(urls.current).forEach(URL.revokeObjectURL);
    urls.current = {};

    const init: Record<string, DocStatus> = {};
    PLAN.forEach((p) => (init[p.id] = 'generating'));
    setStatuses(init);

    PLAN.forEach((p) => {
      const outcome: DocStatus = failAll ? 'failed' : p.outcome;
      timers.current.push(
        setTimeout(() => {
          if (outcome === 'ready') {
            const content =
              p.type === 'csv' ? CSV : `${p.name}\nGenerated by Aiden.\n`;
            urls.current[p.id] = URL.createObjectURL(
              new Blob([content], { type: 'text/plain' }),
            );
          }
          setStatuses((s) => ({ ...s, [p.id]: outcome }));
        }, p.at),
      );
    });

    return () => {
      timers.current.forEach(clearTimeout);
      Object.values(urls.current).forEach(URL.revokeObjectURL);
    };
  }, [runId, failAll]);

  const download = (doc: Plan) => {
    const url = urls.current[doc.id];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const total = PLAN.length;
  const ready = PLAN.filter((p) => statuses[p.id] === 'ready').length;
  const settled = PLAN.filter((p) => statuses[p.id] !== 'generating').length;
  const anyGenerating = settled < total;
  const allFailed =
    total > 0 && PLAN.every((p) => statuses[p.id] === 'failed');

  const header = anyGenerating
    ? `Generating your documents… (${settled}/${total})`
    : `Here are your Q3 documents — ${ready} of ${total} ready:`;

  return (
    <div>
      {/* Demo controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-5)',
          marginBottom: 'var(--p-4)',
          flexWrap: 'wrap',
          fontFamily: 'var(--font-family)',
        }}
      >
        <button
          type="button"
          onClick={() => setRunId((r) => r + 1)}
          className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
        >
          <RotateCw /> Replay
        </button>
        <Checkbox
          id="live-authorized"
          checked={authorized}
          onCheckedChange={setAuthorized}
          label="Authorized to download"
        />
        <Checkbox
          id="live-failall"
          checked={failAll}
          onCheckedChange={setFailAll}
          label="Simulate failure"
        />
      </div>

      {frame(
        <Chat density="balanced" style={{ flex: 1 }}>
          <ChatMessageList>
            <ChatMessage from="user">
              <ChatBubble>Generate the Q3 reports.</ChatBubble>
            </ChatMessage>

            <ChatMessage from="assistant">
              {allFailed ? (
                <ChatBubble>
                  <p>I couldn’t generate your documents.</p>
                  <div
                    style={{
                      marginTop: 'var(--p-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--rounded-lg)',
                    }}
                  >
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FileExclamationPoint />
                        </EmptyMedia>
                        <EmptyTitle>No documents available</EmptyTitle>
                        <EmptyDescription>
                          Generation failed, so there’s nothing to download yet.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <button
                          type="button"
                          onClick={() => {
                            setFailAll(false);
                            setRunId((r) => r + 1);
                          }}
                          className="ui-button ui-button--default ui-button--default-outline ui-button--sz-small"
                        >
                          <RotateCw /> Try again
                        </button>
                      </EmptyContent>
                    </Empty>
                  </div>
                </ChatBubble>
              ) : (
                <ChatBubble>
                  <p>{header}</p>
                  <div
                    style={{
                      marginTop: 'var(--p-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--p-2)',
                      maxWidth: 420,
                    }}
                  >
                    {PLAN.map((doc) => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        status={statuses[doc.id] ?? 'generating'}
                        authorized={authorized}
                        url={urls.current[doc.id]}
                        onDownload={() => download(doc)}
                      />
                    ))}
                  </div>
                  {!authorized && !anyGenerating && (
                    <p
                      style={{
                        marginTop: 'var(--p-3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--p-1-5)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      <Lock style={{ width: 'var(--w-3-5)', height: 'var(--h-3-5)' }} />
                      View-only access — only authorized users can download.
                    </p>
                  )}
                </ChatBubble>
              )}
            </ChatMessage>
          </ChatMessageList>
        </Chat>,
      )}
    </div>
  );
};

export const Playground: Story = {
  render: () => <AidenDocumentsLive />,
};
