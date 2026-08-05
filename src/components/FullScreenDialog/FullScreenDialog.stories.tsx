import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CircleHelp, MessageSquare, Search } from 'lucide-react';
import FullScreenDialog, {
  FullScreenDialogHeader,
  FullScreenDialogBody,
  FullScreenDialogFooter,
} from './FullScreenDialog';
import Button from '../Button/Button';
import Input from '../Input/Input';
import Textarea from '../Textarea/Textarea';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '../Select/Select';
import Item, { ItemContent, ItemTitle, ItemDescription } from '../Item/Item';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof FullScreenDialog> = {
  title: 'Components/FullScreenDialog',
  component: FullScreenDialog,
  parameters: {
    // Not 'centered' — this fills the viewport, and a centred canvas would
    // misrepresent it.
    layout: 'fullscreen',
    ui: {
      description:
        'A page rendered over the one the user was on — Help, Feedback, settings: ' +
        'anything that is a **destination** rather than a question. Covers the viewport ' +
        'edge to edge, so nothing of the app shell shows through, and returns the user ' +
        'exactly where they were.\n\n' +
        'It is a preset of `Dialog`, not a reimplementation. The portal, focus trap, ' +
        'scroll lock, focus restore and exit animation are all Dialog’s; only the ' +
        'geometry and the Escape handling are new.',
      tags: ['compound', 'modal', 'portal'],
      usage: {
        when: [
          'A whole page of content opened from inside the app — Help, Feedback, account settings.',
          'The task is long enough that a card would scroll awkwardly, but the user must come back to where they were.',
        ],
        avoid: [
          'A question with two answers — that is `AlertDialog`.',
          'One focused task that fits in a card — that is `Dialog`.',
          'Supporting content that should sit beside the page rather than over it — that is `Drawer`.',
          'Anything the user should be able to leave by clicking away. There is deliberately no click-outside here.',
        ],
        notes:
          'Dismissal is the X or Escape only. `contentWidth` caps the body’s content column ' +
          'without narrowing the panel, so a form does not stretch across a 2560px monitor — ' +
          'the scroll bar still hugs the viewport edge.',
      },
      composition: [
        {
          name: 'FullScreenDialogHeader',
          description:
            'Title, optional description, and the close X. Takes `id` and `onClose` from ' +
            'context, so `<FullScreenDialogHeader title="Feedback" />` is the whole of it.',
          required: true,
        },
        {
          name: 'FullScreenDialogBody',
          description: 'The scrolling middle. Its content sits in a centred column sized by `contentWidth`.',
        },
        {
          name: 'FullScreenDialogFooter',
          description: 'Action row pinned to the bottom of the viewport.',
        },
      ],
      a11y: {
        keyboard: [
          { keys: ['Esc'], description: 'Close the page — unless a menu or select is open, which gets the Escape first.' },
          { keys: ['Tab'], description: 'Cycles within the page. Focus never reaches the app behind it.' },
        ],
        notes:
          'Keeps `role="dialog"` with `aria-modal`: size does not change the semantics, and the ' +
          'alternatives (`region`, `main`) carry no modality, which would leave the fully-covered ' +
          'app reachable to a screen reader. The header is required for the accessible name — ' +
          'it seeds the id that `aria-labelledby` points at. The X is on by default because with ' +
          'no click-outside, a header without one leaves Escape as the only exit, which is ' +
          'undiscoverable and unavailable on touch.',
      },
      changelog: [
        {
          date: '2026-08-05',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API. ' +
            'Built as a preset of `Dialog`, which gained an additive `closeOnEscape` prop so this ' +
            'component can decide whether an Escape was meant for the page or for a menu above it.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    open: { control: 'boolean' },
    contentWidth: {
      control: 'select',
      options: ['md', 'lg', 'xl', 'full'],
    },
    onClose: { action: 'closed' },
    children: { control: false, table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof FullScreenDialog>;

const PROSE: React.CSSProperties = {
  display: 'grid',
  gap: 'var(--p-4)',
  color: 'var(--muted-foreground)',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--leading-6)',
};

// ── A fake workspace behind the overlay ─────────────────────────────────────
// Not decoration: this is the regression test for "nothing shows through". The
// sidebar sits at --z-30 and the overlay at --z-50, and the only honest way to
// check that is to put a real shell underneath.
const WorkspaceShell = ({ onOpen }: { onOpen: () => void }) => (
  <div style={{ display: 'flex', height: '100vh', background: 'var(--background)' }}>
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--sidebar)',
        borderRight: 'var(--border-w-100) solid var(--sidebar-border)',
        padding: 'var(--p-2)',
      }}
    >
      <div style={{ padding: 'var(--p-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)' }}>
        Acme workspace
      </div>
      <div style={{ display: 'grid', gap: 'var(--p-1)', flex: 1, alignContent: 'start' }}>
        {['Home', 'Revenue', 'Pipeline', 'Retention'].map((s) => (
          <div key={s} style={{ padding: 'var(--p-2)', borderRadius: 'var(--rounded-md)', fontSize: 'var(--text-sm)', color: 'var(--sidebar-foreground)' }}>
            {s}
          </div>
        ))}
      </div>
      {/* The trigger the component was designed for. */}
      <Button id="ws-help" style="ghost" size="sm" onClick={onOpen} IconLeft={CircleHelp} label="Help & feedback" />
    </aside>

    <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 'var(--p-1)', padding: 'var(--p-2)', borderBottom: 'var(--border-w-100) solid var(--border)' }}>
        {['Revenue', 'Pipeline'].map((t, i) => (
          <div key={t} style={{
            padding: 'var(--p-1-5) var(--p-3)', fontSize: 'var(--text-sm)',
            borderRadius: 'var(--rounded-md)',
            background: i === 0 ? 'var(--accent)' : 'transparent',
          }}>{t}</div>
        ))}
      </div>
      <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-4)', alignContent: 'start' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>Revenue</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--p-4)' }}>
          {['MRR', 'Churn', 'Expansion'].map((k) => (
            <div key={k} style={{ padding: 'var(--p-4)', border: 'var(--border-w-100) solid var(--border)', borderRadius: 'var(--rounded-lg)', background: 'var(--card)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{k}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>—</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export const OverAppShell: Story = {
  name: 'Opened from a workspace sidebar',
  render: function Shell() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <WorkspaceShell onOpen={() => setOpen(true)} />
        <FullScreenDialog id="fsd-shell" open={open} onClose={() => setOpen(false)}>
          <FullScreenDialogHeader
            title="Help &amp; feedback"
            description="Search the docs, or tell us what is not working."
          />
          <FullScreenDialogBody>
            <Input id="fsd-shell-q" label="Search help" placeholder="How do I…" IconLeft={Search} />
            {['Getting started', 'Sharing a dashboard', 'Billing and invoices', 'Keyboard shortcuts'].map((t) => (
              <Item key={t} id={`fsd-shell-${t}`} variant="outline" onClick={() => {}}>
                <ItemContent>
                  <ItemTitle>{t}</ItemTitle>
                  <ItemDescription>Read the guide</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </FullScreenDialogBody>
        </FullScreenDialog>
      </>
    );
  },
};

export const Feedback: Story = {
  name: 'Feedback — the case it was built for',
  render: function FeedbackPage() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--p-8)' }}>
        <Button id="fsd-fb-open" onClick={() => setOpen(true)} IconLeft={MessageSquare} label="Give feedback" />
        {/* md — a label and its input stay in one glance. */}
        <FullScreenDialog id="fsd-fb" open={open} onClose={() => setOpen(false)} contentWidth="md">
          <FullScreenDialogHeader
            title="Send feedback"
            description="Product, bug report, or anything else on your mind."
          />
          <FullScreenDialogBody>
            <Select id="fsd-fb-kind" label="Topic" defaultValue="bug">
              <SelectTrigger id="fsd-fb-kind-trigger" placeholder="Pick one" />
              <SelectContent>
                <SelectItem value="bug">Something is broken</SelectItem>
                <SelectItem value="idea">I have an idea</SelectItem>
                <SelectItem value="other">Something else</SelectItem>
              </SelectContent>
            </Select>
            <Input id="fsd-fb-subject" label="Subject" placeholder="One line" />
            <Textarea id="fsd-fb-body" label="Details" rows={8} placeholder="What happened?" />
          </FullScreenDialogBody>
          <FullScreenDialogFooter>
            <Button id="fsd-fb-cancel" style="ghost" onClick={() => setOpen(false)} label="Cancel" />
            <Button id="fsd-fb-send" onClick={() => setOpen(false)} label="Send feedback" />
          </FullScreenDialogFooter>
        </FullScreenDialog>
      </div>
    );
  },
};

export const EscapeWithNestedSelect: Story = {
  name: 'Escape closes the select, not the page',
  render: function NestedEscape() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--p-8)' }}>
        <Button id="fsd-esc-open" onClick={() => setOpen(true)} label="Open, then Escape a select" />
        <FullScreenDialog id="fsd-esc" open={open} onClose={() => setOpen(false)} contentWidth="md">
          <FullScreenDialogHeader
            title="Nested overlays"
            description="Open the select, press Escape. The select closes and this page stays. Press Escape again to leave."
          />
          <FullScreenDialogBody>
            <Select id="fsd-esc-sel" label="A select inside the page">
              <SelectTrigger id="fsd-esc-sel-trigger" placeholder="Open me, then press Escape" />
              <SelectContent>
                <SelectItem value="a">First</SelectItem>
                <SelectItem value="b">Second</SelectItem>
                <SelectItem value="c">Third</SelectItem>
              </SelectContent>
            </Select>
            <p style={PROSE}>
              Without the guard this component adds, one Escape would close the select
              <em> and </em> discard the page behind it, because the floating surfaces all
              listen on <code>document</code> and none of them stops the event.
            </p>
          </FullScreenDialogBody>
        </FullScreenDialog>
      </div>
    );
  },
};

export const ContentWidths: Story = {
  render: function Widths() {
    const [w, setW] = useState<'md' | 'lg' | 'xl' | 'full' | null>(null);
    return (
      <div style={{ padding: 'var(--p-8)', display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
        {(['md', 'lg', 'xl', 'full'] as const).map((size) => (
          <Button key={size} id={`fsd-w-${size}`} style="outline" onClick={() => setW(size)} label={`contentWidth="${size}"`} />
        ))}
        <FullScreenDialog id="fsd-w" open={w !== null} onClose={() => setW(null)} contentWidth={w ?? 'lg'}>
          <FullScreenDialogHeader
            title={`contentWidth="${w ?? 'lg'}"`}
            description="The panel always fills the viewport — only the column inside the body is capped."
          />
          <FullScreenDialogBody>
            <div style={{ padding: 'var(--p-4)', border: 'var(--border-w-100) dashed var(--border)', borderRadius: 'var(--rounded-lg)', fontSize: 'var(--text-sm)' }}>
              This block stretches to the column width. Widen the browser to see the
              column stop growing while the header hairline keeps running edge to edge.
            </div>
          </FullScreenDialogBody>
        </FullScreenDialog>
      </div>
    );
  },
};

export const LongContent: Story = {
  name: 'The body scrolls, the chrome does not',
  render: function Long() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--p-8)' }}>
        <Button id="fsd-long-open" onClick={() => setOpen(true)} label="Open a long page" />
        <FullScreenDialog id="fsd-long" open={open} onClose={() => setOpen(false)}>
          <FullScreenDialogHeader title="Terms of service" description="Scroll — the header and footer stay put." />
          <FullScreenDialogBody>
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} style={PROSE}>
                <strong style={{ color: 'var(--foreground)' }}>{i + 1}.</strong> Every part
                that scrolls is the body; the header and footer sit outside it and are
                pinned to the top and bottom of the viewport.
              </p>
            ))}
          </FullScreenDialogBody>
          <FullScreenDialogFooter>
            <Button id="fsd-long-ok" onClick={() => setOpen(false)} label="Done" />
          </FullScreenDialogFooter>
        </FullScreenDialog>
      </div>
    );
  },
};
