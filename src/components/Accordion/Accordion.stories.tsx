import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Accordion, {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'A vertical stack of disclosure sections. `type="single"` keeps one open at a ' +
        'time — add `collapsible` to allow none — while `type="multiple"` lets any ' +
        'number sit open at once. Height animates with a CSS grid trick, so there is ' +
        'no measurement and no JavaScript in the open/close path.',
      tags: ['compound', 'animated'],
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
    id: 'story-accordion',
    type: 'single',
    collapsible: true,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

const faq = [
  {
    value: 'item-1',
    q: 'Is it accessible?',
    a: 'Yes. It follows the WAI-ARIA design pattern for disclosure, has roving arrow-key focus between triggers, and marks closed content as inert.',
  },
  {
    value: 'item-2',
    q: 'Is it styled?',
    a: 'Yes. Every value comes from a design token — no hex, no rgba. Colors adapt to light/dark themes automatically.',
  },
  {
    value: 'item-3',
    q: 'Is it animated?',
    a: 'The height animation uses grid-template-rows: 0fr → 1fr, which requires no JavaScript measurement. The chevron rotates 180° on open.',
  },
];

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: 'var(--max-w-md)' }}>
      <Accordion {...args}>
        {faq.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div style={{ width: 'var(--max-w-md)' }}>
      <Accordion id="multi" type="multiple">
        {faq.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const SingleNotCollapsible: Story = {
  args: {
    type: 'single',
    collapsible: false,
    id: 'no-collapse',
  },
  render: (args) => (
    <div style={{ width: 'var(--max-w-md)' }}>
      <Accordion {...args}>
        {faq.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <div style={{ width: 'var(--max-w-md)' }}>
      <Accordion
        id="with-default"
        type="single"
        collapsible
        defaultValue="item-2"
      >
        {faq.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>('item-1');
    return (
      <div style={{ display: 'grid', gap: 'var(--p-3)', width: 'var(--max-w-md)' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          Currently open:{' '}
          <strong>{value ?? '(none)'}</strong>
        </div>
        <Accordion
          id="ctrl"
          type="single"
          collapsible
          value={value}
          onValueChange={setValue}
        >
          {faq.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  },
};

export const WithDisabledItem: Story = {
  args: { type: 'single', collapsible: true, id: 'disabled-item' },
  render: (args) => (
    <div style={{ width: 'var(--max-w-md)' }}>
      <Accordion {...args}>
        <AccordionItem value="a">
          <AccordionTrigger>Enabled</AccordionTrigger>
          <AccordionContent>You can toggle this one.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b" disabled>
          <AccordionTrigger>Disabled — not clickable</AccordionTrigger>
          <AccordionContent>You should not see this.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionTrigger>Also enabled</AccordionTrigger>
          <AccordionContent>
            Arrow keys skip the disabled item.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const EntireAccordionDisabled: Story = {
  args: { type: 'single', collapsible: true, disabled: true, id: 'all-off' },
  render: (args) => (
    <div style={{ width: 'var(--max-w-md)' }}>
      <Accordion {...args}>
        {faq.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ),
};
