import type { Meta, StoryObj } from '@storybook/react';
import CloseButton from './CloseButton';
import Card, { CardBody } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof CloseButton> = {
  title: 'Components/CloseButton',
  component: CloseButton,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'The dismissal X. It hard-codes the icon and exists only to close something — ' +
        'anything else needing a small icon-only button should take the shared ' +
        '`.ui-icon-button` shell directly rather than wrapping this.',
      tags: ['icon button'],
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
    variant: { control: 'select', options: ['default', 'background'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    id: 'story-close',
    variant: 'default',
    disabled: false,
    ariaLabel: 'Close',
  },
};

export default meta;

type Story = StoryObj<typeof CloseButton>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
        <CloseButton {...args} id="close-default" variant="default" />
        <span
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
          }}
        >
          default
        </span>
      </div>
      <div style={{ display: 'grid', gap: 4, justifyItems: 'center' }}>
        <CloseButton {...args} id="close-bg" variant="background" />
        <span
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
          }}
        >
          background (hover for fill)
        </span>
      </div>
    </div>
  ),
};

/**
 * `sm` (20px) suits a dense surface like a Toast, `default` (24px) a dialog or
 * banner header, `lg` (32px) a touch-first layout. Every size keeps a pointer
 * target of at least 24×24 — `sm`'s is expanded past its drawn box.
 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
          <CloseButton {...args} id={`close-${size}`} size={size} variant="background" />
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const InToastHeader: Story = {
  name: 'In context — Toast header',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Card id="close-toast-card">
        <CardBody>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'var(--p-3)',
            }}
          >
            <div style={{ display: 'grid', gap: 'var(--p-1)' }}>
              <strong
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--card-foreground)',
                }}
              >
                Changes saved
              </strong>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)',
                }}
              >
                Your edits to the report are live.
              </span>
            </div>
            <CloseButton id="close-toast" variant="background" />
          </div>
        </CardBody>
      </Card>
    </div>
  ),
};
