import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ChartColumn, ChartLine, CircleHelp, FileText, House, Layers,
  LifeBuoy, MessageSquare, Search, Users,
} from 'lucide-react';
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
import Accordion, {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../Accordion/Accordion';
import Card, { CardHeader, CardBody, CardFooter } from '../Card/Card';
import Separator from '../Separator/Separator';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../Tabs/Tabs';
import Sidebar, {
  SidebarProvider, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarRail,
} from '../Sidebar/Sidebar';
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
        'anything that is a destination rather than a question. Covers the viewport ' +
        'edge to edge, so nothing of the app shell shows through, and returns the user ' +
        'exactly where they were. It is a preset of `Dialog`, not a reimplementation — ' +
        'the portal, focus trap, scroll lock, focus restore and exit animation are all ' +
        'Dialog’s, and only the geometry and the Escape handling are new.',
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

// No `display: grid` here — the body is already a grid and supplies the row
// gap, and making the paragraph one too broke `<strong>1.</strong> text` onto
// two lines by turning the strong into its own row.
const PROSE: React.CSSProperties = {
  margin: 0,
  color: 'var(--muted-foreground)',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--leading-6)',
};

// ── A real workspace behind the overlay ─────────────────────────────────────
// Built from the library's own Sidebar and Tabs rather than hand-rolled divs.
// That matters twice over: it is the scenario this component was designed for
// (a Help link pinned to the sidebar footer), and it is the honest regression
// test for "nothing shows through" — the REAL sidebar sits at --z-30 with a
// viewport-fixed panel, and the overlay has to cover that, not a stand-in.
const WorkspaceShell = ({ onOpen }: { onOpen: () => void }) => (
  // minHeight released from 100svh so the shell fills its frame rather than the
  // viewport — see the `contain: layout` note on the story that renders it.
  <SidebarProvider style={{ minHeight: 0, height: '100%' }}>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Workspace">
              <Layers />
              <span>Workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { label: 'Home', Icon: House },
                { label: 'Revenue', Icon: ChartLine },
                { label: 'Pipeline', Icon: ChartColumn },
                { label: 'Retention', Icon: Users },
              ].map(({ label, Icon }, i) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton isActive={i === 1} tooltip={label}>
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* The trigger this whole component exists for. */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help &amp; feedback" onClick={onOpen}>
              <CircleHelp />
              <span>Help &amp; feedback</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      {/* Tabs as the workspace's open-dashboard row. Content tabs, not browser
          tabs — the library has no per-tab-close strip, which is noted in
          CLAUDE.md as its own component if the shell ever needs one. */}
      <Tabs id="ws-tabs" defaultValue="revenue">
        <div style={{ padding: 'var(--p-2)', borderBottom: 'var(--border-w-100) solid var(--border)' }}>
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="revenue">
          <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-4)', alignContent: 'start' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>Revenue</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--p-4)' }}>
              {['MRR', 'Churn', 'Expansion'].map((k) => (
                <Card key={k} id={`ws-card-${k}`}>
                  <CardBody>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{k}</div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>—</div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="pipeline">
          <div style={{ padding: 'var(--p-6)', color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)' }}>
            Pipeline dashboard.
          </div>
        </TabsContent>
      </Tabs>
    </SidebarInset>
  </SidebarProvider>
);

export const OverAppShell: Story = {
  name: 'Opened from a workspace sidebar',
  render: function Shell() {
    const [open, setOpen] = useState(false);
    return (
      /*
        A bounded frame so the docs page does not run a full screen per example.
        `contain: layout` is load-bearing: the Sidebar's panel is
        `position: fixed`, and `position: relative` does NOT contain a fixed
        child — only transform / filter / perspective / contain do. Without it
        the sidebar escapes to the iframe viewport and the shell claims 100svh.

        MEASURED, because the obvious assumption is wrong: this contains the
        SIDEBAR but NOT the overlay. Dialog portals to `document.body`, so the
        overlay is not a descendant of this frame and no containing block here
        can reach it — it still covers the whole iframe when opened. That is
        correct behaviour for a full-screen page and would need a portal-target
        prop on Dialog to change, which is not worth adding for a story.
      */
      <div
        style={{
          contain: 'layout',
          position: 'relative',
          height: 'var(--h-96)',
          overflow: 'hidden',
          border: 'var(--border-w-100) solid var(--border)',
          borderRadius: 'var(--rounded-lg)',
        }}
      >
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
      </div>
    );
  },
};

const FAQS = [
  {
    q: 'How do I invite someone to my workspace?',
    a: 'Open the workspace switcher, choose Members, then Invite. Invitees get an email link that expires after seven days. Members added this way start on the Viewer role — you can change it from the same screen once they have accepted.',
  },
  {
    q: 'Can I move a dashboard between workspaces?',
    a: 'Yes. Open the dashboard, choose Move from the overflow menu, and pick the destination. Anything the dashboard depends on — saved filters, shared queries — moves with it. People who had access through the old workspace lose it, so re-share afterwards if you need to.',
  },
  {
    q: 'Why does my chart show fewer rows than the source table?',
    a: 'Charts apply the dashboard-level filters before they draw, and rows with a null on the grouping column are dropped rather than bucketed into an "unknown" group. Clear the filters in the toolbar to compare against the raw table.',
  },
  {
    q: 'How long is data kept after I delete it?',
    a: 'Deleted dashboards sit in Trash for 30 days and can be restored by anyone with Editor access. After that they are removed permanently and cannot be recovered, including by support.',
  },
  {
    q: 'Do you support single sign-on?',
    a: 'SAML and OIDC are available on Business and Enterprise plans. Setup takes about ten minutes and needs a workspace Owner plus someone who can add an application in your identity provider.',
  },
];

/**
 * The story the component was designed against: a real Help page with sections,
 * not a paragraph of filler. Also the honest test of the content column — an
 * accordion and a two-up card row have to sit comfortably at the same width.
 */
export const HelpAndSupport: Story = {
  name: 'Help & Support page',
  render: function HelpPage() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--p-8)' }}>
        <Button id="fsd-help-open" onClick={() => setOpen(true)} IconLeft={CircleHelp} label="Help & Support" />
        <FullScreenDialog id="fsd-help" open={open} onClose={() => setOpen(false)}>
          <FullScreenDialogHeader
            title="Help &amp; Support"
            description="Answers to the questions we get most, and a way to reach a human when they are not enough."
          />
          <FullScreenDialogBody>
            <section style={{ display: 'grid', gap: 'var(--p-4)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>
                Frequently asked questions
              </h3>
              {/* `collapsible` so the last open item can be closed again — on a
                  reference page nothing should be forced open. */}
              <Accordion id="fsd-help-faq" type="single" collapsible>
                {FAQS.map((f, i) => (
                  <AccordionItem key={f.q} value={`faq-${i}`}>
                    <AccordionTrigger>{f.q}</AccordionTrigger>
                    <AccordionContent>
                      <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)', color: 'var(--muted-foreground)' }}>
                        {f.a}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <Separator id="fsd-help-sep" />

            {/* Two-up, and it collapses to one column under 640px rather than
                squeezing two unreadable cards side by side. */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 'var(--p-4)',
                marginTop: 'var(--p-8)',
              }}
            >
              {/* Flex column + a growing header so BOTH footers sit on the same
                  line. The grid already stretches the cards to equal height;
                  without this the shorter description leaves its CTA floating
                  mid-card and the pair reads as misaligned. */}
              <Card id="fsd-help-terms" style={{ display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  style={{ flex: 1 }}
                  id="fsd-help-terms-header"
                  title="Terms of use"
                  description="What you agree to when you use the product, in plain language, plus our privacy and data-retention policies."
                />
                <CardFooter>
                  <Button id="fsd-help-terms-cta" style="outline" IconLeft={FileText} label="Read the terms" onClick={() => {}} />
                </CardFooter>
              </Card>

              <Card id="fsd-help-contact" style={{ display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  style={{ flex: 1 }}
                  id="fsd-help-contact-header"
                  title="Still need more assistance?"
                  description="Our support team replies within one business day, and sooner on Business and Enterprise plans."
                />
                <CardFooter>
                  <Button id="fsd-help-contact-cta" IconLeft={LifeBuoy} label="Contact support" onClick={() => {}} />
                </CardFooter>
              </Card>
            </div>
          </FullScreenDialogBody>
        </FullScreenDialog>
      </div>
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

const CLAUSE =
  'Every part that scrolls is the body; the header and footer sit outside it and are pinned ' +
  'to the top and bottom of the viewport, so they stay put however far the content runs.';

export const LongContent: Story = {
  name: 'The body scrolls, the chrome does not',
  render: function Long() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 'var(--p-8)' }}>
        <Button id="fsd-long-open" onClick={() => setOpen(true)} label="Open a long page" />
        <FullScreenDialog id="fsd-long" open={open} onClose={() => setOpen(false)}>
          <FullScreenDialogHeader
            title="Terms of service"
            description="Scroll — the header and footer stay put, and the page's own scrollbar is styled to match the system rather than left as a raw OS bar."
          />
          {/*
            ONE scroll region, deliberately. An earlier cut put a ScrollArea
            pane in here as well, which left the page with two thumbs in two
            different styles — the nested one ours, the outer one the OS's. Two
            scrollbars on one surface read as a bug however correct each is on
            its own. The body is the page's scroller; its bar is styled in
            FullScreenDialog.scss.
          */}
          <FullScreenDialogBody>
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} style={PROSE}>
                <strong style={{ color: 'var(--foreground)' }}>{i + 1}.</strong> {CLAUSE}
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
