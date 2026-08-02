import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import Button from './Button';
import type { ButtonVariant, ButtonStyle } from './Button.types';
import { SIZES } from '../../types/GlobalTypes';
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
      motion: {
        notes:
          'Motion here is confirmation, not decoration — the control has to feel like it received the press. ' +
          'Everything runs on `--ease-premium`, the house easing for anything the user touches.',
        moments: [
          { trigger: 'Hover', description: 'Background and border cross-fade over `--duration-fast`.' },
          { trigger: 'Press', description: 'Scales to `--motion-scale-press` (0.97). Never put a positioning `transform` on a Button — `transform` replaces rather than composes, so the press state would discard it and the button jumps out from under the cursor.' },
          { trigger: 'Loading', description: 'The label stays put and a `Spinner` takes the icon slot, so the box never resizes mid-action.' },
        ],
      },
      changelog: [
        {
          date: '2026-08-02',
          summary:
            'Hover on every solid button now increases contrast with its label instead of reducing it. In light mode the fill darkens; in dark mode it lightens.',
          detail:
            'FIXES A CONTRAST BUG. The five `default`-style variants painted hover as a 10% `--opacity-90` overlay — white in light, slate in dark — which moved the fill toward the label and spent contrast. Seven of eight themes dropped below WCAG AA on hover in light mode (`dc` was worst at 4.57 → 3.85), as did `info` (4.49) and `warning` (4.40). Each variant now reads its existing `--{family}-hover` token, which is `color-mix` toward `--foreground` and so adapts by mode automatically. Themed CTAs now measure 5.62–6.87 in light and 7.17–10.55 in dark. No token changed; the Aiden surface and `variant="aiden"` overrides are unaffected, as they already used their own hand-tuned `--aiden-hover`.',
        },
        {
          date: '2026-07-30',
          summary:
            'Size renamed to the abbreviated scale — `xs` / `sm` / `default` / `lg`. The old `xsmall / small / large` spellings no longer work.',
          detail:
            'BREAKING. The library carried two size vocabularies; 26 of 28 components already used the abbreviated one, so Button moved to match. Both the prop value AND the emitted class changed — it is now `ui-button--sz-sm`, matching the prop — and `normalizeSize` is gone. Update any `size` prop and any hand-written CSS targeting the old class names.',
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
    variant: { control: 'select', options: variants },
    style: { control: 'select', options: styles },
    // Derived from SIZES so the control list and the `Size` union cannot drift.
    // An option missing from here is silently rejected and falls back to the
    // default arg, which looks like the component ignoring you.
    size: { control: 'select', options: [...SIZES] },
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
      <Button {...args} id="btn-xs" size="xs" label="xs" />
      <Button {...args} id="btn-sm" size="sm" label="sm" />
      <Button {...args} id="btn-md" size="default" label="default" />
      <Button {...args} id="btn-lg" size="lg" label="lg" />
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
