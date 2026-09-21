import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import Button from './Button';
import type { ButtonVariant, ButtonStyle } from './Button.types';
import { SIZES } from '../../types/GlobalTypes';
import type { UiDocsParameters } from '../../types/DocsTypes';

const variants: ButtonVariant[] = [
  'default',
  'neutral',
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
        'The primary way a user commits to an action. Seven variants crossed with five emphasis styles and four sizes cover every rung of the hierarchy, from the page’s single call to action down to a quiet inline link.',
      tags: ['7 variants', '5 styles', '4 sizes'],
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
          'Themes reach Button through `--primary`: wrap a subtree in `data-theme="{code}"` and default, secondary, outline and link all pick up the brand color. Ghost is the deliberate exception — it stays neutral slate so a Cancel never competes with the themed commit. Error stays red under every theme.',
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
          date: '2026-09-20',
          summary:
            'The `outline` style no longer casts a shadow, matching `secondary`, `ghost` and `link`. Outline buttons now read as flat controls in both modes.',
          detail:
            '`box-shadow: none` added to all seven `*-outline` styles. `outline` was the only flat style still inheriting `--shadow-xs` from the `.ui-button` base, even though `secondary` — the same shape, a tint plus a border — has always reset it.\n\n' +
            'The reset also closes a design-file mismatch that was invisible in the browser. `outline` fills with `--bg-input-30`, which in dark is `rgba(255,255,255,0.04)` — translucent. CSS clips an outer `box-shadow` to *outside* the border box, so the dark white rim light (`--shadow-color-xs` is `rgba(255,255,255,0.1)`) never reached the interior and the button rendered a true 4% wash. Figma does not clip drop shadows, so the same glow composited through the fill and the mirror drew these buttons at roughly 13% white. Measured 2026-09-20 on the Browse screens: Figma `#2f3647` against the browser\'s `#182032`, while the search field beside them — same token, no shadow — was correct in both.\n\n' +
            'Light mode never showed it, because `--bg-input-30` is an opaque `#ffffff` there and nothing can bleed through. Focus rings are unaffected: they hang off `.ui-button--{variant}:focus-visible` at (0,2,0), which outranks the (0,1,0) reset.',
        },
        {
          date: '2026-09-18',
          summary: 'Small icon-only buttons draw a 16px icon (was 14px), so they match the other small icon controls; the button grows from 30px to 32px.',
          detail:
            '`.ui-button--icon-only.ui-button--sz-sm` now sets its svg to `--w-4`/`--h-4`. Labeled `sm` buttons keep the 14px icon that pairs with their 12px text. 16px is the default icon size and renders lucide\'s stroke at 1.33px — the same as `ModeToggler` sm, which it sits beside in the rail footer.',
        },
        {
          date: '2026-09-17',
          summary: 'New `count` — a number riding on the button, after the label and before any trailing icon.',
          detail:
            'For "Filter 3", "Selected 12" — the count a toolbar button carries. It renders a `span`, NOT a composed `Badge`: Badge renders a `div`, and a div inside a `<button>` is flow content in a phrasing context, which is invalid markup the browser silently un-nests.\n\n' +
            'One CSS rule covers all six variants and all five styles, because the fill is a tint of `currentColor` — 15% of whatever the label color already is. A solid primary button gets a white-ish pill, a neutral outline a slate one, an error ghost a red one, with no per-variant declarations to keep in step. `min-width` stops a single digit collapsing to a sliver and `font-variant-numeric: tabular-nums` stops the button resizing as the number changes.\n\n' +
            'The count is visible text inside the button, so it already joins the accessible name ("Filter 3"). Pass an explicit `aria-label` if that reads badly.',
        },
        {
          date: '2026-09-16',
          summary: 'New `neutral` variant — slate in every theme, for chrome that must not read as the brand.',
          detail:
            'The chrome button: a toolbar\'s Filter and Sort, a viewer bar\'s Share, a control sitting beside the page\'s themed CTA. `default`\'s `ghost` has always been the neutral carve-out, but ghost has no border and these controls are bordered in every design that uses them \u2014 so the only bordered option was `default` + `outline`, which reads `--primary-border` and `--primary-text` and therefore themes. A Filter button went indigo on an indigo application.\n\n' +
            'It builds on the neutral vocabulary that already exists rather than minting a parallel derived family: `--primary-main` for the solid (slate-700 light / slate-300 dark, and never remapped by a `data-theme`), `--border` for the edge, `--muted-foreground` for the label, `--secondary` for the soft fill, `--accent` for ghost hover. `neutral-ghost` is identical to `default-ghost` on purpose \u2014 that style was already the neutral one, and two neutral ghosts that differed would be a bug; it exists so the variant works across the whole style ladder without switching variants half way down it.\n\n' +
            'This had been worked around twice before it was worth a variant: Toast keeps `outline` as a recorded carve-out, and the Alert action bumped `--primary-border` to 60%.',
        },
        {
          date: '2026-09-02',
          summary:
            'The `error` variant is a touch lighter in dark mode, across all five styles.',
          detail:
            'Dark `--error` moved `#f87171` to `#fa8585`, with `-light`, `-soft`, `-border`, `-ring` and ' +
            '`-focus` re-based on `rgba(250, 133, 133)` so the whole family stays one hue. Error text on ' +
            'a brand-tinted card measured 4.30:1 on `--error-light` and 4.07:1 on `--error-soft` — under ' +
            'WCAG AA — because the tint multiplier lightens `--card` in dark. Thinning the tint could not ' +
            'fix it: with the tint at alpha 0 the ceiling was still only 4.64:1, so the text color was ' +
            'the binding constraint, not the tint. Light mode is unchanged.',
        },
        {
          date: '2026-08-31',
          summary:
            '`style="link"` no longer carries horizontal padding, so a link button aligns flush with the copy around it.',
          detail:
            'BREAKING (visual). `link` is inline text rather than a control box, and every other ' +
            'style\'s side padding made it read as indented by its own size — 12px at `sm`, 16px at ' +
            '`default`, 24px at `lg`. It now sets `padding-left`/`right` to `--p-0` in all four ' +
            'rungs. Any layout that compensated with a negative margin will now over-correct.\n\n' +
            'The CLICK TARGET is unchanged. Dropping the padding would take a short label under ' +
            'the 24px WCAG 2.5.8 minimum on width, so an `::after` re-expands the hit area by ' +
            'exactly the padding removed — the same technique `.ui-icon-button` uses. Each size ' +
            'block now publishes its side padding as `--ui-button-pad-x` for that rule to read ' +
            'back, which is why one rule covers all four sizes. Only `link` changed; `ghost` and ' +
            'the rest keep their boxes.',
        },
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

/**
 * `count` rides on the button after the label. The pill is a tint of
 * `currentColor`, so it needs no per-variant rules — every variant and style
 * below uses the same one, and each picks up its own label color.
 */
export const WithCount: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {(['default', 'neutral', 'error'] as ButtonVariant[]).map((v) =>
          (['default', 'secondary', 'outline', 'ghost'] as ButtonStyle[]).map((s) => (
            <Button key={`${v}-${s}`} id={`cnt-${v}-${s}`} label="Filter" variant={v} style={s} count={3} />
          )),
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {SIZES.map((s) => (
          <Button key={s} id={`cnt-sz-${s}`} label="Selected" size={s} count={12} variant="neutral" style="outline" />
        ))}
        <Button id="cnt-trailing" label="Filter" variant="neutral" style="outline" count={3} IconRight={ArrowRight} />
      </div>
    </div>
  ),
};

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
  'ec',
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
