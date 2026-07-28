import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Switch from './Switch';
import Button from '../Button';
import Card, { CardBody } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'A setting that takes effect the moment it is flipped. For a choice that ' +
        'applies when the form is submitted, use `Checkbox`.',
      tags: ['form control', '3 sizes'],
    } satisfies UiDocsParameters,
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: {
      control: 'inline-radio',
      options: ['sm', 'default', 'lg'],
    },
    onCheckedChange: { action: 'checked-change' },
  },
  args: {
    id: 'story-switch',
    label: 'Airplane mode',
    size: 'default',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch {...args} checked={checked} onCheckedChange={setChecked} />
    );
  },
};

export const NoLabel: Story = {
  args: { label: undefined },
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch {...args} checked={checked} onCheckedChange={setChecked} />
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <Switch
        id="notifications"
        checked={checked}
        onCheckedChange={setChecked}
        label="Email notifications"
        description="Receive an email when someone comments on your posts."
      />
    );
  },
};

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      <Switch id="sz-sm" size="sm" label="Small" defaultChecked />
      <Switch id="sz-default" size="default" label="Default" defaultChecked />
      <Switch id="sz-lg" size="lg" label="Large" defaultChecked />
    </div>
  ),
};

export const AllStates: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
      <Switch id="s1" label="Off" />
      <Switch id="s2" label="On" defaultChecked />
      <Switch id="s3" label="Disabled off" disabled />
      <Switch id="s4" label="Disabled on" disabled defaultChecked />
      <Switch
        id="s5"
        label="With description"
        description="Longer helper text sits under the label."
        defaultChecked
      />
    </div>
  ),
};

export const SettingsPanel: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [settings, setSettings] = useState({
      airplane: false,
      wifi: true,
      bluetooth: true,
      dnd: false,
    });
    const set = (key: keyof typeof settings) => (next: boolean) =>
      setSettings((s) => ({ ...s, [key]: next }));

    return (
      <div style={{ maxWidth: 'var(--max-w-sm)' }}>
        <Card id="switch-settings">
          <CardBody>
            <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
              <Switch
                id="s-airplane"
                label="Airplane mode"
                description="Disable all wireless connections."
                checked={settings.airplane}
                onCheckedChange={set('airplane')}
              />
              <Switch
                id="s-wifi"
                label="Wi-Fi"
                checked={settings.wifi}
                onCheckedChange={set('wifi')}
                disabled={settings.airplane}
              />
              <Switch
                id="s-bt"
                label="Bluetooth"
                checked={settings.bluetooth}
                onCheckedChange={set('bluetooth')}
                disabled={settings.airplane}
              />
              <Switch
                id="s-dnd"
                label="Do not disturb"
                description="Silence notifications."
                checked={settings.dnd}
                onCheckedChange={set('dnd')}
              />
            </div>
          </CardBody>
        </Card>
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
      <Switch
        id="marketing"
        name="marketing"
        value="yes"
        label="Marketing emails"
        description="News, product updates, and announcements."
      />
      <Switch
        id="digest"
        name="digest"
        value="weekly"
        label="Weekly digest"
        defaultChecked
      />
      <div style={{ justifySelf: 'start' }}>
        <Button id="switch-submit" type="submit" label="Submit" />
      </div>
    </form>
  ),
};

// Inside `data-surface="aiden"` the checked track takes Aiden's gradient.
// See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div data-surface="aiden" style={{ display: 'grid', gap: 'var(--p-2-5)' }}>
      <Switch id="aiden-on" label="On" defaultChecked />
      <Switch id="aiden-off" label="Off" />
    </div>
  ),
};
