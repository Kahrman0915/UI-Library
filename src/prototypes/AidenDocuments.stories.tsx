import { useEffect, useState } from 'react';
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
 * Aiden generates a **set of documents** and returns them as a list. Each row is
 * an `Attachment` whose `state` carries its status — `done` (ready),
 * `processing` (generating, title shimmers), `error` (failed, red). Rows show
 * file size + last-updated. Downloads are **permission-gated** (unauthorized →
 * lock, no download link). When the whole generation fails, the list is replaced
 * by an `Empty` error state — nothing to download.
 *
 * Use the two demo controls above the chat to flip authorization and the
 * ready/failed scenarios.
 */
const meta: Meta = {
  title: 'Prototypes/Aiden Documents',
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj;

const CSV = `quarter,revenue,growth
Q1,842000,0.04
Q2,915000,0.09
Q3,1024000,0.12
`;

type DocStatus = 'ready' | 'generating' | 'failed';
type Doc = {
  id: string;
  name: string;
  type: 'csv' | 'pdf' | 'xlsx' | 'json';
  label: string;
  size: string;
  updated: string;
  status: DocStatus;
};

const DOCS: Doc[] = [
  { id: 'd1', name: 'q3-revenue-report.csv', type: 'csv', label: 'CSV', size: '1.2 MB', updated: 'Jul 24, 2:14 PM', status: 'ready' },
  { id: 'd2', name: 'q3-summary.pdf', type: 'pdf', label: 'PDF', size: '842 KB', updated: 'Jul 24, 2:14 PM', status: 'ready' },
  { id: 'd3', name: 'forecast-model.xlsx', type: 'xlsx', label: 'XLSX', size: '—', updated: 'started 14s ago', status: 'generating' },
  { id: 'd4', name: 'raw-export.json', type: 'json', label: 'JSON', size: '—', updated: 'Jul 24, 2:13 PM', status: 'failed' },
];

const TYPE_ICON: Record<Doc['type'], React.FC> = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  pdf: FileText,
  json: FileBraces,
};

const STATE = { ready: 'done', generating: 'processing', failed: 'error' } as const;

const metaLine = (doc: Doc) => {
  if (doc.status === 'generating') return `Generating… · ${doc.updated}`;
  if (doc.status === 'failed') return `Couldn’t generate · failed ${doc.updated}`;
  return `${doc.label} · ${doc.size} · Updated ${doc.updated}`;
};

const DocRow = ({
  doc,
  authorized,
  url,
  onDownload,
}: {
  doc: Doc;
  authorized: boolean;
  url?: string;
  onDownload: () => void;
}) => {
  const Icon = TYPE_ICON[doc.type];
  const downloadable = doc.status === 'ready' && authorized;

  return (
    <Attachment state={STATE[doc.status]}>
      <AttachmentMedia variant="icon">
        <Icon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{doc.name}</AttachmentTitle>
        <AttachmentDescription>{metaLine(doc)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        {doc.status === 'generating' && <Spinner id={`${doc.id}-sp`} size={16} />}
        {doc.status === 'failed' && (
          <AttachmentAction aria-label={`Retry ${doc.name}`}>
            <RotateCw />
          </AttachmentAction>
        )}
        {doc.status === 'ready' &&
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
              style={{
                display: 'inline-flex',
                color: 'var(--muted-foreground)',
              }}
            >
              <Lock style={{ width: 'var(--w-4)', height: 'var(--h-4)' }} />
            </span>
          ))}
      </AttachmentActions>
      {downloadable && url && (
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

const SegBtn = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`ui-button ui-button--default ${active ? 'ui-button--default-outline' : 'ui-button--default-ghost'} ui-button--sz-sm`}
  >
    {children}
  </button>
);

const AidenDocuments = () => {
  const [authorized, setAuthorized] = useState(true);
  const [scenario, setScenario] = useState<'documents' | 'failed'>('documents');
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const made: Record<string, string> = {};
    DOCS.filter((d) => d.status === 'ready').forEach((d) => {
      const content = d.type === 'csv' ? CSV : `${d.name}\nGenerated by Aiden.\n`;
      made[d.id] = URL.createObjectURL(
        new Blob([content], { type: 'text/plain' }),
      );
    });
    setUrls(made);
    return () => Object.values(made).forEach(URL.revokeObjectURL);
  }, []);

  const download = (doc: Doc, url?: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const readyCount = DOCS.filter((d) => d.status === 'ready').length;

  return (
    <div>
      {/* Demo controls (not part of the chat) */}
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
        <Checkbox
          id="docs-authorized"
          checked={authorized}
          onCheckedChange={setAuthorized}
          label="Authorized to download"
        />
        <div style={{ display: 'inline-flex', gap: 'var(--p-1)' }}>
          <SegBtn
            active={scenario === 'documents'}
            onClick={() => setScenario('documents')}
          >
            Documents ready
          </SegBtn>
          <SegBtn
            active={scenario === 'failed'}
            onClick={() => setScenario('failed')}
          >
            Generation failed
          </SegBtn>
        </div>
      </div>

      {frame(
        <Chat density="balanced" style={{ flex: 1 }}>
          <ChatMessageList>
            <ChatMessage from="user">
              <ChatBubble>Generate the Q3 reports.</ChatBubble>
            </ChatMessage>

            <ChatMessage from="assistant">
              {scenario === 'failed' ? (
                <ChatBubble>
                  <p>I couldn’t finish generating your documents.</p>
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
                          onClick={() => setScenario('documents')}
                          className="ui-button ui-button--default ui-button--default-outline ui-button--sz-sm"
                        >
                          <RotateCw /> Try again
                        </button>
                      </EmptyContent>
                    </Empty>
                  </div>
                </ChatBubble>
              ) : (
                <ChatBubble>
                  <p>Here are your Q3 documents — {readyCount} ready to download:</p>
                  <div
                    style={{
                      marginTop: 'var(--p-3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--p-2)',
                      maxWidth: 420,
                    }}
                  >
                    {DOCS.map((doc) => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        authorized={authorized}
                        url={urls[doc.id]}
                        onDownload={() => download(doc, urls[doc.id])}
                      />
                    ))}
                  </div>
                  {!authorized && (
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
  render: () => <AidenDocuments />,
};
