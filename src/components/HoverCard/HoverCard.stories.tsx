import type { Meta, StoryObj } from '@storybook/react';
import { CalendarDays } from 'lucide-react';
import HoverCard, { HoverCardTrigger, HoverCardContent } from './HoverCard';
import Button from '../Button';
import Avatar from '../Avatar';

const meta: Meta<typeof HoverCard> = {
  title: 'Components/HoverCard',
  component: HoverCard,
  parameters: { layout: 'centered' },
  args: {
    id: 'story-hover-card',
    openDelay: 500,
    closeDelay: 200,
  },
};

export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Playground: Story = {
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger>
        <Button id="pg-trigger" label="@design-lab" style="link" />
      </HoverCardTrigger>
      <HoverCardContent>
        <div style={{ display: 'flex', gap: 'var(--p-3)' }}>
          <Avatar
            id="pg-avatar"
            fallback="N"
            size="default"
            shape="circle"
          />
          <div style={{ display: 'grid', gap: 'var(--p-1)' }}>
            <div
              style={{
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
              }}
            >
              @design-lab
            </div>
            <div style={{ color: 'var(--muted-foreground)' }}>
              An open-source component library — maintained by the design systems team.
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--p-1-5)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-xs)',
                marginTop: 'var(--p-2)',
              }}
            >
              <CalendarDays width={12} height={12} />
              Joined December 2021
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const OnLink: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: 'var(--p-1-5)',
        fontSize: 'var(--text-sm)',
      }}
    >
      Built with love by
      <HoverCard id="link">
        <HoverCardTrigger>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              color: 'var(--primary)',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            @jrivera
          </a>
        </HoverCardTrigger>
        <HoverCardContent>
          <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
            <div
              style={{
                fontWeight: 'var(--font-semibold)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Jordan Rivera
            </div>
            <div style={{ color: 'var(--muted-foreground)' }}>
              Product designer building tools for teams.
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      .
    </div>
  ),
};

export const AllSides: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--p-8)',
        maxWidth: 'var(--max-w-md)',
        margin: '80px auto',
      }}
    >
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <HoverCard key={side} id={`side-${side}`} openDelay={200}>
          <HoverCardTrigger>
            <Button id={`side-t-${side}`} label={side} style="outline" />
          </HoverCardTrigger>
          <HoverCardContent side={side}>
            <div style={{ fontSize: 'var(--text-sm)' }}>
              Anchored on the <strong>{side}</strong>. Hover-cards support
              rich content like avatars, buttons, and links.
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  ),
};

export const InstantOpen: Story = {
  args: { openDelay: 0, closeDelay: 100 },
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger>
        <Button id="instant" label="Hover me (instant)" style="outline" />
      </HoverCardTrigger>
      <HoverCardContent>
        With <code>openDelay={0}</code> the card opens as soon as your cursor
        enters the trigger — useful for previews.
      </HoverCardContent>
    </HoverCard>
  ),
};

export const RichContent: Story = {
  render: () => (
    <HoverCard id="rich" openDelay={200}>
      <HoverCardTrigger>
        <Button id="rich-t" label="View profile" style="outline" />
      </HoverCardTrigger>
      <HoverCardContent style={{ width: 320 }}>
        <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--p-3)',
            }}
          >
            <Avatar id="rich-a" fallback="KM" size="lg" shape="circle" />
            <div>
              <div
                style={{
                  fontWeight: 'var(--font-semibold)',
                  fontSize: 'var(--text-base)',
                }}
              >
                Kahrman McKenzie
              </div>
              <div
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Design + engineering
              </div>
            </div>
          </div>
          <div style={{ color: 'var(--muted-foreground)' }}>
            You can put buttons, links, or anything else inside a HoverCard —
            unlike Tooltip, its content is interactive.
          </div>
          <div style={{ display: 'flex', gap: 'var(--p-2)' }}>
            <Button
              id="rich-follow"
              label="Follow"
              size="small"
            />
            <Button
              id="rich-message"
              label="Message"
              size="small"
              style="outline"
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
