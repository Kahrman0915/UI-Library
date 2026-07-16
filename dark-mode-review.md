# Dark-theme review notes

Findings from a visual sweep on `data-theme="dark"` across 18 of 33 components.
None of these are structural failures — the [data-theme="dark"] block in
`src/styles/tokens.scss` (line 613) correctly remaps every semantic color and
components pick it up consistently. But three behaviors are worth reviewing
before deciding whether to change anything.

Session: 2026-07-12. Un-verified components (ButtonGroup, CloseButton, Chip,
Label, Spinner, Tabs, Breadcrumb, Collapsible, ScrollArea, Popover, HoverCard,
ContextMenu, Select, Field, InputGroup) compose the same tokens and primitives
that were verified, so they inherit the same behavior.

---

## 1. Brand-ghost / brand-link fallback reads as dim in dark mode

**Where:** [src/components/Button/Button.scss](src/components/Button/Button.scss) — wherever
`variant="brand" + style="ghost"` and `variant="brand" + style="link"` resolve their
color. Same fallback pattern likely affects Badge's `brand-outline` variant outside
a scope.

**What happens:** Outside a `.brand-{code}` scope, `--brand` falls back to
`--primary`. In dark mode `--primary` becomes near-white
(`--foreground: #f8fafc`). That means a brand-ghost or brand-link button renders
near-white text on the dark background — technically readable but visually dim
and not obviously interactive.

**Why it might be OK:** Inside a real brand scope (`.brand-db`, `.brand-nb`,
etc.) the fallback never triggers — the button reads in the sub-app's actual
brand color. The problem only shows when consumers use `variant="brand"` in a
neutral (non-brand-scoped) region, which the design system's mental model says
they shouldn't be doing anyway.

**Options if fixing:**
- Leave as-is (documented behavior — brand outside scope falls back to primary).
- Hard-code a color for `.ui-button--brand-ghost` / `.ui-button--brand-link` that
  reads on both themes (e.g. `--brand-secondary-foreground` = slate).
- Warn in dev when `variant="brand"` renders outside a `.brand-*` ancestor
  (dev-only console warning, not runtime).

---

## 2. Checked checkbox uses inverse pattern (light fill, dark check) in dark mode

**Where:** [src/components/Checkbox/Checkbox.scss](src/components/Checkbox/Checkbox.scss) — the
`.ui-checkbox` fill.

**What happens:** The checked-state fill uses `--primary`. In dark mode
`--primary` = near-white, so a checked checkbox is a light square with a dark
check. This is the standard inverse pattern (matches shadcn, Radix, Chakra) —
the checked state stays visually prominent because light-on-dark stands out.

**Why to review:** If your design intent is for `variant="brand"`-shaped
components to feel dominant (colored, not neutral), you might prefer the checkbox
to use a brand color when checked instead of `--primary`. But that'd be a bigger
design decision — checkbox doesn't currently accept a `variant` prop.

**Options if fixing:**
- Leave as-is (standard, expected).
- Introduce a `variant` prop on Checkbox so consumers can opt into a colored
  fill when checked.

---

## 3. Tooltip uses inverse coloring in dark mode

**Where:** [src/components/Tooltip/Tooltip.scss](src/components/Tooltip/Tooltip.scss).

**What happens:** In dark mode the tooltip renders as a light chip with dark
text. Same inverse-contrast pattern as Checkbox #2 — tokens that flip.

**Why to review:** Tooltips traditionally use inverse contrast so they stand
out from the surrounding UI. This is the correct default. Only reconsider if
you want tooltips to blend into the theme surface instead of contrasting with
it.

**Options if fixing:**
- Leave as-is (recommended).
- Add a `tone="inverse" | "surface"` prop if you want both behaviors.

---

## Screenshots

Not committed. If you want them, boot Storybook (`npm run storybook`) and open
each story with `?globals=theme:dark` in the URL, e.g.
`http://localhost:6006/iframe.html?globals=theme:dark&id=components-button--all-variants&viewMode=story`.

## When you're ready to decide

Delete this file after making calls on all three. Or convert to GitHub issues
if you'd rather track them there.
