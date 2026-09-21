import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';
import AidenPanel, { AidenPanelHeader } from './AidenPanel';
import AidenFullScreen from '../AidenFullScreen';
import Fab from '../Fab';
import { Activity, BarChart, FolderPlus, LineChart, Plus } from 'lucide-react';
import Button from '../Button';
import Card, { CardBody, CardHeader } from '../Card';
import Item, {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '../Item';
import Input from '../Input';
import NativeSelect, { NativeSelectOption } from '../NativeSelect';
import {
  ChatActionCard,
  ChatBubble,
  ChatGreeting,
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
  ChatSuggestion,
  ChatSuggestions,
} from '../Chat';
import type { ChatActionStatus } from '../Chat';
import type { UiDocsParameters } from '../../types/DocsTypes';
import { AidenSparkles } from '../../prototypes/AidenSparkles';

const meta: Meta<typeof AidenPanel> = {
  title: 'AI/AIPanel',
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
          date: '2026-09-20',
          summary:
            'The panel lifts off the page instead of sitting flush against it — a new `--shadow-panel`, with the hairline and the surface unchanged.',
          detail:
            '**The panel was hard to tell apart from the page, and in light that was arithmetic rather than taste.** Every surface token resolves to `#ffffff`, so the panel and the page behind it were literally the same colour — a 1.00:1 difference — leaving a single `--border` hairline at **1.48:1** to do all the separating.\n\n' +
            '`box-shadow` moves from `--shadow-lg` to a new `--shadow-panel`. **Nothing else changed**: the surface is still `--background` and the hairline is still `--border`, so the panel keeps its weight and only gains depth.\n\n' +
            '`--shadow-panel` is a tight layer for definition plus a wide soft halo, both on `--shadow-color-2xl` so it stays mode-aware. **It is symmetric on purpose** — `box-shadow` has no logical-direction form, so a leftward cast would point the wrong way under `dir="rtl"`; at the viewport edge only the inboard side is ever visible, so a halo reads the same and mirrors for free. Every other shadow in the ramp casts downward, which does nothing for a surface whose visible edge is vertical.\n\n' +
            'A first attempt also moved the surface to `--popover`, the edge to `--border-hover` and the shadow to `--shadow-2xl` — chasing the 3:1 WCAG 1.4.11 boundary figure. It cleared every number and looked wrong: a hard slate-500 rule, a heavy drop shadow, and in dark a pale slate-600 slab. Reverted. **The contrast floor told us the old edge was too weak; it did not say the new one should be strong.**',
        },
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
        Browse dashboards
      </h1>
      <Card id="host-card">
        <CardHeader id="host-card-h" title="128 dashboards" description="The page stays fully usable while the panel is open — type here to prove it." />
        <CardBody>
          <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
            <Input id="host-input" label="Search" placeholder="Still focusable behind the panel" />
            <NativeSelect id="host-select" label="Sort">
              <NativeSelectOption value="used">Most used</NativeSelectOption>
              <NativeSelectOption value="new">Newest</NativeSelectOption>
            </NativeSelect>
          </div>
        </CardBody>
      </Card>
      {children}
    </div>
  </div>
);


/**
 * What Aiden found, as objects rather than names in a sentence.
 *
 * `Item` is the library's result row — its own docblock calls it the building
 * block for result lists — so this needs no new component. Three details make it
 * work inside a transcript:
 *
 * - **`alignSelf: stretch`.** The assistant's body is `align-items: flex-start`
 *   (full-width prose, not a bubble), so a block child hugs its content and the
 *   rows come out ragged. Stretching pins them to the message width.
 * - **The row is a plain `<div>`, not a link.** `Item` renders an `<a>` when
 *   given `href` and a `<button>` when given `onClick` — either would put the
 *   "Add to space" button inside an interactive element, which browsers
 *   silently un-nest. The TITLE carries the link and the action stays a real
 *   button, so there are two valid targets.
 * - **One layout for all three surfaces.** The popover is 316px of content and
 *   the full screen 736px; a card grid that works at 736 collapses at 316, so
 *   these are compact rows and the action is icon-only everywhere.
 *
 * **The popover drops the descriptions** (Figma, 2026-09-20). Three rows with
 * two-line descriptions are 210px of a ~380px body, which pushed the composer
 * off the bottom — measured, the group overlapped it by 2px. Title-only rows are
 * 48px instead of 70 and leave 64px of clearance. That is a real rule rather
 * than a fudge: the smallest surface says WHAT it found, not why, and you open a
 * result to learn more. The panel (510px of slack) and full screen keep theirs.
 */
const RESULTS = [
  {
    id: 'collections-performance',
    Icon: LineChart,
    name: 'Collections Performance',
    what: 'Promise-to-pay, roll forward and agent outcomes by queue.',
  },
  {
    id: 'support-backlog',
    Icon: BarChart,
    name: 'Support Backlog',
    what: 'Ticket age and first-response time across every queue.',
  },
  {
    id: 'servicing-sla',
    Icon: Activity,
    name: 'Servicing SLA',
    what: 'Attainment by team, including the collections queues.',
  },
];

const DashboardResults = ({ idPrefix }: { idPrefix: string }) => (
  <ItemGroup
    aria-label="Dashboards Aiden found"
    style={{ alignSelf: 'stretch', gap: 'var(--p-2)', marginTop: 'var(--p-1)' }}
  >
    {RESULTS.map(({ id, Icon, name, what }) => (
      <Item key={id} variant="outline" size="sm">
        <ItemMedia variant="icon">
          <Icon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <a href={`#${id}`} style={{ color: 'inherit' }}>
              {name}
            </a>
          </ItemTitle>
          <ItemDescription>{what}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            id={`${idPrefix}-add-${id}`}
            style="ghost"
            size="sm"
            iconOnly
            IconCenter={Plus}
            aria-label={`Add ${name} to a space`}
          />
        </ItemActions>
      </Item>
    ))}
  </ItemGroup>
);

/**
 * The action Aiden wants to take, driven so the whole lifecycle is real rather
 * than four static cards: Confirm advances it to `running`, it settles on
 * `done`, and Undo puts it back. That round trip is the reason the component
 * exists — a receipt you cannot reverse is just a notification.
 */
const AddToSpaceAction = ({ id }: { id: string }) => {
  const [status, setStatus] = useState<ChatActionStatus>('proposed');
  const timer = useRef<number | undefined>(undefined);
  // A bare setTimeout would fire a state update on a dead component if the
  // panel closes mid-run — the same guard ChatMessageAction's copy timer uses.
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const confirm = () => {
    setStatus('running');
    timer.current = window.setTimeout(() => setStatus('done'), 900);
  };

  return (
    <ChatActionCard
      id={id}
      status={status}
      icon={<FolderPlus aria-hidden="true" />}
      title={
        status === 'done'
          ? 'Added Collections Performance to a new space'
          : 'Add Collections Performance to a new space'
      }
      description="Creates “Collections” and opens the Builder with it on the canvas."
      secondaryAction={
        status === 'proposed' ? (
          <Button id={`${id}-cancel`} style="ghost" size="sm" label="Not now" />
        ) : undefined
      }
      primaryAction={
        status === 'proposed' ? (
          <Button id={`${id}-confirm`} size="sm" label="Confirm" onClick={confirm} />
        ) : status === 'done' ? (
          <Button
            id={`${id}-undo`}
            style="ghost"
            size="sm"
            label="Undo"
            onClick={() => setStatus('proposed')}
          />
        ) : undefined
      }
      style={{ alignSelf: 'stretch', marginTop: 'var(--p-1)' }}
    />
  );
};

/** The three openers. Written as things a user would actually type, and scoped
 *  to what Aiden can genuinely do here — a starter it cannot answer is worse
 *  than no starter at all. */
const STARTERS = [
  'Which dashboards cover collections?',
  'What does promise-to-pay measure?',
  'What did my team open this week?',
];

/**
 * First run, driven: the greeting is replaced by the conversation the moment a
 * starter is picked, so the story shows the transition rather than two
 * disconnected states.
 */
const FirstRunChat = ({ idPrefix }: { idPrefix: string }) => {
  const [asked, setAsked] = useState<string | null>(null);
  const [value, setValue] = useState('');
  return (
    <ChatLayout>
      <ChatLayoutBody>
        <ChatMessageList>
          {asked === null ? (
            <ChatGreeting
              icon={<AidenSparkles gradient />}
              title="What can I help you find?"
              description="Ask about any of the 128 dashboards here, or start with one of these."
            >
              <ChatSuggestions>
                {STARTERS.map((s) => (
                  <ChatSuggestion key={s} onClick={() => setAsked(s)}>
                    {s}
                  </ChatSuggestion>
                ))}
              </ChatSuggestions>
            </ChatGreeting>
          ) : (
            <>
              <ChatMessage from="user">
                <ChatBubble>{asked}</ChatBubble>
              </ChatMessage>
              <ChatMessage from="assistant" avatar={<AidenSparkles gradient />}>
                <ChatBubble>Three do — closest first.</ChatBubble>
                <DashboardResults idPrefix={idPrefix} />
              </ChatMessage>
            </>
          )}
        </ChatMessageList>
      </ChatLayoutBody>
      <ChatLayoutFooter>
        <ChatComposer
          id={`${idPrefix}-composer`}
          value={value}
          onValueChange={setValue}
          onSubmit={() => { setAsked(value); setValue(''); }}
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

const PanelChat = ({
  idPrefix,
  sendSize = 'sm',
}: {
  idPrefix: string;
  /**
   * The send button steps up to `default` on the full-screen composer. At `sm`
   * it is 30px on a 768px composer — 3.9% of its width, stranded behind ~600px
   * of empty toolbar — and it stops registering as the primary action. In the
   * 388px panel the same button is 7.7% and sits beside the other tools, so it
   * reads fine and stays `sm`.
   */
  sendSize?: 'sm' | 'default';
}) => {
  const [value, setValue] = useState('');
  return (
    <ChatLayout>
      <ChatLayoutBody>
        <ChatMessageList>
          {/* Aiden's turns carry its glyph on every surface — popover, panel and
              full screen alike — so an answer is attributable wherever it is
              read. Owner, 2026-09-20. */}
          <ChatMessage from="assistant" avatar={<AidenSparkles gradient />}>
            <ChatBubble>
              You’re browsing 128 dashboards. Ask me to narrow them down, or to
              explain what any of them measures.
            </ChatBubble>
          </ChatMessage>

          <ChatMessage from="user">
            <ChatBubble>Which of these dashboards covers collections?</ChatBubble>
          </ChatMessage>

          {/* The answer names three products the user's next move is to open, so
              it renders them rather than describing them. */}
          <ChatMessage from="assistant" avatar={<AidenSparkles gradient />}>
            <ChatBubble>Three do — closest first.</ChatBubble>
            <DashboardResults idPrefix={idPrefix} />
          </ChatMessage>

          <ChatMessage from="user">
            <ChatBubble>Add the closest one to a new space.</ChatBubble>
          </ChatMessage>

          {/* Aiden is about to change the product, so it asks first and leaves a
              receipt it can reverse — rather than narrating what it already did. */}
          <ChatMessage from="assistant" avatar={<AidenSparkles gradient />}>
            <AddToSpaceAction id={`${idPrefix}-add-space`} />
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
            <ChatComposerSend id={`${idPrefix}-send`} size={sendSize} />
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
              <AidenSparkles />
            </Fab>
          )}
        </HostPage>
        <AidenPanel id="aiden-panel" open={open} onClose={() => setOpen(false)}>
          {/* No `icon`: the mark was pulled from the headers on 2026-09-20. Aiden's
              glyph now identifies its turns in the transcript, and repeating it
              in the header a few pixels above the first answer said it twice. */}
          <AidenPanelHeader title="Aiden" description="Assistant" />
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
              <AidenSparkles />
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
          <PanelChat idPrefix="flow-full" sendSize="default" />
        </AidenFullScreen>
      </>
    );
  },
};


/**
 * What a user actually sees first: nothing has been asked yet.
 *
 * Every other story here opens mid-conversation, which is the state a demo
 * reaches for and the one a real user almost never starts in. An assistant that
 * opens as an empty box asks the user to guess what it can do — the greeting and
 * three starters are what turn a blank panel into an obvious next move.
 *
 * **A suggestion SUBMITS, it does not pre-fill the composer.** That is the
 * contract `AidenLauncher` already documents: one click, one turn. Pre-filling
 * would make the user press send on words they did not write.
 */
export const FirstRun: Story = {
  render: function FirstRunStory() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <HostPage>
          {!open && (
            <Fab id="first-run-fab" onClick={() => setOpen(true)} aria-label="Ask Aiden" pulse>
              <AidenSparkles />
            </Fab>
          )}
        </HostPage>
        <AidenPanel id="first-run-panel" open={open} onClose={() => setOpen(false)}>
          <AidenPanelHeader title="Aiden" description="Assistant" />
          <FirstRunChat idPrefix="first-run" />
        </AidenPanel>
      </>
    );
  },
};
