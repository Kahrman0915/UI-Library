import type { Meta, StoryObj } from '@storybook/react';
import {
  Info,
  CircleCheck,
  TriangleAlert,
  CircleAlert,
  Terminal,
} from 'lucide-react';
import Alert from './Alert';
import Button from '../Button';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'An inline message explaining a state or an outcome, sitting in the flow ' +
        'right next to the thing it describes. For an announcement that affects the ' +
        'whole page use `Banner`; for something transient that should get out of the ' +
        'way on its own, call `toast()`.',
      tags: ['5 variants', 'dismissible'],
      changelog: [
        {
          date: '2026-08-05',
          summary:
            'The `action` button now keeps the main brand’s neutral slate inside every ' +
            'sub-brand, instead of picking up the surrounding theme. The `brand` variant is ' +
            'unaffected and still themes.',
          detail:
            'New `--primary-main` / `--primary-main-foreground` tokens hold the main brand’s ' +
            'primary; no `[data-theme]` scope remaps them. `.ui-alert__action` rebuilds the ' +
            'whole `--primary-*` family from them — all of it, because a theme scope re-declares ' +
            'every derived token, so overriding `--primary` alone would leave `-soft`/`-border`/' +
            '`-text` themed and give a slate fill a brand-coloured border. Scoped to the action ' +
            'slot rather than `.ui-alert` because the `brand` variant reads `--primary-light`/' +
            '`-text`/`-border` on the alert surface and is meant to follow the theme.',
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
    variant: {
      control: 'inline-radio',
      options: ['default', 'brand', 'info', 'success', 'warning', 'error'],
    },
    style: {
      control: 'inline-radio',
      options: ['default', 'outline'],
    },
  },
  args: {
    id: 'story-alert',
    variant: 'default',
    style: 'default',
    title: 'Heads up!',
    description: 'You can add components to your app using the CLI.',
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert {...args} Icon={Terminal} />
    </div>
  ),
};

const iconFor = (variant: string) => {
  switch (variant) {
    case 'info':
      return Info;
    case 'success':
      return CircleCheck;
    case 'warning':
      return TriangleAlert;
    case 'error':
      return CircleAlert;
    default:
      return Terminal;
  }
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      {(['default', 'info', 'success', 'warning', 'error'] as const).map(
        (v) => (
          <Alert
            key={v}
            id={`v-${v}`}
            variant={v}
            Icon={iconFor(v)}
            title={v.charAt(0).toUpperCase() + v.slice(1)}
            description="This is what a variant looks like when filled in."
          />
        ),
      )}
    </div>
  ),
};

export const AllOutlines: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      {(['default', 'info', 'success', 'warning', 'error'] as const).map(
        (v) => (
          <Alert
            key={v}
            id={`o-${v}`}
            variant={v}
            style="outline"
            Icon={iconFor(v)}
            title={v.charAt(0).toUpperCase() + v.slice(1)}
            description="Outline treatment — transparent background, tinted border."
          />
        ),
      )}
    </div>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      <Alert id="t1" variant="success" Icon={CircleCheck} title="Saved" />
      <Alert
        id="t2"
        variant="error"
        Icon={CircleAlert}
        title="Something went wrong"
      />
    </div>
  ),
};

export const DescriptionOnly: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--p-3)',
        maxWidth: 'var(--max-w-lg)',
      }}
    >
      <Alert
        id="d1"
        variant="info"
        Icon={Info}
        description="Your session expires in 5 minutes."
      />
      <Alert
        id="d2"
        variant="warning"
        Icon={TriangleAlert}
        description="This action is irreversible."
      />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="a1"
        variant="warning"
        Icon={TriangleAlert}
        title="Storage almost full"
        description="You've used 92% of your allocated storage."
        action={
          <Button
            id="alert-upgrade"
            label="Upgrade"
            style="outline"
            size="sm"
          />
        }
      />
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="dismiss"
        variant="info"
        Icon={Info}
        title="Tip"
        description="Press ⌘K to open the command palette."
        onClose={() => {
          // eslint-disable-next-line no-console
          console.log('dismissed');
        }}
      />
    </div>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="no-icon"
        variant="success"
        title="Success!"
        description="Your changes have been saved."
      />
    </div>
  ),
};

export const Brand: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-lg)' }}>
      <Alert
        id="brand"
        variant="brand"
        Icon={Info}
        title="Brand Alert"
        description="Uses the active theme's --primary, so it follows data-theme."
      />
    </div>
  ),
};

// "Edit Mode" from the Figma design = an info alert used as a persistent
// instructional banner: no close button, so it can't be dismissed.
export const EditMode: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-2xl)' }}>
      <Alert
        id="edit-mode"
        variant="info"
        Icon={Info}
        title="Edit Mode Active"
        description="Drag cards to reorder your board. Use the menu on each card to change types or configure filters. Click “Done Editing” when finished."
      />
    </div>
  ),
};

const THEMES = ['db', 'dc', 'dr', 'ec', 'ir', 'nb', 'ph', 'rm'] as const;

/**
 * The action button holds the main brand's slate in every sub-brand, while the
 * `brand` variant beside it still follows the theme — those two behaviours have
 * to coexist, which is why the token override is scoped to the action slot and
 * not to `.ui-alert`.
 */
export const ActionStaysMainUnderEveryTheme: Story = {
  name: 'Action stays main under every sub-brand',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-6)', maxWidth: 'var(--max-w-2xl)' }}>
      {THEMES.map((code) => (
        <section key={code} data-theme={code} style={{ display: 'grid', gap: 'var(--p-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-family-mono)' }}>
            data-theme=&quot;{code}&quot;
          </span>

          {/* The action must be slate here, not the brand colour. */}
          <Alert
            id={`alert-main-${code}`}
            variant="warning"
            Icon={TriangleAlert}
            title="Storage almost full"
            description="The action reads as the alert's own control, not the page's CTA."
            action={<Button id={`alert-main-${code}-btn`} label="Upgrade" style="outline" size="sm" />}
          />

          {/* …and this one must still be the brand colour. */}
          <Alert
            id={`alert-brand-${code}`}
            variant="brand"
            title="The brand variant still themes"
            description="Its surface, title and border follow data-theme — only the action slot is pinned."
            action={<Button id={`alert-brand-${code}-btn`} label="View" style="outline" size="sm" />}
          />
        </section>
      ))}
    </div>
  ),
};
