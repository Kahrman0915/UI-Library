import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import Button from './Button';
import type { ButtonVariant, ButtonStyle } from './Button.types';
import type { UiDocsParameters } from '../../types/DocsTypes';

const variants: ButtonVariant[] = [
  'default',
  'error',
  'info',
  'success',
  'warning',
  'aiden',
];

const styles: ButtonStyle[] = [
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
];

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'The primary way a user commits to an action. Six variants crossed with five emphasis styles and four sizes cover every rung of the hierarchy, from the page’s single call to action down to a quiet inline link.',
      tags: ['6 variants', '5 styles', '4 sizes'],
      usage: {
        when: [
          'The control performs an action — submit, save, open a dialog, add a row.',
          'You need a visible emphasis ladder on one screen: default for the commit, secondary or outline for supporting actions, ghost for the quiet companion (Cancel).',
          'The action can fail or take time — `isLoading` swaps in a spinner and blocks re-entry.',
        ],
        avoid: [
          'The control navigates somewhere — render an `<a>`, or use `style="link"` on an anchor so it reads as a destination.',
          'The control has a persistent on/off state — that is `Toggle` (one), `ToggleGroup` (one-of-N) or `Chip` (many-on).',
          'The control only carries an icon inside a surface that already has its own affordance — `CloseButton` and the shared `.ui-icon-button` shell handle those.',
        ],
        notes:
          'Themes reach Button through `--primary`: wrap a subtree in `data-theme="{code}"` and default, secondary, outline and link all pick up the brand colour. Ghost is the deliberate exception — it stays neutral slate so a Cancel never competes with the themed commit. Error stays red under every theme.',
      },
      a11y: {
        notes:
          'Renders a real `<button type="button">`, so Enter and Space activate it and it lands in the tab order for free. `isLoading` sets `aria-busy` and keeps the label in the accessible name rather than replacing it with the spinner. An icon-only button has no visible text — give it an `aria-label`.',
        keyboard: [
          { keys: ['Tab'], description: 'Move focus to the button.' },
          { keys: ['Enter'], description: 'Activate.' },
          { keys: ['Space'], description: 'Activate.' },
        ],
      },
    } satisfies UiDocsParameters,
  },
  argTypes: {
    variant: { control: 'select', options: variants },
    style: { control: 'select', options: styles },
    size: {
      control: 'select',
      // Both vocabularies. `xs`/`sm`/`lg` are aliases of the spelled-out forms
      // and normalize to the same class — see utils/size.ts.
      options: ['xsmall', 'small', 'default', 'large', 'xs', 'sm', 'lg'],
    },
    disabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    IconLeft: { control: false, table: { disable: true } },
    IconRight: { control: false, table: { disable: true } },
    IconCenter: { control: false, table: { disable: true } },
    onClick: { action: 'clicked' },
  },
  args: {
    id: 'story-button',
    label: 'Click me',
    variant: 'default',
    style: 'default',
    size: 'default',
    disabled: false,
    isLoading: false,
    iconOnly: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      {variants.map((variant) => (
        <div key={variant}>
          <h4
            style={{
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              textTransform: 'capitalize',
            }}
          >
            {variant}
          </h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {styles.map((style) => (
              <Button
                {...args}
                key={style}
                id={`${variant}-${style}`}
                variant={variant}
                style={style}
                label={style}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} id="btn-xs" size="xsmall" label="XSmall" />
      <Button {...args} id="btn-sm" size="small" label="Small" />
      <Button {...args} id="btn-md" size="default" label="Default" />
      <Button {...args} id="btn-lg" size="large" label="Large" />
    </div>
  ),
};

export const SizeAliases: Story = {
  name: 'Sizes — both vocabularies',
  parameters: {
    docs: {
      description: {
        story:
          'Most of the library takes `sm` / `default` / `lg`; Button and Chip were ' +
          'written with `xsmall` / `small` / `default` / `large`. Both spellings are ' +
          'accepted and normalize to the same class, so you can use one vocabulary ' +
          'across the whole system. Each pair below renders identically — prefer the ' +
          'abbreviations in new code.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
      {[
        ['xsmall', 'xs'],
        ['small', 'sm'],
        ['large', 'lg'],
      ].map(([spelled, abbrev]) => (
        <div
          key={abbrev}
          style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'center' }}
        >
          <Button
            {...args}
            id={`alias-${spelled}`}
            size={spelled as 'xsmall'}
            label={spelled}
          />
          <Button
            {...args}
            id={`alias-${abbrev}`}
            size={abbrev as 'xs'}
            label={abbrev}
          />
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIcons: Story = {
  args: {
    IconLeft: ArrowLeft,
    IconRight: ArrowRight,
    label: 'Back and forth',
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    IconCenter: Plus,
    'aria-label': 'Add item',
  },
};

export const AidenIconOnly: Story = {
  args: {
    variant: 'aiden',
    iconOnly: true,
    IconCenter: Plus,
    'aria-label': 'Add with Aiden',
  },
};

const productBrands = [
  'db',
  'dc',
  'dr',
  'ec',
  'ir',
  'nb',
  'ph',
  'rm',
] as const;

export const ThemeDB: Story = {
  name: 'Theme — DB',
  parameters: { layout: 'padded' },
  render: () => (
    <div data-theme="db" style={{ display: 'grid', gap: 12 }}>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-family)',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted-foreground)',
        }}
      >
        Put <code>data-theme="db"</code> on any subtree — the default (primary)
        button takes DB's color automatically. Secondary / outline / ghost / link
        stay neutral slate.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {styles.map((style) => (
          <Button
            key={style}
            id={`db-${style}`}
            variant="default"
            style={style}
            label={style}
          />
        ))}
      </div>
    </div>
  ),
};

export const ThemesShowcase: Story = {
  name: 'Theme — All Products',
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {productBrands.map((brand) => (
        <div
          key={brand}
          data-theme={brand}
          style={{ display: 'grid', gap: 8 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            data-theme=&quot;{brand}&quot;
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {styles.map((style) => (
              <Button
                key={style}
                id={`${brand}-${style}`}
                variant="default"
                style={style}
                label={style}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

// Inside `data-surface="aiden"` the primary CTA takes Aiden's violet→blue
// gradient (hover deepens it); secondary/outline/link go solid violet; ghost
// stays neutral slate — the same carve-out as the brand themes.
// See Foundations/Themes → Aiden Surface.
export const AidenSurface: Story = {
  render: () => (
    <div
      data-surface="aiden"
      style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', alignItems: 'center' }}
    >
      <Button id="aiden-primary" variant="default" label="Ask Aiden" />
      <Button id="aiden-secondary" variant="default" style="secondary" label="Secondary" />
      <Button id="aiden-outline" variant="default" style="outline" label="Outline" />
      <Button id="aiden-ghost" style="ghost" label="Ghost" />
      <Button id="aiden-link" variant="default" style="link" label="Link" />
    </div>
  ),
};
