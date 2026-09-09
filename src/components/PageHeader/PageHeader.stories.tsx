import type { Meta, StoryObj } from '@storybook/react';
import { Megaphone, Plus, Search, Sparkles } from 'lucide-react';
import PageHeader from './PageHeader';
import Badge from '../Badge';
import Button from '../Button';
import FeaturedIcon from '../FeaturedIcon';
import Input from '../Input';
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
 * type's colour, with actions and a toolbar still in their usual places.
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
