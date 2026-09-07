# Spacing

How space is defined in `@ui/lib`, and the rules for where each value goes. Two tiers:
a **primitive ramp** of numbers, and a **semantic layer** of named roles on top of it.
Components ask for roles; the ramp is where roles get their numbers.

The recipe that produces the tokens is `src/styles/spacingRecipe.ts`. The Storybook page
`Foundations / Semantic Spacing` renders it live; the Figma collections `Space` and
`Space · width` mirror it.

## 1 · The ramp

A 4px base with half-steps at the bottom: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32,
40, 48, 56, 64 … 384. In code it is `--p-N` (Tailwind's numbering: `--p-4` is 16px); in
Figma it is `spacing/N` in the Primitives collection. `--w-*` and `--h-*` carry the same
numbers for width and height — those are *sizing*, not spacing, and this document does
not govern them.

## 2 · The roles

A role names what the space is **between**. Three families, a few sizes each.

| Role | balanced | compact | spacious | Between |
|---|---|---|---|---|
| `--space-inline-xs` | 4 | 4 | 4 | an icon and its label; keycap glyphs |
| `--space-inline-sm` | 8 | 8 | 8 | items in a row: chips, badges, breadcrumb, button group |
| `--space-inline` | 12 | 8 | 16 | controls in a toolbar or a form row |
| `--space-inline-lg` | 16 → 24 | 12 → 16 | 24 → 32 | siblings that are separate objects: cards in a grid, columns |
| `--space-stack-xs` | 4 | 4 | 4 | a label and its control; a title and its description |
| `--space-stack-sm` | 8 | 8 | 8 | rows in a list or a menu; sections inside a screen |
| `--space-stack` | 16 | 16 | 16 | fields in a form; paragraphs |
| `--space-stack-lg` | 24 → 32 | same | same | blocks inside a card or a panel |
| `--space-stack-xl` | 40 → 64 | same | same | sections of a page |
| `--space-inset-sm` | 12 | 8 | 16 | tight surfaces: menu items, toasts, tooltips, chips |
| `--space-inset` | 16 | 12 | 20 | the default surface: card, dialog body, popover |
| `--space-inset-lg` | 24 → 32 | 16 → 24 | 32 → 40 | roomy surfaces: page containers, feature cards, empty states |
| `--space-page-x` | 24 → 48 | same | same | the page edge |
| `--space-gutter` | 16 → 24 | same | same | the grid gutter |

An arrow means the role is **fluid** (§4). Every number is a rung on the ramp.

Deliberately absent: `--space-card-padding`, `--space-button-x`. Component-specific
tokens are how a scale turns back into a hundred magic numbers with better names. A
component reads a role; if nothing expresses what it needs, question the design before
minting a token.

## 3 · Density

One switch, three settings: `compact · balanced · spacious`. Set `data-density` on
`<html>` or any subtree; **absence is balanced**, so nothing changes until a page opts
in. The same words the Chat family already uses for its `density` prop.

Density moves **inset and inline** one rung and **never moves stack** (rule 5). A compact
table tightens its cells; it does not push its rows together. That is what keeps compact
readable instead of cramped.

```html
<section data-density="compact">…</section>
```

## 4 · Fluid

Six layout-level roles breathe with available width: they slide smoothly between a
floor and a ceiling as the width grows from **1024px to 1920px**, and sit pinned outside
that range. No breakpoint, no jump.

```css
--space-stack-xl: clamp(var(--p-10), 0.7857rem + 2.6786vw, var(--p-16));
```

- Page-level roles (`stack-lg`, `stack-xl`, `inset-lg`, `page-x`) follow the
  **viewport** (`vw`).
- Grid roles (`inline-lg`, `gutter`) follow the nearest **container** (`cqi`), so a card
  grid beside a sidebar on a big monitor gets the gap for the room it actually has. The
  grid's wrapper declares `container-type: inline-size`; without one, `cqi` falls back to
  the viewport.
- The `rem` term is not decoration: a pure `vw` expression ignores browser zoom and fails
  WCAG 1.4.4.
- Everything at 16 and below is fixed. An icon-to-label gap that drifts a pixel as the
  window resizes looks like a bug.

`--fluid-min-width` and `--fluid-max-width` publish the two widths for reading. The
clamp arithmetic is generated (`npm run tokens:gen`) and checked (`npm run test:tokens`);
do not hand-edit the block in `tokens.scss`.

## 5 · The rules

1. **The base unit is 4px; the working unit is 8px.** The half-steps (2, 6, 10, 14) are
   primitive-only: legal inside a component's own geometry, never for space between
   components.
2. **inline < stack < inset** at the same size name. A layout that violates the ordering
   has the wrong role, not the wrong number.
3. **Space belongs to the container, never to the child.** A surface sets its inset and
   its stack gap; children carry no margin.
4. **Stack steps one role per level of hierarchy.** Label → control `xs`, field → field
   `stack`, group → group `lg`, section → section `xl`. Needing to skip two levels is the
   tell that a heading is missing.
5. **Density scales inset and inline, never stack.**
6. **Negative space is geometry, not spacing.** ButtonGroup's and ToggleGroup's `-1`
   overlap and AvatarGroup's stack stay raw.
7. **Off-scale is a decision, not a rounding error.** Mark's 0.225 artwork ratio is the
   recorded exception. Anything new that cannot take a role gets a comment saying why; a
   bare number without one is a lint finding.
8. **Doc pages follow the same roles.** Specimen bands at `stack-lg`, component-set
   grids at `inline-lg`.

## 6 · Where the boundary is — Card, the worked example

A component's **own geometry** stays on the ramp: Button's padding at each size, a
checkbox's 2px offset, Card's title → description rhythm of 6px, its 12px body gap. That
is the component being itself.

The **inside edge of a surface** is a role. Card's header, body and footer read
`--space-inset`, so a default-size card follows density. Its `sm / lg / xl / 2xl` size
blocks set `padding` per rung as before: **an explicit size pins geometry; density applies
to the default size.** Card migrates exactly three declarations, and that is the point —
it shows where the tiers meet on one component.

Migration of other components and of the screen pages happens one at a time. A primitive
binding is still a correct binding while a page waits its turn; the lint reports a
primitive bound on a *screen* as advisory until the tier check is made strict.

## 7 · In Figma

- **`Space`** — modes `compact · balanced · spacious`, default balanced. Fourteen
  `space/*` variables, scoped to gap and padding. Fixed roles alias `spacing/N`; fluid
  roles alias into the width collection.
- **`Space · width`** — modes `1024 · 1920`, default 1024. One variable per fluid role
  per density, each mode aliasing the floor or the ceiling rung.
- Figma cannot render the in-between; the two modes show the two ends, and each fluid
  variable's description states the clamp.
- Handing off: bind a gap to a role and Dev Mode reports the role's name, which is also
  the CSS token. Pin a frame's modes to what it was designed at. Where a value cannot take
  a role (rules 6 and 7), leave a note on the layer.

## 8 · Not covered here

A responsive layout system — named window sizes, Grid / Stack / Container primitives,
per-component responsive behaviour — is separate and larger. The `768` mobile breakpoint
(`useIsMobile`, `SIDEBAR_MOBILE_BREAKPOINT`, two `767px` literals) is a *layout* swap, not
spacing, and is unchanged by this document.
