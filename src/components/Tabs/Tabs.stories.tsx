import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Tabs, { TabsList, TabsTrigger, TabsContent } from './Tabs';
import Card, { CardBody } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

// Wraps arbitrary content in a Card so every tab pane uses the real Card
// component instead of duplicating card visuals inline.
const Pane = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <Card id={id}>
    <CardBody>{children}</CardBody>
  </Card>
);

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'Switches between panels occupying the same space. `activationMode` decides ' +
        'whether the arrow keys select immediately or only move focus — use `manual` ' +
        'when switching is expensive or destructive.',
      tags: ['compound', '4 parts'],
      motion: {
        notes:
          'The active pill is ONE shared element (`.ui-tabs__indicator`) positioned from the active trigger and ' +
          'slid between them — not a background on each tab. Switching therefore reads as a single object ' +
          'moving rather than two states swapping. It sits behind the triggers, whose own background is ' +
          'transparent so it shows through.',
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
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    activationMode: {
      control: 'inline-radio',
      options: ['automatic', 'manual'],
    },
    onValueChange: { action: 'value-change' },
  },
  args: {
    id: 'story-tabs',
    orientation: 'horizontal',
    activationMode: 'automatic',
    defaultValue: 'account',
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Pane id="tab-pane-account">
            <strong>Account</strong>
            <p style={{ marginTop: 'var(--p-2)', color: 'var(--muted-foreground)' }}>
              Manage your account settings and public profile.
            </p>
          </Pane>
        </TabsContent>
        <TabsContent value="password">
          <Pane id="tab-pane-password">
            <strong>Password</strong>
            <p style={{ marginTop: 'var(--p-2)', color: 'var(--muted-foreground)' }}>
              Change your password. Sign out after saving.
            </p>
          </Pane>
        </TabsContent>
        <TabsContent value="notifications">
          <Pane id="tab-pane-notifications">
            <strong>Notifications</strong>
            <p style={{ marginTop: 'var(--p-2)', color: 'var(--muted-foreground)' }}>
              Choose what you want to be notified about.
            </p>
          </Pane>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Pane id="v-general">General settings live here.</Pane>
        </TabsContent>
        <TabsContent value="billing">
          <Pane id="v-billing">Billing and invoice history.</Pane>
        </TabsContent>
        <TabsContent value="team">
          <Pane id="v-team">Team roster and roles.</Pane>
        </TabsContent>
        <TabsContent value="integrations">
          <Pane id="v-integrations">Connect third-party services.</Pane>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Tabs id="disabled-tab" defaultValue="active-1">
        <TabsList>
          <TabsTrigger value="active-1">Active</TabsTrigger>
          <TabsTrigger value="disabled" disabled>
            Disabled
          </TabsTrigger>
          <TabsTrigger value="active-2">Active</TabsTrigger>
        </TabsList>
        <TabsContent value="active-1">
          <Pane id="dt-1">First active tab.</Pane>
        </TabsContent>
        <TabsContent value="disabled">
          <Pane id="dt-dis">You shouldn't see this.</Pane>
        </TabsContent>
        <TabsContent value="active-2">
          <Pane id="dt-2">Second active tab.</Pane>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('home');
    return (
      <div style={{ maxWidth: 'var(--max-w-md)' }}>
        <div
          style={{
            marginBottom: 'var(--p-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
          }}
        >
          External state: <strong>{value}</strong>
        </div>
        <Tabs id="ctrl-tabs" value={value} onValueChange={setValue}>
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <Pane id="ctrl-home">Home content.</Pane>
          </TabsContent>
          <TabsContent value="about">
            <Pane id="ctrl-about">About content.</Pane>
          </TabsContent>
          <TabsContent value="contact">
            <Pane id="ctrl-contact">Contact content.</Pane>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

export const ManualActivation: Story = {
  args: { activationMode: 'manual' },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <div
        style={{
          marginBottom: 'var(--p-3)',
          fontSize: 'var(--text-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        Arrow keys move focus only. Press Enter/Space to activate.
      </div>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="one">Tab One</TabsTrigger>
          <TabsTrigger value="two">Tab Two</TabsTrigger>
          <TabsTrigger value="three">Tab Three</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Pane id="manual-1">Manual mode — panel one.</Pane>
        </TabsContent>
        <TabsContent value="two">
          <Pane id="manual-2">Manual mode — panel two.</Pane>
        </TabsContent>
        <TabsContent value="three">
          <Pane id="manual-3">Manual mode — panel three.</Pane>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-4xl)' }}>
      <Tabs id="many-tabs" defaultValue="mon">
        <TabsList>
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => (
            <TabsTrigger key={d} value={d}>
              {d.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => (
          <TabsContent key={d} value={d}>
            <Pane id={`many-${d}`}>Schedule for {d.toUpperCase()}.</Pane>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  ),
};
