import type { Meta, StoryObj } from '@storybook/react';
import { FolderPlus, Inbox, Search } from 'lucide-react';
import Empty, {
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from './Empty';
import Button from '../Button/Button';
import FeaturedIcon from '../FeaturedIcon/FeaturedIcon';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The placeholder for a list, table or panel with nothing in it yet. Centres ' +
        'an icon, a title, a sentence explaining why it is empty, and usually the ' +
        'action that would fill it.',
      tags: ['compound', '6 parts'],
      changelog: [
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof Empty>;

/**
 * The preferred way to get a boxed icon: drop a `<FeaturedIcon>` into the
 * `default` media slot. It brings sizes, a circle option, and semantic/brand
 * tones — the shared version of the inline `variant="icon"` tile.
 */
export const WithFeaturedIcon: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <FeaturedIcon Icon={Inbox} size="lg" />
        </EmptyMedia>
        <EmptyTitle>No messages yet</EmptyTitle>
        <EmptyDescription>
          When someone sends you a message, it will show up here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button id="empty-fi-compose" label="New message" />
      </EmptyContent>
    </Empty>
  ),
};

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>No messages yet</EmptyTitle>
        <EmptyDescription>
          When someone sends you a message it'll show up here. Start a
          conversation to get going.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button id="empty-compose" label="Compose" />
      </EmptyContent>
    </Empty>
  ),
};

export const WithoutAction: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderPlus />
        </EmptyMedia>
        <EmptyTitle>No projects</EmptyTitle>
        <EmptyDescription>
          Projects you create or are invited to will appear in this list.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const TwoActions: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          We couldn't find anything matching your search. Try a different term
          or clear the filters.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button id="empty-clear" label="Clear filters" style="outline" />
        <Button id="empty-retry" label="New search" />
      </EmptyContent>
    </Empty>
  ),
};

export const DefaultMedia: Story = {
  name: 'Media — default (unboxed)',
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>Inbox zero</EmptyTitle>
        <EmptyDescription>
          The <code>default</code> media variant is unboxed — use it for a large
          glyph, an image, or an avatar.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};
