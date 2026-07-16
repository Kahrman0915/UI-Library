import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Combobox from './Combobox';
import type { ComboboxOption } from './Combobox.types';
import Button from '../Button';

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    clearable: { control: 'boolean' },
    onValueChange: { action: 'value-change' },
  },
  args: {
    id: 'story-combobox',
    label: 'Language',
    description: 'Pick your preferred language.',
    placeholder: 'Select language',
    searchPlaceholder: 'Search language…',
    emptyMessage: 'No language found.',
    size: 'default',
    disabled: false,
    required: false,
    error: false,
    clearable: true,
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

const languages: ComboboxOption[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Mandarin' },
];

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ width: 320 }}>
        <Combobox
          {...args}
          options={languages}
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

export const NoLabel: Story = {
  args: { label: undefined, description: undefined },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ width: 260 }}>
        <Combobox
          {...args}
          options={languages}
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-4)',
        maxWidth: 'var(--max-w-sm)',
      }}
    >
      {(['sm', 'default', 'lg'] as const).map((s) => (
        <Combobox
          key={s}
          id={`sz-${s}`}
          size={s}
          label={`Size: ${s}`}
          options={languages}
          placeholder="Select language"
          searchPlaceholder="Search…"
          clearable
        />
      ))}
    </div>
  ),
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Language',
    description: undefined,
    defaultValue: 'fr',
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Combobox {...args} options={languages} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'en', description: undefined },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Combobox {...args} options={languages} />
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    error: true,
    errorMessage: 'Pick a language to continue.',
    description: undefined,
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Combobox {...args} options={languages} />
    </div>
  ),
};

export const WithItemDescriptions: Story = {
  args: {
    label: 'Plan',
    description: 'Choose a plan.',
  },
  render: (args) => {
    const plans: ComboboxOption[] = [
      {
        value: 'free',
        label: 'Free',
        description: 'Basic features for individuals.',
      },
      {
        value: 'pro',
        label: 'Pro',
        description: 'Collaboration and higher limits.',
      },
      {
        value: 'team',
        label: 'Team',
        description: 'Shared workspaces and admin controls.',
      },
      {
        value: 'enterprise',
        label: 'Enterprise',
        description: 'Custom limits, SSO, and priority support.',
      },
    ];
    return (
      <div style={{ width: 380 }}>
        <Combobox {...args} options={plans} defaultValue="pro" />
      </div>
    );
  },
};

export const WithDisabledOptions: Story = {
  args: { label: 'Plan', description: undefined },
  render: (args) => {
    const plans: ComboboxOption[] = [
      { value: 'starter', label: 'Starter' },
      { value: 'pro', label: 'Pro' },
      { value: 'team', label: 'Team' },
      { value: 'enterprise', label: 'Enterprise (contact sales)', disabled: true },
    ];
    return (
      <div style={{ width: 320 }}>
        <Combobox {...args} options={plans} />
      </div>
    );
  },
};

export const LongList: Story = {
  args: {
    label: 'Timezone',
    description: 'Type to search.',
    searchPlaceholder: 'Filter zones…',
  },
  render: (args) => {
    const zones: ComboboxOption[] = [
      'Pacific/Honolulu',
      'America/Anchorage',
      'America/Los_Angeles',
      'America/Denver',
      'America/Chicago',
      'America/New_York',
      'America/Halifax',
      'America/Sao_Paulo',
      'Atlantic/Cape_Verde',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Athens',
      'Europe/Moscow',
      'Africa/Nairobi',
      'Asia/Dubai',
      'Asia/Karachi',
      'Asia/Kolkata',
      'Asia/Bangkok',
      'Asia/Singapore',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Australia/Perth',
      'Australia/Sydney',
      'Pacific/Auckland',
    ].map((z) => ({ value: z, label: z }));
    return (
      <div style={{ width: 320 }}>
        <Combobox
          {...args}
          options={zones}
          defaultValue="America/New_York"
        />
      </div>
    );
  },
};

export const InForm: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        // eslint-disable-next-line no-console
        console.log('form values:', Object.fromEntries(data));
      }}
      style={{
        display: 'grid',
        gap: 'var(--p-4)',
        maxWidth: 'var(--max-w-sm)',
      }}
    >
      <Combobox
        id="language-form"
        name="language"
        label="Language"
        description="Which stack are you on?"
        options={languages}
        placeholder="Select language"
        searchPlaceholder="Search language…"
        required
        clearable
      />
      <div style={{ justifySelf: 'start' }}>
        <Button id="combobox-submit" type="submit" label="Submit" />
      </div>
    </form>
  ),
};
