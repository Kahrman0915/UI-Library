import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Textarea from './Textarea';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A multi-line text field. Reuses Input’s field chrome, so the two sit ' +
        'together consistently in the same form.',
      tags: ['form control'],
      changelog: [
        {
          date: '2026-08-05',
          summary:
            'A `required` field with no `label` now shows the asterisk inside the field.',
          detail:
            'Matches Input. `.ui-input__required` renders on `required && !label`, `aria-hidden` '+
            'since the native attribute is the announcement. In a multiline wrap it pins to '+
            'the FIRST line rather than centring, so it does not drift down the block as the '+
            'textarea grows — `--multi` zeroes the wrap padding, so the marker carries the '+
            'control’s own inset per size.',
        },
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
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    onValueChange: { action: 'value-change' },
  },
  args: {
    id: 'story-textarea',
    label: 'Feedback',
    placeholder: 'Tell us what you think…',
    size: 'default',
    error: false,
    disabled: false,
    required: false,
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div style={{ width: 400 }}>
        <Textarea {...args} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Bio',
    description: 'A short intro shown on your profile. Markdown supported.',
    placeholder: 'I build things…',
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Textarea {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 480 }}>
      <Textarea id="ta-sm" size="sm" label="Small" placeholder="text-xs, min-h-16" />
      <Textarea
        id="ta-md"
        size="default"
        label="Default"
        placeholder="text-sm, min-h-24"
      />
      <Textarea id="ta-lg" size="lg" label="Large" placeholder="text-base, min-h-32" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue:
      "This field can't be edited right now. Contact your admin to unlock it.",
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Textarea {...args} />
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'x',
    error: true,
    errorMessage: 'Please write at least 20 characters.',
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Textarea {...args} />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', maxWidth: 480 }}>
      <Textarea id="ta-1" label="Default" placeholder="Type here…" />
      <Textarea id="ta-2" label="Required" required placeholder="Type here…" />
      <Textarea
        id="ta-3"
        label="With value"
        defaultValue="This is some content already in the textarea. Drag the handle to resize me."
      />
      <Textarea
        id="ta-4"
        label="Disabled"
        disabled
        defaultValue="Read only content."
      />
      <Textarea
        id="ta-5"
        label="Error"
        defaultValue="x"
        error
        errorMessage="Please write at least 20 characters."
      />
    </div>
  ),
};

export const LongContent: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ width: 480 }}>
      <Textarea
        id="ta-long"
        label="Release notes"
        description="Drag the resize handle in the bottom-right to grow the field."
        defaultValue={`Version 1.4.0

- Added dark theme support for the reporting module
- Fixed a bug where the export button would silently fail on Safari
- Improved keyboard nav in the dropdown menu — arrow keys wrap correctly

Version 1.3.2

- Small tweaks to spacing on the settings page
- Updated internal token names for consistency`}
      />
    </div>
  ),
};

/**
 * With no label the asterisk moves inside the field — and in a multiline box it
 * pins to the FIRST LINE rather than centring, so it does not drift down the
 * block as the textarea grows.
 */
export const RequiredWithoutLabel: Story = {
  name: 'Required indicator with no label',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-5)', maxWidth: 'var(--max-w-sm)' }}>
      <Textarea id="ta-req-labelled" label="Notes" required placeholder="Label carries the asterisk" />
      <Textarea id="ta-req-bare" required placeholder="Required, no label" />
      <Textarea id="ta-req-optional" placeholder="Not required — no marker" />
      <Textarea id="ta-req-tall" required rows={6} placeholder="Six rows — the marker stays on the first line" />
      <Textarea id="ta-req-disabled" required disabled placeholder="Disabled — the ask recedes" />
      {(['sm', 'default', 'lg'] as const).map((s) => (
        <Textarea key={s} id={`ta-req-${s}`} size={s} required placeholder={`size="${s}"`} />
      ))}
    </div>
  ),
};
