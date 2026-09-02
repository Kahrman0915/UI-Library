import type { Meta, StoryObj } from '@storybook/react';
import { Rocket, LayoutGrid, Bell, MessageSquare, Flag, ChevronRight } from 'lucide-react';
import Card, {
  CardHeader,
  CardMedia,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  CardOverline,
  CardVisual,
  CardActions,
} from './Card';
import Code from '../Code';
import Button from '../Button/Button';
import Badge from '../Badge/Badge';
import Avatar from '../Avatar/Avatar';
import StatusDot from '../StatusDot/StatusDot';
import FeaturedIcon from '../FeaturedIcon/FeaturedIcon';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardOverline,
    CardVisual,
    CardActions,
    CardMedia,
    CardBody,
    CardFooter,
  },
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A surface that gathers related content into one unit. `CardHeader` is the ' +
        'prop-driven preset for the common row (`overline`, `title`, `description`, ' +
        '`media`, `action`); when the arrangement differs, the same pieces are ' +
        'exported as **parts** you compose freely. `interactive` opts into the hover ' +
        'lift for cards that are themselves clickable.',
      tags: ['compound', '10 parts'],
      usage: {
        when: [
          'Reach for `CardHeader` first \u2014 it is the common row and it wires the parts for you.',
          'Reach for the **parts** when the arrangement differs: a stat card (a small label over a big value, which inverts the header\u2019s ranking), a pricing card (a `Badge` beside the title rather than pinned to the trailing edge), a two-column interior.',
        ],
        avoid: [
          'Hand-rolling an `<h3>` and a muted `<p>` inside `CardBody`. That is what the parts replace \u2014 they carry the same classes the header does, so the card\u2019s `size` ramp reaches them wherever they sit.',
          'Putting a `Button` straight into `CardBody`. It is a flex column with the default `align-items: stretch`, so the button fills the card and centres its label \u2014 use `CardActions`.',
        ],
        notes:
          '`CardActions` and `CardFooter` are different jobs. `CardActions` hugs and ' +
          'aligns to the leading edge, for an action that belongs to the CONTENT. ' +
          '`CardFooter` is the dialog-shaped bar \u2014 right-aligned, with its own rule ' +
          'above it \u2014 for an action that closes the card.',
      },
      composition: [
        { name: 'CardHeader', description: 'The prop-driven preset: overline, title, description, a leading visual and a trailing action, in one row.' },
        { name: 'CardTitle', description: 'The heading. `as` sets the element \u2014 default `h3`, `p` for a stat value that should not enter the document outline. `scale` renders it at another {@link CardSize}\u2019s type without moving padding.' },
        { name: 'CardDescription', description: 'The supporting line under the title.' },
        { name: 'CardOverline', description: 'The metadata line above the title. A `div`, so it can carry a `Code` chip or a `Badge`.' },
        { name: 'CardVisual', description: 'The small visual that introduces a title \u2014 a `FeaturedIcon`, `Avatar`, `StatusDot` or `Mark`. Not the cover.' },
        { name: 'CardActions', description: 'A hugging, leading-aligned row of controls that belongs to the content.' },
        { name: 'CardMedia', description: 'The full-bleed cover \u2014 image, video or chart. Composes `AspectRatio`; placed by the caller so it can sit anywhere.' },
        { name: 'CardBody', description: 'The content region. A flex column with the card\u2019s padding.' },
        { name: 'CardFooter', description: 'The trailing action bar \u2014 right-aligned, with its own rule above it.' },
      ],
      changelog: [
        {
          date: '2026-08-31',
          summary:
            'The header\u2019s pieces are now exported as parts \u2014 `CardTitle`, `CardDescription`, `CardOverline`, `CardVisual`, `CardActions` \u2014 so any layout composes from the system. Also fixes `mediaPlacement`, which never worked.',
          detail:
            'ADDITIVE. `CardHeader`\u2019s API is unchanged; it now renders these parts internally so ' +
            'there is one implementation of each and the preset cannot drift from them.\n\n' +
            'WHY. The prop-driven header expresses one arrangement, and each new layout had cost ' +
            'another prop. Of 40 call sites outside these stories, 18 used `CardHeader` \u2014 all the ' +
            'same trivial `title` + `description` \u2014 and 22 bypassed it: 7 stat cards (the header ' +
            'makes `title` the biggest text; a stat wants a small label over a big value), 4 pricing ' +
            'cards (a `Badge` beside the title, not pinned right), 3 icon-above-title, 4 legitimately ' +
            'headerless. `Item`, `Empty` and `Attachment` already expose their internals as parts; ' +
            'Card was the only hybrid.\n\n' +
            '`CardTitle` takes `as` (default `h3`) \u2014 which closes the long-standing hard-`<h3>` ' +
            'question, and lets a stat VALUE be a `<p>` instead of putting a number in the document ' +
            'outline \u2014 and `scale`, which renders the title at another `CardSize`\u2019s type WITHOUT ' +
            'moving padding. That does not contradict \u201csize lives on `Card`\u201d: that rule exists ' +
            'because padding has to move together across regions, and type has no such dependency.\n\n' +
            '`CardActions` is the leading-aligned hugging action row that neither region provided, ' +
            'and it retires the wrapper-div escape hatch these stories used to document. ' +
            '`.ui-card__header-action` gained a `gap` so two buttons in the action slot no longer touch.\n\n' +
            'BUG FIX, shipped broken earlier the same day: `mediaPlacement="above"` never applied. ' +
            'The TSX emitted `ui-card__header--media-above` while the SCSS was authored one nesting ' +
            'level too high and compiled to `.ui-card--media-above`, which nothing carries. The ' +
            'stack rendered as a plain block whose layout happened to look close enough to pass a ' +
            'screenshot. Also: `Card` and `CardHeader` each apply their own `id`, and 21 call sites ' +
            'passed the same string to both, emitting duplicate DOM ids \u2014 all now distinct.',
        },
        {
          date: '2026-08-31',
          summary:
            'New `mediaPlacement` prop on `CardHeader` — `above` puts the leading visual on its own line over the title.',
          detail:
            'ADDITIVE; `leading` is the default and emits neither a modifier class nor a wrapper, ' +
            'so every existing card renders byte-identically. `.ui-card__header` is a flex ROW of ' +
            'media | content | action, which meant the option / chooser-card shape — a ' +
            '`FeaturedIcon` tile, then the name, then what it does — could not be built with ' +
            '`CardHeader` at all; it had to be hand-composed in `CardBody`, giving up the real ' +
            '`title` / `description` props and the `<h3>` they render.\n\n' +
            '`above` wraps the media and the content in a `.ui-card__header-stack` column. The ' +
            'header itself stays a row of [stack, action], so a header `action` still pins ' +
            'top-right and the two props compose. The stack gap is a constant `--p-4` rather than ' +
            'proportional to `size`, for the same reason the no-divider gap is: what it has to ' +
            'out-rank is the header content\'s own overline → title → description rhythm, and that ' +
            'is `--p-1-5` at every rung.',
        },
        {
          date: '2026-08-31',
          summary:
            'New `size` prop on `Card` (`sm` · `default` · `lg` · `xl` · `2xl`) and ' +
            '`showDivider` on `CardHeader`. Also fixes a trailing header drawing a rule ' +
            'against the card\'s own border.',
          detail:
            '`size` lives on **`Card`**, not on a part, and cascades through one root class — ' +
            'the mechanism `RadioGroup` and `Tabs` already use. It has to: padding and type ' +
            'move together, and a large header over a default-padded body misaligns their left ' +
            'edges. No part gained a prop.\n\n' +
            'The ramp is padding / title / description — `sm` 12/14/12, `default` 16/16/14, ' +
            '`lg` 20/18/14, `xl` 24/20/16, `2xl` 32/30/16. The overline steps up only at `2xl`, ' +
            'where a 12px date under a 30px heading reads as a typo rather than a tier.\n\n' +
            '**`xl` and `2xl` are Card-local and deliberately NOT added to the library-wide ' +
            '`Size` union** (`xs | sm | default | lg`). A featured card is a real tier, but ' +
            'widening `SIZES` would offer two dead rungs on every other component\'s control ' +
            'list. `CardSize` is its own exported union.\n\n' +
            '`showDivider` defaults to `true`, so no existing card changes; `false` emits ' +
            '`.ui-card__header--no-divider`. The default case emits no modifier at all.\n\n' +
            '**Turning the divider off collapses the spacing as well as the line.** Header ' +
            'padding-bottom plus body padding-top is `2 × P` — right when a rule separates two ' +
            'regions, a hole when nothing does. Without the rule the gap becomes a **constant ' +
            '16px** (12 at `sm`, clamped to its own padding).\n\n' +
            '**Constant, not proportional — and that distinction was earned.** A half-of-`P` ' +
            'rule looked right on the largest card and far too tight on the default one. What ' +
            'this gap has to out-rank is the header\'s own internal rhythm — the overline → ' +
            'title → description spacing — which is a fixed `--p-1-5` at every size, since ' +
            '`__header-content` has one gap the size blocks never touch. Half of `P` is 8 at ' +
            '`default`, only 1.3× the 6px it must beat, so the body read as one more line of ' +
            'the header. 16 is ~2.7× it, the ratio the largest card was already right at.\n\n' +
            'The rules are per-size and sit after the size blocks, since those set `padding` as ' +
            'a shorthand and would otherwise win; `:not(:last-child)` keeps a trailing ' +
            'header\'s own bottom padding, which zeroing would have dropped its description ' +
            'onto the card edge.\n\n' +
            'Separately: `.ui-card__header` drew its `border-bottom` even as the card\'s LAST ' +
            'child, painting a second hairline one pixel inside `.ui-card`\'s own border. It ' +
            'was invisible only because the two were flush — measured at header-bottom 158 ' +
            'against card-bottom 159. A `:last-child` guard removes it.',
        },
        {
          date: '2026-08-31',
          summary:
            'New `overline` prop on `CardHeader` — the short line above the title, for a ' +
            'date, a category or a version.',
          detail:
            'Closes a gap found while reviewing a What\'s New page in Figma: every card on it ' +
            'needed a date above the heading, `CardHeader` had nowhere to put one, and so all ' +
            'seven cards hand-built their whole text stack inside `CardBody` and drifted off ' +
            'the component\'s type ramp.\n\n' +
            '`overline` takes a `React.ReactNode`, not a `string` like `title` and ' +
            '`description`. Those two become an `<h3>` and a `<p>` and want text; an overline ' +
            'routinely carries a `Code` chip or a `Badge` beside its words. It renders as a ' +
            'flex row with a gap so `July 7, 2026 · Dartboards <Code />` needs no wrapper, and ' +
            'as a `<div>` rather than a `<p>` because `Badge` renders a `<div>`, which a `<p>` ' +
            'may not legally contain.\n\n' +
            'Styled as metadata — `--text-xs` on `--muted-foreground`, the rung ' +
            '`.ui-item__description` already uses — and deliberately NOT uppercased, since the ' +
            'motivating content is sentence case. A kicker that wants caps sets them through ' +
            '`className`.\n\n' +
            'Nothing changes when the prop is absent. The one new behaviour is the combination: ' +
            'with `media` **and** `overline`, `.ui-card__header`\'s `align-items: flex-start` ' +
            'puts the avatar beside the overline rather than the title — the top of the text ' +
            'block, which is the intent.',
        },
        {
          date: '2026-08-08',
          summary:
            'New `CardMedia` part — a full-bleed cover image, video or chart, for the ' +
            'vertical card layout (cover on top, then header, then description).',
          detail:
            '`CardHeader`\'s existing `media` prop is a LEADING visual on the title\'s own ' +
            'line — an avatar or status dot beside the heading. It could never be a cover: it ' +
            'is `flex-shrink: 0` inside the header\'s flex row and floored at one line of ' +
            'title. `CardMedia` is the other thing.\n\n' +
            'It is a sibling part placed by the caller, not a `media` prop on `Card`, because a ' +
            'prop would have to choose an order — this way the cover can sit above the header, ' +
            'between header and body, or under the footer.\n\n' +
            'It composes `AspectRatio` and defaults to `16 / 9`, so a row of cards keeps a level ' +
            'top edge and does not jump as images load. It declares no radius of its own: ' +
            '`.ui-card` is `overflow: hidden`, so a cover touching an edge inherits the card\'s ' +
            'rounding for free, and adding one would show as a hairline of card background in ' +
            'the corners.',
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
    children: { control: false, table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

/**
 * The vertical layout: a full-bleed cover, then the header, then the body.
 * `CardMedia` composes `AspectRatio` (default `16 / 9`) so a grid of these keeps
 * a level top edge and nothing shifts as the images load.
 *
 * The cover declares no rounding — `.ui-card` clips, so it inherits the card's
 * radius. Put it anywhere: above the header, between header and body, or last.
 */
export const WithCover: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 280px)', gap: 'var(--p-4)' }}>
      {[
        { t: 'Quarterly review', d: 'Revenue, retention and pipeline.', h: 200 },
        { t: 'Release notes', d: 'What shipped in 4.2.', h: 260 },
      ].map((c) => (
        <Card id={`cover-${c.h}`} key={c.t} interactive>
          <CardMedia>
            {/* A plain block stands in for the image, so the story has no network
                dependency and the ratio box is what you actually see. */}
            <div style={{ width: '100%', height: '100%', background: 'var(--muted)' }} />
          </CardMedia>
          <CardHeader id={`cover-${c.h}-h`} title={c.t} description={c.d} />
        </Card>
      ))}
    </div>
  ),
};

/**
 * `size` lives on **`Card`**, not on any part, and cascades through one root
 * class — the same mechanism `RadioGroup` and `Tabs` use. Padding and type have
 * to move together: a large header over a default-padded body misaligns their
 * left edges.
 *
 * `xl` and `2xl` are Card-local rungs, above the library-wide `xs | sm | default
 * | lg` scale. They exist because a featured card is a real tier — a hero
 * heading a page, not just a bigger list item.
 */
export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--p-4)' }}>
      {(['sm', 'default', 'lg', 'xl', '2xl'] as const).map((s) => (
        <Card id={`sz-${s}`} key={s} size={s}>
          <CardHeader
            id={`sz-${s}-h`}
            overline={`July 7, 2026 · size="${s}"`}
            title="Introducing Dartboards"
            description="A focused, dashboard-first experience built into DART Central."
          />
          <CardBody>Padding and type scale together, so every region stays aligned.</CardBody>
        </Card>
      ))}
    </div>
  ),
};

/**
 * `showDivider={false}` drops the hairline under the header, for a card whose
 * heading simply introduces the copy beneath it rather than labelling a separate
 * region.
 *
 * A header that is the card's **last child** never draws the rule at all —
 * there is nothing under it to divide.
 */
export const HeaderDivider: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
      <Card id="div-on" style={{ width: 320 }}>
        <CardHeader id="div-on-h" title="Divider on" description="The default." />
        <CardBody>Header and body read as two regions.</CardBody>
      </Card>
      <Card id="div-off" style={{ width: 320 }}>
        <CardHeader
          id="div-off-h"
          showDivider={false}
          title="Divider off"
          description="showDivider={false}"
        />
        <CardBody>Header and body read as one block.</CardBody>
      </Card>
    </div>
  ),
};

/**
 * `overline` is the short line **above** the title — a date, a category, a
 * version. It takes a node rather than a string, because this line so often
 * carries a `Code` chip or a `Badge` beside its words; it lays out as a flex
 * row with a gap, so no wrapper is needed.
 *
 * It renders as metadata — `--text-xs` on `--muted-foreground` — and does not
 * uppercase. A kicker that wants caps sets them through `className`.
 *
 * Note what happens with `media`: the header aligns to `flex-start`, so an
 * avatar sits beside the **overline**, not the title. That is the top of the
 * text block, which is the intent.
 */
export const WithOverline: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
      <Card id="ol-plain" style={{ width: 320 }}>
        <CardHeader
          id="ol-plain-h"
          overline="July 7, 2026 · Dartboards"
          title="Spaces: your personal dashboard collections"
          description="Group dashboards around a project, a team or a cadence."
        />
      </Card>
      <Card id="ol-rich" style={{ width: 320 }}>
        <CardHeader
          id="ol-rich-h"
          overline={
            <>
              July 7, 2026 · Dartboards
              <Code>v1.0.0</Code>
            </>
          }
          title="Introducing Dartboards"
          description="A focused, dashboard-first experience built into DART Central."
        />
      </Card>
      <Card id="ol-media" style={{ width: 320 }}>
        <CardHeader
          id="ol-media-h"
          media={<Avatar id="ol-media-a" fallback="KM" />}
          overline="2 hours ago"
          title="Pinned a dashboard to Platform"
          description="Kahrman McKenzie"
        />
      </Card>
    </div>
  ),
};

/**
 * `media` is the leading visual slot — a featured icon, an avatar, a status
 * dot. It renders before the title and shrinks to its content, so a two-line
 * description doesn't drag it out of line with the heading.
 */
export const WithMedia: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--p-4)', flexWrap: 'wrap' }}>
      <Card id="m-icon" style={{ width: 320 }}>
        <CardHeader
          id="m-icon-h"
          media={<Rocket />}
          title="Deploy preview"
          description="Ships to a throwaway URL on every push."
        />
        <CardBody>Builds finish in about 40 seconds.</CardBody>
      </Card>
      <Card id="m-avatar" style={{ width: 320 }}>
        <CardHeader
          id="m-avatar-h"
          media={<Avatar id="m-avatar-a" fallback="KM" />}
          title="Kahrman McKenzie"
          description="Owner"
          action={<Badge id="m-avatar-b" color="default" appearance="outline" label="Admin" />}
        />
        <CardBody>Full access to every workspace setting.</CardBody>
      </Card>
      <Card id="m-status" style={{ width: 320 }}>
        <CardHeader
          id="m-status-h"
          media={<StatusDot status="online" />}
          title="Production"
          description="All systems nominal."
        />
        <CardBody>Last incident 94 days ago.</CardBody>
      </Card>
    </div>
  ),
};

export const Playground: Story = {
  render: () => (
    <Card id="pg" style={{ width: 400 }}>
      <CardHeader
        id="pg-header"
        title="Q4 revenue"
        description="Last 90 days across all products"
      />
      <CardBody>
        <p>
          Revenue is trending up 12% quarter-over-quarter, driven primarily by
          the new enterprise tier.
        </p>
      </CardBody>
      <CardFooter>
        <Button id="pg-cancel" label="Dismiss" style="ghost" />
        <Button id="pg-view" label="View report" />
      </CardFooter>
    </Card>
  ),
};

// Opt-in `interactive` prop — border strengthens to --border-hover on hover.
// For clickable cards; static cards leave it off.
export const Interactive: Story = {
  render: () => (
    <Card id="int" interactive style={{ width: 400 }}>
      <CardHeader
        id="int-header"
        title="Enterprise plan"
        description="Hover the card — the border strengthens to signal it's clickable."
      />
      <CardBody>
        <p>Unlimited seats, SSO, and priority support.</p>
      </CardBody>
    </Card>
  ),
};

export const HeaderOnly: Story = {
  render: () => (
    <Card id="ho" style={{ width: 360 }}>
      <CardHeader
        id="ho-header"
        title="Simple card"
        description="Header + body, no footer needed."
      />
      <CardBody>
        <p>Body content here.</p>
      </CardBody>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  render: () => (
    <Card id="wa" style={{ width: 420 }}>
      <CardHeader
        id="wa-header"
        title="Dashboard sharing"
        description="Manage who can access this dashboard"
        action={<Badge id="wa-badge" color="success" label="Live" />}
      />
      <CardBody>
        <p>
          Your dashboard is currently public. Anyone with the link can view it.
        </p>
      </CardBody>
      <CardFooter>
        <Button id="wa-manage" label="Manage" style="outline" />
      </CardFooter>
    </Card>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <Card id="to" style={{ width: 320 }}>
      <CardHeader id="to-header" title="Reports" />
      <CardBody>
        <p>You have 3 pending reports.</p>
      </CardBody>
    </Card>
  ),
};

export const StatCard: Story = {
  render: () => (
    <Card id="stat" style={{ width: 280 }}>
      <CardHeader
        id="stat-header"
        title="Active users"
        description="Past 24 hours"
        action={<Badge id="stat-badge" color="default" appearance="outline" label="+12%" />}
      />
      <CardBody>
        <span
          style={{
            fontSize: 'var(--text-4xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--foreground)',
            lineHeight: 'var(--leading-10)',
          }}
        >
          14,382
        </span>
      </CardBody>
    </Card>
  ),
};

export const CardGrid: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--p-4)',
      }}
    >
      {[
        { id: 'g1', title: 'Reports', desc: 'Published this month', value: '24' },
        { id: 'g2', title: 'Data sources', desc: 'Connected', value: '11' },
        { id: 'g3', title: 'Team members', desc: 'Active', value: '38' },
      ].map((c) => (
        <Card key={c.id} id={c.id}>
          <CardHeader id={c.id} title={c.title} description={c.desc} />
          <CardBody>
            <span
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--foreground)',
              }}
            >
              {c.value}
            </span>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
};

/**
 * The **option / chooser card** — a grid of things the user is picking between,
 * each one a tile, a name, and a line saying what it does.
 *
 * This is what `mediaPlacement="above"` exists for. With the default `leading`
 * the tile sits on the title's own line, which is the list-row shape and reads
 * as an avatar beside a heading; here the tile has to introduce the option from
 * above it.
 *
 * Two other things are doing work. `showDivider={false}` drops the rule *and*
 * the gap to a constant 16, so the header and the action under it read as one
 * block rather than two regions. And the action sits in `CardBody`, not in the
 * header's `action` slot and not in a `CardFooter` — the slot pins top-right
 * (that is a menu or a badge, not the card's affordance), and `CardFooter` is
 * the dialog-shaped action BAR: right-aligned, with its own rule above it.
 *
 * The action sits in a `CardActions` — a hugging, leading-aligned row. Dropping
 * the `Button` straight into `CardBody` would stretch it to the card's width
 * and centre its label, because the body is a flex column with the default
 * `align-items: stretch`.
 *
 * The tiles take **category** colours, not semantic ones: these four options do
 * not rank against each other, they only have to be told apart.
 */
export const OptionCards: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const options = [
      {
        id: 'dashboard',
        Icon: LayoutGrid,
        color: 'blue',
        title: 'Dashboard',
        description:
          'Add, edit, promote, or remove a dashboard in the Dartboards library.',
      },
      {
        id: 'notice',
        Icon: Bell,
        color: 'amber',
        title: 'Banner / Notice',
        description:
          'Post an alert or informational notice on a dashboard, app, or platform-wide.',
      },
      {
        id: 'general',
        Icon: MessageSquare,
        color: 'default',
        title: 'General Request',
        description:
          'Ask a question or submit a general request to the DART admin team.',
      },
      {
        id: 'feature',
        Icon: Flag,
        color: 'violet',
        title: 'Feature Request',
        description:
          'Suggest a new feature or improvement. Tracked in the public feature backlog.',
      },
    ] as const;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 'var(--p-4)',
          maxWidth: 680,
        }}
      >
        {options.map(({ id, Icon, color, title, description }) => (
          <Card key={id} id={`option-${id}`} size="xl" interactive>
            <CardHeader
              id={`option-${id}-header`}
              mediaPlacement="above"
              showDivider={false}
              media={<FeaturedIcon Icon={Icon} color={color} />}
              title={title}
              description={description}
            />
            <CardBody>
              <CardActions>
                <Button
                  id={`option-${id}-select`}
                  style="link"
                  label="Select"
                  IconRight={() => <ChevronRight />}
                />
              </CardActions>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  },
};


/**
 * **The parts.** `CardHeader` is a preset for one arrangement — a leading
 * visual, a title, a description, a trailing action. When the shape differs,
 * the same pieces are exported and compose freely, and because the size cascade
 * is written as descendant selectors they still pick up the card's ramp
 * wherever they sit.
 *
 * Three shapes the prop-driven header cannot express, side by side:
 *
 * 1. **Stat card** — inverts the ranking. The header always makes `title` the
 *    biggest text; here the label is small and the value is large. `as="p"`
 *    keeps a number out of the document outline, and `scale` gives it the type
 *    a `2xl` card would without moving this card's padding.
 * 2. **Pricing card** — the `Badge` sits *beside* the title. The header's
 *    `action` slot pins to the trailing edge, which is a different thing.
 * 3. **Content actions** — `CardActions` hugs and aligns leading, for an action
 *    that belongs to the content rather than closing the card.
 */
export const Composition: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 'var(--p-4)',
        maxWidth: 900,
        alignItems: 'start',
      }}
    >
      <Card id="comp-stat">
        <CardBody>
          <CardOverline>
            <span style={{ flex: 1 }}>Active accounts</span>
            <Badge id="comp-stat-delta" label="+12%" color="success" appearance="outline" />
          </CardOverline>
          <CardTitle as="p" scale="2xl">
            1,284
          </CardTitle>
          <CardDescription>Compared with the same week last month.</CardDescription>
        </CardBody>
      </Card>

      <Card id="comp-price">
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
            <CardTitle scale="lg">Pro</CardTitle>
            <Badge id="comp-price-tag" label="Popular" />
          </div>
          <CardDescription>Everything in Starter, plus usage analytics.</CardDescription>
          <CardTitle as="p" scale="2xl">
            $29
          </CardTitle>
          <CardActions>
            <Button id="comp-price-cta" label="Choose Pro" />
            <Button id="comp-price-alt" style="ghost" label="Compare" />
          </CardActions>
        </CardBody>
      </Card>

      <Card id="comp-visual">
        <CardBody>
          <CardVisual>
            <FeaturedIcon Icon={Rocket} size="lg" />
          </CardVisual>
          <CardTitle>Ship faster</CardTitle>
          <CardDescription>
            The visual, the heading and the copy are three parts, stacked in
            source order.
          </CardDescription>
          <CardActions>
            <Button
              id="comp-visual-cta"
              style="link"
              label="Read more"
              IconRight={() => <ChevronRight />}
            />
          </CardActions>
        </CardBody>
      </Card>
    </div>
  ),
};

/**
 * Two buttons in a `CardHeader`'s `action` slot. `.ui-card__header-action` now
 * carries a `gap`, matching `CardFooter` — without it they touched.
 */
export const HeaderActionGroup: Story = {
  render: () => (
    <Card id="hag" style={{ width: 420 }}>
      <CardHeader
        id="hag-header"
        title="Deployment"
        description="Last run 4 minutes ago."
        action={
          <CardActions>
            <Button id="hag-logs" style="ghost" size="sm" label="Logs" />
            <Button id="hag-run" style="outline" size="sm" label="Re-run" />
          </CardActions>
        }
      />
      <CardBody>Built from commit 3fc246f on feat/figma-table.</CardBody>
    </Card>
  ),
};
