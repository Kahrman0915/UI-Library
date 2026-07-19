# @ui/lib — agent context

This file is auto-loaded into every Claude Code session opened inside this repo. Read it before writing any code that lives under `src/`. Deviations from these rules should be surfaced back to the user before they land — don't silently reshape the system.

---

## What this repo is

A React + SCSS component library. 42 shipped components, one shared token file, zero third-party UI libraries. Every visual value comes from `src/styles/tokens.scss`. Every class name follows BEM under a `ui-` prefix.

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

**Shadows** (theme-aware; each token already embeds its color):
- `--shadow-2xs` (very subtle) → `--shadow-2xl` (dramatic)
- Never write `box-shadow: 0 1px 3px rgba(...)` — always `box-shadow: var(--shadow-md)` etc.

**Effects:**
- `--focus-ring-width: 3px` — the focus ring on every interactive
- `--overlay-blur: 4px` — Dialog backdrop-filter blur
- `--tooltip-slide: 4px` — Tooltip enter/exit translate distance

**Mode vs. theme (the two axes):**
- **Mode = light/dark**, set via **`data-mode='light'` / `data-mode='dark'`** on `<html>`. Tokens swap on `:root, [data-mode='light']` and `[data-mode='dark']`. The `ModeToggler` component owns this attribute.
- **Theme = a sub-brand's color**, set via **`data-theme='{code}'`** on `<html>` or any subtree. A theme remaps **just `--primary` / `--primary-foreground`**. The **main brand is the absence of `data-theme`** (`--primary` stays neutral slate). Do NOT reintroduce a `--brand` token or a `variant="brand"` — that model was removed.

**Semantic colors (all mode-aware):**
- Core: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--border`, `--input`, `--ring`, `--focus`
- `--tooltip-background` / `--tooltip-foreground` — neutral slate inverse, **never remapped by a theme** (Tooltip is the one carve-out from theming).
- Semantic families: `--error`, `--error-foreground`, `--error-light`, `--error-soft`, `--error-border`, `--error-hover`, `--error-ring`, `--error-focus`. Same shape for `--success`, `--warning`, `--info` — and `--primary` carries the same derived family (`--primary-light/-soft/-border/-hover/-ring/-focus`), which theme scopes remap.
  - **`-light` vs `-soft`:** `-light` is the *subtle* tint (6%) for surfaces — Alert backgrounds, destructive menu rows, ghost-hover — and was tuned for WCAG-AA text-on-tint. (Badge `*-outline` variants are transparent now, so `-light` no longer backs any Badge.) `-soft` is the *visible* tint used **only** for the filled `secondary` button, so `secondary` (filled tint + border) reads distinctly from `outline` (transparent + border). Don't swap them: bumping `-light` would over-saturate Alerts and break the AA math.
  - **`-soft` is mode-split for contrast:** **8% in light**, **10% in dark**. Main-brand + semantic `-soft` are split in the base `[data-mode]` blocks; the themed `--primary-soft` is split by a `[data-mode='light'] [data-theme]` rule near the bottom of `tokens.scss` (2-attr specificity beats the single `[data-theme='{code}']` scope). Aiden's `--aiden-secondary` fill is a matching low-alpha gradient (8% light / 10% dark), not a solid hex. Re-run the contrast script if you touch these percentages.
- Aiden (AI gradient variant): `--aiden-primary`, `--aiden-hover`, `--aiden-outline-bg`, etc.

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

**Category colors** (chart / tags): `--category-red`, `--category-blue`, `--category-emerald`, `--category-violet`, etc., each with `-bg` (light background at 0.1 opacity) and `-hover` variants.

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
| `Attachment` (+ `Media` `Content` `Title` `Description` `Actions` `Action` `Trigger` `Group`) | yes | 9 exports. File-attachment row/tile; `size` = xs/sm/default, `orientation` = horizontal/vertical, `AttachmentMedia variant` = icon/image. Shimmer via `--duration-shimmer`. Parallel family to `Item` |
| `Avatar` + `AvatarGroup` | yes | Fallback initials + optional image + status-dot badge |
| `Badge` | no | 12 variants — every color is `{solid base, transparent outline}`; no brand — default/outline theme via `--primary`. Extends `HTMLAttributes<HTMLDivElement>` (full `...rest`) |
| `Button` | no | 6 variants × 5 styles × **4 sizes** (`xsmall`/`small`/`default`/`large`) + `isLoading` (no brand — `default` IS the theme's primary) |
| `Breadcrumb` (+ `List` `Item` `Link` `Page` `Separator` `Ellipsis`) | yes | 7 exports. Links use `text-underline-offset: 3px`; `Ellipsis` carries an sr-only label |
| `ButtonGroup` + `ButtonGroupSeparator` + `ButtonGroupText` | yes | Corner-flatten via CSS `:not(:first/last-child)` |
| `Card` + `CardHeader` + `CardBody` + `CardFooter` | yes | Header prop-driven (`title`, `description`, `action`) |
| `Checkbox` | no | Native input + custom visual + `indeterminate` prop |
| `Chip` | no | Toggle-style; `active` state uses `--primary` |
| `CloseButton` | no | Uses `X` from `lucide-react` |
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
| `Label` | no | Shared with Checkbox internal label + Input/Textarea's built-in label; `required` renders `*` in `--error` |
| `Popover` + `PopoverTrigger` + `PopoverContent` + `PopoverClose` | yes | `computePosition` floating surface (`--popover`); `side`/`align`, no collision detection |
| `Progress` (+ `Label` `Value` `Track` `Indicator`) | yes | 5 exports. `size` = sm/default/lg, `variant`, `indeterminate` (shimmer via `--duration-shimmer`); default indicator reads `--primary` |
| `RadioGroup` + `RadioGroupItem` | yes | `orientation` prop; checked dot uses `--primary` |
| `ScrollArea` | no | Custom JS thumb, grid layout, no floating-ui dep |
| `Select` (+ `Trigger` `Content` `Item` `Group` `Label` `Separator`) | yes | 7 exports. Floating listbox (distinct from `NativeSelect`); `size`/`side`/`align`. One of the 4 menu-item styling copies |
| `Separator` | no | `orientation` prop; the canonical hairline-with-label primitive (`FieldSeparator` wraps it) |
| `Sidebar` (+ `SidebarProvider`, `useSidebar`, ~21 parts) | yes | Full app-sidebar subsystem. `collapsible` = offcanvas/icon/none, `variant` = sidebar/floating/inset, `side` = left/right. ⌘B shortcut, localStorage persistence, mobile (<768px) renders as a `Drawer`, icon-mode `tooltip` via `Tooltip`, `SidebarMenuSkeleton` via `Skeleton`. Own `--sidebar-*` token surface. Collapse = in-flow gap spacer + viewport-fixed panel driven by `data-state`/`data-collapsible` |
| `Skeleton` | no | `shape` = default/circle/text; shimmer via `--duration-shimmer` |
| `Spinner` | no | lucide `LoaderCircle` + `--duration-spin` rotation; `role="status"` |
| `Switch` | no | `size` prop; checked track uses `--primary`. Thumb travel distances (12/16/20px) are intentional component-internal literals |
| `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | yes | `orientation` prop |
| `Textarea` | no | Reuses Input's `.ui-input-wrap` via `--multi` modifier |
| `Toast` — `Toaster` + `toast()` | yes | **Imperative API, not a compound tree**: render `<Toaster>` once, call `toast()` anywhere. `variant`, `duration`, `position`. 380px stack / 300px card min-width (panel geometry); action reads `--primary`; dismissal X composes `CloseButton` |
| `Tooltip` + `TooltipTrigger` + `TooltipContent` | yes | State machine (`closed`/`open`/`closing`), direction-aware animations, portal |

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
   - **Forms** — Input, Textarea, Select, NativeSelect, Combobox, Checkbox, RadioGroup, Switch, Field, InputGroup
   - **Feedback** — Alert, Badge, Progress, Spinner, Skeleton, Toast, Empty
   - **Overlays** — Dialog, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Command
   - **Navigation** — Tabs, Breadcrumb, Sidebar, Item (list rows)
   - **Layout** — Card, Accordion, Collapsible, ScrollArea, Attachment, Separator
   - **Identity** — Avatar, Chip, Label

   (Verified 2026-07-18: these groupings cover all 42 components with no omissions.)
4. Call `DesignSync` in sequence: `list_projects` → `finalize_plan` → `write_files` → verify

### After the push

- Test generating a UI via Claude Design that uses these components
- Iterate any misalignment between preview cards and how AI picks components

### Non-blocking follow-ups

- **Round out the roster:** **Slider is the only component still missing.** (Roster table above refreshed 2026-07-18 — all 42 components are now listed and every one is exported from `src/index.ts`, verified programmatically. Drawer fills the "sheet"/edge-panel role. Every component now has a Claude Design preview as of 2026-07-19.)
- **Finish the Figma push** (paused mid-Badge — 9/17 variants done, Card unstarted)
- **npm publish workflow** so any repo can `npm install @ui/lib`
- **Accessibility audit** — keyboard nav, focus rings, aria-live regions across all 42 components
- **Dark-mode visual sweep** — verify every component renders correctly with `data-mode="dark"`

### Recent decisions worth remembering

- **Theming re-architecture (2026-07):** `--primary` = "the current theme's color." Mode (light/dark) = `data-mode`; theme (sub-brand) = `data-theme='{code}'` which remaps `--primary`. Main brand = no `data-theme`. The old `--brand` family and `variant="brand"` were **removed** — don't reintroduce them. Full immersion except Tooltip (uses `--tooltip-*`). See `Foundations/Themes`.
- **Button emphasis ladder (2026-07):** every variant (default + error/info/success/warning + aiden) has five visibly distinct rungs — `default` (solid fill) → `secondary` (filled `-soft` tint + border + colored text) → `outline` (transparent + border + colored text) → `ghost` → `link`. `secondary` must use `-soft` (not `-light`) or it collapses into `outline`. `default`'s `ghost` is the neutral-slate carve-out; aiden keeps its gradient on `default`/`secondary` fills but uses solid violet (`--aiden-outline-border`) for text + outline/ghost/link.
- **Secondary-button AA status (2026-07, `-soft` at 8%/10%):** measured (contrast script over composited fill) — **dark mode: all secondaries pass AA.** Light mode: main-brand slate, all four semantics (error 4.56 / warning 4.62 / info / success), and the `rm` theme pass; **still under 4.5:1 in light are the themed `default`-secondary for db/dc/dr/ec/ir/nb/ph (3.84–4.34) and aiden (3.84)** — mid/high-luminance colored *text* on a tint of itself can't reach AA no matter how pale the fill. **Owner chose to leave these as-is** (2026-07). The fix if ever wanted: deeper "on-fill" text on the secondary (Material tonal pattern) or neutral-slate text on those two — not a lighter tint.
- **Button gained an `xsmall` size, and Toast composes `Button` (2026-07-18):** Toast's action/cancel were hand-rolled `<button>`s in `Toast.scss` — 2px radius instead of Button's `--rounded-md`, a wrong hover (`--foreground` rather than `--primary-hover`), no disabled state, no participation in the variant/style ladder, and **zero focus styling** (Button has 27 focus rules; these had none, so keyboard users got no visible focus). Fixed by adding a fourth Button size **`xsmall`** (`--p-1`/`--p-2-5`, `--text-xs`, 24px tall — a tighter box on the same type ramp as `small`) and rendering real `<Button>`s in `ToastCard`: action = `style="default"`, cancel = `style="outline"`, both `size="xsmall"`. `.ui-toast__action` / `.ui-toast__cancel` survive as **layout-only hooks** so consumers can still target the slots. The shared `Size` type in `types/GlobalTypes.ts` is consumed by **Button only**, so widening it rippled nowhere else. Net effect: focus rings, disabled, and full theming now come free — verified `data-theme='dr'` turns both buttons crimson, which the old neutral `--muted-foreground` cancel never did. **Don't re-inline button styling into a surface's SCSS** — compose `Button` at `xsmall`.
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
