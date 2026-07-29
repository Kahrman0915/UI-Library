import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronsUpDown } from 'lucide-react';
import Collapsible, {
  CollapsibleTrigger,
  CollapsibleContent,
} from './Collapsible';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A single show/hide disclosure. Same CSS-only height animation as ' +
        '`Accordion`; reach for `Accordion` instead when you have a set of them that ' +
        'coordinate.',
      tags: ['compound', '3 parts', 'animated'],
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
  args: {
    id: 'story-collapsible',
    defaultOpen: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

const rowStyle: React.CSSProperties = {
  padding: 'var(--p-3) var(--p-4)',
  background: 'var(--card)',
  border: 'var(--border-w-100) solid var(--border)',
  borderRadius: 'var(--rounded-md)',
  fontSize: 'var(--text-sm)',
  color: 'var(--card-foreground)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--p-3)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
};

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 380 }}>
      <Collapsible {...args}>
        <div style={headerStyle}>
          <span>@jrivera starred 3 repositories</span>
          <CollapsibleTrigger>
            <Button
              id="pg-trigger"
              iconOnly
              IconCenter={ChevronsUpDown}
              style="ghost"
              size="small"
              aria-label="Toggle"
            />
          </CollapsibleTrigger>
        </div>
        <div style={rowStyle}>@design-lab/components</div>
        <CollapsibleContent>
          <div style={{ display: 'grid', gap: 'var(--p-2)', marginTop: 'var(--p-2)' }}>
            <div style={rowStyle}>@design-lab/icons</div>
            <div style={rowStyle}>@design-lab/tokens</div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const StartsOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <div style={{ width: 380 }}>
      <Collapsible {...args}>
        <div style={headerStyle}>
          <span>Show more</span>
          <CollapsibleTrigger>
            <Button
              id="open-trigger"
              iconOnly
              IconCenter={ChevronsUpDown}
              style="ghost"
              size="small"
              aria-label="Toggle"
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div style={rowStyle}>Content that starts visible.</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={{ width: 380 }}>
      <Collapsible {...args}>
        <div style={headerStyle}>
          <span>Disabled section</span>
          <CollapsibleTrigger>
            <Button
              id="disabled-trigger"
              iconOnly
              IconCenter={ChevronsUpDown}
              style="ghost"
              size="small"
              aria-label="Toggle"
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div style={rowStyle}>Cannot be opened.</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ display: 'grid', gap: 'var(--p-3)', width: 380 }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          External state: <strong>{open ? 'open' : 'closed'}</strong>
        </div>
        <Button
          id="ctrl-external"
          label={open ? 'Force close' : 'Force open'}
          style="outline"
          onClick={() => setOpen(!open)}
        />
        <Collapsible id="ctrl" open={open} onOpenChange={setOpen}>
          <div style={headerStyle}>
            <span>Controlled collapsible</span>
            <CollapsibleTrigger>
              <Button
                id="ctrl-trigger"
                label="Toggle"
                style="outline"
                size="small"
              />
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div style={rowStyle}>Toggle from inside or outside.</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};

export const AsAFAQ: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-2)',
        maxWidth: 'var(--max-w-md)',
      }}
    >
      {[
        {
          q: 'What is the return policy?',
          a: '30 days for a full refund, no questions asked.',
        },
        {
          q: 'Do you offer student discounts?',
          a: 'Yes — 50% off any annual plan with a valid .edu email.',
        },
        {
          q: 'Can I self-host?',
          a: 'Self-hosting is available on the Enterprise plan.',
        },
      ].map((item, idx) => (
        <Collapsible key={item.q} id={`faq-${idx}`}>
          <div style={rowStyle}>
            <div style={headerStyle}>
              <span>{item.q}</span>
              <CollapsibleTrigger>
                <Button
                  id={`faq-trigger-${idx}`}
                  iconOnly
                  IconCenter={ChevronsUpDown}
                  style="ghost"
                  size="small"
                  aria-label={`Toggle ${item.q}`}
                />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <p
                style={{
                  marginTop: 'var(--p-2)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {item.a}
              </p>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  ),
};
