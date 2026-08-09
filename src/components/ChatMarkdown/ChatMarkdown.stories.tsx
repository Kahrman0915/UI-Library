import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ChatMarkdown from './ChatMarkdown';
import Chat, {
  ChatBubble,
  ChatMessage,
  ChatMessageList,
} from '../Chat';
import Button from '../Button';
import { useStreamingText } from '../../hooks/useStreamingText';
import type { UiDocsParameters } from '../../types/DocsTypes';

const SAMPLE = `# Quarterly summary

Revenue grew **18% year over year**, driven by *enterprise renewals*. Three things stand out:

1. Net retention held at 121%
2. New logos doubled in \`EMEA\`
3. Support volume fell — see the [full report](https://example.com/report)

## By region

| Region | Revenue | Change |
| --- | --- | --- |
| Americas | $4.2M | +12% |
| EMEA | $2.8M | +31% |
| APAC | $1.1M | +9% |

> Enterprise renewals are the engine — everything else is drafting behind them.

Here's the query that produced it:

\`\`\`sql
SELECT region, SUM(amount) AS revenue
FROM invoices
WHERE quarter = 'Q4'
GROUP BY region
ORDER BY revenue DESC;
\`\`\`

And the chart config:

\`\`\`ts
const series: SeriesSlot[] = regions.map((r, i) => ({
  key: r.name,
  slot: (i % 6) + 1,   // cycle the six chart slots
}));
\`\`\`
`;

const meta: Meta<typeof ChatMarkdown> = {
  title: 'AI/ChatMarkdown',
  component: ChatMarkdown,
  parameters: {
    ui: {
      description:
        'Rendered markdown for a model reply — headings, lists, GFM tables, ' +
        'blockquotes, links, and fenced code with syntax highlighting.\n\n' +
        'It is the one component allowed to import the markdown dependencies ' +
        '(`react-markdown`, `remark-gfm`, `highlight.js`), and it lives on the ' +
        '`@ui/lib/markdown` subpath — NOT the main entry — so an app that never ' +
        'renders AI markdown never pays for a parser. Everything renders through ' +
        'the library\'s own primitives: fences become `CodeBlock` (copy button ' +
        'included, highlighted onto the 11 `--code-*` tokens that have waited for ' +
        'a consumer since 2026-07-25), inline code becomes `Code`, quotes become ' +
        '`Blockquote`, and links sit on `--primary-text` so they theme.\n\n' +
        '**Raw HTML in the markdown renders as inert text, by construction** — ' +
        'there is no HTML string path and no `rehype-raw`. Never add it.',
      tags: ['ai', 'subpath export', 'dependencies: react-markdown · remark-gfm · highlight.js'],
      changelog: [
        {
          date: '2026-08-09',
          summary: 'Initial build complete.',
          detail:
            'The first deliberate exception to the zero-dependency rule, scoped to ' +
            'this component and the `./markdown` subpath. Fences render through ' +
            'CodeBlock with highlight.js (~15 registered languages, class-based ' +
            'output mapped onto the pre-existing --code-* palette in ' +
            'src/styles/hljs.scss); the main entry stays dependency-free, verified ' +
            'by the build gate.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;
type Story = StoryObj<typeof ChatMarkdown>;

const StreamedReply = () => {
  const { text, isDone } = useStreamingText(SAMPLE, {
    charsPerTick: 6,
    intervalMs: 16,
  });
  return (
    <ChatMarkdown id="md-stream" codeBlockProps={{ showCopy: isDone }}>
      {text}
    </ChatMarkdown>
  );
};

/** The whole vocabulary at once — the reply a real model sends. */
export const KitchenSink: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ChatMarkdown id="md-sink">{SAMPLE}</ChatMarkdown>
    </div>
  ),
};

/**
 * Streaming: `useStreamingText` reveals the source progressively and the
 * markdown re-renders as it grows — mid-fence code appears as plain text until
 * the language is parseable, then snaps into highlight. `showCopy` is off
 * until the reply is done, so a copy can never capture half an answer.
 */
export const Streaming: Story = {
  render: function StreamingStory() {
    // Remount-by-key is the honest restart: a same-string target never
    // restarts useStreamingText (that is its append-tolerance working), so a
    // fresh run is a fresh mount.
    const [run, setRun] = useState(0);
    return (
      <div style={{ maxWidth: 720, display: 'grid', gap: 'var(--p-4)' }}>
        <div>
          <Button
            id="md-stream-go"
            label={run > 0 ? 'Restart' : 'Stream the reply'}
            size="sm"
            onClick={() => setRun((r) => r + 1)}
          />
        </div>
        {run > 0 && <StreamedReply key={run} />}
      </div>
    );
  },
};

/**
 * The safety story, kept as a living proof: script tags, event handlers and
 * `javascript:` URLs in model output render as INERT TEXT or are stripped.
 * If this story ever shows an alert or a live red button, the sandboxing
 * regressed — most likely someone added `rehype-raw`.
 */
export const RawHtmlIsInert: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <ChatMarkdown id="md-xss">{[
        'A hostile reply:',
        '',
        '<script>alert("xss")</script>',
        '',
        '<button style="background:red" onclick="alert(1)">click me</button>',
        '',
        '[looks safe](javascript:alert(2))',
      ].join('\n')}</ChatMarkdown>
    </div>
  ),
};

/** In place: an assistant turn in the transcript, bubble-less per the asymmetry. */
export const InATranscript: Story = {
  render: () => (
    <div style={{ width: 640 }}>
      <Chat>
        <ChatMessageList style={{ maxHeight: 480 }}>
          <ChatMessage from="user">
            <ChatBubble>Summarize Q4 for me — include the SQL.</ChatBubble>
          </ChatMessage>
          <ChatMessage from="assistant">
            <ChatBubble>
              <ChatMarkdown id="md-turn">{SAMPLE}</ChatMarkdown>
            </ChatBubble>
          </ChatMessage>
        </ChatMessageList>
      </Chat>
    </div>
  ),
};
