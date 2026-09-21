import type { Meta, StoryObj } from '@storybook/react';
import { Megaphone, Plus, Search, Sparkles } from 'lucide-react';
import PageHeader from './PageHeader';
import Badge from '../Badge';
import Button from '../Button';
import FeaturedIcon from '../FeaturedIcon';
import Input from '../Input';
import PageContainer from '../PageContainer';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The top of a page: an optional `visual` and `overline`, the `title`, a `description`, ' +
        '`actions`, and optionally a `toolbar` under the row. ' +
        'The spacing inside it is decided once — overline → title → description L5, the row\'s parts L3 ' +
        'apart and its controls L4, toolbar L2 below the row — so a screen never chooses it. First child ' +
        'of `PageContainer`, which puts level 1 between the header and the content.',
      tags: ['layout', 'ladder', 'header'],
      usage: {
        when: [
          'Every page. The search field or filter bar that belongs to the page goes in `toolbar`, not in the section stack below.',
          'Use `overline` for the short line above the title — the section the page belongs to, a status, a date, a "what\'s new" eyebrow. It is a flex row, so it carries a `Badge` or a glyph beside the words.',
          'Use `visual` for the object that introduces the page — a `FeaturedIcon`, an `Avatar`, a product mark. It sits at the start of the title row, level with the first line.',
        ],
        avoid: [
          'Stacking a search field under a `PageHeader` as a sibling. That is the gap that goes wrong at 1920; it belongs in `toolbar`.',
          'A cover image in `visual`. A page header has no full-bleed media region — that is `CardMedia`\'s job, on a card in the content below.',
          'Uppercasing an overline by passing shouted text when the page does not want it. The component deliberately does not transform the case, so the string you pass is the string that renders.',
        ],
        notes:
          'Renders a `<header>` with an `h1` by default; `headingLevel="h2"` for a panel inside a page that already has one.\n\n' +
          '`overline` renders as a `div`, not a `p`. An overline routinely carries a `Badge`, which is a div, and a div inside a `p` is invalid markup the browser silently un-nests. Same reasoning as `CardOverline`.',
      },
      changelog: [
        {
          date: '2026-09-17',
          summary: 'New `showDivider` — a hairline closing the header that bleeds past the page margin.',
          detail:
            'Off by default, so every header already in the wild renders unchanged. It composes `Separator` as `decorative` (the `<header>` element already draws the boundary; a second role would announce it twice) and sits last, closing the whole header rather than landing between the title row and a toolbar. The root\'s level-2 gap sits above it — the same rung header → toolbar already uses.\n\n' +
            '**The bleed is the point.** A rule that stops at the text column reads as belonging to the content instead of closing the header. `PageContainer` now publishes its own padding as `--ui-page-header-bleed`, and the rule takes that much negative inline margin to cancel it exactly. The variable is declared on the container, not read from the header, because the container is the only thing that knows its own padding — so a header outside a container gets no bleed and stays inset. That direction matters: it can never drag a header out of an arbitrary parent. Override the variable to bleed past a different container.\n\n' +
            'The `.ui-page-header__divider` rule is deliberately two classes: `.ui-separator--horizontal` sets `width: 100%`, which would leave the rule merely offset by the bleed rather than widened, and a single class ties it at (0,1,0) and resolves on stylesheet order.',
        },
        {
          date: '2026-09-16',
          summary: '`actions` now align to the bottom of the text block instead of the top.',
          detail:
            'A header with a title AND a description left its controls floating high — 32px controls hung off the top of a 40px title sitting over a 24px description. The header reads as one block on a baseline, and the controls belong to the page rather than to the title, so they now sit on the block\'s bottom edge. Measured against the Browse screen in the design file, which draws exactly this.\n\n' +
            'Implemented as `align-self: flex-end` on `__actions` alone, NOT `align-items: flex-end` on `__row`. The row has to stay `flex-start` so `visual` keeps sitting level with the first line of text; bottom-aligning the row would drop the glyph to the foot of a wrapped block, which is the one thing that rule exists to prevent.\n\n' +
            'Trade-off, accepted: a description long enough to wrap carries the controls down with it, away from the title. A header with no description, or with actions taller than its text, renders exactly as before.',
        },
        {
          date: '2026-09-16',
          summary: 'New `xs` rung — a 16px title, for a header inside a side panel.',
          detail:
            'The builder\'s "Add components" and "Add dashboards" panels measure a 16/24 title over a 12px description at 420px wide, where even `sm` reads as a page heading dropped into a drawer. Like `sm`, `xs` moves the TITLE alone — the overline, description and meta all sit at 12, which is the ramp\'s floor for those roles with nothing below it to step to.\n\n' +
            'The ramp is now four rungs and each has a measured case: 16 in a panel, 20 on viewer chrome, 24 on every working screen, 36 on What\'s New. Nothing sits between them.',
        },
        {
          date: '2026-09-16',
          summary: 'New `meta` region — the trailing badge, date or count that belongs to the title.',
          detail:
            'Sits on the title\'s own line, immediately after it, level 3 apart — the same rung as text ↔ actions, and the 16px the viewer chrome in the design file measures. It is not `actions` (nothing in it is a control, and a source badge parked at the far right reads as a dead button) and not `overline` (which is above the title and read first). The title truncates rather than pushing the meta off the row.\n\n' +
            'Emits NO wrapper when `meta` is omitted, so every existing header renders byte for byte as before. The meta tracks the description\'s size at every rung, not the title\'s.',
        },
        {
          date: '2026-09-16',
          summary: 'New `sm` rung on `size` — a 20px title over a 12px description.',
          detail:
            'Added for the dashboard viewer\'s title bar, where the whole bar is 56px and a 24px title does not fit; it measures 20px Semi Bold in the design file. The description steps down with the title to 12px, matching the panel headers the design file already draws under a small title. The overline stays at 12 because that is the ramp\'s floor for an eyebrow — so at this rung the overline and description match, which is what `lg` does at the other end for the opposite reason: there the description rises to meet a 16px overline, here it falls to meet a 12px one. The bare-glyph default in `visual` steps down with the title, as it steps up at `lg`.\n\n' +
            'Known gap this does NOT close: the builder\'s side-panel headers measure a 16px TITLE, so they take `sm` and render 4px large. That is a candidate for an `xs` rung, which the shared `Size` vocabulary already has room for.',
        },
        {
          date: '2026-09-09',
          summary: 'New `size` prop: `default` (24px title) or `lg` (36px), for a page that is a destination rather than a working screen.',
          detail:
            'Two rungs, not a ramp — a census of every page heading in the design file found exactly two clusters, 24px on all 13 working screens and 36px on What\'s New. `size` moves TYPE only: every gap stays on its level, because the ranking of overline, title and description is identical at both rungs. At `lg` the description steps up with the overline so it is not left smaller than the eyebrow above it, and only the bare-glyph default in `visual` moves. `default` emits no modifier class; `data-size` is the hook. Independent of `headingLevel`, which is the document outline.',
        },
        {
          date: '2026-09-09',
          summary: 'The Figma master can now put an icon inside the overline, which `overline` already allowed in code.',
          detail:
            'No code change — `overline` takes a node, so `overline={<><Megaphone />What\'s new</>}` has worked since the region shipped. The Figma property was TEXT-only, so a designer could not build the shape a developer could. The master\'s overline is now a row with an optional leading glyph (`Overline icon` + `Show overline icon`). Pick by what the icon introduces: inside the overline the title stays flush with the page edge, while `visual` sits beside the whole text block and indents the title past it.',
        },
        {
          date: '2026-09-09',
          summary: 'Two new regions: `overline` above the title, and `visual` at the start of the title row.',
          detail:
            '`overline` is a level-4 flex row at `--text-xs` in muted text, sitting L5 above the title — the `CardOverline` treatment, a `div` for the same reason. `visual` is a sibling of the text block inside the row, so the existing L3 row gap separates them and the row\'s `flex-start` alignment keeps it level with the first line — the `CardHeader` `leading` shape. Both are optional and render nothing when unset, so every existing header is unchanged.',
        },
        {
          date: '2026-09-07',
          summary: 'Initial build. The page header on the spacing ladder.',
          detail: 'Four regions — text (L5), actions (L4), row (L3), toolbar (L2 below) — each reading `--space-N`. Built so the header → search relationship on the flow screens stops being a section gap. docs/spacing.md.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  args: { id: 'ph', title: 'My Requests', description: 'Submit requests to the DART Central admin team and track their status.' },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Playground: Story = { render: (args) => <PageHeader {...args} actions={<Button id="ph-new" label="New request" IconLeft={Plus} />} /> };

export const WithToolbar: Story = {
  render: (args) => (
    <PageHeader
      {...args}
      actions={<Button id="ph-new-2" label="New request" IconLeft={Plus} />}
      toolbar={<Input id="ph-search" placeholder="Search requests by name or reference number…" aria-label="Search requests" IconLeft={Search} />}
    />
  ),
};

export const TitleOnly: Story = { render: () => <PageHeader id="ph-3" title="Settings" /> };

/**
 * `showDivider` closes the header with a hairline that **bleeds past the page
 * margin**. A rule stopping at the text column reads as belonging to the content
 * rather than closing the header, so inside a `PageContainer` it runs the full
 * width of the content window — the container publishes its padding as
 * `--ui-page-header-bleed` and the rule cancels exactly that much.
 *
 * The second header below sits outside any container: the variable is unset, the
 * bleed is `0`, and the rule is simply inset. That is the safe default — this can
 * never drag a header out of an arbitrary parent.
 */
export const WithDivider: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div style={{ border: '1px dashed var(--border)' }}>
        <PageContainer>
          <PageHeader
            id="ph-div"
            title="Browse"
            description="Every dashboard you can add to a space."
            showDivider
            actions={<Button id="ph-div-new" label="New dashboard" IconLeft={Plus} />}
          />
          <p style={{ margin: 0, color: 'var(--muted-foreground)' }}>
            Content starts here. The rule above runs the full width of the dashed box;
            this paragraph stays inside the page margin.
          </p>
        </PageContainer>
      </div>
      <div style={{ border: '1px dashed var(--border)', padding: 24 }}>
        <PageHeader id="ph-div-2" title="No container" description="The rule is inset instead." showDivider />
      </div>
    </div>
  ),
};

/**
 * The What's New shape: a glyph beside the title and a short eyebrow above it.
 * `visual` is a sibling of the text, so the overline and title both sit to its
 * right and the row's `flex-start` alignment keeps the glyph on the first line.
 */
export const WithOverlineAndVisual: Story = {
  render: () => (
    <PageHeader
      id="ph-whats-new"
      visual={<Megaphone aria-hidden />}
      overline="What's new"
      title="Recent releases"
      description="Everything shipped across DART Central, newest first. Filter by application or by the kind of change."
    />
  ),
};

/**
 * The four rungs, each with a measured case in the design file: 16px in a side
 * panel, 20px on viewer chrome, 24px on every working screen, 36px on What's
 * New. Nothing sits between them, and nothing was invented to round out the ramp.
 *
 * `size` moves type and nothing else. Every gap stays on its level — the ranking
 * of overline, title and description is the same at every rung. The supporting
 * text bottoms out at 12px, so `xs` and `sm` differ only in the title.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
      <PageHeader
        id="ph-sz-xs"
        size="xs"
        overline={
          <>
            <Megaphone aria-hidden />
            <span>What's new</span>
          </>
        }
        title="Catch up on DART Central"
        description="Everything shipped across the portal, newest first."
      />
      <PageHeader
        id="ph-sz-sm"
        size="sm"
        overline={
          <>
            <Megaphone aria-hidden />
            <span>What's new</span>
          </>
        }
        title="Catch up on DART Central"
        description="Everything shipped across the portal, newest first."
      />
      <PageHeader
        id="ph-sz-default"
        overline={
          <>
            <Megaphone aria-hidden />
            <span>What's new</span>
          </>
        }
        title="Catch up on DART Central"
        description="Everything shipped across the portal, newest first."
      />
      <PageHeader
        id="ph-sz-lg"
        size="lg"
        overline={
          <>
            <Megaphone aria-hidden />
            <span>What's new</span>
          </>
        }
        title="Catch up on DART Central"
        description="Everything shipped across the portal, newest first."
      />
    </div>
  ),
};

/**
 * The other icon shape, and usually the one a "what's new" page wants: the glyph
 * sits INSIDE the overline, beside the eyebrow, so the title stays flush with
 * the page's left edge instead of indenting past a visual.
 *
 * Use `visual` when the object introduces the whole block and the title should
 * sit beside it. Use an icon in `overline` when it belongs to the eyebrow line.
 * They are different compositions, not two ways to do one thing.
 */
export const OverlineWithIcon: Story = {
  render: () => (
    <PageHeader
      id="ph-eyebrow-icon"
      overline={
        <>
          <Megaphone aria-hidden />
          <span>What's new</span>
        </>
      }
      title="Catch up on DART Central"
      description="Everything shipped across the portal, newest first."
    />
  ),
};

/**
 * An overline is a flex row, not a paragraph — it takes a `Badge`, a date, a
 * glyph, or all three. That is why it renders as a `div`: a `Badge` is a div,
 * and a div inside a `p` is invalid markup the browser silently un-nests.
 */
export const OverlineWithBadge: Story = {
  render: () => (
    <PageHeader
      id="ph-detail"
      overline={
        <>
          <Badge id="ph-detail-status" label="In review" color="warning" />
          <span>Submitted 4 September 2026</span>
        </>
      }
      title="Promote Q3 campaign banner"
      description="REQ-4821 · Marketing · Requested by Dana Whitfield"
      actions={<Button id="ph-detail-edit" label="Edit request" style="outline" />}
    />
  ),
};

/**
 * A flow page's own shape: a `FeaturedIcon` as the visual, carrying the request
 * type's color, with actions and a toolbar still in their usual places.
 */
export const WithFeaturedIcon: Story = {
  render: () => (
    <PageHeader
      id="ph-feature-requests"
      visual={<FeaturedIcon Icon={Sparkles} color="violet" size="lg" />}
      overline="New request type"
      title="Feature requests"
      description="Describe the feature and the impact it would have. The admin team reviews it like any other request."
      actions={<Button id="ph-fr-new" label="New feature request" IconLeft={Plus} />}
      toolbar={
        <Input
          id="ph-fr-search"
          placeholder="Search feature requests…"
          aria-label="Search feature requests"
          IconLeft={Search}
        />
      }
    />
  ),
};

/**
 * `meta` is the trailing lockup that belongs to the title — the source it came
 * from, when it last refreshed, how many of something there are. It sits on the
 * title's line, after the title.
 *
 * It is deliberately not `actions`: nothing in it is a control. A source badge
 * parked at the far right of the row reads as a button that does nothing.
 */
export const WithMeta: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
      <PageHeader
        id="ph-meta-badge"
        title="Revenue by Region"
        meta={<Badge id="ph-meta-badge-src" label="Excellerate" color="info" />}
        description="Bookings, pipeline and win rate broken out by region and segment."
      />
      <PageHeader
        id="ph-meta-date"
        title="Approval queue"
        meta={<span>Updated 2 minutes ago</span>}
        description="Requests waiting on you, oldest first."
        actions={<Button id="ph-meta-act" label="New request" IconLeft={Plus} />}
      />
    </div>
  ),
};

/**
 * The viewer-chrome case `sm` exists for: a 20px title with a source badge beside
 * it, in a bar that has to stay 56px tall. At this rung the description drops to
 * 12px to match the overline's floor.
 */
export const ViewerChrome: Story = {
  render: () => (
    <PageHeader
      id="ph-viewer"
      size="sm"
      title="Revenue by Region"
      meta={<Badge id="ph-viewer-src" label="Excellerate" color="info" />}
      actions={
        <>
          <Button id="ph-viewer-share" label="Share" style="secondary" size="sm" />
          <Button id="ph-viewer-add" label="Add to space" style="secondary" size="sm" IconLeft={Plus} />
        </>
      }
    />
  ),
};
