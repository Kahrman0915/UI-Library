import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RadioGroup, { RadioGroupItem } from './RadioGroup';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'One choice from a small set of mutually exclusive options, all visible at ' +
        'once. Past roughly seven options the list stops being scannable — use a ' +
        '`Select` instead.',
      tags: ['form control', '3 sizes'],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    onValueChange: { action: 'value-change' },
  },
  args: {
    id: 'story-radio-group',
    orientation: 'vertical',
    label: 'Notification preference',
    description: 'How would you like to be notified?',
    disabled: false,
    required: false,
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('email');
    return (
      <RadioGroup {...args} value={value} onValueChange={setValue}>
        <RadioGroupItem id="pg-email" value="email" label="Email" />
        <RadioGroupItem id="pg-sms" value="sms" label="SMS" />
        <RadioGroupItem id="pg-push" value="push" label="Push notification" />
      </RadioGroup>
    );
  },
};

export const NoGroupLabel: Story = {
  args: { label: undefined, description: undefined },
  render: (args) => {
    const [value, setValue] = useState('one');
    return (
      <RadioGroup {...args} value={value} onValueChange={setValue}>
        <RadioGroupItem id="ng-1" value="one" label="One" />
        <RadioGroupItem id="ng-2" value="two" label="Two" />
        <RadioGroupItem id="ng-3" value="three" label="Three" />
      </RadioGroup>
    );
  },
};

export const WithItemDescriptions: Story = {
  args: {
    id: 'plan',
    label: 'Choose a plan',
    description: 'You can change this later.',
  },
  render: (args) => {
    const [value, setValue] = useState('starter');
    return (
      <RadioGroup {...args} value={value} onValueChange={setValue}>
        <RadioGroupItem
          id="plan-starter"
          value="starter"
          label="Starter"
          description="Free forever, up to 3 projects."
        />
        <RadioGroupItem
          id="plan-pro"
          value="pro"
          label="Pro"
          description="$12/mo — unlimited projects and history."
        />
        <RadioGroupItem
          id="plan-team"
          value="team"
          label="Team"
          description="$29/mo per seat — collaboration and SSO."
        />
      </RadioGroup>
    );
  },
};

export const Horizontal: Story = {
  args: {
    id: 'horiz',
    orientation: 'horizontal',
    label: 'Density',
    description: undefined,
  },
  render: (args) => {
    const [value, setValue] = useState('comfortable');
    return (
      <RadioGroup {...args} value={value} onValueChange={setValue}>
        <RadioGroupItem id="d-compact" value="compact" label="Compact" />
        <RadioGroupItem
          id="d-comfortable"
          value="comfortable"
          label="Comfortable"
        />
        <RadioGroupItem id="d-spacious" value="spacious" label="Spacious" />
      </RadioGroup>
    );
  },
};

export const AllStates: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
      <RadioGroup id="s-default" label="Default" defaultValue="b">
        <RadioGroupItem id="s-def-a" value="a" label="Option A" />
        <RadioGroupItem id="s-def-b" value="b" label="Option B (selected)" />
        <RadioGroupItem id="s-def-c" value="c" label="Option C" />
      </RadioGroup>

      <RadioGroup id="s-disabled" label="Disabled group" disabled defaultValue="a">
        <RadioGroupItem id="s-dis-a" value="a" label="Option A" />
        <RadioGroupItem id="s-dis-b" value="b" label="Option B" />
      </RadioGroup>

      <RadioGroup id="s-item-dis" label="One item disabled" defaultValue="a">
        <RadioGroupItem id="s-id-a" value="a" label="Enabled" />
        <RadioGroupItem
          id="s-id-b"
          value="b"
          label="Disabled option"
          disabled
        />
        <RadioGroupItem id="s-id-c" value="c" label="Enabled" />
      </RadioGroup>

      <RadioGroup id="s-required" label="Required" required>
        <RadioGroupItem id="s-req-a" value="a" label="Option A" />
        <RadioGroupItem id="s-req-b" value="b" label="Option B" />
      </RadioGroup>
    </div>
  ),
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
        gap: 'var(--p-6)',
        maxWidth: 'var(--max-w-sm)',
      }}
    >
      <RadioGroup
        id="delivery"
        name="delivery"
        label="Delivery method"
        description="Where should we ship your order?"
        defaultValue="standard"
        required
      >
        <RadioGroupItem
          id="d-standard"
          value="standard"
          label="Standard"
          description="3–5 business days"
        />
        <RadioGroupItem
          id="d-express"
          value="express"
          label="Express"
          description="1–2 business days"
        />
        <RadioGroupItem
          id="d-pickup"
          value="pickup"
          label="In-store pickup"
          description="Ready in 4 hours"
        />
      </RadioGroup>
      <div style={{ justifySelf: 'start' }}>
        <Button id="radio-submit" type="submit" label="Submit" />
      </div>
    </form>
  ),
};

// Inside `data-surface="aiden"` the checked radio's filled circle takes Aiden's
// gradient. See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div data-surface="aiden">
      <RadioGroup id="aiden-radio" label="Model" defaultValue="opus">
        <RadioGroupItem id="aiden-r1" value="opus" label="Opus" />
        <RadioGroupItem id="aiden-r2" value="sonnet" label="Sonnet" />
        <RadioGroupItem id="aiden-r3" value="haiku" label="Haiku" />
      </RadioGroup>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
      <RadioGroup id="rg-sm" size="sm" label="Small" defaultValue="a">
        <RadioGroupItem id="rg-sm-a" value="a" label="Option A" />
        <RadioGroupItem id="rg-sm-b" value="b" label="Option B" />
      </RadioGroup>
      <RadioGroup id="rg-default" size="default" label="Default" defaultValue="a">
        <RadioGroupItem id="rg-md-a" value="a" label="Option A" />
        <RadioGroupItem id="rg-md-b" value="b" label="Option B" />
      </RadioGroup>
      <RadioGroup id="rg-lg" size="lg" label="Large" defaultValue="a">
        <RadioGroupItem id="rg-lg-a" value="a" label="Option A" />
        <RadioGroupItem id="rg-lg-b" value="b" label="Option B" />
      </RadioGroup>
    </div>
  ),
};
