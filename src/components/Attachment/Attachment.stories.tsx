import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Download,
  File,
  FileImage,
  FilePlay,
  FileSpreadsheet,
  FileText,
  X,
} from 'lucide-react';
import Attachment, {
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from './Attachment';
import Progress from '../Progress';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Attachment> = {
  title: 'Components/Attachment',
  component: Attachment,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A file attachment rendered as a row or a tile: its type or thumbnail, its ' +
        'name and size, and any actions on it. `AttachmentGroup` stacks several. The ' +
        'parallel family to `Item`, specialised for files.',
      tags: ['compound', '9 parts', '3 sizes'],
      changelog: [
        {
          date: '2026-09-02',
          summary:
            'The failed-upload state’s tint and border are a touch lighter in dark mode.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text colour was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
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
    state: {
      control: 'inline-radio',
      options: ['idle', 'uploading', 'processing', 'error', 'done'],
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'default'],
    },
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    state: 'done',
    size: 'default',
    orientation: 'horizontal',
  },
};

export default meta;

type Story = StoryObj<typeof Attachment>;

export const Playground: Story = {
  args: {
    state: "processing"
  },

  render: (args) => (
    <div style={{ width: 380 }}>
      <Attachment {...args}>
        <AttachmentMedia variant="icon">
          <FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Quarterly report.pdf</AttachmentTitle>
          <AttachmentDescription>PDF • 2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download">
            <Download />
          </AttachmentAction>
          <AttachmentAction aria-label="Remove">
            <X />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  )
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 420,
      }}
    >
      {(['done', 'uploading', 'processing', 'error', 'idle'] as const).map(
        (state) => (
          <Attachment key={state} state={state}>
            <AttachmentMedia variant="icon">
              <FileText />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>
                {state === 'error' ? 'Upload failed.pdf' : 'Report.pdf'}
              </AttachmentTitle>
              <AttachmentDescription>
                {state === 'uploading' && '68% • 2.4 MB'}
                {state === 'processing' && 'Processing…'}
                {state === 'error' && 'Network error. Try again.'}
                {state === 'done' && 'PDF • 2.4 MB'}
                {state === 'idle' && 'Waiting…'}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Remove">
                <X />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ),
      )}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 420 }}
    >
      {(['xs', 'sm', 'default'] as const).map((s) => (
        <Attachment key={s} size={s}>
          <AttachmentMedia variant="icon">
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Size: {s}</AttachmentTitle>
            {s !== 'xs' && (
              <AttachmentDescription>PDF • 2.4 MB</AttachmentDescription>
            )}
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Remove">
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div style={{ width: 380 }}>
      <Attachment>
        <AttachmentMedia variant="image">
          <img
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=60"
            alt="Mountain landscape"
          />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>mountain-landscape.jpg</AttachmentTitle>
          <AttachmentDescription>JPEG • 1.8 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">
            <X />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div style={{ maxWidth: 200 }}>
      <Attachment {...args}>
        <AttachmentMedia variant="icon">
          <FileImage />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>vacation.zip</AttachmentTitle>
          <AttachmentDescription>ZIP • 128 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download">
            <Download />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
};

export const AsWholeCardLink: Story = {
  render: () => (
    <div style={{ width: 420 }}>
      <Attachment>
        <AttachmentTrigger
          onClick={() => {
            // eslint-disable-next-line no-console
            console.log('open attachment');
          }}
        >
          Open Q4-forecast.xlsx
        </AttachmentTrigger>
        <AttachmentMedia variant="icon">
          <FileSpreadsheet />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Q4-forecast.xlsx</AttachmentTitle>
          <AttachmentDescription>Spreadsheet • 384 KB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">
            <X />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AttachmentGroup style={{ maxWidth: 600 }}>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <FileSpreadsheet />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Budget.xlsx</AttachmentTitle>
          <AttachmentDescription>380 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <FileImage />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Cover.png</AttachmentTitle>
          <AttachmentDescription>1.2 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <FilePlay />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Demo.mp4</AttachmentTitle>
          <AttachmentDescription>28 MB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment size="sm">
        <AttachmentMedia variant="icon">
          <File />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Notes.txt</AttachmentTitle>
          <AttachmentDescription>4 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  ),
};

export const UploadingWithProgress: Story = {
  render: () => {
    const [pct, setPct] = useState(0);
    const done = pct >= 100;
    useEffect(() => {
      if (done) return;
      const id = window.setInterval(() => {
        setPct((v) => Math.min(100, v + 4));
      }, 200);
      return () => window.clearInterval(id);
    }, [done]);

    const state = done ? 'done' : 'uploading';
    return (
      <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 420 }}>
        <Attachment state={state}>
          <AttachmentMedia variant="icon">
            <FilePlay />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>keynote-demo.mp4</AttachmentTitle>
            <AttachmentDescription>
              {done ? 'MP4 • 28 MB' : `${pct}% • Uploading…`}
            </AttachmentDescription>
            {!done && (
              <div style={{ marginTop: 'var(--p-1-5)' }}>
                <Progress value={pct} size="sm" variant="default" />
              </div>
            )}
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label={done ? 'Remove' : 'Cancel upload'}
              onClick={() => setPct(0)}
            >
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>

        {/* A second row to show variety: a failed upload with error state */}
        <Attachment state="error">
          <AttachmentMedia variant="icon">
            <FileText />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>large-report.pdf</AttachmentTitle>
            <AttachmentDescription>
              Failed at 42% — network dropped
            </AttachmentDescription>
            <div style={{ marginTop: 'var(--p-1-5)' }}>
              <Progress value={42} size="sm" variant="error" />
            </div>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction aria-label="Retry">
              <Download />
            </AttachmentAction>
            <AttachmentAction aria-label="Remove">
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </div>
    );
  },
};

export const InlineChip: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--p-2)',
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: 400,
      }}
    >
      <Attachment size="xs">
        <AttachmentMedia variant="icon">
          <FileText />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>brief.pdf</AttachmentTitle>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">
            <X />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment size="xs">
        <AttachmentMedia variant="icon">
          <FileImage />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>screenshot.png</AttachmentTitle>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove">
            <X />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  ),
};
