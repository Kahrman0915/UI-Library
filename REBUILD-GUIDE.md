# Reconciling an older copy of this library

**Read this first, in full, before changing any file.**

You are holding an older version of a very similar component library. This repo is the **newer, authoritative state**. Your job is to bring your copy up to this one — not to merge two peers, and not to preserve your version's decisions where they conflict.

The two codebases share an ancestor. They diverged around **2026-07-25**, at the commit that darkened the code-block syntax palette for WCAG AA. Roughly 144 commits landed here after that point. Your copy already has the three-axis theming model and the Aiden surface, so the shape will be familiar.

**Component names may not match.** The designs are largely the same but the naming isn't guaranteed to be, so match by *behaviour and shape* before assuming a name is missing. There's a matching procedure below.

---

## 1 · What is authoritative

| Question | Answer |
|---|---|
| Which repo wins on conflict? | **This one, always.** |
| Which repo wins on a component *you* have and this one doesn't? | Yours — bring it across, then make it follow the rules here. |
| Where are the rules? | [`CLAUDE.md`](./CLAUDE.md). It is the source of truth for conventions and for decisions that must not be relitigated. |
| Where is the public surface? | [`README.md`](./README.md) — 59 components, 250 exported values, the three axes, the token families. |
| Where is per-component API truth? | The component's own `{Name}.types.ts` JSDoc, surfaced in Storybook → Docs → API reference. |
| Where is per-component history? | Each component's docs page has a **Changelog** section, fed by `parameters.ui.changelog` in its story meta. |

Read `CLAUDE.md` end to end before you start. It is long, and it is the whole point — most of what follows assumes you have.

---

## 2 · Matching components when the names differ

Do **not** assume a name that's missing here means the component is missing. Match on shape:

1. **Look for the exported symbol first.** `src/index.ts` exports every component and compound part. Grep it.
2. **If the name isn't there, match by role.** Use the table in [`plugin/resources/components.md`](./plugin/resources/components.md) — it groups all 59 by what they're *for*, which survives renaming.
3. **Match by class name.** Every component owns a BEM block under a `ui-` prefix: `.ui-button`, `.ui-input-wrap`, `.ui-chat-bubble`. If your version renders `.ui-{something}`, the same block almost certainly exists here.
4. **Match by props.** The API conventions are stable across both: `id`, `label`, `description`, `error` + `errorMessage`, `variant`, `style`, `size`, `className`. A form control with `label` + `description` + `errorMessage` is the same component whatever it's called.
5. **Only then conclude it's new.**

**Known renames and model changes** — check these before matching anything colour-related:

| If your copy has… | It is now… |
|---|---|
| `--brand`, `--brand-*` tokens | **Removed.** `--primary` *is* the current theme's colour. |
| `variant="brand"` on Button or Badge | **Removed.** `variant="default"` is the theme's primary. |
| `.brand-{code}` scope classes | **Removed.** Use the `data-theme="{code}"` attribute. |
| `data-theme="dark"` for light/dark | **`data-mode`.** `data-theme` is the sub-brand axis. |
| 17 or 18 category hues | **15** — yellow and lime were removed. |
| Category `-hover` used for anything | Unused; `-text` is the member you want for text on a tint. |

If you find any of the left column in your copy, that is a **pre-divergence artifact**. Delete it rather than porting it.

---

## 3 · What changed after the divergence

Work through these in order. Each is independently verifiable.

### 3.1 Tokens (do this first — everything else depends on it)

`src/styles/tokens.scss` is the single file. New since your copy:

- **`--primary-text`** — the on-surface variant of `--primary`, for when the theme colour is *text* on a light surface. Without it, outline/link/secondary button labels and brand Alert titles fail WCAG AA on mid-luminance themes. **Solid fills keep raw `--primary`.**
- **Category `-text` members** (15 hues) — AA-safe text on each `-bg` tint. Raw `--category-{hue}` as small text on its own tint fails AA for every hue in light mode.
- **Motion:** `--ease-premium`, `--ease-entrance`, `--duration-entrance`, `--duration-pulse`, `--motion-scale-press`, `--motion-scale-press-subtle`, `--stagger-step`.
- **Aiden re-tuned to "blurple"** — `--aiden-outline-border` is now `#5a37e6` (light) / `#9076f9` (dark), and the gradient runs violet → blurple → blue. If your copy has the older violet `#8455f0` as the solid, it will read too close to the `db` theme's indigo.
- **`--border-hover`** — the strengthened border on hover.
- **`--icon-border-width*`**.

**Verify:** `npm run test:contrast` — 49 pairings, must report 0 below AA.

### 3.2 Shared primitives

Extracted here, and worth adopting before porting components that use them:

| Module | What it solves |
|---|---|
| `src/hooks/usePresence.ts` | The `closed → open → closing` machine every portal uses. **Must promote to `open` synchronously during render** — deferring to an effect mounts content a render late, after the positioning layout-effect ran against a null ref, leaving the surface invisible. |
| `src/hooks/useFloatingReposition.ts` | Keeps a floating surface anchored while open (rAF-throttled resize + capture-phase scroll + ResizeObserver). `computePosition` measures **once**; without this, any layout shift strands the menu away from its trigger. |
| `src/utils/focus.ts` | `FOCUSABLE_SELECTOR` / `getFocusable`, shared by Dialog, Drawer, HoverCard. |
| `src/types/GlobalTypes.ts` | `SIZES` / `Size` — the one size scale, `xs`/`sm`/`default`/`lg`. If your copy has Button or Chip on `xsmall`/`small`/`large`, that vocabulary was retired: rename the prop **and** the emitted `--sz-*` class. |
| `src/styles/icon-button.scss` | `.ui-icon-button` — the shared shell for every small icon-only button, including the WCAG 2.5.8 hit-target expansion. |
| `src/styles/stagger.scss`, `reveal.scss`, `overlay-entrance.scss` | Motion utilities applied by class. |

### 3.3 New components

`Fab` and `FeaturedIcon`. `Empty` was refactored to reuse `FeaturedIcon` rather than hand-rolling its icon tile.

### 3.4 Correctness fixes you should port deliberately

These were real defects. If your copy predates them, it has them. Each is worth checking against your version rather than assuming:

- **Dialog's focus trap never ran.** The effect was keyed on `open`, but the presence machine's `state` is still `closed` on that commit, so it ran against a null panel, bailed, and never re-ran. Result: no initial focus, no Tab containment, no scroll lock, no focus restore on *every* Dialog and AlertDialog. Key it on `state`.
- **Select / Combobox had an unclickable dead strip.** The chevron was a flex *sibling* of the trigger with `pointer-events: none`, so clicks in a ~37px band did nothing while the wrap still showed `cursor: pointer`.
- **Floating surfaces never re-measured** — see `useFloatingReposition` above.
- **Form errors were not live regions.** All five (Input, Textarea, NativeSelect, Select, Combobox) now carry `role="alert"`, so a validation error that appears after submit is announced.
- **`Label.description` polluted the accessible name** — it now renders `aria-hidden` with an id the control references via `aria-describedby`. One fix, seven consumers.
- **HoverCard was `role="tooltip"` with buttons inside** (invalid), and its content was unreachable by keyboard because it's portaled to the end of `<body>`.
- **A positioning `transform` on a `Button` breaks its click.** The `:active` press-scale replaces `transform` wholesale, so the button teleports out from under the cursor and no `click` fires. Put positioning on a wrapper.
- Plus ~16 more, listed with file references in [`docs/component-audit-2026-07-28.md`](./docs/component-audit-2026-07-28.md).

### 3.5 Documentation infrastructure

`.storybook/docs/` holds a bespoke Storybook Docs template. It is **dev-only** — verify `dist/` never contains Storybook references. Prose comes from `parameters.ui` in each story meta, typed by `src/types/DocsTypes.ts`. If you port it, port `PropsTable.tsx`'s standing-copy map too, or 301 props render an em-dash.

---

## 4 · Rules that must survive the merge

Non-negotiable. If your copy conflicts, your copy is wrong.

1. **Runtime dependencies are `lucide-react` only.** `react` / `react-dom` are peers. Tailwind, Radix, cva, framer-motion, floating-ui, styled-components and emotion have each been explicitly rejected. If a merge wants one, **stop and ask** — don't resolve it yourself.
2. **No Tailwind, no CSS-in-JS.** SCSS files imported as a side effect from the component's `.tsx`.
3. **Every value is a token.** No hex, no rgba, no raw px, except the documented geometry exceptions in `CLAUDE.md`. Verify with the greps in §5.
4. **BEM under a `ui-` prefix.** Never CSS Modules. The prefix was renamed once already; the preview HTML and the Figma mapping key off these exact strings, so **don't mass-rename**.
5. **`forwardRef` + `displayName` + `className` passthrough + `{...rest}` spread first** on every component.
6. **`id` is required** on non-trivial components and seeds child ids.
7. **Compound parts are `Header` / `Body` / `Footer`** — not `Content`.
8. **Three theming axes**, all attributes: `data-mode` ⊥ `data-theme` ⊥ `data-surface`.

`CLAUDE.md` has a "Design decisions the user has made — do not relitigate" section. Treat every entry there as settled.

---

## 5 · Verification

Run all of these after each phase, not just at the end.

```bash
npx tsc --noEmit          # must be clean
npm run build             # must be clean; check dist/ for leakage
npm run test:contrast     # 49 pairings, 0 below AA
npm run storybook         # the real regression check
```

Guardrail greps — each must return nothing:

```bash
grep -rE "#[0-9a-fA-F]{3,8}" src/components/   # no hex outside tokens.scss
grep -rE "rgba\("            src/components/   # no rgba either
```

Imports in `src/components/` may only resolve to `react`, `react-dom`, `lucide-react`, `@storybook/*`, or relative/alias paths:

```bash
grep -rE "^import.*from" src/components/ | grep -oE "from ['\"][^'\"]+['\"]" | sort -u
```

Two checks worth automating, both of which caught real bugs here:

- **No dead BEM modifiers.** Every `ui-x--mod` literal in a `.tsx` must exist in a `.scss`. (The reverse isn't checkable — most modifiers are built by interpolation.)
- **No unoverridable `aria-label`.** Every hard-coded label must sit *before* `{...rest}`, or be exposed as a prop when it's on an internal element.

**Storybook is the primary regression test.** Type-checking proves nothing about whether a menu opens where you can click it — two of the worst bugs found here were invisible in source and only showed up when a component was driven in a browser. When you verify interaction, use real `pointerdown → mousedown → mouseup → click` sequences: a synthetic `.click()` bypasses the browser's "was mouseup over the same element" rule and will report a broken control as working.

---

## 6 · Suggested order

1. Read `CLAUDE.md` in full.
2. Reconcile `tokens.scss`. Run `test:contrast`. Nothing else is safe until this is right.
3. Adopt the shared primitives (§3.2) — later components depend on them.
4. Walk components alphabetically. For each: match by shape (§2), port the fixes (§3.4), JSDoc every prop, ensure stories exist including a disabled state.
5. Bring across anything your copy has that this one doesn't, conforming it to §4.
6. Port the docs infrastructure last — it's the least load-bearing and the most fiddly.
7. Full verification pass (§5), in both light and dark, across a sample of themes.

**When you hit a genuine conflict — same component, two defensible designs — stop and ask.** Don't split the difference. The decisions in `CLAUDE.md` were made deliberately, often after being got wrong once, and a reasonable-looking compromise usually undoes the reason.
