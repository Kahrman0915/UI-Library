import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AidenPanel, { AidenPanelHeader } from './AidenPanel';
import AidenFullScreen from '../AidenFullScreen';
import Fab from '../Fab';
import Card, { CardBody, CardHeader } from '../Card';
import Input from '../Input';
import NativeSelect, { NativeSelectOption } from '../NativeSelect';
import {
  ChatBubble,
  ChatComposer,
  ChatComposerActions,
  ChatComposerInput,
  ChatComposerSend,
  ChatDisclaimer,
  ChatLayout,
  ChatLayoutBody,
  ChatLayoutFooter,
  ChatMessage,
  ChatMessageList,
} from '../Chat';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof AidenPanel> = {
  title: 'AI/AidenPanel',
  component: AidenPanel,
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The assistant riding along INSIDE a sub-application — a non-modal side ' +
        'panel. No backdrop, no focus trap, no scroll lock: you ask Aiden about ' +
        'the screen you are looking at, so the screen stays readable, scrollable ' +
        'and clickable. It is a `complementary` landmark, not a dialog — `Drawer` ' +
        'exists for the modal case.\n\n' +
        'Escape closes it only while focus is INSIDE the panel; focus returns to ' +
        'the opener only if it was still inside. Z-index is `--z-40`, deliberately ' +
        'BELOW the floating surfaces at `--z-50`, so a Select or menu opened ' +
        'inside the panel paints above it. Self-applies `data-surface="aiden"`.\n\n' +
        'The expand button (rendered when `onExpand` is given) does not open ' +
        'anything itself — the consumer holds `closed | panel | full` and swaps ' +
        'surfaces. The Fab convention stands: hide the launcher while a surface ' +
        'is open.',
      tags: ['ai', 'non-modal', 'landmark', 'surface'],
      changelog: [
        {
          date: '2026-08-09',
          summary: 'Initial build complete.',
          detail:
            'Drawer\'s closed→open→closing machine (literal keyframes, animationend ' +
            'filtered by name, 400ms safety timeout) without Drawer\'s modality. New ' +
            '--aiden-panel-width token (420px) and the --ui-aiden-panel-inset-top ' +
            'consumer hook for fixed app headers.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;
type Story = StoryObj<typeof AidenPanel>;

/** A stand-in for the sub-application behind the panel. */
const HostPage = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ minHeight: '100vh', padding: 'var(--p-8)', background: 'var(--background)' }}>
    <div style={{ maxWidth: 640, display: 'grid', gap: 'var(--p-4)' }}>
      <h1 style={{ margin: 0, font: 'var(--font-semibold) var(--text-2xl)/var(--leading-8) var(--font-family)', color: 'var(--foreground)' }}>
        Phoenix — Queue review
      </h1>
      <Card id="host-card">
        <CardHeader id="host-card-h" title="Case 4821" description="The page stays fully usable while the panel is open — type here to prove it." />
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
            <Input id="host-input" label="Assignee" placeholder="Still focusable behind the panel" />
            <NativeSelect id="host-select" label="Priority">
              <NativeSelectOption value="p1">P1</NativeSelectOption>
              <NativeSelectOption value="p2">P2</NativeSelectOption>
            </NativeSelect>
          </div>
        </CardBody>
      </Card>
      {children}
    </div>
  </div>
);

const PanelChat = ({ idPrefix }: { idPrefix: string }) => {
  const [value, setValue] = useState('');
  return (
    <ChatLayout>
      <ChatLayoutBody>
        <ChatMessageList>
          <ChatMessage from="assistant">
            <ChatBubble>
              I can see the Phoenix queue. Ask me about this case, or anything else.
            </ChatBubble>
          </ChatMessage>
        </ChatMessageList>
      </ChatLayoutBody>
      <ChatLayoutFooter>
        <ChatComposer
          id={`${idPrefix}-composer`}
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue('')}
        >
          <ChatComposerInput placeholder="Message Aiden…" aria-label="Message Aiden" />
          <ChatComposerActions>
            <ChatComposerSend id={`${idPrefix}-send`} />
          </ChatComposerActions>
        </ChatComposer>
        <ChatDisclaimer>Aiden can make mistakes. Verify important information.</ChatDisclaimer>
      </ChatLayoutFooter>
    </ChatLayout>
  );
};

/** The panel over a working page — open it, then interact with the page behind. */
export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <HostPage>
          {!open && (
            <Fab id="aiden-fab" onClick={() => setOpen(true)} aria-label="Ask Aiden" pulse>
              <Sparkles />
            </Fab>
          )}
        </HostPage>
        <AidenPanel id="aiden-panel" open={open} onClose={() => setOpen(false)}>
          <AidenPanelHeader
            title="Aiden"
            description="Assistant"
            icon={<Sparkles size={16} aria-hidden="true" />}
          />
          <PanelChat idPrefix="aiden-panel" />
        </AidenPanel>
      </>
    );
  },
};

/**
 * The whole integration: Fab → panel → expand → full screen → back. The
 * consumer owns one `view` value; the components never navigate themselves.
 */
export const ThreeStateFlow: Story = {
  render: function FlowStory() {
    const [view, setView] = useState<'closed' | 'panel' | 'full'>('closed');
    return (
      <>
        <HostPage>
          {view === 'closed' && (
            <Fab id="flow-fab" onClick={() => setView('panel')} aria-label="Ask Aiden" pulse>
              <Sparkles />
            </Fab>
          )}
        </HostPage>

        <AidenPanel
          id="flow-panel"
          open={view === 'panel'}
          onClose={() => setView('closed')}
          onExpand={() => setView('full')}
        >
          <AidenPanelHeader title="Aiden" description="Assistant" />
          <PanelChat idPrefix="flow-panel" />
        </AidenPanel>

        <AidenFullScreen
          id="flow-full"
          open={view === 'full'}
          onClose={() => setView('panel')}
        >
          <PanelChat idPrefix="flow-full" />
        </AidenFullScreen>
      </>
    );
  },
};
