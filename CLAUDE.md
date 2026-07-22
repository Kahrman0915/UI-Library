# @ui/lib — agent context

This file is auto-loaded into every Claude Code session opened inside this repo. Read it before writing any code that lives under `src/`. Deviations from these rules should be surfaced back to the user before they land — don't silently reshape the system.

---

## What this repo is

A React + SCSS component library. 53 shipped components, one shared token file, zero third-party UI libraries. Every visual value comes from `src/styles/tokens.scss`. Every class name follows BEM under a `ui-` prefix.

## Hard rules (never break without asking)

1. **Runtime deps are `lucide-react` only.** `react` and `react-dom` are peer-deps. If you feel like reaching for `class-variance-authority`, `clsx`, `@radix-ui/*`, `framer-motion`, `motion`, `tailwindcss`, `@emotion/*`, `styled-components`, `@floating-ui/*` — stop and ask. The user has explicitly rejected each of these.
2. **No Tailwind, no CSS-in-JS.** Styling is SCSS in `.scss` files, imported by the component's `.tsx` as a side effect (`import './Component.scss'`).
3. **Every value comes from a token.** Grep `src/styles/tokens.scss` before writing any hex, rgba, or px literal. If a value isn't tokenized, add a token in `tokens.scss` first, then use it. See "Rare exceptions" below.
4. **Every component gets `forwardRef` + `displayName` + `className` passthrough.** Full stop.
5. **Class names use BEM under a `ui-` prefix** — `.ui-button`, `.ui-button__label`, `.ui-button--error`, etc. Never CSS Modules. Never Tailwind-in-JSX.
6. **`id` is a required prop** on every non-trivial component (Button, Input, Dialog, etc.). It seeds child IDs (`${id}-spinner`, `${id}-title`, `${id}-error`) so aria-relationships wire up cleanly.
7. **Storybook is where you verify.** Every new component needs stories. The user runs `npm run storybook` on port 6006. Screenshots are the primary regression test.

### Rare exceptions to rule 3

The following unavoidable literals live in the codebase intentionally — don't rewrite them:
- `-3px` on Tooltip arrow position (component-internal geometry, not a design-system value)
- `1000px` in Input's AND InputGroup's `-webkit-autofill` box-shadow (autofill kill-switch)
- `12px/16px/20px` Switch thumb travel distances (component-internal geometry per size)
- `380px/300px` Toast stack width / card min-width, `480px/560px` Command max-height / dialog width (panel geometry, deliberately not design-system values)
- `outline-offset: -1px` throughout Button (idiomatic inset outline)
- `text-underline-offset: 3px` in Breadcrumb links
- `width/height: 1px` sr-only patterns (Attachment, Breadcrumb)
- Tokens themselves in `tokens.scss` (the primitives literals)

Audited 2026-07: everything else in component SCSS is tokenized — zero hex/rgba/cubic-bezier literals, all durations/easings/border-widths/focus-rings via `var(--…)`.

---

## Non-negotiable file structure per component

```
src/components/{Name}/
├── {Name}.tsx            # forwardRef, displayName, prop destructure, ...rest spread
├── {Name}.types.ts       # Props + variant/size union types
├── {Name}.scss           # BEM global classes, plain .scss (never .module.scss)
├── {Name}.stories.tsx    # Playground + AllStates + variant/size stories
├── {Name}.constants.ts   # ONLY if the component has runtime constants (rare)
└── index.ts              # default export + type re-exports
```

Then wire it into `src/index.ts` as a named export.

## Component API conventions (do these on EVERY component)

```tsx
import { forwardRef } from 'react';
import type { WidgetProps } from './Widget.types';
import './Widget.scss';

const Widget = forwardRef<HTMLButtonElement, WidgetProps>(
  (
    { id, label, variant = 'default', size = 'default', className, ...rest },
    ref,
  ) => {
    return (
      <button
        {...rest}                          // spread first so our controlled props win
        ref={ref}
        id={id}
        className={`ui-widget ui-widget--${variant} ui-widget--sz-${size}${className ? ' ' + className : ''}`}
        type="button"
      >
        {label}
      </button>
    );
  },
);

Widget.displayName = 'Widget';

export default Widget;
```

Types file:
```ts
export type WidgetVariant = 'default' | 'brand' | 'error';
export type WidgetSize = 'sm' | 'default' | 'lg';

export type WidgetProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'         // if we constrain onClick's signature
> & {
  id: string;
  label?: string;
  variant?: WidgetVariant;
  size?: WidgetSize;
  className?: string;
};
```

Key points:
- **Extend `React.*HTMLAttributes`** for the underlying element so all HTML props flow through via `...rest`
- **`Omit`** only the specific keys we want to redefine (usually `style`, `size`, `onClick`) — leave everything else intact
- **Spread `{...rest}` FIRST** in JSX, then set our controlled props (`id`, `className`, `type`, `disabled`, `onClick`) after so consumer overrides can't clobber our internals

---

## Shared utilities

Reuse these — don't reinvent.

- **`src/hooks/useMounted.ts`** — returns `true` after client-side mount. Use in every portal-rendering component (Dialog, Tooltip, DropdownMenu already do). Prevents SSR mismatches.
- **`src/hooks/useIsMobile.ts`** — SSR-safe `matchMedia` breakpoint hook (default 768px). Used by Sidebar to swap to a Drawer on small viewports; reuse for any responsive branch.
- **`src/hooks/useRipple.ts`** — opt-in Material ripple, **hook only** — no component turns it on for you (**Button deliberately has no `ripple` prop**). Returns `{ onPointerDown }` to spread on any `.ui-ripple` element; imports `ripple.scss` as a side effect. Wave expands over `--duration-ripple` (600ms, `--ease-out`); removed on `animationend` **plus a 900ms `setTimeout` fallback** (animationend doesn't fire under reduced motion / backgrounded tab). Use it only where the ripple is seen and helps — touch-first in-place actions (toggle, add-to-cart, stepper); **not** on navigation, desktop/mouse-only UIs, or anything that closes on click. Full when/how guidance lives in the hook's JSDoc and the `Hooks/useRipple` stories.
- **`src/utils/computePosition.ts`** — positions a floating element relative to a trigger. `Side`/`Align`/`Position` types exported. Used by Tooltip + DropdownMenu today; use in Popover, Select, Combobox, Sheet next.
- **`src/components/Label/`** — the shared label + description + required-indicator primitive. Any form control (Input, Textarea, Checkbox, future Radio/Switch) should either render a `<Label>` internally or reuse its `.ui-label` classes. Import `../Label/Label.scss` in the component that reuses the classes.
- **`src/components/Input/Input.scss`** — owns `.ui-input-wrap` (border, focus-within ring, hover, error, disabled states). Textarea reuses it via a `--multi` modifier and NativeSelect reuses it as-is (native `<select>` inside the wrap). Future form-field-shaped components (Select trigger, Combobox trigger) should reuse it too rather than redefining borders.

---

## Notable techniques

### Height animation without JS — Collapsible & Accordion pattern

Both Collapsible and Accordion animate open/close height using `grid-template-rows: 0fr → 1fr`. No JS measurement, no ResizeObserver, no framer-motion. Purely CSS.

**The catch:** padding on the inner container leaks into the grid row's minimum-content-size, so a single inner div won't fully collapse to 0 when closed — you get a phantom gap. Fix is a **two-layer clip**:

```tsx
<div className="ui-accordion__content">          {/* grid, 0fr → 1fr */}
  <div className="ui-accordion__content-inner">  {/* overflow: hidden, min-height: 0 */}
    <div className="ui-accordion__content-body"> {/* padding + typography live HERE */}
      {children}
    </div>
  </div>
</div>
```

- The outer `-inner` owns **only** `overflow: hidden` + `min-height: 0` (the clip context)
- The `-body` owns padding + typography — since it's inside the clip context, its padding doesn't contribute to the grid row's min-size

If you build any future component with a similar disclosure animation (Sheet, drawer), use this same 3-div structure.

### Cross-fade between SVG states — Checkbox pattern

The Checkbox's check-mark and indeterminate SVGs are both always mounted (position: absolute overlaying each other) so switching between them cross-fades instead of hard-swapping via `display: none`. The draw-in animation uses `stroke-dasharray: 24; stroke-dashoffset: 24 → 0` on the polyline/line stroke, transitioning with `--ease-spring`. Icons scale from 0.5 → 1 with `--ease-spring-strong` (the animate-ui pop feel). If you're animating an icon that swaps between states, follow this pattern.

### Portal exit animation with a safety-net timeout — Drawer pattern

Tooltip and Drawer keep a `closed → open → closing` state machine so a portal can animate *out* before unmounting (React unmounts instantly otherwise). The panel stays mounted in `closing`, plays its exit keyframes, and unmounts when done. Two hard-won rules for any new component using this:

- **Never put `var()` inside `@keyframes` for the animated property.** A keyframe like `transform: var(--drawer-from)` parks the end value but the browser runs no real interpolation and **never fires `animationend`** — the exit hangs forever. Use explicit literal keyframes (Drawer has per-side `ui-drawer-in/out-{side}`); filter the unmount handler by `animationName.startsWith('ui-drawer-out')` since animation events bubble.
- **Back `animationend` with a duration-based `setTimeout` fallback.** `animationend` doesn't fire under `prefers-reduced-motion`, on a backgrounded/occluded tab, or when an animation is interrupted. For a modal surface (Drawer) that's a stuck-open trap. Drawer's `closing` effect sets a ~400ms timer that forces `state → 'closed'`; whichever of the event or timer fires first wins (both idempotent). **Keep this timeout** — it's the only thing that guarantees the drawer can always close.

---

## Token vocabulary (grep `tokens.scss` before improvising)

**Spacing / sizing** (px in tokens; scale is Tailwind-like):
- `--p-0` (0) → `--p-96` (384px), plus half-steps like `--p-0-5`, `--p-1-5`, `--p-2-5`, `--p-3-5`
- Same scale mirrored for `--w-*` (width) and `--h-*` (height)
- `--max-w-xs` (320px) → `--max-w-7xl` (1280px), plus screen breakpoints

**Typography:**
- `--text-xs` (12px) → `--text-9xl` (128px); use `--text-code: 13px` for inline code
- `--leading-3` (12px) → `--leading-11` (44px)
- `--tracking-tighter` → `--tracking-widest`
- `--font-thin` (100) → `--font-black` (900); most components use `--font-normal` (400), `--font-medium` (500), or `--font-semibold` (600)
- `--font-family: 'Inter', sans-serif` (default), `--font-family-mono: 'JetBrains Mono'`

**Radii / borders:**
- `--rounded-sm` (2px) → `--rounded-3xl` (24px), plus `--rounded-full: 9999px`
- `--border-w-50` (0.5px) → `--border-w-400` (4px)
- `--border` (resting hairline) + `--border-hover` — the strengthened border on hover. Symmetric across modes (light `#64748b` / dark `#cbd5e1`: each mode's hover value is the *other* mode's resting border), so the border always gains contrast on hover. Consumed by Card's `interactive` prop, Item's `--outline` interactive hover, and the shared `.ui-input-wrap` hover (Input/Textarea/NativeSelect).

**Shadows** (theme-aware; each token already embeds its color):
- `--shadow-2xs` (very subtle) → `--shadow-2xl` (dramatic)
- Never write `box-shadow: 0 1px 3px rgba(...)` — always `box-shadow: var(--shadow-md)` etc.

**Effects:**
- `--focus-ring-width: 3px` — the focus ring on every interactive
- `--overlay-blur: 4px` — Dialog backdrop-filter blur
- `--tooltip-slide: 4px` — Tooltip enter/exit translate distance

**The three axes (all attribute-driven, independent, composable):**
- **Mode = light/dark**, set via **`data-mode='light'` / `data-mode='dark'`** on `<html>`. Tokens swap on `:root, [data-mode='light']` and `[data-mode='dark']`. The `ModeToggler` component owns this attribute.
- **Theme = a sub-brand's color**, set via **`data-theme='{code}'`** on `<html>` or any subtree. A theme remaps **just `--primary` / `--primary-foreground`** (the derived `--primary-*` family follows via `color-mix`). The **main brand is the absence of `data-theme`** (`--primary` stays neutral slate). Do NOT reintroduce a `--brand` token or a `variant="brand"` — that model was removed.
- **Surface = the Aiden AI surface**, set via **`data-surface='aiden'`** on a panel/subtree. It is **NOT a theme code** (never in the brand picker) — it's a cross-cutting identity that layers *inside* any brand. See the Aiden entry in Recent decisions and `Foundations/Themes → Aiden Surface` for the full model. Documented in the Themes + Tokens Storybook pages.

**Semantic colors (all mode-aware):**
- Core: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--border`, `--input`, `--ring`, `--focus`
- `--tooltip-background` / `--tooltip-foreground` — neutral slate inverse, **never remapped by a theme** (Tooltip is the one carve-out from theming).
- Semantic families: `--error`, `--error-foreground`, `--error-light`, `--error-soft`, `--error-border`, `--error-hover`, `--error-ring`, `--error-focus`. Same shape for `--success`, `--warning`, `--info` — and `--primary` carries the same derived family (`--primary-light/-soft/-border/-hover/-ring/-focus/-text`), which theme scopes remap.
  - **`--primary-text` is the "on-surface" primary — use it whenever `--primary` is *text* on a light/subtle surface** (outline / ghost-is-neutral-so-not-it / link / secondary button text, Badge `outline`, brand Alert/Banner titles). It's `color-mix(in srgb, var(--primary) 85%, var(--foreground))` — nudges the theme colour toward the mode's text colour (darker in light, lighter in dark) so mid-luminance themes clear AA as text (worst case 5.2 light / 5.8 dark). **Solid fills keep raw `--primary`** (they pair with `--primary-foreground`, which already passes). Don't use `--primary-text` for fills, borders, or the neutral ghost button.
  - **`-light` vs `-soft`:** `-light` is the *subtle* tint (6%) for surfaces — Alert backgrounds, destructive menu rows, ghost-hover — and was tuned for WCAG-AA text-on-tint. (Badge `*-outline` variants are transparent now, so `-light` no longer backs any Badge.) `-soft` is the *visible* tint used **only** for the filled `secondary` button, so `secondary` (filled tint + border) reads distinctly from `outline` (transparent + border). Don't swap them: bumping `-light` would over-saturate Alerts and break the AA math.
  - **`-soft` is mode-split for contrast:** **8% in light**, **10% in dark**. Main-brand + semantic `-soft` are split in the base `[data-mode]` blocks; the themed `--primary-soft` is split by a `[data-mode='light'] [data-theme]` rule near the bottom of `tokens.scss` (2-attr specificity beats the single `[data-theme='{code}']` scope). Aiden's `--aiden-secondary` fill is a matching low-alpha gradient (8% light / 10% dark), not a solid hex. Re-run the contrast script if you touch these percentages.
- Aiden (the AI **surface**, `data-surface='aiden'`): `--aiden-primary` (the violet→blue **gradient** fill), `--aiden-hover` (deeper gradient), `--aiden-outline-border` (the **solid violet** = the surface's `--primary`), `--aiden-secondary`/`-border`/`-ring`/`-focus` (tints for the standalone `variant="aiden"`). Mode-aware. See the Aiden entry in Recent decisions for how the surface scope works.

**Theme scopes** (`src/styles/tokens.scss`, bottom): `[data-theme='{code}'] { --primary: var(--{code}-primary); --primary-foreground: var(--{code}-primary-foreground); }` for `db, dc, dr, ec, ir, nb, ph, rm`. The per-theme colors live in the "Theme Palettes" blocks (mode-aware). Consumers just wrap a subtree: `<section data-theme="db">…</section>` — every `--primary` consumer inside picks up the color, no component changes.

**How `--primary` reaches components (full immersion, except Tooltip):** primary button (solid `default` variant), the `default` variant's soft `secondary` / `outline` / `link` styles, checked Checkbox, Radio dot, Switch track, active Chip, Toast action, Progress default indicator, InputGroup, and the Badge `default`/`outline` variants — all read `--primary` and theme automatically. **The `default` variant's `ghost` style is the deliberate exception — it stays neutral slate (`--secondary-foreground` / `--accent`) so quiet companion actions like a Dialog "Cancel" never compete with the themed CTA.** `--secondary`/`--muted`/`--border`-based chrome and Tooltip also stay neutral.

**When a user names a theme code — the routing rules Claude should apply:**

| Role | Component + props | Themes? |
|---|---|---|
| Primary CTA | `<Button variant="default" />` inside `data-theme` | ✅ solid theme color |
| Soft / outline / link action | `<Button style="secondary" \| "outline" \| "link" />` | ✅ theme color (soft tint, border, or link accent) |
| Quiet / cancel | `<Button style="ghost" />` | ❌ neutral slate (the one carve-out in the default family) |
| Destructive | `<Button variant="error" />` | ❌ stays red regardless of theme |
| Status pill / badge | `<Badge variant="default" \| "outline" />` | ✅ (both theme — `default` = solid `--primary` fill, `outline` = `--primary-border`; semantic `error`/`*-outline` etc. keep their own color) |
| Checkbox / Switch / Radio (checked) | as-is | ✅ theme color |
| Card / panel chrome, borders, body text | neutral tokens | ❌ neutral |
| Tooltip | `<Tooltip>` | ❌ always neutral (carve-out) |

**Rule of thumb:** `--primary` = the current theme's color (slate on the main brand). Wrap a subtree in `data-theme="{code}"` to swap the accent; neutral tokens don't move. See `Foundations / Themes` in Storybook.

**Category colors** (chart / tags): `--category-red`, `--category-blue`, `--category-emerald`, `--category-violet`, etc. (17 hues). Per hue: `-bg` (tint: 0.1 light / 0.15 dark), `-hover` (interactive state — **currently unused**, kept as the documented complete-palette token), and `-text`; plus one global `--category-foreground`. Roles: **`--category-{c}` = the vivid fill (charts / dots / *solid* badge)**; **`--category-{c}-bg` = the soft-tag tint**; **`--category-{c}-text` = AA-safe text ON that tint** (light darkened past AA, dark reuses base); **`--category-foreground` = `#0f172a` dark ink (both modes) for text on the vivid solid badge** — dark text is the only readable option on a bright palette (white forces it pale; this is the GitHub/Linear/Notion pattern). **No `-solid` fill token** — the solid badge reads the vivid base directly. **Never use raw `--category-{c}` as small text on its tint — use `-text`.** `test:contrast` AA-gates the 17 soft `-text`-on-`-bg` pairings; the solid badge is best-effort (dark-on-vivid ~4.0–9.3, indigo/violet just under 4.5).

**Sidebar surface** (Sidebar-only chrome palette, mode-aware): `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`(`-foreground`), `--sidebar-accent`(`-foreground` — hover/active menu rows), `--sidebar-border`, `--sidebar-ring`. Plus width constants `--sidebar-width` (16rem), `--sidebar-width-icon` (3rem), `--sidebar-width-mobile` (18rem). Not remapped by a `data-theme` (it's neutral chrome, like Tooltip).

**Motion:**
- Duration (transitions): `--duration-instant: 150ms` (micro hover shifts), `--duration-fast: 100ms`, `--duration-normal: 200ms`, `--duration-slow: 300ms`
- Duration (loops): `--duration-spin: 900ms` (Spinner), `--duration-shimmer: 1400ms` (Skeleton/Progress/Attachment)
- Easing (native): `--ease-default`, `--ease-in`, `--ease-out`, `--ease-in-out`, `--ease-linear`
- Easing (spring): `--ease-spring` (smooth, no overshoot) — was the Tooltip literal; `--ease-spring-strong` (slight overshoot, animate-ui-flavored pop)
- Slide distances: `--motion-slide-sm: 4px`, `--motion-slide-md: 8px`, `--motion-slide-lg: 12px`; enter scale: `--motion-scale-in: 0.97`
- `--tooltip-slide` is a back-compat alias for `--motion-slide-sm` — prefer the generic name in new code

---

## Component roster (as of this file's last update)

Each is exported from `src/index.ts`. See the individual `.tsx` for full prop signatures.

| Component | Compound? | Notes |
|---|---|---|
| `Accordion` + `AccordionItem` + `AccordionTrigger` + `AccordionContent` | yes | `type` = `single` (+ `collapsible`) or `multiple`. Height animation via the 3-div `grid-template-rows: 0fr→1fr` clip (see Notable techniques) |
| `Alert` | no | `variant`-driven semantic banner; dismissal X composes `CloseButton` |
| `AlertDialog` + `AlertDialogHeader` + `AlertDialogBody` + `AlertDialogFooter` | yes | Confirmation dialog. A thin **preset of `Dialog`** (role=`alertdialog`, no overlay-click-close, no header X) — reuses Dialog's portal/focus-trap/escape/restore + Dialog.scss; only new Dialog surface is an optional `role` prop |
| `AspectRatio` | no | CSS `aspect-ratio` wrapper; `ratio` passed as a division expression (`16 / 9`). Media children fill+cover. Layout primitive, no `id` |
| `Attachment` (+ `Media` `Content` `Title` `Description` `Actions` `Action` `Trigger` `Group`) | yes | 9 exports. File-attachment row/tile; `size` = xs/sm/default, `orientation` = horizontal/vertical, `AttachmentMedia variant` = icon/image. Shimmer via `--duration-shimmer`. Parallel family to `Item` |
| `Avatar` + `AvatarGroup` | yes | Fallback initials + optional image + status-dot badge |
| `Badge` | no | 12 variants — every color is `{solid base, transparent outline}`; no brand — default/outline theme via `--primary`. Plus `category?: CategoryColor` + `categoryStyle?: 'soft' \| 'solid'` (17-hue tag: soft `-bg`+`-text` or solid `--category`+`-foreground`; overrides `variant`). Extends `HTMLAttributes<HTMLDivElement>` (full `...rest`) |
| `Banner` | no | Page-level full-bleed announcement bar (distinct from inline `Alert`); reuses Alert's semantic tint tokens + bottom hairline; composes `CloseButton` (dismiss) + `Button` (action); `role` alert/status by severity; `centered` |
| `Blockquote` | no | Semantic `<blockquote>` + accent border + italic body; optional `cite` renders a `<footer>` with em-dash. Native `cite` URL attr Omit-ed and redefined as content |
| `Button` | no | 6 variants × 5 styles × **4 sizes** (`xsmall`/`small`/`default`/`large`) + `isLoading` (no brand — `default` IS the theme's primary) |
| `Breadcrumb` (+ `List` `Item` `Link` `Page` `Separator` `Ellipsis`) | yes | 7 exports. Links use `text-underline-offset: 3px`; `Ellipsis` carries an sr-only label |
| `ButtonGroup` + `ButtonGroupSeparator` + `ButtonGroupText` | yes | Corner-flatten via CSS `:not(:first/last-child)` |
| `Card` + `CardHeader` + `CardBody` + `CardFooter` | yes | Header prop-driven (`title`, `description`, `action`) |
| `Checkbox` | no | Native input + custom visual + `indeterminate` prop |
| `Chip` | no | Toggle-style; `active` state uses `--primary` |
| `CloseButton` | no | Uses `X` from `lucide-react` |
| `Code` + `CodeBlock` | no | Inline `Code` (`<code>`) + fenced `CodeBlock` (`<pre>` + optional filename header + copy `Button` via `navigator.clipboard`, icon/label swap to check/"Copied"). No syntax highlighting (needs a dep). One folder, two exports |
| `Collapsible` + `CollapsibleTrigger` + `CollapsibleContent` | yes | Same `0fr→1fr` grid height animation as Accordion; single disclosure |
| `Combobox` | no | Single export (not compound). Filterable listbox on `computePosition`; `size`/`side`/`align` |
| `Command` (+ `Dialog` `Input` `List` `Empty` `Group` `Item` `Separator` `Shortcut`) | yes | 9 exports. Command palette; `CommandItem variant` = default/error. Max-height 480px / dialog 560px (panel geometry). One of the 4 menu-item styling copies |
| `ContextMenu` (+ 13 parts incl. `Sub`/`SubTrigger`/`SubContent`) | yes | 14 exports — the only menu family with submenus. `variant` = default/destructive; `side`/`align` via `computePosition` |
| `Dialog` + `DialogHeader` + `DialogBody` + `DialogFooter` | yes | Portal + focus trap + scroll lock + Escape |
| `Drawer` + `DrawerHeader` + `DrawerBody` + `DrawerFooter` | yes | Edge panel (`side` = top/right/bottom/left, default right); reuses Dialog's portal/focus-trap/scroll-lock/Escape + Tooltip's `closed→open→closing` exit state machine for the slide-out. `open`/`onClose` controlled, no drag |
| `Empty` + `EmptyHeader` + `EmptyMedia` + `EmptyTitle` + `EmptyDescription` + `EmptyContent` | yes | Centered empty-state; static (mirrors Item's compound pattern). `EmptyMedia variant` = `icon` (boxed muted tile) or `default` (unboxed) |
| `DropdownMenu` + `Trigger` + `Content` + `Item` + `Label` + `Separator` + `Group` + `CheckboxItem` + `RadioGroup` + `RadioItem` + `Shortcut` | yes | 11 exports; keyboard nav wraps at ends |
| `Field` (+ `Set` `Legend` `Group` `Content` `Label` `Title` `Description` `Error` `Separator`) | yes | 10 exports. Form-row scaffolding; `orientation` prop; label typography reuses the shared `.ui-label__*` classes, `FieldSeparator` wraps `Separator` |
| `HoverCard` + `HoverCardTrigger` + `HoverCardContent` | yes | Hover-intent popover on `computePosition`; `--popover` surface |
| `Input` | no | `label` composes `<Label>`; `IconLeft`/`IconRight` slots; `error` + `errorMessage` |
| `InputGroup` (+ `Input` `Textarea` `Addon` `Text` `Button`) | yes | 6 exports. Addon-flanked field; reads `--primary`; carries the `1000px` autofill box-shadow kill-switch |
| `Item` (+ `Group` `Separator` `Media` `Content` `Title` `Description` `Actions` `Header` `Footer`) | yes | 10 exports. Generic list row; `variant` = default/outline/muted, `size` = xs/sm/default, `ItemMedia variant` = default/icon/image. Parallel family to `Attachment` |
| `ModeToggler` | no | Owns the `data-mode` light/dark attribute on `<html>`; `variant` = default/outline/ghost, `size` = sm/default/lg |
| `NativeSelect` + `NativeSelectOption` + `NativeSelectOptGroup` | yes | Styled native `<select>` (distinct from the floating `Select`); composes `<Label>` + reuses Input's `.ui-input-field`/`.ui-input-wrap`; native chrome stripped, custom chevron overlaid; `size`/`error`/`required` like Input |
| `Kbd` | no | Styled `<kbd>` keycap, mono + raised bottom border; `size` = sm/default/lg |
| `Label` | no | Shared with Checkbox internal label + Input/Textarea's built-in label; `required` renders `*` in `--error` |
| `Popover` + `PopoverTrigger` + `PopoverContent` + `PopoverClose` | yes | `computePosition` floating surface (`--popover`); `side`/`align`, no collision detection |
| `Pagination` (+ `Content` `Item` `Link` `Previous` `Next` `Ellipsis`) | yes | Page-nav compound; cells reuse `.ui-button` (ghost, outline+`aria-current` when active); imports Button.scss so cells style in isolation; mirrors Breadcrumb ellipsis |
| `Progress` (+ `Label` `Value` `Track` `Indicator`) | yes | 5 exports. `size` = sm/default/lg, `variant`, `indeterminate` (shimmer via `--duration-shimmer`); default indicator reads `--primary` |
| `RadioGroup` + `RadioGroupItem` | yes | `orientation` prop; checked dot uses `--primary` |
| `ScrollArea` | no | Custom JS thumb, grid layout, no floating-ui dep |
| `Select` (+ `Trigger` `Content` `Item` `Group` `Label` `Separator`) | yes | 7 exports. Floating listbox (distinct from `NativeSelect`); `size`/`side`/`align`. One of the 4 menu-item styling copies |
| `Separator` | no | `orientation` prop; the canonical hairline-with-label primitive (`FieldSeparator` wraps it) |
| `Sidebar` (+ `SidebarProvider`, `useSidebar`, ~21 parts) | yes | Full app-sidebar subsystem. `collapsible` = offcanvas/icon/none, `variant` = sidebar/floating/inset, `side` = left/right. ⌘B shortcut, localStorage persistence, mobile (<768px) renders as a `Drawer`, icon-mode `tooltip` via `Tooltip`, `SidebarMenuSkeleton` via `Skeleton`. Own `--sidebar-*` token surface. Collapse = in-flow gap spacer + viewport-fixed panel driven by `data-state`/`data-collapsible` |
| `Skeleton` | no | `shape` = default/circle/text; shimmer via `--duration-shimmer` |
| `Slider` | no | Single value, or `range` for two thumbs (`[lower, upper]`). `min`/`max`/`step`, `showValue`, `formatValue`, `size` = sm/default/lg. Each thumb is a `role="slider"` span whose `aria-valuemin`/`max` stop at its neighbour. Composes `<Label>`; strips its own union props from `...rest` like Accordion |
| `Spinner` | no | lucide `LoaderCircle` + `--duration-spin` rotation; `role="status"` |
| `StatusDot` | no | Presence dot (online/offline/busy/away/neutral) → semantic tokens via `--ui-status-color`; optional `pulse` ring (reduced-motion aware); `role="status"`+label when named. Mirrors Avatar badge |
| `Switch` | no | `size` prop; checked track uses `--primary`. Thumb travel distances (12/16/20px) are intentional component-internal literals |
| `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | yes | `orientation` prop |
| `Textarea` | no | Reuses Input's `.ui-input-wrap` via `--multi` modifier |
| `Toast` — `Toaster` + `toast()` | yes | **Imperative API, not a compound tree**: render `<Toaster>` once, call `toast()` anywhere. `variant`, `duration`, `position`. 380px stack / 300px card min-width (panel geometry); action reads `--primary`; dismissal X composes `CloseButton` |
| `Tooltip` + `TooltipTrigger` + `TooltipContent` | yes | State machine (`closed`/`open`/`closing`), direction-aware animations, portal |
| `Toggle` | no | `aria-pressed` squared two-state button; controlled (`pressed`) or uncontrolled (`defaultPressed`); pressed = neutral `--accent` fill. Distinct from `Chip` (rounded filter pill); reuses its interaction shape |
| `ToggleGroup` + `ToggleGroupItem` | yes | Segmented control; `type` single (re-click clears) / multiple; items reuse `.ui-toggle` + collapse shared borders (ButtonGroup-style). Strips union props from `...rest` like Accordion |

---

## How to build a new component (from scratch)

1. **Check a reference implementation for the shape:** read the component's API + visual spec + state matrix from whatever reference design system you're mirroring. **Do not copy code** (references typically use Tailwind + Radix, we don't) — only extract the shape.
2. **Create the folder** at `src/components/{Name}/` with the exact file structure above.
3. **Types file first** — define `{Name}Props` extending the right `React.*HTMLAttributes<...>`, `Omit` any collisions, add our specific props.
4. **Component:** `forwardRef` + `displayName` + `className` merge + `...rest` spread. Import `./Name.scss` at the top.
5. **SCSS:** BEM classes only, tokens only. Reference Tooltip.scss or Card.scss for style patterns.
6. **Stories:** `Playground` (Storybook controls), `AllVariants` or `AllStates` (matrix), plus state-specific stories.
7. **Wire into `src/index.ts`** as `export { default as {Name} } from './components/{Name}';` plus its types.
8. **Verify:** `npx tsc --noEmit`, boot Storybook, screenshot each new story. Confirm existing stories didn't regress.

---

## How to modify an existing component

Same rules apply. Before editing:
- Run `npx tsc --noEmit` to confirm the current baseline is clean
- Boot Storybook and screenshot the affected component's stories (visual baseline)
- Make the change
- Re-screenshot and diff mentally against the baseline
- If a story changes unintentionally, either revert or update the story to match the new intent

---

## Verification workflow

```bash
# Typecheck
npx tsc --noEmit

# Boot Storybook (dev)
npm run storybook       # port 6006 by default

# Build the library (verifies the lib bundle actually compiles)
npm run build

# WCAG contrast guardrail (fails below AA on any text-on-surface pairing)
npm run test:contrast

# Grep guardrails
grep -rE "#[0-9a-fA-F]{3,8}" src/components/   # should be empty
grep -rE "rgba\("              src/components/   # should be empty
grep -rE "^import.*from"       src/components/ | grep -oE "from ['\"][^'\"]+['\"]" | sort -u
# ↑ only 'react', 'react-dom', 'lucide-react', '@storybook/react', or relative/alias imports allowed
```

If any of the greps produces output that doesn't fit the "allowed" list, you've introduced something that violates the rules above.

---

## Design decisions the user has made — do not relitigate

- **Vanilla CSS + React only.** No Tailwind. No Radix. No cva. No Framer Motion. No floating-ui. No CSS-in-JS. If the user's asked for a feature that would need one of these, offer them the trade-off explicitly (like Tooltip exit-animation interruption) and let them decide — don't silently reach for the dep.
- **BEM `ui-*` prefix.** Not per-component (`.button-*`), not per-product (`.foo-button`), not CSS Modules. This was renamed once already; don't reintroduce old names.
- **Product brand codes are 2 letters.** `db`, `dc`, `dr`, `ec`, `ir`, `nb`, `ph`, `rm`. Do not expand these codes to full product names — those were replaced during the codebase rename.
- **Package name is `@ui/lib`.** Don't propose different names without asking.
- **Every form control's built-in label uses `<Label>`.** Consumers can override by wrapping in a custom Label externally, but the component's internal label always goes through the shared class names.
- **Compound components use `Header/Body/Footer` naming** (Dialog, Card), not `Header/Content/Footer`. Internal consistency across our library is what matters.
- **Positioning has no collision detection.** Tooltip and DropdownMenu place popups at exact positions. If off-screen, they render off-screen. Adding flip logic would need `@floating-ui/react` — the user has declined.
- **Exit animations only exist on Tooltip.** Other portals unmount instantly on close. Adding exit animations elsewhere requires the interruption-jump state-machine pattern documented in `Tooltip.tsx`.

---

## When something's ambiguous

Ask the user before doing it. Don't guess at:
- Whether a new prop should be added to an existing component (adds API surface)
- What a variant should be named (naming is hard, they usually have opinions)
- Whether to introduce a new token vs. reuse an existing one
- Whether to break out a shared primitive (extract-vs-inline)

Small clarifying questions cost less than reworking a component after the fact.

---

## Roadmap — where we're headed next

**The Claude Design push is done (2026-07-19).** All 42 components have preview cards. **Immediate next up: generate a UI via Claude Design that actually uses these components, and iterate wherever the AI picks the wrong one** — that's the real test of whether the preview cards communicate what each component is for.

### Prep

1. ~~`npm run build` — verify the library bundles cleanly end-to-end~~ **Done 2026-07-18.** Builds clean; `tsc --noEmit` clean; grep guardrails clean.
2. ~~Top-level `styles.css` bundle so consumers can import in one line~~ **Done** — `dist/styles.css` (121 kB / 17 kB gzip) via the `@ui/lib/styles.css` export.

**Fonts are a separate opt-in import (2026-07-18) — don't re-couple them.** `tokens.scss` no longer `@import`s `./fonts`. Reason: Vite **forces asset inlining in library mode** (`build.assetsInlineLimit` is ignored there), so the 25 subsetted woff2 files were base64-inlined into `styles.css` — 685 kB / 438 kB gzip, and it *defeated the `unicode-range` subsetting*, making every consumer download Cyrillic/Greek/Vietnamese up front as render-blocking CSS.

Fonts now build via a separate `npm run build:fonts` (plain `sass` CLI, outside Vite's lib pipeline) → `dist/fonts.css` + `dist/fonts/*.woff2`, exported as `@ui/lib/fonts.css`. All 25 `@font-face` rules keep their `unicode-range`, so faces load lazily per script. Verified: mono is fetched only when something actually renders in it.

- Consumers: `import '@ui/lib/styles.css'` (required) + `import '@ui/lib/fonts.css'` (optional self-hosted Inter/JetBrains Mono).
- Storybook loads `src/styles/fonts.scss` explicitly in `.storybook/preview.tsx`.
- If you ever re-add `@import './fonts'` to `tokens.scss`, the 685 kB regression comes straight back.

### The push (via the `DesignSync` tool + `/design-sync` skill) — **COMPLETE as of 2026-07-19**

Project **`@ui/lib`** (`49609428-9a74-47c7-a777-b9f56bd43b81`), `type: PROJECT_TYPE_DESIGN_SYSTEM`, holds **45 preview files — all 42 components plus 3 Foundations pages** (motion, palettes, themes). Verified programmatically: every directory under `src/components/` has a matching preview.

The previews are **tracked in this repo** under `preview/{group}/{kebab-name}.html` and uploaded from there — local is the source of truth, the project is a published copy. They can drift (they did: `dist/styles.css` sat at the pre-fix 685 kB build for two days, and the Toast preview kept hand-rolled action buttons after Toast moved to composing `Button`). **When you change a component's rendered markup or class names, update its preview in the same commit.**

Two conventions worth knowing before you write another one:
- **Static pages can't rely on entrance animations.** Drawer animates in with `animation-fill-mode: none`, so after the keyframes finish the panel reverts to its off-screen resting transform. `drawer.html` pins `animation: none; transform: none;` inside its `.stage` so every card renders identically.
- **Viewport-anchored components need re-anchoring.** `Drawer` is `position: fixed` and `.ui-sidebar__container` likewise; both previews scope a `.stage { position: relative }` and override the child to `absolute` so the component sits inside its own frame instead of the page viewport. `dialog.html` established this pattern.

Steps, for reference / re-running:

1. ~~Create a Claude Design project~~ **Done** — must be `type: PROJECT_TYPE_DESIGN_SYSTEM` (set at creation, immutable)
2. Build HTML preview files, one per component (or per family), each with a `<!-- @dsCard group="…" -->` marker at the top so it appears as a card in Claude Design's Design System pane
3. Suggested groupings for the `group=` attribute:
   - **Foundations** — Themes, palettes, motion tokens preview, ModeToggler
   - **Buttons** — Button, ButtonGroup, CloseButton
   - **Forms** — Input, Textarea, Select, NativeSelect, Combobox, Checkbox, RadioGroup, Switch, Slider, Toggle, ToggleGroup, Field, InputGroup
   - **Feedback** — Alert, Banner, Badge, Progress, Spinner, Skeleton, Toast, Empty
   - **Overlays** — Dialog, AlertDialog, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Command
   - **Navigation** — Tabs, Breadcrumb, Pagination, Sidebar, Item (list rows)
   - **Layout** — Card, Accordion, Collapsible, ScrollArea, Attachment, Separator, AspectRatio, Blockquote, Code
   - **Identity** — Avatar, Chip, Label, Kbd, StatusDot

   (Verified 2026-07-20: these groupings cover all 53 components with no omissions.)
4. Call `DesignSync` in sequence: `list_projects` → `finalize_plan` → `write_files` → verify

### After the push

- Test generating a UI via Claude Design that uses these components
- Iterate any misalignment between preview cards and how AI picks components

### Non-blocking follow-ups

- ~~**Round out the roster**~~ **Done 2026-07-19 — Slider shipped, the roster is complete at 43.** Every component is exported from `src/index.ts` and has a Claude Design preview, both verified programmatically. Drawer fills the "sheet"/edge-panel role.
- **Finish the Figma push** (paused mid-Badge — 9/17 variants done, Card unstarted)
- **npm publish workflow** so any repo can `npm install @ui/lib`
- **Accessibility audit — first pass done 2026-07-19.** Swept all 42 for focus rings, ARIA wiring, live regions, label association, accessible names, and reduced motion. Two real findings, both fixed: no global `prefers-reduced-motion` support, and Chip's missing focus ring. Verified correct and needing no change: Dialog (focus trap + Escape + **focus restored to trigger**, confirmed end-to-end in a browser), Drawer (same), Command (proper `aria-activedescendant` combobox), Alert/Toast (`role` alert-vs-status by variant), Progress/Spinner/Skeleton, `htmlFor` on all 8 form controls, and accessible names on all 200 buttons across the preview HTML. **Still outstanding:** real screen-reader passes (VoiceOver/NVDA — ARIA wiring being correct is not the same as it announcing well), colour contrast beyond the secondary-button data recorded above, Sidebar's sub-768px Drawer swap, and tab order across composite widgets in real page layouts.
- **Dark-mode visual sweep** — verify every component renders correctly with `data-mode="dark"`

### Recent decisions worth remembering

- **Category palette got an on-tint `-text` family + Badge `category` prop (2026-07-22):** the 17 `--category-*` hues were **never in the contrast audit**, and all 17 **failed WCAG AA as text on their own `-bg` tint in light mode** (1.79–3.95; 9 failed even the 3:1 graphical floor). Dark was already fine. Fix mirrors `--primary-text`: added **`--category-{c}-text`** (17×2) — light darkened via HSL just past AA on the `-bg` tint (4.56–4.83, "as light as it can be while passing"), dark reuses the base (already 4.77+). **Base `--category-{c}` stays vivid for fills/dots/charts; `-text` is for any small text on the tint.** Added all 17 `-text`-on-`-bg` pairings to `scripts/contrast-check.mjs` (now 40 pairings, 0 below AA). **Badge** gained a **`category?: CategoryColor` prop** (new shared type in `types/GlobalTypes.ts`, 17-hue union) plus **`categoryStyle?: 'soft' | 'solid'`** (default `soft`). `category` **overrides `variant`**. `soft` → `.ui-badge--cat-{c}` (`-bg` tint + `-text`); `solid` → `.ui-badge--cat-{c}-solid` (`--category-{c}` fill + `-foreground`). Both generated by a **SCSS `@each`** over `$ui-badge-categories` (**names quoted** — bare `cyan` is a Sass colour keyword that serialises to `aqua` and would emit the wrong class). `solid` uses the **vivid `--category-{c}` fill + dark `--category-foreground`** (`#0f172a` both modes). We explored white-on-fill (needs darkening → muddy) and a uniform-luminance `-solid` set (~2.6 contrast → went pale/pastel, owner rejected: "pale easter egg colors") and **reverted both** — a bright palette can only carry *dark* text without losing its vividness (GitHub/Linear/Notion do the same). Solid is best-effort (dark-on-vivid ~4.0–9.3; indigo/violet ~4.0–4.2 just under AA); soft `-text` is the AA-safe path. **No `-solid` token** — the solid badge reads the vivid base directly. Mirrored to Figma as `category/{c}-text` + `category/foreground` (dark). `CategoryColor` is the reusable vocabulary for extending category support to Chip/Item next.

- **Design-system audit → recorded "won't-fix" decisions (2026-07-22):** full audit (token coverage / completeness / naming) scored **90/100**. Token coverage is **perfect** (0 hardcoded hex/rgba/durations in component `.scss`; every `px` is a documented exception). Completeness near-total (all 54 dirs: `forwardRef`+`displayName`, exported, storied). **Only fix taken:** split `SpinnerProps` into `Spinner.types.ts` (was inline). The rest are **accepted — do NOT "fix" them, they've been evaluated:**
  - **BEM `__part` vs `-part` mixing is accepted.** Several components mix the element form (`.ui-x__part`) with a hyphenated pseudo-block (`.ui-x-wrap`, `.ui-dialog-overlay`, `.ui-field-label`). Both are valid; **do not mass-rename** — BEM was renamed once already and preview HTML + the Figma mapping depend on the current strings. Regression risk ≫ cosmetic gain.
  - **`ItemContent` (not `ItemBody`) is accepted** even though Item also has `ItemHeader`/`ItemFooter`. Renaming the export is a breaking change for consumers — not worth it for naming purity.
  - **Menu-item styling duplicated 4× (DropdownMenu, ContextMenu, Command, Select) stays** until a *5th* menu is needed — the existing policy. Don't extract a shared base pre-emptively.
  - **Dual `onChange` (event) + `onValueChange` (string) on Input/Textarea/NativeSelect is intentional** (adapter pattern) — both fire; just know both exist.
  - Modifier-prefix drift (`--sz-`, `--state-error`, `--default-default`) is accepted as-is.

- **Aiden is a `data-surface`, not a theme — the third axis (2026-07-21):** Aiden (the AI assistant) has its own UI *and* embeds inside every product brand, and its identity is a **violet→blue gradient**. That rules out making it a `data-theme`: (1) a gradient can't be the single scalar `--primary` (which must also work as border/text), and (2) a theme *swaps* a subtree's accent, but Aiden must *keep* its look inside another brand. So it's a **surface** — `data-surface='aiden'` — orthogonal to mode and theme, layering on top of any brand. **How the scope works (reuses ALL the theme machinery):** `[data-surface='aiden'] { --primary: var(--aiden-outline-border); --primary-foreground: var(--aiden-primary-foreground); }` (mirrors a theme scope). That one remap turns every *scalar* `--primary` consumer violet for free — outline/link/secondary text (via derived `--primary-text`), borders, focus rings, checked checkbox/switch/radio, active chip. Then **every `--primary` FILL** takes the actual gradient via a `[data-surface='aiden'] …{ background: var(--aiden-primary) }` override in its **own component SCSS** — **9 components**: Button primary CTA, Badge default, Chip active, Checkbox checked, Switch track, **RadioGroup checked dot, Progress determinate default bar, Slider range, InputGroup default button**. (Rule: *anywhere `--primary` is a background fill, use the gradient*; where it's text/border, the solid violet via `--primary-text` / `--primary-border` stays.) The Progress override is scoped `:not(.ui-progress--indeterminate)` so the shimmer keeps animating, and to `--default` so semantic variants keep their colour. **Ghost stays neutral slate** — same carve-out as the brand themes. Nests correctly inside any `data-theme` (proven: a db button indigo, an Aiden panel beside it violet). Key gotchas: (a) **the Chip's active-hover override must match the base hover specificity** — base `.ui-chip--active:hover:not(:disabled)` is (0,3,0) and beats `[data-surface='aiden'] .ui-chip--active` (0,2,0), so add `[data-surface='aiden'] .ui-chip--active:hover:not(:disabled)`; same reasoning applied to the Button CTA hover. (b) **axe can't measure gradient contrast** — verify white-text-on-gradient by painting the gradient to a canvas and sampling across the label width, not with axe.
- **Aiden gradient re-tuned for AA (2026-07-21):** the original light gradient (`#8b5cf6→#7761f3→#60a5fa`) was too light for **white** text at *every* stop (4.23 / 4.39 / 2.54 — the blue end failed hard), so the flagship "Ask Aiden" button, default badge, and active chip all sat under AA (axe couldn't see it because it's a gradient). Fixed the **light** gradient to `#8455f0 → #5f61ef → #2c6dea` (violet→indigo→blue) — the **lightest** stops where white text still clears AA (canvas-measured min **~4.6** across a long chip label; owner explicitly wanted it "as light as it can be, right on the line"). Hover deepens to `#7c3aed→#4f46e5→#2563eb` (min 5.34). **Dark mode is unchanged** (`#a78bfa→#93c5fd` carrying **dark** text — already passes). Owner **rejected** the dark-text-on-light-pastel-gradient option for light mode ("way harder to read"). The `--aiden-secondary`/`-border`/`-ring`/`-focus` tints + `--aiden-outline-border` (now `#8455f0`) were re-derived to match. POC lives at `src/prototypes/AidenSurface.stories.tsx`; the mechanism is documented in `Foundations/Themes → Aiden Surface`. Follow-up if wanted: extend the surface to more components (the standalone `variant="aiden"` on Button/Badge still exists for one-off accents).
- **Accessibility audit of composed pages → `--primary-text` + 3 component fixes (2026-07-21):** ran axe-core 4.10.2 over three composed prototype pages (`src/prototypes/`) across **both modes × all 9 themes**. Everything passed except a few real issues, all now fixed:
  - **`--primary-text` on-surface token** (see Token vocabulary + the superseded secondary-button note) — fixes themed `--primary`-as-text falling just under AA (outline buttons ~4.33 in db dark; brand Banner/Alert titles 4.22–4.28 in light for 6 themes). Repointed Button (secondary/outline/link), Badge (outline), Alert (brand), Banner (brand). **All 18 mode×theme combos now 0 contrast violations** on the dashboard.
  - **Progress had no accessible name** (`role="progressbar"` with an unassociated label) — now wires `aria-labelledby` to the rendered label via `useId` (only on the simple, non-children path; children/no-label consumers pass their own `aria-label`).
  - **Alert semantic descriptions ran `opacity: var(--o-80)`**, dragging colored-on-tint text below AA (info 3.7). Removed the opacity from all 5 (brand/info/success/warning/error) — full opacity clears AA (info 5.37 … error 4.72); size+weight still carry the title/description hierarchy.
  - **Tabs inactive-trigger colour froze on a live mode-switch** — `.ui-tabs__trigger` transitioned `color: var(--muted-foreground)`, and **Chromium freezes a `var()`-driven transitioned property when the variable changes without a recalc** (→ 1.36:1 in dark). Dropped `color` from the trigger transition. **General lesson:** this freeze hits *any* transitioned var-colour on a dynamic `data-mode` flip (breadcrumb links, active-tab background, etc.); it's invisible on fresh load and the ModeToggler's view-transition path recalcs it away, but the **reduced-motion path (plain commit) does not** — so verifying dark-mode contrast by toggling `data-mode` needs a forced recalc (`el.style.display='none'; el.offsetHeight; el.style.display=''`) or the results are polluted by freeze artifacts.
  - Remaining page findings are **prototype-markup only** (no `<main>` landmark, `h1→h3` skips, a couple `opacity:0.7` decorative texts) — not component defects.
- **`--border-hover` token + Card `interactive` prop (2026-07-21):** added `--border-hover` (light `#64748b` / dark `#cbd5e1` — see "Radii / borders") for a border that strengthens on hover. Three consumers wired: (1) **Card gained an opt-in `interactive` prop** (`.ui-card--interactive`, matching Item's existing `interactive` convention) — on hover it strengthens the border to `--border-hover`, **lifts `translateY(-4px)`** (`--motion-slide-sm`), and deepens the shadow `--shadow-xs → --shadow-md`, all over `--duration-normal`/`--ease-out`; off by default so static cards are untouched. The lift has a **local `@media (prefers-reduced-motion: reduce)` override setting `transform: none`** — the global reduced-motion block only zeroes *durations*, so without this the card would still teleport up 4px; border + shadow stay (not motion). (2) **Item `--outline`** variant's interactive hover: border `--border` → `--border-hover` (default/muted variants keep their background-`--accent` hover — a border appearing from `transparent` would clash). (3) **`.ui-input-wrap`** hover: was `--muted-foreground`, now `--border-hover` (covers Input/Textarea/NativeSelect). Borders are non-text, so `--border-hover` is not in the contrast test's pairings.
- **Muted-text surfaces moved to `--secondary`; contrast guardrail added (2026-07-21):** `--muted` in light was slate-300 (`#cbd5e1`) — the *darkest* neutral surface, literally the same value as `--border`. That made muted-filled panels read too heavy AND put `--muted-foreground` text on them at only **5.1:1** (the tightest pairing in the system, sharpest on Kbd at 12px). Fix: repoint the **five surfaces that carry `--muted-foreground` text** — Alert default, Banner default, Item `--muted` variant, Avatar fallback initials, Kbd — from `--muted` → `--secondary` (slate-200). **Text hierarchy is unchanged** (title `--foreground` / description `--muted-foreground`, per the owner — "the point of muted description text is hierarchy"); only the *surface* lightens, lifting the pairing to **6.15:1 light / 11.87:1 dark**. **Pure image/icon fills stay on `--muted`** (Item/Attachment image tiles, Empty icon tile, Avatar count badge) — they carry no small muted text and want the weight. **Rule going forward: `--muted-foreground` text belongs only on `--background`/`--card`/`--secondary`; never introduce a new `--muted-foreground`-on-`--muted` pairing.** New guardrail **`npm run test:contrast`** (`scripts/contrast-check.mjs`, dependency-free) parses `tokens.scss` — brace-matching each `[data-mode]` block so the bottom-of-file `[data-theme]` scopes don't pollute the dark `--primary` values — composites `-light` tints over their base surface, and **fails below AA (4.5:1)** across 23 text-on-surface pairings. Add a pairing there whenever a component puts a `-foreground`/text token on a new surface. The owner explicitly rejected a `--tertiary`/`--subtle` surface token for this — the `--secondary` repoint solved it without new API.
- **`inherit` in component SCSS is wiring, not a gap (2026-07-21):** an audit (prompted by "define everything we can") found 36 `inherit` usages. Unlike an untokenized hex/px, `inherit` is a **defined relationship** and is mostly load-bearing: `color: inherit` on Alert/Banner/Attachment/Breadcrumb close-buttons/links is *how* a variant's `-foreground` colour reaches the nested element (pinning a token freezes it to one colour and breaks variant theming); `border-radius: inherit` (Progress indicator, Attachment overlay) keeps inner/outer radii in lockstep; `font-size`/`line-height`/`color: inherit` on native form controls follow the `--sz-*` size modifier and disabled/error colour set on the wrap; `font-family: inherit` is the idiomatic native-control reset (kept over `var(--font-family)` deliberately — pinning is more explicit but less flexible for consumers who theme a section's font). **Only 2 were pinnable and were pinned:** Item/Attachment `__title` `color: inherit` → `var(--foreground)` (they always resolved to foreground via cascade). Don't "tokenize" the rest — it's a regression.
- **Component batch — 10 new components + ripple (2026-07-20):** shipped in 7 committed groups off the "finish the roster" push. AspectRatio, Kbd, Blockquote, StatusDot (trivial primitives); Toggle + ToggleGroup (segmented); Banner (page-level bar); AlertDialog; Pagination; Code + CodeBlock; plus the `useRipple` hook. Deferred as their own efforts (too large for one session under the no-dep rule): Calendar, Date Picker, Carousel, Resizable, Menubar, Navigation Menu, Input OTP, Direction, App Shell, and the **chat family** (bubble / message / message-scroller / **marker** — "marker" is the inline status/system-note/labeled-separator chat part, per the owner). Overlaps left as reuse, not rebuilt: **Sheet → Drawer**, **Power Search → Command**, Attachment already shipped. Key sub-decisions:
  - **AlertDialog is a preset of Dialog, not a reimplementation.** The only Dialog change is a new optional `role?: 'dialog' | 'alertdialog'` (default `dialog`, backward-compatible). AlertDialog passes `role="alertdialog"`, `closeOnOutsideClick={false}`, and header `showCloseButton={false}` — the two carve-outs vs a plain dialog. It has **no `.scss` of its own** (reuses Dialog.scss).
  - **Toggle is distinct from Chip** (owner's call): Chip = rounded filter pill, Toggle = squared `aria-pressed` control with a neutral `--accent` pressed fill. Toggle reuses Chip's interaction shape; ToggleGroupItem reuses `.ui-toggle`.
  - **Pagination cells are `<a class="ui-button">`** — so Pagination.tsx must `import '../Button/Button.scss'` (cells render with no `<Button>` nearby, so its CSS wouldn't otherwise load in isolation), and `.ui-pagination__link` sets `text-decoration: none` (Button was only ever used on `<button>`, which has no underline). Same class-reuse pattern as NativeSelect→Input, ToggleGroup→Toggle.
  - **Ripple is a hook, not a Button prop (2026-07-20).** First shipped as an opt-in `ripple` prop on Button; the owner then **removed the prop** so it can't be over-used — a click that navigates away never shows the wave, and it's a Material signature much of modern web design omits. `useRipple` stays as an exported hook for the narrow cases it fits (touch-first in-place actions); when/how is documented in the hook JSDoc + `Hooks/useRipple` stories. Duration is `--duration-ripple` (600ms, tuned to animate-ui's reference — 300ms read as too quick); the 900ms `setTimeout` fallback is load-bearing since `animationend` doesn't fire under reduced motion.
- **Theming re-architecture (2026-07):** `--primary` = "the current theme's color." Mode (light/dark) = `data-mode`; theme (sub-brand) = `data-theme='{code}'` which remaps `--primary`. Main brand = no `data-theme`. The old `--brand` family and `variant="brand"` were **removed** — don't reintroduce them. Full immersion except Tooltip (uses `--tooltip-*`). See `Foundations/Themes`.
- **Button emphasis ladder (2026-07):** every variant (default + error/info/success/warning + aiden) has five visibly distinct rungs — `default` (solid fill) → `secondary` (filled `-soft` tint + border + colored text) → `outline` (transparent + border + colored text) → `ghost` → `link`. `secondary` must use `-soft` (not `-light`) or it collapses into `outline`. `default`'s `ghost` is the neutral-slate carve-out; aiden keeps its gradient on `default`/`secondary` fills but uses solid violet (`--aiden-outline-border`) for text + outline/ghost/link.
- **Secondary-button AA — FIXED via `--primary-text` (2026-07-21).** Previously (2026-07) the themed `default`-secondary text sat at 3.84–4.34 in light and the owner left it as-is. The `--primary-text` on-surface token (see Token vocabulary) is exactly the "deeper on-fill text (Material tonal pattern)" fix that note anticipated: secondary/outline/link button text, Badge `outline`, and brand Alert/Banner titles now read `--primary-text`, clearing AA across all 9 theme codes × both modes (verified below). Don't reintroduce raw `--primary` as text on those. **Not covered: the `aiden` gradient variant** — its outline/secondary text is `--aiden-outline-border` (solid violet), still ~3.84 in light. Same class of issue; would need an analogous `--aiden-text` on-surface token if you want it fixed too (not done — no page exercised it).
- **Reduced motion is handled globally in `tokens.scss` (2026-07-19):** an accessibility audit found **27 of 42 components animate and only ModeToggler checked `prefers-reduced-motion`** — no global rule existed. `tokens.scss` now ends with a `@media (prefers-reduced-motion: reduce)` block collapsing all animation/transition durations. **It uses `0.01ms`, not `animation: none` — this is load-bearing.** Drawer and Tooltip unmount off `animationend`; `none` means that event never fires and the panel stays mounted forever, which is exactly the stuck-open trap the Drawer notes above warn about. A near-zero duration still fires the event on the next frame. Verified: with the rules applied unconditionally, Drawer still goes `open → closing → unmounted`. **Spinner is the deliberate exemption** (re-declared at `--duration-spin`, `infinite`) — it's a functional status indicator and freezing it reads as "nothing is happening". If you add a component with its own reduced-motion rule, prefer the global block over a local one.
- **Chip got the system focus ring (2026-07-19):** `Chip.scss` had no `focus`, `outline` or `box-shadow` rule at all, so it fell back to the browser's default outline rather than the 3px token ring. Now matches Checkbox / Switch: `outline: none` + `box-shadow: 0 0 0 var(--focus-ring-width) var(--focus)`. Same class of gap as the Toast one below — worth grepping a new component's SCSS for `focus-visible` before shipping it.
- **Button gained an `xsmall` size, and Toast composes `Button` (2026-07-18):** Toast's action/cancel were hand-rolled `<button>`s in `Toast.scss` — 2px radius instead of Button's `--rounded-md`, a wrong hover (`--foreground` rather than `--primary-hover`), no disabled state, no participation in the variant/style ladder, and **no design-system focus styling** (Button has 27 focus rules; these had none). **Correction (2026-07-19):** the original note here — and commit `00615ea`'s message — said keyboard users got *no visible focus*. That overstated it. The old rules contained zero `outline` declarations, so they never suppressed the browser's default ring; keyboard users saw that instead of the system's 3px `--focus-ring-width` ring. Inconsistent, not invisible. The fix was still right, but don't cite this as an example of a missing focus indicator. Fixed by adding a fourth Button size **`xsmall`** (`--p-1`/`--p-2-5`, `--text-xs`, 24px tall — a tighter box on the same type ramp as `small`) and rendering real `<Button>`s in `ToastCard`: action = `style="default"`, cancel = `style="outline"`, both `size="xsmall"`. `.ui-toast__action` / `.ui-toast__cancel` survive as **layout-only hooks** so consumers can still target the slots. The shared `Size` type in `types/GlobalTypes.ts` is consumed by **Button only**, so widening it rippled nowhere else. Net effect: focus rings, disabled, and full theming now come free — verified `data-theme='dr'` turns both buttons crimson, which the old neutral `--muted-foreground` cancel never did. **Don't re-inline button styling into a surface's SCSS** — compose `Button` at `xsmall`.
- **State updaters must stay pure — Toaster (2026-07-18):** `Toaster` used to call `onDismiss()`, `clearTimer()` and `scheduleDismiss()` *inside* `setToasts((prev) => …)`. React treats updaters as pure and may run them more than once — StrictMode does in dev — so every consumer `onDismiss` fired **twice** (measured: 2 calls for 1 dismissal). Fixed by funnelling writes through a `commit()` helper that keeps a `toastsRef` mirror in lockstep, so handlers read the current stack outside any updater and side effects run exactly once. The ref assignment is synchronous, which preserves the same-tick-burst correctness the old `prev` argument provided. **Don't move side effects back inside an updater** in Toaster or anywhere else.
- **`Toaster` is an accepted exception to the `forwardRef` + `id` rules (2026-07-18):** hard rules 4 and 6 say every component gets `forwardRef` and a required `id`. `Toaster` deliberately has neither. It's a mount-once portal singleton with no meaningful ref target for callers and no child IDs to seed — adding them would be API surface that serves the rule rather than any consumer. Owner decision, not drift. Every *other* component still follows rules 4 and 6.
- **Toast duration precedence (2026-07-18):** `<Toaster duration>` used to be a **no-op** — `toast.ts` baked `DEFAULT_DURATION = 4000` into every record at creation, so the Toaster never had anything to fall back to. Now non-error toasts leave `ToastRecord.duration` **undefined** and the Toaster substitutes its own prop. Resolution order: **per-toast `opts.duration` → variant default (error only, 6000ms) → `<Toaster duration>` → 4000**. `toast.loading()` / the pending leg of `toast.promise()` still pass `Infinity` explicitly and stay sticky; `promise`'s success leg patches `duration: undefined` so it falls back to the Toaster rather than re-hardcoding 4000. Don't reintroduce a non-error default inside `toast.ts` — that's exactly what broke the prop.
- **Accordion root strips its own props from `...rest` (2026-07-18):** `value` / `defaultValue` / `onValueChange` / `collapsible` were leaking onto the root `<div>` (React warned on `collapsible`; the string ones rendered as real DOM attributes). They can't simply be destructured off `props` — `type` has to stay an *aliased discriminant* of `props` or `type === 'single'` stops narrowing `props.value`/`props.defaultValue` and the file won't typecheck. Hence the deliberate two-step destructure against `AccordionRootValueProps`. Don't "simplify" it back into one.
- **Motion tokens exist now** — use `--ease-spring` / `--ease-spring-strong` and `--motion-slide-sm/md/lg` instead of raw literals.
- **Storybook is pinned to 8.6.18** (don't upgrade to 9/10 casually — addon-essentials was removed in 9+).
- **Sass modern-compiler API** is enabled in `.storybook/main.ts` viteFinal — keeps the terminal quiet.
- **Light-theme semantic hues darkened for WCAG AA (2026-07):** `--error #d32424`, `--success #047857`, `--warning #c2410c` (plus matching `-light/-border/-ring/-focus/-hover`). All now ≥4.5:1 as text on white AND on their own `-light` tints. Dark theme untouched. Don't lighten these back without re-running contrast math.
- **Surface rule:** floating overlays (Popover, HoverCard, DropdownMenu, ContextMenu, Select, Combobox, Command, Toast) use `--popover`; in-flow surfaces (Card, Dialog panel) use `--card`. Tooltip is the deliberate exception (inverted `--primary`).
- **Composition rule:** dismissal X = `CloseButton` (Dialog, Alert, Toast all comply); form-label typography = shared `.ui-label__*` classes (Field included); hairline-with-label = `Separator` (FieldSeparator wraps it); **in-surface action buttons = `Button`** (Toast's action/cancel comply — see below).
- **Badge model (2026-07):** flat variant list, `{solid base, transparent outline}` per color. `secondary` and `no-background` were removed. Every `outline` — neutral and semantic — is now **transparent + colored border + colored text** (no fill), so `-outline` means the same thing across all colors. `default`/`outline` theme via `--primary`; semantic colors keep their own. Badge extends `React.HTMLAttributes<HTMLDivElement>` and spreads `...rest` like every other component.
- **Known-intentional duplication (future consolidation candidates):** menu-item styling exists 4× (DropdownMenu, ContextMenu, Command, Select); Attachment/Item are parallel compound families. Don't add a 5th copy — extract a shared base if you need another menu.
