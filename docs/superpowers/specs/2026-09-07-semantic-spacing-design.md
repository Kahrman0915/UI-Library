# Semantic spacing, density and fluid spacing — design

Owner decisions, 2026-09-07: fluid range **1024 → 1920**; container units for grid
roles, viewport units for page roles; density vocabulary **compact · balanced ·
spacious** (Chat's existing words); scope is **the layer, the rules, Figma, the lint,
and Card as the one exemplar**. Migration of other components and the screen pages is a
separate, incremental job.

## What this is

A named vocabulary of spacing *roles* on top of the existing 4px primitive ramp
(`--p-*` in code, `spacing/*` in Figma). The ramp does not change. A role points at a
rung; a component or a screen asks for a role, never a number.

Three families, named by what the space is *between*:

- **inline** — things side by side
- **stack** — things one above another
- **inset** — the inside edge of a container

## The roles

| Role | balanced | compact | spacious | fluid |
|---|---|---|---|---|
| `inline-xs` · `stack-xs` | 4 | 4 | 4 | — |
| `inline-sm` · `stack-sm` | 8 | 8 | 8 | — |
| `inline` | 12 | 8 | 16 | — |
| `inline-lg` | 16 → 24 | 12 → 16 | 24 → 32 | cqi |
| `stack` | 16 | 16 | 16 | — |
| `stack-lg` | 24 → 32 | same | same | vw |
| `stack-xl` | 32 → 48 | same | same | vw |
| `inset-sm` | 12 | 8 | 16 | — |
| `inset` | 16 | 12 | 20 | — |
| `inset-lg` | 24 → 32 | 16 → 24 | 32 → 40 | vw |
| `page-x` | 24 → 48 | same | same | vw |
| `gutter` | 16 → 24 | same | same | cqi |

Every endpoint is a primitive rung. Density moves **inset and inline** one rung and
never moves **stack**. Fluid applies to six layout-level roles only; everything at 16
and below is fixed.

## Code

- `scripts/generate-spacing-tokens.mjs` holds the recipe and emits one generated region
  in `src/styles/tokens.scss` (markers `@generated spacing-semantic`): a `:root` block
  (balanced values plus `--fluid-min-width` / `--fluid-max-width`) and two scope blocks,
  `[data-density='compact']` and `[data-density='spacious']`, that re-emit only the roles
  that move. Absence of the attribute is balanced (opt-in, like `data-tint`).
- Fluid tokens are `clamp(var(--p-min), A rem + B unit, var(--p-max))`, slope and
  intercept solved so the expression equals the floor at 1024 and the ceiling at 1920.
  The `rem` term keeps browser zoom working (WCAG 1.4.4).
- `npm run tokens:gen` writes; `npm run test:tokens` checks for drift and fails the build.
- **Exemplar:** Card's header, body and footer `padding` → `--space-inset`. Its gaps
  (body 12, footer 8, header 16, title→description 6) and every size-ramp value stay
  primitive, because they are the component's own geometry; an explicit size pins
  geometry, density applies to the default size.

## Figma

- Collection **`Space`** — modes `compact · balanced · spacious`, default balanced.
  Fourteen `space/*` variables scoped GAP. Fixed roles alias `spacing/N`; fluid roles
  alias into the width collection.
- Collection **`Space · width`** — modes `1024 · 1920`, default 1024. One variable per
  fluid role per density (`fluid/{role}/{density}`), each mode aliasing the floor or
  ceiling rung.
- Each variable's description states its job; fluid ones also state the clamp.
- The **Spacing & sizing** page gains a Semantic section: the roles table, the rules,
  and one specimen row per density × width.
- Card master: `Size=default` variants' padding → `space/inset`; body gap → `space/stack`.

## Rules (`docs/spacing.md`)

1. Base unit 4, working unit 8. Half-steps are primitive-only.
2. inline < stack < inset at the same size name.
3. Space belongs to the container, never to the child.
4. Stack steps one role per level of hierarchy.
5. Density scales inset and inline, never stack.
6. Negative space is geometry, not spacing.
7. Off-scale is a decision with a comment, and a lint finding without one.
8. Doc pages follow the same roles (bands `stack-lg`, set grids `inline-lg`).

## Lint

`scripts/figma-design-check.js` gains a `primitiveBinding` bucket: geometry on a screen
or example frame bound to `spacing/*` rather than `space/*`. Advisory (outside
`allZero`) until `strictTiers: true`.

## Out of scope, recorded

A responsive layout system (named window sizes, Grid/Stack/Container primitives,
per-component responsive behaviour). Unifying the `768` mobile breakpoint's three
expressions. Whether Chat's `density` prop should default from `data-density`. Whether
density should scale a component's size ramp rather than pin at explicit sizes.

## Acceptance

`tsc`, `build`, `test:tokens`, `test:contrast` green. Card renders byte-identically at
balanced/1024. Computed values measured in a browser at 1024 / 1440 / 1920 and under each
density match the recipe. Figma: both collections exist with the stated modes, every
variable resolves to a primitive rung, the Spacing & sizing page lints at all zeros.

---

## Revision, later the same day: the ladder replaces the roles

The owner tried the fluid roles on the Request Flow @1920 proofs and rejected the result:
one gap grew while its neighbours stood still. Their own example (Figma Page 109) showed
the intent — a **ladder of five hierarchy levels** where the *whole* ladder steps with
width and reshapes per density, and where at 1920 the width is *used* (more cards per
row), not padded.

**Model.** Five levels (`--space-1` page … `--space-5` micro; Figma `space/N-name`). A
container's gap or padding is the level it sits at; each level down is one step down.
Owner's tables, per density, as `1024 → 1920`: balanced 32→64 / 24→32 / 16→24 / 8→12 / 4;
compact 24→32 / 12→24 / 8→12 / 6→8 / 2; spacious 40→64 / 32→40 / 24→32 / 12→16 / 6.
Every level is a `clamp()` between its two ends, all on `vw`, so the ladder stays in
proportion at every width. The fourteen relationship roles and their `cqi` grid roles are
withdrawn.

**What changed.** Recipe, generator and generated block; Card's padding → `--space-3`;
the Storybook page (`Foundations / Spacing Ladder`); `docs/spacing.md`. In Figma: the
level variables, the 534 flow-page bindings remapped (zero-delta at balanced · 1024),
Card's master, the Spacing & sizing section, the guide page; the 32 role variables deleted
after a file-wide check found zero references.

**Still open.** The layout components that carry levels (PageContainer, PageHeader,
Section, Grid, Stack, Toolbar); the header → search relationship on the flow screens,
which the ladder puts at L1 with the section gaps until a PageHeader exists; the strict
lint tier.
