import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ChevronRight,
  Ellipsis,
  FileText,
  Folder,
  Star,
  User,
} from 'lucide-react';
import Item, {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from './Item';
import Avatar from '../Avatar';
import Badge from '../Badge';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A generic list row: media, a title and description, and actions on the ' +
        'trailing edge. The building block for settings lists, pickers and result ' +
        'lists.',
      tags: ['compound', '10 parts', '3 sizes'],
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
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'muted'],
    },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'default'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Item>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Item {...args}>
        <ItemMedia variant="icon">
          <User />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Jane Doe</ItemTitle>
          <ItemDescription>jane@example.com</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight
            style={{ color: 'var(--muted-foreground)' }}
            width={16}
            height={16}
          />
        </ItemActions>
      </Item>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 'var(--max-w-md)' }}>
      {(['default', 'outline', 'muted'] as const).map((v) => (
        <Item key={v} variant={v}>
          <ItemMedia variant="icon">
            <Folder />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Variant: {v}</ItemTitle>
            <ItemDescription>How the item looks statically.</ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-3)', maxWidth: 'var(--max-w-md)' }}>
      {(['xs', 'sm', 'default'] as const).map((s) => (
        <Item key={s} size={s} variant="outline">
          <ItemMedia variant="icon">
            <FileText />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Size: {s}</ItemTitle>
            {s !== 'xs' && (
              <ItemDescription>Padding, gap, and font scale.</ItemDescription>
            )}
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

export const InteractiveLink: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Item
        href="#"
        onClick={(e) => {
          e.preventDefault();
          // eslint-disable-next-line no-console
          console.log('clicked link item');
        }}
      >
        <ItemMedia variant="icon">
          <Folder />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Design system</ItemTitle>
          <ItemDescription>32 components, 4 layouts</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight
            style={{ color: 'var(--muted-foreground)' }}
            width={16}
            height={16}
          />
        </ItemActions>
      </Item>
    </div>
  ),
};

export const InteractiveButton: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Item
        onClick={() => {
          // eslint-disable-next-line no-console
          console.log('button item clicked');
        }}
      >
        <ItemMedia variant="icon">
          <Star />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Toggle favorite</ItemTitle>
          <ItemDescription>Adds this project to your favorites.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <ItemGroup>
        {[
          { name: 'Kahrman McKenzie', email: 'kahrman@example.com', role: 'Admin' },
          { name: 'Jane Doe', email: 'jane@example.com', role: 'Member' },
          { name: 'Alex Kim', email: 'alex@example.com', role: 'Viewer' },
        ].map((p, idx) => (
          <Fragment key={p.email}>
            <Item href="#" onClick={(e) => e.preventDefault()}>
              <ItemMedia>
                <Avatar
                  id={`li-${p.email}`}
                  fallback={p.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                  size="default"
                  shape="circle"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{p.name}</ItemTitle>
                <ItemDescription>{p.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge id={`b-${p.email}`} variant="outline" label={p.role} />
              </ItemActions>
            </Item>
            {idx < 2 && <ItemSeparator />}
          </Fragment>
        ))}
      </ItemGroup>
    </div>
  ),
};

export const OutlineList: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <ItemGroup
        style={{
          border: 'var(--border-w-100) solid var(--border)',
          borderRadius: 'var(--rounded-md)',
        }}
      >
        {['Reports', 'Dashboards', 'Data sources', 'Team', 'Settings'].map(
          (label, idx, arr) => (
            <Fragment key={label}>
              <Item href="#" onClick={(e) => e.preventDefault()}>
                <ItemContent>
                  <ItemTitle>{label}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight
                    style={{ color: 'var(--muted-foreground)' }}
                    width={16}
                    height={16}
                  />
                </ItemActions>
              </Item>
              {idx < arr.length - 1 && <ItemSeparator />}
            </Fragment>
          ),
        )}
      </ItemGroup>
    </div>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Item variant="outline">
        <ItemHeader>
          <span>Latest commit</span>
        </ItemHeader>
        <ItemMedia>
          <Avatar
            id="hf-avatar"
            fallback="KM"
            size="default"
            shape="circle"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Kahrman McKenzie</ItemTitle>
          <ItemDescription>
            feat(Item): add Header + Footer slots and disabled state
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            f5d3
          </span>
        </ItemActions>
        <ItemFooter>
          <span>2 minutes ago • main</span>
        </ItemFooter>
      </Item>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Item
        href="#"
        disabled
        onClick={(e) => e.preventDefault()}
      >
        <ItemMedia variant="icon">
          <Folder />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Archived project</ItemTitle>
          <ItemDescription>Read-only. Restore to interact.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Ellipsis
            style={{ color: 'var(--muted-foreground)' }}
            width={16}
            height={16}
          />
        </ItemActions>
      </Item>
    </div>
  ),
};
