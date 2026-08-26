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
        'when switching is expensive or destructive.\n\n' +
        '`variant` changes only how the tablist looks — `default` (enclosed pill track), ' +
        '`line` (a bar on `--primary`) and `browser` (a card tab joined to its panel) ' +
        'all share identical semantics, keyboard behaviour and aria wiring.',
      tags: ['compound', '4 parts', '3 variants'],
      usage: {
        when: [
          'Panels that ship together and occupy the same space — settings sections, a detail view with several faces.',
          '`line` when the tabs sit inside an existing surface and a second filled track would read as a box in a box.',
          '`browser` when the panel is its own document-like surface and you want the active tab visibly attached to it.',
        ],
        avoid: [
          'A strip of documents the user opened and can close — that is {@link TabBar}, whatever the two look like. `variant="browser"` borrows the shape, not the job: no close affordance, no overflow scrolling.',
          'Navigation between routes. A tab reveals a panel shipped beside it; a link goes somewhere.',
        ],
        notes:
          '`variant="browser"` gives `TabsContent` its own `--card` surface, border and radius — do NOT nest a `Card` inside it, or you get two stacked panels. The other variants leave the panel unstyled, so a `Card` is right there.\n\n' +
          '`browser` is horizontal-only. Paired with `orientation="vertical"` it falls back to `line` styling rather than render a column of browser tabs, which is not a thing.',
      },
      motion: {
        notes:
          'The active pill is ONE shared element (`.ui-tabs__indicator`) positioned from the active trigger and ' +
          'slid between them — not a background on each tab. Switching therefore reads as a single object ' +
          'moving rather than two states swapping. It sits behind the triggers, whose own background is ' +
          'transparent so it shows through.',
      },
      changelog: [
        {
          date: '2026-08-26',
          summary:
            'Added a `variant` prop with `line` and `browser` treatments, and moved the tablist background off `--muted`.',
          detail:
            'The list background was `--muted`, putting `--muted-foreground` triggers on it at 5.1:1 — the pairing the ' +
            '2026-07-21 sweep moved five other surfaces off, which Tabs was missed in. Now `--accent`: 6.92:1 in light, ' +
            'and unchanged in dark where both tokens resolve to #334155. `variant` is presentation only and styles off a ' +
            'single root class, so no part gained a prop. The shared sliding indicator is reused rather than rebuilt — ' +
            'its box is set inline from the active trigger, so each variant repaints it through a pseudo-element and ' +
            'inherits the slide. `browser` is horizontal-only and falls back to `line` when vertical.\n\n' +
            '`browser` draws NO hairline on the tablist. The panel\'s own `border-top` already spans the full width and ' +
            'sits flush against the list (the root gap is 0 there), so a list hairline stacked into a 2px rule under the ' +
            'inactive tabs — measured, not guessed. The panel border is the strip\'s rule, and the active tab\'s seam ' +
            'masks exactly that pixel.',
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
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: 'inline-radio',
      options: ['default', 'line', 'browser'],
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
    variant: 'default',
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

// ─────────────────────────────────────────────────────────────────────────────
// Variants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The three treatments side by side. Every one of them has identical semantics,
 * keyboard behaviour and aria wiring — `variant` is presentation only.
 *
 * Note what each does with the panel. `default` and `line` leave `TabsContent`
 * unstyled, so a `Card` belongs there. `browser` makes the panel the surface
 * itself, so nesting a `Card` inside it would stack two panels.
 */
export const AllVariants: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--p-10)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      {(['default', 'line', 'browser'] as const).map((variant) => (
        <div key={variant}>
          <p
            style={{
              margin: '0 0 var(--p-3)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
            }}
          >
            variant=&quot;{variant}&quot;
          </p>
          <Tabs {...args} id={`story-tabs-${variant}`} variant={variant}>
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            {[
              ['account', 'Account', 'Manage your account settings and public profile.'],
              ['password', 'Password', 'Change your password. Sign out after saving.'],
              ['notifications', 'Notifications', 'Choose what you want to be notified about.'],
            ].map(([value, title, body]) => (
              <TabsContent key={value} value={value}>
                {variant === 'browser' ? (
                  <>
                    <strong>{title}</strong>
                    <p style={{ margin: 'var(--p-2) 0 0', color: 'var(--muted-foreground)' }}>
                      {body}
                    </p>
                  </>
                ) : (
                  <Pane id={`tab-pane-${variant}-${value}`}>
                    <strong>{title}</strong>
                    <p style={{ margin: 'var(--p-2) 0 0', color: 'var(--muted-foreground)' }}>
                      {body}
                    </p>
                  </Pane>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

/**
 * `line` drops the filled track entirely and marks the active tab with a bar on
 * `--primary`, so it themes. Reach for it when the tabs already sit inside a
 * card or panel and a second filled track would read as a box in a box.
 */
export const Line: Story = {
  args: { variant: 'line', id: 'story-tabs-line-only' },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-md)' }}>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Pane id="tab-pane-line-account">Account settings live here.</Pane>
        </TabsContent>
        <TabsContent value="password">
          <Pane id="tab-pane-line-password">Password settings live here.</Pane>
        </TabsContent>
        <TabsContent value="notifications">
          <Pane id="tab-pane-line-notifications">Notification settings live here.</Pane>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * `browser` joins the active tab to its panel, which becomes a `--card` surface
 * with its own border. Do not nest a `Card` in the panel here — the panel is
 * already the surface.
 *
 * This borrows the browser tab SHAPE, not `TabBar`'s job. There is no close
 * affordance and no overflow scrolling; a strip of open documents the user can
 * close is `TabBar`.
 */
export const Browser: Story = {
  args: { variant: 'browser', id: 'story-tabs-browser-only' },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="account">Overview</TabsTrigger>
          <TabsTrigger value="password">Activity</TabsTrigger>
          <TabsTrigger value="notifications">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <strong>Overview</strong>
          <p style={{ margin: 'var(--p-2) 0 0', color: 'var(--muted-foreground)' }}>
            The panel is the surface — the active tab is attached to it.
          </p>
        </TabsContent>
        <TabsContent value="password">
          <strong>Activity</strong>
          <p style={{ margin: 'var(--p-2) 0 0', color: 'var(--muted-foreground)' }}>
            Switching slides the tab shape between triggers.
          </p>
        </TabsContent>
        <TabsContent value="notifications">
          <strong>Settings</strong>
          <p style={{ margin: 'var(--p-2) 0 0', color: 'var(--muted-foreground)' }}>
            Same semantics as every other variant.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/**
 * `browser` is horizontal-only. Asking for it with `orientation="vertical"`
 * resolves to `line` rather than rendering a column of browser tabs — the
 * rendered root carries `ui-tabs--line`, and `data-variant` reports `line` too.
 */
export const BrowserFallsBackWhenVertical: Story = {
  args: {
    variant: 'browser',
    orientation: 'vertical',
    id: 'story-tabs-browser-vertical',
    defaultValue: 'general',
  },
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Tabs {...args}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Pane id="tab-pane-bfv-general">General settings.</Pane>
        </TabsContent>
        <TabsContent value="members">
          <Pane id="tab-pane-bfv-members">Member settings.</Pane>
        </TabsContent>
        <TabsContent value="billing">
          <Pane id="tab-pane-bfv-billing">Billing settings.</Pane>
        </TabsContent>
      </Tabs>
    </div>
  ),
};
