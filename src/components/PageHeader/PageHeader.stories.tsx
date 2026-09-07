import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Search } from 'lucide-react';
import PageHeader from './PageHeader';
import Button from '../Button';
import Input from '../Input';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The top of a page: `title`, `description`, `actions`, and optionally a `toolbar` under the row. ' +
        'The spacing inside it is decided once — title → description L5, controls L4 apart, toolbar L2 ' +
        'below the row — so a screen never chooses it. First child of `PageContainer`, which puts level 1 ' +
        'between the header and the content.',
      tags: ['layout', 'ladder', 'header'],
      usage: {
        when: ['Every page. The search field or filter bar that belongs to the page goes in `toolbar`, not in the section stack below.'],
        avoid: ['Stacking a search field under a `PageHeader` as a sibling. That is the gap that goes wrong at 1920; it belongs in `toolbar`.'],
        notes: 'Renders a `<header>` with an `h1` by default; `headingLevel="h2"` for a panel inside a page that already has one.',
      },
      changelog: [
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
