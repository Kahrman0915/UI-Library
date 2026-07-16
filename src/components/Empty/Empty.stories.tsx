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

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof Empty>;

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
