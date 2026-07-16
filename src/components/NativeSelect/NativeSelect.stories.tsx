import type { Meta, StoryObj } from '@storybook/react';
import NativeSelect, {
  NativeSelectOption,
  NativeSelectOptGroup,
} from './NativeSelect';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    children: { table: { disable: true } },
  },
  args: { id: 'story-select', label: 'Status', size: 'default' },
  render: (args) => (
    <div style={{ width: 260 }}>
      <NativeSelect {...args}>
        <NativeSelectOption value="">Select a status…</NativeSelectOption>
        <NativeSelectOption value="todo">Todo</NativeSelectOption>
        <NativeSelectOption value="in-progress">In progress</NativeSelectOption>
        <NativeSelectOption value="done">Done</NativeSelectOption>
        <NativeSelectOption value="archived" disabled>
          Archived
        </NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof NativeSelect>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', width: 260 }}>
      {(['sm', 'default', 'lg'] as const).map((s) => (
        <NativeSelect key={s} id={`sz-${s}`} label={`Size: ${s}`} size={s}>
          <NativeSelectOption value="one">One</NativeSelectOption>
          <NativeSelectOption value="two">Two</NativeSelectOption>
          <NativeSelectOption value="three">Three</NativeSelectOption>
        </NativeSelect>
      ))}
    </div>
  ),
};

export const Grouped: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <NativeSelect
        id="grouped"
        label="Framework"
        description="Pick your stack."
      >
        <NativeSelectOption value="">Select…</NativeSelectOption>
        <NativeSelectOptGroup label="Frontend">
          <NativeSelectOption value="react">React</NativeSelectOption>
          <NativeSelectOption value="vue">Vue</NativeSelectOption>
          <NativeSelectOption value="svelte">Svelte</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Backend">
          <NativeSelectOption value="node">Node</NativeSelectOption>
          <NativeSelectOption value="go">Go</NativeSelectOption>
          <NativeSelectOption value="rust">Rust</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <NativeSelect
        id="err"
        label="Country"
        required
        error
        errorMessage="Please choose a country."
        defaultValue=""
      >
        <NativeSelectOption value="">Select a country…</NativeSelectOption>
        <NativeSelectOption value="us">United States</NativeSelectOption>
        <NativeSelectOption value="ca">Canada</NativeSelectOption>
        <NativeSelectOption value="mx">Mexico</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 260 }}>
      <NativeSelect id="disabled" label="Plan" disabled defaultValue="pro">
        <NativeSelectOption value="free">Free</NativeSelectOption>
        <NativeSelectOption value="pro">Pro</NativeSelectOption>
      </NativeSelect>
    </div>
  ),
};
