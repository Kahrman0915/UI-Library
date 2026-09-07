# Spacing

How space is defined in `@ui/lib`, and the rule for where each value goes. Two tiers: a
**primitive ramp** of numbers, and a **ladder** of five levels on top of it. Containers
ask for a level; the ramp is where levels get their numbers.

The recipe is `src/styles/spacingRecipe.ts`. The Storybook page `Foundations / Spacing
Ladder` renders it live; the Figma collections `Space` and `Space · width` mirror it, and
the 📐 Spacing guide page in the Figma file explains it for designers.

## 1 · The ramp

A 4px base with half-steps at the bottom: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32,
40, 48, 56, 64 … 384. In code it is `--p-N` (Tailwind's numbering: `--p-4` is 16px); in
Figma it is `spacing/N` in the Primitives collection. `--w-*` and `--h-*` carry the same
numbers for width and height — those are *sizing*, and this document does not govern them.

## 2 · The ladder

A container's gap or padding is a **level**, assigned by where the container sits in the
hierarchy. Each level down is one step down the ladder.

| Level | Code | Figma | balanced | compact | spacious | What sits at it |
|---|---|---|---|---|---|---|
| **1 · page** | `--space-1` | `space/1-page` | 32 → 48 | 24 → 36 | 40 → 64 | page margin; between the page header and the content |
| **2 · section** | `--space-2` | `space/2-section` | 24 → 36 | 12 → 20 | 32 → 48 | between sections; between a section heading and its grid |
| **3 · block** | `--space-3` | `space/3-block` | 16 → 24 | 8 → 12 | 24 → 36 | grid gap; card padding |
| **4 · element** | `--space-4` | `space/4-element` | 8 → 12 | 6 → 8 | 12 → 20 | inside a card: header → item, row → row; toolbar gaps |
| **5 · micro** | `--space-5` | `space/5-micro` | 4 → 6 | 2 → 4 | 6 → 8 | icon → label; title → subtitle |

Each cell reads *value at 1024 → value at 1920*. Every number is a rung on the ramp. The
1024 columns are the owner's tables (2026-09-07). **The 1920 column is the 1024 column
× 1.5** — one multiplier, so the ladder keeps exactly the same shape at every width;
balanced is exact, compact and spacious snap to the nearest rung (36 / 20 / 12 / 8 / 4 and
64 / 48 / 36 / 20 / 8). Change them in the recipe.

There are deliberately no named tokens like `--space-card-padding`. A card's padding *is*
level 3; naming it separately is how a scale turns back into magic numbers.

## 3 · Width: the whole ladder slides

Every level is a `clamp()` between its two ends, solved so the value equals the small
ladder at 1024px and the large ladder at 1920px of viewport width, and pinned outside
that range. Because every level slides on the same width, **the ladder stays in
proportion at every size** — no gap ever moves alone. A user pulling a window in from a
big monitor sees the grid gap ease from 24 to 16 with no jump.

```css
--space-3: clamp(var(--p-4), 0.4286rem + 0.8929vw, var(--p-6));
```

The `rem` term is not decoration: a pure `vw` expression ignores browser zoom and fails
WCAG 1.4.4. The arithmetic is generated (`npm run tokens:gen`) and drift-checked
(`npm run test:tokens`); never hand-edit the block in `tokens.scss`.

Fluid spacing smooths the *space around things*. It does not reflow *layout*: a grid going
from seven cards per row to four still happens where the cards stop fitting. Using the
width — wider columns, more cards per row, side-by-side panels — is the job of the layout
components, not of the ladder.

## 4 · Density: the ladder reshapes

One switch, three settings: `compact · balanced · spacious`. Set `data-density` on
`<html>` or any subtree; **absence is balanced**. The whole ladder takes the matching
column of the table, so a compact user gets a compact page everywhere, and a compact
user on a big monitor still slides smoothly — between compact's two ends.

```html
<html data-density="compact">
```

Density is a user preference in the product, one attribute in code, and one mode on the
frame in Figma. The three columns are authored, not derived: compact is a manager who
wants more on screen; spacious is for people who already zoom.

## 5 · The rules

1. **Assign a level, never a number.** Ask where the container sits: page, section,
   block, element, micro. If two things at the same depth want different gaps, one of them
   is at the wrong depth.
2. **Each level down is one step down.** Needing to skip a level is the tell that a
   heading or a grouping is missing.
3. **Space belongs to the container, never to the child.** A surface sets its padding and
   its gap; children carry no margin.
4. **The ladder moves as one.** Nothing is fluid on its own and nothing is dense on its
   own; a gap that must not move with width or density is component geometry (rule 5).
5. **A component's own geometry stays on the ramp.** Button's padding at each size, a
   checkbox's 2px offset, Card's 6px title rhythm, its 12px body gap: the component being
   itself, expressed as `--p-N`. Only the space a *layout composes* takes a level.
6. **Negative space is geometry, not spacing.** ButtonGroup's and ToggleGroup's `-1`
   overlap and AvatarGroup's stack stay raw.
7. **Off-scale is a decision, not a rounding error.** Mark's 0.225 artwork ratio is the
   recorded exception; anything new that cannot take a level gets a comment saying why.

## 6 · Where the boundary is — Card, the worked example

Card's header, body and footer read `--space-3` (block), so a default-size card follows
density and slides with width. Its `sm / lg / xl / 2xl` size blocks set `padding` per rung
as before — **an explicit size pins geometry; the ladder applies to the default size** —
and its gaps stay primitive because they are the card's own rhythm. Card migrates exactly
three declarations, and that is the point: it shows where the tiers meet on one component.

## 7 · Layout components carry the levels

The way a team applies this consistently is not by everyone remembering the table. It is
by the layout components deciding. All five exist, in code and in Figma (each Figma master
has real Slots for its content):

| Component | Levels it carries | In Figma |
|---|---|---|
| `PageContainer` | L1: page margin, and page header → content | `Width` variants (each with a matching max-width, so a FILL instance caps and centres like the CSS); `Page header` + `Content` slots |
| `PageHeader` | L5 title → description · L4 between actions · L3 text ↔ actions · L2 row → toolbar | `With toolbar` variants; `Title`/`Description` text, `Actions` + `Toolbar` slots |
| `Section` | L2 heading → content (`default`) · L4 label → content (`group`) | `Variant` variants; `Heading` text, `Actions` + `Content` slots |
| `Stack` | the level you give it; a wrapping horizontal Stack is the grid | `Level × Direction` variants; `Children` slot |
| `Toolbar` + `ToolbarGroup` | L3 between groups · L4 inside a group | `Justify` variants; `Leading group` + `Trailing group` slots, a `Middle group` slot behind `Show middle group` for a second filter axis, plus a `Toolbar/Group` part |

A page is `PageContainer › PageHeader › Stack level 2 › Section › Stack level 3 › Card`.
Proven on the Figma page **📐 Spacing · applied to built screens**: both duplicated flow
screens are now composed from these five at 1024 and 1920, nothing hand-spaced.
A screen built from them makes one decision per container — which level — and none
about pixels. The page's search field goes in `PageHeader`'s `toolbar`, never as a
sibling in the section stack: that sibling gap is the one that read wrong at 1920.

## 8 · In Figma

- **`Space`** — modes `balanced · compact · spacious`, default balanced. `space/1-page` …
  `space/5-micro`, scoped to gap and padding. Bind a container's gap or padding to its level.
- **`Space · width`** — modes `1024 · 1920`, default 1024. Holds each level's two ends per
  density (`fluid/N-name/density`); the target of `Space`, not for direct use.
- Figma shows the two ends; the browser slides between them. Pin a frame's modes only when
  the frame is meant to show that state; a working screen stays on Auto.
- Handing off: Dev Mode reports `space/3-block`, and the developer types `--space-3`.

## 9 · Not covered here

A responsive layout system — named window sizes, how the layout components in §7
behave at small widths — is separate and larger, and it is where the
width gets *used* rather than padded. The `768` mobile breakpoint (`useIsMobile`,
`SIDEBAR_MOBILE_BREAKPOINT`, two `767px` literals) is a layout swap, not spacing.
