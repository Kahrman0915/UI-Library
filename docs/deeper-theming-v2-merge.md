# Deeper Theming v2 — merge record

**Status:** Phase A is **merged to `main`**. `Mark` and the widened Sidebar rail override landed after it on `feat/sidebar-tint-and-mark`. Phase B is outlined at the end and **not started**.
**Audience:** an engineer or agent replicating this change in a *different* component library.
**Source of truth for values:** `src/prototypes/deeperThemingRecipeV2.ts` (the POC recipe). Nothing in this document restates a colour that the recipe owns.

This is a working record, not a tutorial. It is written so that someone who has never seen this repo can reproduce the architecture, and — more importantly — avoid the specific mistakes that cost time here. Every "gotcha" below was actually hit.

---

## 0. Where everything lives, and how to start

Take these files. The first two are the system; the rest are what keeps it honest.

| File | What it is |
|---|---|
| `src/styles/tokens.scss` | The shipped token system. Brand blocks sit between `/* @generated … */` markers — **do not hand-edit those**. |
| `src/prototypes/deeperThemingRecipeV2.ts` | **The source of truth for every colour.** Solved anchors per brand, and the emitter that turns three anchors into a full token block. If you port one file, port this one. |
| `scripts/generate-brand-tokens.mjs` | Reads the recipe's emitted CSS, rewrites selectors, splices into tokens.scss. `--check` mode → `npm run test:tokens`. |
| `scripts/contrast-check.mjs` | AA gate across all 52 mode × theme × tint contexts. |
| `scripts/check-palette.mjs` | Chart-slot separation, CVD, and the recorded-not-fixed findings. |
| `src/components/Mark/` | The one component that renders a brand's full three-anchor identity. |
| `src/charts/Chart/Chart.scss` | The `var(--decorative-hi, currentColor)` fallback whose behaviour depends on the main brand having **no** decorative anchors. |

**Suggested order of work**, which is also the order these were built and the reason it went smoothly:

1. Read §2 and §5 before writing any CSS. Those two sections are the whole architecture; everything else is consequence.
2. Extend your contrast checker **first** (§8). It must land before the refactor it protects.
3. Base neutral layer (§2) — prove it is a no-op (§13).
4. Tint axis (§4), then the brand blocks via a generator (§6).
5. Aiden or your equivalent cross-cutting surface (§7).
6. Only then the components (§11).

If you are adapting rather than porting — different brands, different anchors — everything from §2 to §8 still applies unchanged. The colours are the only part that is ours.

---

## 1. What the change is, in one paragraph

Before: a theme was a single attribute (`data-theme='db'`) that remapped **one** token family — `--primary` and its eight derived members. Nine declarations per brand. Surfaces, borders, charts and artwork stayed neutral slate in every brand.

After: a theme still remaps `--primary`, and additionally brings its own **functional deep** (`--primary-deep`), **artwork pair** (`--decorative-hi` / `--decorative-deep`), a **composed gradient**, and its own **six categorical chart colours**. A fourth, independent axis (`data-tint`) can tint the neutral surfaces toward the brand. An AI surface (`data-surface='aiden'`) composes *inside* any brand and deliberately keeps neutral surfaces.

Axes are orthogonal and all attribute-driven:

| Axis | Attribute | Values |
|---|---|---|
| Mode | `data-mode` | `light` \| `dark` |
| Brand | `data-theme` | `db` `dc` `ec` `nb` `ph` `rm` (absence = neutral "main") |
| Surface | `data-surface` | `aiden` (composes inside any brand) |
| **Tint (new)** | `data-tint` | `page` \| `rail` \| `page rail` (absence = neutral) |

---

## 2. The one structural problem you must solve first

**A CSS custom property cannot reference itself.**

The tinted surfaces want to be "the neutral base, with some brand mixed in":

```css
--card: color-mix(in srgb, var(--tint-stock) 12%, var(--card));  /* ✗ CYCLE */
```

A cycle resolves to `unset` — **not** to the previous value, and **with no error anywhere**. The page renders with `--card` invalid and everything downstream falls back to initial/inherited. It looks like a styling bug, not a cycle.

### The fix: a raw neutral base layer

For every surface a brand may tint, move the literal into a `--base-*` twin and make the public token a pass-through:

```css
:root, [data-mode='light'] {
  --base-card: #ffffff;
  --card: var(--base-card);     /* untinted output is bit-identical */
}
```

Then a brand scope mixes against `--base-card`, which is a different name and therefore not a cycle.

**Thirteen tokens needed this** (the full set a brand can tint):
`--background --card --popover --secondary --accent --muted --input --border --border-hover --ring --sidebar --sidebar-border --sidebar-accent`

`--base-*` is *input to the derivation*, not a second public vocabulary. Nothing else should read it.

> **Verify this step is a no-op before continuing.** `var()` of an inherited literal *is* the literal, so unthemed output must be byte-identical. We proved it by resolving every token that resolved on the baseline, across all pre-existing contexts: 4020 token/context pairs, 0 differences. Do not proceed on "it looks the same."

---

## 3. The layer stack

Order in the file matters. This is the shipped order:

1. `:root` primitives — includes `--tint-page: 0; --tint-rail: 0;`
2. `:root, [data-mode='light']` — base literals + light semantic tokens
3. `[data-mode='dark']` — base literals + dark semantic tokens
4. `[data-theme='xx']` × 6 — the existing `--primary` family remap (unchanged shape)
5. **Tint derivations** — dark block, then light block (see §5 for why that order)
6. `[data-tint~='page'] { --tint-page: 1 }` / `[data-tint~='rail'] { --tint-rail: 1 }`
7. **Generated brand blocks** — per brand: light, dark, light-reasserted
8. `[data-surface='aiden']` — `--primary` remap
9. **Aiden neutral re-pin** — must come after 5
10. Existing mode-tuned overrides, reduced-motion

---

## 4. The tint axis

```css
/* in :root */
--tint-page: 0;
--tint-rail: 0;

/* the flippers */
[data-tint~='page'] { --tint-page: 1; }
[data-tint~='rail'] { --tint-rail: 1; }
```

`~=` is a whitespace-list match, so `data-tint="page rail"` enables both and either works alone.

**Multipliers, not booleans**, for two reasons: CSS has no booleans, and the value must enter `calc()`. Every tinted surface is:

```css
--accent: color-mix(in srgb, var(--tint-stock) calc(12% * var(--tint-page, 0)), var(--base-accent));
```

At `0` the mix collapses numerically to the base colour. This is what makes **absence mean neutral** — a consumer who never sets the attribute gets today's rendering, guaranteed, not by convention. It also leaves room for a continuous 0–1 strength later without touching any call site.

The `, 0` fallback on every consumer is belt-and-braces: an unresolvable `var()` invalidates the *entire declaration* at computed-value time, so a missing multiplier would take `--accent` out entirely.

### `--tint-stock`

The greyed brand deep that all surface tints mix in:

```css
/* light */ --tint-stock: color-mix(in srgb, var(--primary-deep) 25%, #475569);
/* dark  */ --tint-stock: color-mix(in srgb, var(--primary-deep) 25%, #64748b);
```

Dark greys toward slate-500 rather than slate-600 because the dark deep anchors are lighter; a mid-slate stops the stock collapsing into the page it is about to tint.

### Percentages

Light (page stays white — `--background`/`--card`/`--popover` are **not** tinted in light):

| Token | Mix | Source |
|---|---|---|
| `--accent` | 12% stock | near-white row-hover surface, takes the most |
| `--secondary` `--input` | 10% stock | |
| `--muted` | 7% stock | darkest surface, carries the tightest muted-text pairing |
| `--border` | 5% `--primary` | |
| `--border-hover` | 8% `--primary` | |
| `--ring` | 30% `--primary` | focus indicator — deliberately full strength, WCAG 1.4.11 wants it to stand out |
| `--sidebar` | 4% primary over 8% stock | see below |
| `--sidebar-border` | 4% primary over 11% stock | |
| `--sidebar-accent` | 4% primary over 10% stock | |

Dark (page **is** tinted): background/card/popover/secondary/accent/input 12% stock, muted 10%, border 6% primary, border-hover 8%, ring 30%, sidebar 4%-over-9%, sidebar-border 4%-over-12%, sidebar-accent 4%-over-9%.

**The sidebar's double mix — order is load-bearing.** Inner mix is `--tint-stock` and supplies the rail's *value* (what holds it apart from the content area). Outer mix is a little raw `--primary` and supplies *hue*. Swapping primary in *for* the stock instead of layering on top lightens the rail and hands the separation straight back.

---

## 5. Two cascade rules that will bite you

### 5.1 Where a `var()` resolves

> A `var()` inside a custom property is substituted at **computed-value time on the element that DECLARES it**, not where it is used.

`--tint-stock` derives from `--primary-deep`, which only a brand scope declares. If you put the tint derivations in the mode blocks (on `<html>`), they resolve there — against nothing — and go invalid. **The derivations must live under `[data-theme]`.**

The same rule is why the recipe emits its mark gradient per brand instead of once upstream: a gradient declared on an ancestor has already baked its stop positions by the time a descendant tries to override them.

### 5.2 Light must be declared *after* dark

Both are two-attribute compounds, so a light subtree nested in a dark page matches both and the tie breaks on **source order**. Light has to come last to win it.

```css
/* dark FIRST */
[data-mode='dark'] [data-theme],
[data-mode='dark'][data-theme] { … }

/* light SECOND — the bare selector is the ':root' equivalent */
[data-theme],
[data-mode='light'] [data-theme],
[data-mode='light'][data-theme] { … }
```

Plain dark still works: the light rule's bare `[data-theme]` member is one attribute and loses to the dark compound on specificity.

**Both descendant and same-element forms are required** (`A B` and `AB`) because the mode and theme attributes may sit on one element or on two.

---

## 6. Generate the brand values — do not transcribe them

~250 colour literals. They are *solved*, not picked: derived by the recipe, then hand-tuned against contrast gates over many sessions. Transcribing them once is hours; keeping a transcription correct as the recipe moves is unbounded, and **a stale hex looks exactly like a fresh one**.

`scripts/generate-brand-tokens.mjs` (dependency-free):
- imports the recipe's **emitted CSS**, not its data tables, so the emitter stays the single definition of how an anchor becomes a token
- rewrites `[data-theme-poc2][data-brand='X'][data-mode='M']` → the shipped selectors
- filters to the Phase A token set
- writes between `/* @generated … */` markers
- `--check` mode diffs instead of writing → `npm run test:tokens` makes drift a build failure

### Gotcha: the selector alone does not identify the block

The recipe emits component overrides under the *same* `[data-surface='aiden'][data-mode='…']` selector further down. Taking the last regex match let one of those overwrite aiden's anchors, producing **an empty aiden scope** — valid CSS that declares nothing, so the surface silently fell through to neutral and merely looked "unthemed."

Identify blocks by **what they declare** (`if (!/--decorative-hi\s*:/.test(body)) continue;`) and keep the first qualifying match. The emitter now also **refuses to produce an empty block**.

### What ships per brand

`--primary` / `--primary-foreground` ship as the mode-block anchors (`--db-primary` etc.) that the existing `[data-theme]` scopes already read via `var()`. Emitting them into the brand block too would be a second declaration racing the first on source order.

The generated block carries: `--primary-deep`, `--decorative-hi`, `--decorative-deep`, `--decorative-gradient`, `--chart-1..6`, `--chart-muted`.

### The gradient shape

Four stops, and the middle pair is deliberate:

```css
--decorative-gradient: linear-gradient(135deg,
  var(--decorative-hi) 9.7%,
  var(--primary) 51.6%,
  var(--primary) 51.6%,
  var(--decorative-deep) 90.3%);
```

Naming `--primary` twice gives the colour a **band** rather than a point. The six brands collapse it (51.6/51.6); **aiden holds a plateau at 44%/62%** because the blurple is the thing Aiden actually *is*, and as a single crossing point it had no room.

`decorative-deep` belongs at **90.3%**, not 51.6%. Reading "9.7 / 51.6 / 51.6" as the whole list drops the deep corner and invents a hard diagonal break the marks do not have. (The percentages come from projecting Figma's 0/0.52/1 stops onto the CSS gradient line for a square box — `0/52/100%` is the obvious guess and is wrong.)

---

## 7. Aiden — a surface, not a brand

Selected by `data-surface`, never appears in the brand picker, composes **inside** any theme.

**It takes the main brand's neutrals back.** Without this, an Aiden panel dropped into a tinted `db` page inherits db's tinted surfaces and repaints itself in another product's colour, tearing a hole in the page it is a guest in. Aiden's own product is a chat — a reading surface, where a tint is a liability.

```css
[data-surface='aiden'],
[data-mode='dark'] [data-surface='aiden'],
[data-mode='dark'][data-surface='aiden'],
[data-mode='light'] [data-surface='aiden'],
[data-mode='light'][data-surface='aiden'] {
  --card: var(--base-card);   /* …all 13 surfaces */
}
```

Re-pinning to `var(--base-*)` rather than literals means **one rule serves both modes** (the base layer already flips with `data-mode`). The recipe needed two.

All five selector forms are load-bearing: the tint derivations that would otherwise leak in are two-attribute compounds, so a bare one-attribute `[data-surface='aiden']` loses to them on specificity. These come later and match at equal specificity.

**No `--aiden-*` value changed** in this merge — the recipe copies the shipped gradients verbatim. Verify that before assuming.

---

## 8. Guardrails — build them *before* the tokens move

This is the single highest-leverage ordering decision in the merge.

### 8.1 Contrast checker: 2 contexts → 52

The old checker parsed only the two `[data-mode]` blocks, i.e. the un-themed, un-tinted neutrals — the one combination least likely to break. It would have reported PASS while a brand's muted text sat on its own tinted `--muted` below AA.

Now enumerates mode × theme × tint-page × tint-rail and reports the **worst** context per pairing. Brands are **discovered from the file**, so retiring one needs no edit.

The resolver had to grow: follow `var()` chains, evaluate `color-mix(in srgb, …)` numerically, evaluate `calc(N% * var(--tint-x, 0))`. Without those, every tinted surface resolves to `null` and is **skipped** — indistinguishable from passing.

**Gotcha — splitting a `color-mix` percentage.** A regex for "trailing `calc(...)` or `N%`" looks right and is not. On the sidebar's *nested* double mix it swallowed the inner `color-mix` as the percentage, `--sidebar` resolved to null, and **96 pairing/context combinations were silently skipped**.

Correct approach: split at the **last depth-0 space**. A fully-parenthesised value has none, which is exactly the signal that it carries no percentage.

```js
let depth = 0, cut = -1;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (ch === '(') depth++;
  else if (ch === ')') depth--;
  else if (depth === 0 && /\s/.test(ch)) cut = i;
}
```

### 8.2 What the matrix immediately found

Three real defects, none of which the old checker could see:

1. **`primary-foreground on primary` had never been checked.** `--primary: var(--primary-main)` defeated the old parser, so it was skipped, not passed. Worst is 4.53 (light/ec) — above AA, but thin.
2. **The 96 skipped combinations** above.
3. **`--category-indigo-text` fell to 4.18** on a tinted dark page — see §9.

### 8.3 Palette checker: per-brand chart gating

The neutral ramp's constraints do **not** transfer to brand palettes (one is a single hue interleaved through six lightness steps; the others are multi-hue). Set floors from **what the solved values achieve**, comfortably below the observed minimum, so it is a regression gate rather than a re-litigation of someone's tuning.

Shipped floors: adjacent-slot ΔE ≥ 12 (observed min 13.2), CVD ΔE ≥ 8 (the repo's existing constant).

---

## 9. Decisions taken, with their consequences

| Decision | Consequence |
|---|---|
| **`dr` and `ir` retired** | They had no solved anchors. Shipping them meant a scope where `--primary` swaps but surfaces/artwork/charts do not — a split system, worse than either half. Retiring is reversible with the same machinery. |
| **Tint opt-in, default plain** | No attribute → today's rendering, proven bit-identical. Consumers opt in at the app root. |
| **Per-brand `--chart-1..6` ship now** | `--chart-*` **silently stop being neutral slate** inside a theme scope. No token renamed, nothing errors — a silent behavioural change for any consumer expecting slate under a brand. Intended. |
| **`rm` → magenta, `nb` → grass green** | Any screenshot, marketing asset or printed swatch of those two is out of date. |
| **`--category-indigo-text` / `-violet-text` lightened (dark)** | Tinting the dark page lightens it, costing ~0.6 contrast. Indigo carried only 0.29 headroom and landed at 4.18 under **every** brand (4.18–4.27) — systemic, not one hue colliding. Violet sat at 4.52. Both took their palette's 300 step: indigo 6.26 tinted / 7.17 plain, violet 6.67 / 7.65. Contrast rises on untinted pages too, so nothing regresses. **They are the only two exceptions to "dark `-text` reuses the base hue."** |

---

## 10. Open findings — recorded, not fixed

These are pre-existing properties of solved palettes that nothing had ever measured. They are deferred to the charting rebuild. All three print on every `npm run test:palette` run so they cannot be forgotten.

| Finding | Detail |
|---|---|
| **`rm` dark CVD 6.3** | An adjacent chart-slot pair 6.3 apart under **protanopia**, below the repo's own floor of 8. A magenta/pink family is exactly where protan vision collapses. Listed in `CVD_RECORDED` — the run passes and prints it under "RECORDED, NOT FIXED". Lowering the floor to 6 would have made the gate decorative; hard-failing would block on a solved value. |
| **`rm` light muted separation 5.1** | `--chart-muted` sits 5.1 ΔE from its nearest slot — far tighter than any other brand (next is 9.7). Reported, not gated: a gate at 5 would be a gate in name only. |
| **`ec` dark slot 1 ≠ `--primary`** | The slot-1 invariant holds for 11 of 12 brand/mode pairs. Deliberate; recorded in `SLOT1_EXCEPTIONS`. |

---

## 11. Component-level changes

Three components needed edits, plus the new `Mark`. Everything else inherits through token remapping.

- **Sidebar** — hover and active painted the *same* `--sidebar-accent`, distinguishable only by `font-weight`. Now `color-mix(in srgb, var(--sidebar-accent) 55%, var(--sidebar))`.

  > **Gotcha, hit twice.** The first fix layered an `--opacity-50` gradient over the accent. It looks right and breaks the animation: the base is `background: transparent` with `transition: background`, so hover used to interpolate colour → colour; a gradient makes it `background-image: none → linear-gradient`, and **`background-image` cannot interpolate from `none`**. Every row snapped instead of fading. Keep it a colour.

- **Sidebar, second issue — a tinted region containing surfaces driven by a *different* multiplier.** This is the one to internalise; it will happen in any library that splits the tint into more than one switch.

  `.ui-sidebar__input` and the outline menu button paint with `--background`, tinted by `--tint-page`. The rail around them is `--sidebar`, tinted by `--tint-rail`. Independent switches, so `data-tint="rail"` alone moved the container and left its own contents behind. Measured in dark/nb: the field stayed at `15,23,42` while the rail went to `40,55,63`, widening the gap between them from **1.22:1 to 1.45:1** — the search box read as a hole punched in a lighter rail.

  Fixed by re-deriving the page surfaces on `.ui-sidebar__inner` with the *rail's* own percentages, so the field keeps its designed relationship to the rail (darker in dark, lighter in light) in every state:

  |  | off | rail | page+rail |
  |---|---|---|---|
  | before | 1.22 | **1.45** | 1.28 |
  | after | 1.22 | 1.23 | 1.23 |

  Scoped to `__inner` deliberately — `.ui-sidebar__inset` is the real content area beside the rail and must keep the true page surface (verified: still `15,23,42` under rail-only, `25,35,50` under page).

  > **Fix the whole class, not the instance you found.** The first pass re-derived `--background` alone, because the search field was the symptom in front of us. That is the wrong shape for a component other people compose into: anything a consumer renders in the rail sits *on* the rail — a Card, an Input, a Badge, a hover that paints `--accent`. `.ui-sidebar__trigger` was already doing exactly that, one file away. It is now an `@each` over the nine tintable page surfaces (`background card popover secondary accent muted input border border-hover`), which is also a smaller thing to keep correct than nine hand-written declarations.
  >
  > `--ring` is deliberately excluded: it is the focus indicator, the rail has its own `--sidebar-ring`, and a ring whose whole job is to stand out from its surroundings must not track them.
  >
  > Verified in both modes: 8/8 probed surfaces inside `__inner` move on `data-tint="rail"`, 0/8 move in `__inset`.

  > **The general rule: any region tinted by one multiplier that contains surfaces driven by another will diverge on the single-axis states, and the both-on state hides it.** That is why it only showed on one of four combinations and why nobody caught it during the POC. Audit every such region when you add a second tint switch.

- **Chart active marker** — `fill: var(--decorative-hi, currentColor)`. **The fallback is load-bearing**: outside a brand scope the token does not exist and the marker renders exactly as before. The POC also sets an unguarded `stroke: var(--primary)` there; that *would* change unthemed output, so it waits.

- **`Mark` — the consumer of `--decorative-gradient`, added 2026-08-08.** Phase A shipped the artwork anchors but nothing rendered them, so this is where the theming layer is finally load-bearing rather than latent. If you are porting this system, port the mark too: it is the payoff. Three notes that generalise beyond it.

  **The main brand has no `--decorative-*`, and you must not give it any.** They are defined only inside a brand scope, and the chart marker above depends on their *absence* to keep its neutral fallback. Feeding the mark by declaring `--decorative-hi` at `:root` would silently repaint every unthemed chart. The mark carries its own neutral `--mark-ramp` instead — same four-stop plateau geometry, walked down the slate scale.

  > **An undefined `var()` in a comma-separated `background-image` does not drop that one layer — it invalidates the WHOLE property.** So the tile painted `none`, and the glyph (`--primary-foreground`, near-white in light) disappeared with it. The unthemed mark rendered as an empty white square, which is the very first thing a consumer with no `data-theme` sees. Any multi-layer background built from themed tokens needs its fallback written per layer, and needs testing with the theme *absent*.

  **The glass is thirteen `--mark-*` tokens (plus `--mark-ramp`, the neutral fallback above — fourteen declarations in all), and four of them flip in dark.** They are whole gradients and whole shadow colours, not hex-plus-alpha — the same call `--shadow-*` already makes. The dark set is not the light set darkened: a specular highlight is *by definition* brighter than its surface, so on a pale tile the white stack stops existing and you read the shade the same lamp leaves on the opposite side. Bloom becomes occlusion; the sheen rises from the base instead of falling from the top.

  **The sheen's anchored edge may only ever move one way, and the direction inverts by mode.** Light: `(--my - 1)`, always ≤ 0. Dark: `(--my + 1)`, always ≥ 0. `transform-origin` sits on the anchored edge in both. The POC hit this three separate times in three different mechanisms (keyframes, tilt translate, dark geometry) — if you re-derive any of the mark's motion, test it at full pointer deflection in both modes, not at rest.

- **Docs stage** (`.ui-docs-stage`) — `contain: layout`. `position: relative` does **not** create a containing block for a `position: fixed` child; only `transform`, `filter`, `perspective` and `contain` do. Without it every fixed component escapes its card and pins to the iframe viewport — the Sidebar docs page rendered five sidebars stacked on the window edges over the prose. `contain: layout` is the cheapest of the four (no paint or size boundary). Covers Dialog, Drawer, Toast and Fab too.

---

## 11b. Storybook / tooling notes

Not part of the token system, but you will hit both if your library previews in Storybook.

**Changing a toolbar global reloads the docs iframe.** Measured: story (canvas) pages produce **zero** reloads on a globals change; docs pages produce exactly one, and the document genuinely reloads (a marker stamped on `contentWindow` does not survive). Ruled out as causes, each by experiment: our custom docs template (stock autodocs reloads too), `@storybook/addon-themes` (removed, still reloads), and the tint global specifically (`mode` and `theme` do it too). **It is stock Storybook 8.6 behaviour and is not fixable from configuration.** The only escape is a custom toolbar addon that sets the attributes directly and bypasses `globals` — which costs URL-shareable theme state. We chose to live with it.

**A pre-paint background must expire, or it fights the tint.** Because `tokens.scss` is imported from `preview.tsx`, it lives in the JS bundle: on that reload the document has no background until the bundle runs, and the browser paints white. `preview-head.html` closes the gap with an inline script (stamps `data-mode`/`data-theme`/`data-tint`, read from the **parent** URL — Storybook does not put globals in the iframe's own src) and an inline style with literal backgrounds.

  > **The trap, and it shipped for two commits.** Those literals were unscoped, so they never stopped applying — and they outranked the real rule: `html[data-mode='dark']` is (0,1,1) against `preview.scss`'s `html` at (0,0,1), and a `body` variant was worse at (0,1,2). With a page tint on, `<html>` and `<body>` froze at the literal while `#storybook-root` correctly resolved `var(--background)` and tinted. `#storybook-root` is sized to the story, so **every canvas story showed a tinted rectangle floating on an untinted page.** The fix is to gate the literals on `html:not([data-tokens-ready])` and stamp that attribute from `preview.tsx` immediately after the token imports. Any pre-paint fallback needs an expiry, not just a value.

---

## 12. Naming — two vocabularies for the same value

Figma names brands by **hue**, the code names them by **product**:

```
Slate = main    Indigo = db    Teal = dc    Cobalt = ec
Fern  = nb      Amber  = ph    Magenta = rm
```

The Figma Brand collection uses the left column as its mode names. `scripts/figma-variable-audit.js` cross-checks both directions. Keep this table anywhere either vocabulary appears.

---

## 13. Verification procedure

Run in this order. Steps 5 and 8 require a build first.

```bash
npx tsc --noEmit
npm run build
npm run test:tokens       # generator drift
npm run test:contrast     # 52 contexts
npm run test:palette      # neutral ramp + per-brand
npm run test:poc-css
npm run test:chart-a11y
npm run test:preview
```

### Two checks worth writing yourself

**Bit-identical proof.** Resolve every token that resolved on the baseline, in every pre-existing context, and assert equality. Static and dependency-free. This is what turns "the base layer is a no-op" from a claim into a fact.

> **Trap:** our proof printed only the first 60 diffs, and one context group filled that quota. Reading a filtered view of truncated output nearly produced a false "nothing changed." Remove the cap before drawing conclusions.

**Browser confirmation.** Static resolution can be wrong. Read `getComputedStyle` on a probe element across the axes:

```
light / db / tint OFF  →  --accent = 0.945098 0.960784 0.976471  ( = #f1f5f9 exactly)
light / db / tint ON   →  --accent = 0.858275 0.882431 0.918824
light / nb / tint ON   →  --accent = 0.859569 0.882314 0.896353   (differs per brand)
```

Themed-but-untinted routes through `color-mix(… 0% …)` and is **numerically identical** to the neutral — but it is no longer the literal *string*. Compare resolved colours, never serialized values.

---

## 14. Phase B — not started

- **Chart 7th slot** — `SERIES_SLOTS` in `src/utils/series.ts`, the `SeriesSlot` type, the ramp loop in `Chart.tsx`, `Bar.tsx`; add `--chart-7`.
- **Ordered ramps** — `--chart-seq-1..7`, `--chart-div-1..7`, and a `[data-chart-palette='sequential'|'diverging'|'line']` axis. Filtered out of the generator today.
- **Chart guardrails** — per-brand `check-chart-a11y`, ordered-ramp monotonicity.
- **Resolve the §10 findings** as part of the colour-theory rebuild.
- **Deferred visuals** — Card shadow stack, `.ui-sidebar__inner` gradient, `--surface-band`, marker `stroke`.
- **POC teardown** — delete v1 (`deeperThemingRecipe.ts`, `DeeperTheming.stories.tsx`, `DeeperThemingParts.tsx`); retire v2 once the generator's input moves to a data file; prune `check-poc-css.mjs`; retire `data-theme-poc2` / `data-brand`.

---

## 15. Commit trail

```
baec4e6  test(contrast): measure every theming context, not just the two modes
f051bbe  refactor(tokens): raw neutral base layer, and the tint multipliers
7a8aa34  refactor(tokens): retire the dr and ir theme scopes
ea27920  feat(tokens): brand identity, artwork and chart slots, generated from the recipe
f3fc26d  feat(tokens): the tint axis, and two category hues that could not afford it
f644f78  feat(tokens): aiden keeps the main brand's neutrals inside a tinted page
c965366  fix(sidebar,charts): hover stops matching active, and the marker takes the highlight
a0aa18f  test(palette): gate the brand chart palettes, and record what fails
97286b3  fix(sidebar,docs): hover fades again, and fixed components stay in their card
e62e8f3  docs(theming): the merge record, written for someone who was not here
7d7d5b2  docs: changelog entries for Sidebar and Charts, and CLAUDE.md catches up
9cb11cc  fix(sidebar): page surfaces inside the rail follow the rail's tint
351d0b0  fix(storybook): stop the docs preview flashing white on a toolbar change
df41169  fix(storybook): the pre-paint background must expire, and drop addon-themes
```

Then, after Phase A merged — the theming layer's first real consumer, and one more
instance of the same defect class:

```
431de85  fix(sidebar): every page surface inside the rail follows the rail's tint
831670c  feat(mark): the application mark becomes a real component
```

The ordering is deliberate: **guardrail first, then the refactor it protects, then the values.** The contrast resolver had to land before the base-layer refactor, because the refactor turns `--card: #ffffff` into `--card: var(--base-card)` and the old parser would have reported that as unresolved.

Everything up to `a0aa18f` is the merge. **Everything after it is defects the merge surfaced once real people looked at real screens** — a hover that no longer animated, a search field that stopped tracking its own container, a pre-paint fallback that outlived its purpose, and an unthemed mark that rendered as an empty white square. None were visible in the diff, in the guardrails, or in a static screenshot; two of them only appear on **one** of four tint combinations, and one only when **no** theme is applied. Budget for that phase — it is not optional polish, and it is where most of the real bugs were.

The pattern worth carrying: **a system with N independent axes has more default states than you will think to look at, and the plainest one — nothing switched on — is the one a new consumer sees first.**
