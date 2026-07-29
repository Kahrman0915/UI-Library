import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Select, {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './Select';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  // Drives the per-part props tables in the Composition + API sections of the
  // Docs page. Storybook resolves each entry through docgen on its own.
  subcomponents: {
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
  },
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A styled floating listbox for choosing one value from a set. Use it when the options need to be richer than plain text — icons, two-line descriptions, groups and separators — or when the closed field has to look identical across platforms.',
      tags: ['form control', 'portal'],
      usage: {
        when: [
          'Options carry more than a label: an icon, a description line, a group heading.',
          'The trigger has to match the rest of your fields pixel-for-pixel on every OS.',
          'The list is short enough to scan — roughly a screenful — so no search is needed.',
        ],
        avoid: [
          'The list is short and plain, or the form is mobile-first — `NativeSelect` renders the OS control, which is cheaper and has better built-in accessibility.',
          'The list is long (timezones, countries, users) — `Combobox` is the only one of the three with a search field.',
          'The user is picking an action rather than a value — that is `DropdownMenu`.',
        ],
        notes:
          'All three look identical when closed: a bordered field with a chevron. The choice is a behaviour decision, not a visual one, so a static mockup cannot communicate it — NativeSelect first, Select for rich items, Combobox for long or searchable lists.',
      },
      composition: [
        {
          name: 'Select',
          description:
            'Root. Owns the value and open state, renders the label, description and error message, and emits a hidden input so the value posts with a plain form.',
          required: true,
        },
        {
          name: 'SelectTrigger',
          description:
            'The field itself. Shows the selected item’s label (or `placeholder`) plus the chevron.',
          required: true,
        },
        {
          name: 'SelectContent',
          description:
            'The floating listbox. Positioned with `computePosition` and kept anchored by `useFloatingReposition`; `side`, `align` and `sideOffset` place it. No collision detection — it will not flip near a viewport edge.',
          required: true,
        },
        {
          name: 'SelectItem',
          description:
            'One option. `value` is what `onValueChange` reports; pass `label` when `children` is too rich to collapse into the trigger.',
          required: true,
        },
        {
          name: 'SelectGroup',
          description:
            'Wraps related items under a heading passed as `label`.',
        },
        {
          name: 'SelectLabel',
          description:
            'A standalone heading row, for grouping visually without a `SelectGroup` wrapper.',
        },
        {
          name: 'SelectSeparator',
          description: 'Hairline between groups of items.',
        },
      ],
      a11y: {
        notes:
          'The trigger is the single `role="combobox"` and owns `aria-expanded`, `aria-controls` and `aria-activedescendant`; the surface is the `role="listbox"`. `id` seeds every child id, so the label, description and error wire up through `aria-labelledby` / `aria-describedby` automatically. Closing returns focus to the trigger.',
        keyboard: [
          {
            keys: ['Enter'],
            description: 'Open the listbox, or select the highlighted option.',
          },
          { keys: ['Space'], description: 'Open the listbox.' },
          {
            keys: ['↓'],
            description: 'Open the listbox, then move to the next option.',
          },
          { keys: ['↑'], description: 'Move to the previous option.' },
          { keys: ['Home'], description: 'Jump to the first option.' },
          { keys: ['End'], description: 'Jump to the last option.' },
          {
            keys: ['Esc'],
            description: 'Close without selecting and return focus to the trigger.',
          },
        ],
      },
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
