import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from './Checkbox';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A single on/off choice, or one of several independent ones. `indeterminate` ' +
        'covers a parent controlling a partially-checked set. For a setting that ' +
        'takes effect the moment it is flipped rather than on submit, use `Switch`.',
      tags: ['form control', '3 sizes'],
      motion: {
        notes:
          'The check and indeterminate marks are both always mounted and overlaid, so switching between them ' +
          'cross-fades instead of hard-swapping. The mark draws itself in via `stroke-dashoffset`, and the icon ' +
          'pops from `scale(0.5)` on `--ease-spring-strong`.',
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
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    onCheckedChange: { action: 'checked-change' },
  },
  args: {
    id: 'story-checkbox',
    label: 'Accept terms and conditions',
    disabled: false,
    indeterminate: false,
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const NoLabel: Story = {
  args: { label: undefined },
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onCheckedChange={setChecked}
      />
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Checkbox
        id="terms-desc"
        checked={checked}
        onCheckedChange={setChecked}
        label="Send me product updates"
        description="Once a month, no spam. Unsubscribe anytime."
      />
    );
  },
};

export const AllStates: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      <Checkbox id="s1" label="Unchecked" />
      <Checkbox id="s2" label="Checked" defaultChecked />
      <Checkbox id="s3" label="Indeterminate" indeterminate />
      <Checkbox id="s4" label="Disabled unchecked" disabled />
      <Checkbox id="s5" label="Disabled checked" disabled defaultChecked />
      <Checkbox
        id="s6"
        label="Disabled indeterminate"
        disabled
        indeterminate
      />
    </div>
  ),
};

export const SelectAllPattern: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const options = ['Design', 'Engineering', 'Product', 'Research'];
    const [selected, setSelected] = useState<Set<string>>(new Set(['Design']));

    const allChecked = selected.size === options.length;
    const someChecked = selected.size > 0 && selected.size < options.length;

    const toggleAll = (next: boolean) => {
      setSelected(next ? new Set(options) : new Set());
    };

    const toggle = (option: string, next: boolean) => {
      setSelected((prev) => {
        const nextSet = new Set(prev);
        if (next) nextSet.add(option);
        else nextSet.delete(option);
        return nextSet;
      });
    };

    return (
      <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
        <Checkbox
          id="all"
          label="All teams"
          checked={allChecked}
          indeterminate={someChecked}
          onCheckedChange={toggleAll}
        />
        <div
          style={{
            display: 'grid',
            gap: 'var(--p-2)',
            paddingLeft: 'var(--p-6)',
          }}
        >
          {options.map((opt) => (
            <Checkbox
              key={opt}
              id={`opt-${opt.toLowerCase()}`}
              label={opt}
              checked={selected.has(opt)}
              onCheckedChange={(next) => toggle(opt, next)}
            />
          ))}
        </div>
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
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-sm)',
      }}
    >
      <Checkbox
        id="marketing"
        name="marketing"
        value="yes"
        label="Marketing emails"
        description="News, product updates, and announcements."
      />
      <Checkbox
        id="required-tos"
        name="tos"
        value="accepted"
        label="I accept the terms of service"
        required
      />
      <div style={{ justifySelf: 'start' }}>
        <Button id="checkbox-submit" type="submit" label="Submit" />
      </div>
    </form>
  ),
};

// Inside `data-surface="aiden"` the checked/indeterminate box takes Aiden's
// gradient fill. See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div data-surface="aiden" style={{ display: 'grid', gap: 'var(--p-2-5)' }}>
      <Checkbox id="aiden-checked" label="Checked" defaultChecked />
      <Checkbox id="aiden-indeterminate" label="Indeterminate" indeterminate />
      <Checkbox id="aiden-unchecked" label="Unchecked" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)', alignItems: 'start' }}>
      <Checkbox id="cb-sm" size="sm" label="Small" defaultChecked />
      <Checkbox id="cb-default" size="default" label="Default" defaultChecked />
      <Checkbox id="cb-lg" size="lg" label="Large" defaultChecked />
      <Checkbox
        id="cb-lg-desc"
        size="lg"
        label="Large with description"
        description="Everything scales together."
        indeterminate
      />
    </div>
  ),
};
