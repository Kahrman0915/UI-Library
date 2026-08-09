import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AidenLauncher from './AidenLauncher';
import Mark from '../Mark';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof AidenLauncher> = {
  title: 'AI/AidenLauncher',
  component: AidenLauncher,
  parameters: {
    ui: {
      description:
        'The embedded ask — Aiden\'s doorway on a sub-application\'s home screen. ' +
        'It looks like a chat but is not one: no transcript exists yet, and ' +
        'submitting NAVIGATES (into the panel, the full screen, a route) rather ' +
        'than appending a message. `onSubmit` receives the first prompt; the ' +
        'routing is yours.\n\n' +
        'Composes the real parts — `ChatGreeting`, the `ChatComposer` family, ' +
        '`ChatSuggestions` — so the doorway and the destination are visibly the ' +
        'same product. Clicking a suggestion SUBMITS it: on a launcher a ' +
        'suggestion is a shortcut, not a draft. Self-applies `data-surface="aiden"`.',
      tags: ['ai', 'doorway', 'surface'],
      changelog: [
        {
          date: '2026-08-09',
          summary: 'Initial build complete.',
          detail:
            'Named during the DART Central screen build, where the pattern first ' +
            'appeared as a hand-built box. Owns its draft by default (one-shot); ' +
            'controllable via value/onValueChange for clear-after-navigate.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;
type Story = StoryObj<typeof AidenLauncher>;

export const Default: Story = {
  render: function DefaultStory() {
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
      <div style={{ width: 720, display: 'grid', gap: 'var(--p-6)' }}>
        <AidenLauncher
          id="launcher"
          title="Ask Aiden"
          description="Your assistant across the whole suite."
          icon={<Sparkles size={28} aria-hidden="true" />}
          suggestions={[
            'Summarize my open requests',
            'Build a dashboard from this data',
            'Find an IRM request',
          ]}
          onSubmit={(v) => setSubmitted(v)}
        />
        <p
          role="status"
          style={{
            margin: 0,
            textAlign: 'center',
            font: 'var(--text-sm)/var(--leading-5) var(--font-family)',
            color: 'var(--muted-foreground)',
          }}
        >
          {submitted
            ? `onSubmit("${submitted}") — the consumer navigates from here.`
            : 'Submit or pick a suggestion; the launcher never routes itself.'}
        </p>
      </div>
    );
  },
};

/** With the application's own Mark as the greeting icon — the DART pattern. */
export const WithMark: Story = {
  render: () => (
    <div data-theme="db" style={{ width: 720 }}>
      <AidenLauncher
        id="launcher-mark"
        title="Good evening, Kahrman"
        description="What would you like to work on today?"
        icon={<Mark id="launcher-mark-tile" Icon={Sparkles} size="lg" motion="none" label="Aiden" />}
        placeholder="Help me analyze my data, build a dashboard…"
        onSubmit={() => {}}
      />
    </div>
  ),
};
