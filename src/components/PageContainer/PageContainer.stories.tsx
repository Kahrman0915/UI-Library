import type { Meta, StoryObj } from '@storybook/react';
import { Bell, LayoutGrid, Plus, Search } from 'lucide-react';
import PageContainer from './PageContainer';
import Stack from '../Stack';
import Card, { CardHeader } from '../Card';
import Button from '../Button';
import Input from '../Input';
import Badge from '../Badge';
import FeaturedIcon from '../FeaturedIcon';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof PageContainer> = {
  title: 'Components/PageContainer',
  component: PageContainer,
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The outer wrapper of a page\'s content, carrying **level 1** of the spacing ladder: its padding ' +
        'is the page margin and its gap is the space between the page header and the content. Both read ' +
        '`--space-1`, so they slide with viewport width and reshape per `data-density`. `width` caps the ' +
        'centred column — how a page *uses* a big monitor rather than padding it.',
      tags: ['layout', 'ladder', 'level 1'],
      usage: {
        when: [
          'Wrap every page\'s content in one. Then `PageHeader`, then a `Stack level={2}` of sections.',
          'Pick `width` by the page\'s kind: `narrow` for a reading page or a form, `default` for lists, `wide` for tables and dashboards, `full` when the shell owns the margin.',
        ],
        avoid: [
          'Nesting one inside another. One page, one container; sections are Stacks.',
          'Adding your own padding to the page. The margin is level 1 and belongs here.',
        ],
        notes: 'No `id`: a layout primitive. Pass `as="main"` only when the app shell does not already provide the main landmark.',
      },
      changelog: [
        {
          date: '2026-09-07',
          summary: 'Initial build. Level 1 of the spacing ladder as a component.',
          detail:
            'Padding and gap read `--space-1`; `width` = narrow (896) · default (1152) · wide (1280) · full, via the `--max-w-*` tokens; centred with `margin-inline: auto`. ' +
            'Together with `Stack` it rebuilds the My Requests screen from nothing but levels — see the story of that name. docs/spacing.md.',
        },
      ],
    } satisfies UiDocsParameters,
  },
  argTypes: { width: { control: 'select', options: ['narrow', 'default', 'wide', 'full'] } },
  args: { width: 'default' },
};
export default meta;
type Story = StoryObj<typeof PageContainer>;

const Slab = ({ h, label }: { h: number; label: string }) => (
  <div style={{ height: h, background: 'var(--accent)', borderRadius: 'var(--rounded-md)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{label}</div>
);

export const Playground: Story = {
  render: (args) => (
    <div style={{ background: 'var(--muted)', minHeight: 320 }}>
      <PageContainer {...args} style={{ background: 'var(--background)', outline: 'var(--border-w-100) dashed var(--border)' }}>
        <Slab h={56} label="page header" />
        <Slab h={200} label="content" />
      </PageContainer>
    </div>
  ),
};

export const Widths: Story = {
  render: () => (
    <Stack level={2} style={{ background: 'var(--muted)', padding: 'var(--space-2)' }}>
      {(['narrow', 'default', 'wide', 'full'] as const).map((w) => (
        <PageContainer key={w} width={w} style={{ background: 'var(--background)', outline: 'var(--border-w-100) dashed var(--border)' }}>
          <Slab h={40} label={`width="${w}"`} />
        </PageContainer>
      ))}
    </Stack>
  ),
};

/**
 * The My Requests screen rebuilt from nothing but the ladder: PageContainer (L1), a Stack of
 * sections (L2), each section a Stack (L4) of a heading over a Stack of cards (L3). Not one
 * number was chosen. Resize the window; switch `data-density` in the toolbar of the page.
 */
export const MyRequestsFromPrimitives: Story = {
  name: 'My Requests, from primitives',
  render: () => {
    const Group = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
      <Stack level={4} as="section">
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-wide)', color: 'var(--muted-foreground)' }}>{heading}</span>
        <Stack level={3}>{children}</Stack>
      </Stack>
    );
    const Request = ({ id, type, title, body, status, Icon }: { id: string; type: string; title: string; body: string; status: string; Icon: typeof Bell }) => (
      <Card id={`req-${id}`}>
        <CardHeader
          id={`req-${id}-header`}
          overline={`#${id} · ${type}`}
          title={title}
          description={body}
          media={<FeaturedIcon Icon={Icon} color="blue" />}
          action={<Badge id={`req-${id}-status`} label={status} color="info" />}
        />
      </Card>
    );
    return (
      <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
        <PageContainer>
          <Stack level={2}>
            <Stack level={3} direction="horizontal" justify="between" align="start">
              <Stack level={5}>
                <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--foreground)' }}>My Requests</h1>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Submit requests to the DART Central admin team and track their status.</span>
              </Stack>
              <Button id="new-request" label="New request" IconLeft={Plus} />
            </Stack>
            <Input id="search-requests" placeholder="Search requests by name or reference number…" aria-label="Search requests" IconLeft={Search} />
          </Stack>
          <Stack level={2}>
            <Group heading="NEEDS YOUR REPLY">
              <Request id="0416" type="Banner / Notice" title="Scheduled maintenance this Saturday" body="Warning banner, 09/06/2026 – 09/07/2026." status="Needs your reply" Icon={Bell} />
            </Group>
            <Group heading="IN REVIEW">
              <Request id="0417" type="Add Dashboard" title="Add Originations Daily Volume to the library" body="Request to add the Originations Daily Volume dashboard to the Dartboards library." status="Pending review" Icon={LayoutGrid} />
              <Request id="0425" type="Feature Request" title="Let me pin a dashboard to the top of Browse" body="A pin control on each dashboard card that keeps my most-used boards at the top of the Browse page." status="Pending review" Icon={LayoutGrid} />
            </Group>
          </Stack>
        </PageContainer>
      </div>
    );
  },
};
