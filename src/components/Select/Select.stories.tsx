import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectSeparator,
} from './Select';
import Button from '../Button';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: { layout: 'centered' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    onValueChange: { action: 'value-change' },
  },
  args: {
    id: 'story-select',
    label: 'Fruit',
    description: 'Pick your favorite.',
    size: 'default',
    disabled: false,
    required: false,
    error: false,
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

const Fruits = () => (
  <>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="orange">Orange</SelectItem>
    <SelectItem value="mango">Mango</SelectItem>
    <SelectItem value="pineapple">Pineapple</SelectItem>
  </>
);

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ width: 320 }}>
        <Select {...args} value={value} onValueChange={setValue}>
          <SelectTrigger placeholder="Select a fruit" />
          <SelectContent>
            <Fruits />
          </SelectContent>
        </Select>
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
        <Select {...args} value={value} onValueChange={setValue}>
          <SelectTrigger placeholder="Select…" />
          <SelectContent>
            <Fruits />
          </SelectContent>
        </Select>
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
        <Select key={s} id={`sz-${s}`} size={s} label={`Size: ${s}`}>
          <SelectTrigger placeholder="Select a fruit" />
          <SelectContent>
            <Fruits />
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};

export const WithDefaultValue: Story = {
  args: { label: 'Fruit', description: undefined },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Select {...args} defaultValue="banana">
        <SelectTrigger placeholder="Select a fruit" />
        <SelectContent>
          <Fruits />
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: 'Fruit', disabled: true, description: undefined },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Select {...args} defaultValue="apple">
        <SelectTrigger placeholder="Select a fruit" />
        <SelectContent>
          <Fruits />
        </SelectContent>
      </Select>
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Fruit',
    error: true,
    errorMessage: 'Please pick a fruit.',
    description: undefined,
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Select {...args}>
        <SelectTrigger placeholder="Select a fruit" />
        <SelectContent>
          <Fruits />
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroupsAndSeparator: Story = {
  args: {
    label: 'Choose an option',
    description: 'Grouped by category.',
  },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ width: 320 }}>
        <Select {...args} value={value} onValueChange={setValue}>
          <SelectTrigger placeholder="Select…" />
          <SelectContent>
            <SelectGroup label="Fruits">
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup label="Vegetables">
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="broccoli">Broccoli</SelectItem>
              <SelectItem value="spinach">Spinach</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup label="Grains">
              <SelectItem value="rice">Rice</SelectItem>
              <SelectItem value="oats" disabled>
                Oats (out of stock)
              </SelectItem>
              <SelectItem value="wheat">Wheat</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const ManyOptions: Story = {
  args: {
    label: 'Timezone',
    description: 'Scroll to find yours.',
  },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>('America/New_York');
    const zones = [
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
      'Europe/Athens',
      'Europe/Moscow',
      'Asia/Dubai',
      'Asia/Karachi',
      'Asia/Kolkata',
      'Asia/Bangkok',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];
    return (
      <div style={{ width: 320 }}>
        <Select {...args} value={value} onValueChange={setValue}>
          <SelectTrigger placeholder="Select timezone" />
          <SelectContent>
            {zones.map((z) => (
              <SelectItem key={z} value={z}>
                {z}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      <Select
        id="country"
        name="country"
        label="Country"
        description="Where do you live?"
        required
      >
        <SelectTrigger placeholder="Select a country" />
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="ca">Canada</SelectItem>
          <SelectItem value="mx">Mexico</SelectItem>
          <SelectItem value="uk">United Kingdom</SelectItem>
          <SelectItem value="jp">Japan</SelectItem>
        </SelectContent>
      </Select>
      <Select
        id="plan"
        name="plan"
        label="Plan"
        defaultValue="pro"
      >
        <SelectTrigger placeholder="Select a plan" />
        <SelectContent>
          <SelectItem value="starter">Starter — Free</SelectItem>
          <SelectItem value="pro">Pro — $12/mo</SelectItem>
          <SelectItem value="team">Team — $29/mo</SelectItem>
        </SelectContent>
      </Select>
      <div style={{ justifySelf: 'start' }}>
        <Button id="select-submit" type="submit" label="Submit" />
      </div>
    </form>
  ),
};
