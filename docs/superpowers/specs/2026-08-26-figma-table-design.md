# Table — Figma component page (design spec)

**Date:** 2026-08-26
**Status:** approved by owner, not yet built
**Scope:** Figma only. There is no `src/components/Table/` and none is planned in this pass.

---

## 1 · What this is, and what it is not

A full data table — sortable headers, row selection, a density axis, row hover with
trailing row actions, plus toolbar / footer / empty / loading chrome — built as a page in
the design-system file `jzc2ME8xVmfX1V8OCt2HC2`, to template v4.

**It is a proposal, not a mirror.** Every other one of the 62 component pages documents
code that exists; this one documents code that does not. The page must say so on itself
(§7). Without that label a designer builds a screen against a component no developer can
import — the playbook's "a plausible-looking mock is a bug waiting to be built".

Verified before writing this spec: no `Table` in `src/components/`, no Table page in the
Figma file, no table in any `src/prototypes/` screen, no `table` entry in the ledger.

## 2 · The mechanical constraint: row-major, fixed-width cells

Figma offers two ways to build a grid, and they are mutually exclusive:

| | Columns align | Row-level fill (hover / selected / divider) |
|---|---|---|
| Column-major — cells stacked into columns, columns into a row | Free; each column hugs its widest cell | **Impossible.** No row node exists to carry a fill. |
| Row-major — cells into a row, rows stacked | Only if every cell in a column shares a fixed width | Yes. The row is a real node. |

Row hover and row selection are both in scope, so **row-major**. Column width is therefore
a *convention stated on the page*, not something Figma enforces. The Spec frame states it
explicitly as the first anatomy note — it is the first thing a designer will trip on.

## 3 · The assembly is a template frame, not a component

Direct application of the recorded Sidebar/Chat lesson (`figma-ledger.json`, lessons):

> Figma has NO arbitrary-children slot … an assembled "template" whose list must be
> extendable should be a plain FRAME, not a component.

A table whose rows and columns cannot be added is useless. So:

- **Atoms stay linked components** — cells update centrally from the library.
- **The assembled Table is a detached template frame** (`detachInstance()` on an assembled
  instance, which preserves every variable binding and keeps nested atom instances linked)
  — an open auto-layout the designer copies, extends and reorders.

Rejected alternative: one locked `Table` set with N pre-provisioned rows toggled by
booleans. It is how instances fake children elsewhere in this file, but a fixed row ceiling
on a *data table* is the wrong ceiling.

## 4 · Component sets — three, 45 variants

| Set | Axes | Variants |
|---|---|---|
| `Table/HeaderCell` | Density (`sm`·`default`·`lg`) × Sort (`none`·`asc`·`desc`) × Align (`left`·`right`) | 18 |
| `Table/Cell` | Density (3) × Content (`text`·`numeric`·`badge`·`avatar`·`code`·`actions`) | 18 |
| `Table/SelectionCell` | Density (3) × State (`off`·`on`·`indeterminate`) | 9 |

**`Row` is deliberately not a component.** It is the extendable container; modelling a
layout container whose content is arbitrary produces an empty box a designer cannot use —
the same judgement that gives InputGroup's five layout exports zero component sets.

**Row states are painted in the Spec table, not modelled as variants** — hover, selected,
disabled, focus. This is the Card precedent ("states live in the Spec table, not as
variants") and is what holds the count at 45 rather than several hundred.

### Density values

The library has **one** size scale — `xs`/`sm`/`default`/`lg`. The owner's original
phrasing was compact/default/comfortable; that would be a second vocabulary, which a hard
break on 2026-07-30 deleted the last of. Approved change: ship the existing rungs.

| Density | Row height | Cell padding (block / inline) |
|---|---|---|
| `sm` | 36px — `--h-9` | `--p-2` / `--p-3` |
| `default` | 44px — `--h-11` | `--p-3` / `--p-4` |
| `lg` | 56px — `--h-14` | `--p-4` / `--p-4` |

All six tokens verified present in `src/styles/tokens.scss`.

### Cells compose shipped sets — never hand-drawn

A sub-part that has its own code component gets an instance, not a redrawn copy.
Verified set IDs:

| Content option | Instance of | Set ID |
|---|---|---|
| `badge` | Badge | `236:70` |
| `avatar` | Avatar | `254:69` |
| `code` | Code (inline) | `252:35` |
| `actions` | DropdownMenu trigger | `544:63` |
| selection | Checkbox | `215:183` |

Toolbar / footer / empty / loading compose `Input` `192:281`, `ToggleGroup` `344:101`,
`DropdownMenu` `544:63`, `Pagination` `483:49`, `Empty` `430:75`, `Skeleton` `244:883`.

## 5 · Colour

| Part | Token | Variable | Reasoning |
|---|---|---|---|
| Header surface | `--secondary` | `color/secondary` `2:5` | **Not `--muted`.** Header labels are `--muted-foreground`; CLAUDE.md forbids that pairing (5.1:1). On `--secondary` it measures 6.15:1 light / 11.87:1 dark. |
| Header label | `--muted-foreground` | `color/muted-foreground` `2:8` | |
| Body surface | `--card` | `color/card` `2:11` | In-flow surface, per the surface rule. |
| Row divider | `--border` | `color/border` `2:15` | Hairlines, **no zebra striping** — a stripe fill would fight the selected tint. |
| Row hover | `--accent` | `color/accent` `2:9` | Neutral, so hover never competes with selection. |
| Row selected | `--primary-light` | Brand → `primary-light` `2:47` | The 6% subtle tint, exactly its documented purpose. **Themes.** |
| Checked checkbox | `--primary` | Brand → `primary` `2:44` | Comes free from the Checkbox instance. |

Selection reads `--primary`, so the **Theming frame is required** — 7 brand modes
(Slate·Indigo·Teal·Cobalt·Fern·Amber·Magenta) × light/dark.

Brand-coloured usage binds to the **Brand** collection, never to `Mode → brand/main/*`,
or the brand modes will not flip the component.

## 6 · Page structure — template v4, unchanged

Frames left→right, top-aligned `y=80`, gap `80`, width 1280 (Spec wider if measured
overflow demands it — check row content against the table's inner padding, not just the
card).

### Overview
`_Doc/PageHeader` → chips: `Composite · data display` / `compound` / `45 variants` /
**`⚠ proposal — not in src/`** (replacing the source-path chip; see §7) → sep →
COMPOSITION section (`Uses inside →` Checkbox·Badge·Avatar·Code·DropdownMenu·Pagination·
Empty·Skeleton; `Used by →` none yet; `Props →` the modelled axes) → sep → the three
component sets nested in-frame.

### Spec — anatomy × states
Section header → **the column-width convention note first** (§2) → density strip →
sep → `Light + Dark` wrapper holding two tables side by side (`Spec table — Light`,
`Spec table — Dark`; the dark one takes an explicit Mode=Dark override plus a caption).
Rows = row states (default · hover · selected · selected+hover · disabled);
groups delimited by `_Doc/SeparatorLabeled`. Plus a header-cell sort strip
(none/asc/desc) and the **cell content gallery** (all six content options at `default`).

**Focus is not a row state.** A `<tr>` in a plain `<table>` is not focusable — focus lives
on the interactive children. The Spec frame carries a separate *focus strip* showing the
ring on the three things that actually take it: the sort header button, the selection
checkbox, and the row-actions trigger.

### Theming
Section + "Try it: select any frame → Appearance panel → set Brand or Mode" caption →
header row of 7 brand codes → Light row + Dark row of cells, each a `color/background`
frame with an explicit Brand (+ Mode=Dark on row 2) override, containing one selected
row instance.

### Examples · Docs · History
Light bar + identical dark bar holding four assembled compositions — **toolbar**
(Input + ToggleGroup + column-visibility DropdownMenu), **footer** (count readout +
Pagination), **empty** (Empty inside the body), **loading** (Skeleton rows) → sep →
TOKENS section → sep → two `_Doc/DoDont` rows → sep → A11y contract → sep →
VERSION HISTORY seeded `1.0 · 2026-08-26 · — · Initial doc page`.

### A11y contract to state on the page
Semantic `<table>` / `<thead>` / `<tbody>` / `<th scope="col">`; sortable header is a
`<button>` inside the `<th>` carrying `aria-sort` (`none`/`ascending`/`descending`);
select-all checkbox uses the indeterminate state for a partial selection; row actions stay
in the tab order (revealed by `opacity`, never `display: none` — the TabBar close-button
rule); the selected tint is decorative, so selection must not be signalled by colour alone.

**Selection is conveyed by the checkbox, not by `aria-selected` on the row.** `aria-selected`
is only valid on a `row` inside `role="grid"`/`treegrid`; putting it on a `<tr>` in a plain
`<table>` is invalid ARIA that screen readers ignore. If a future code build adopts
`role="grid"` for full keyboard grid navigation, `aria-selected` becomes correct and this
contract changes with it — the page says which model it is documenting.

## 7 · The honesty label

Two markers, both required:

1. The Overview chip that would normally read `src/components/Table` reads
   **`⚠ proposal — not in src/`** instead.
2. A `_Doc/SeparatorLabeled` reading **`PROPOSAL — NOT BUILT IN CODE`** directly above the
   component sets, with a note beneath: what a developer would actually get today
   (nothing), and that the axes here are the proposed API.

Precedent: the Code page's `REQUIRES A TOKENIZER, NOT BUILT` separator, and the retired
POC pages' rule that a page documenting a candidate must say so.

## 8 · Filing and ship gate

- Page named **`Table`**, filed **alphabetically** in the `Components` section, between
  `Switch` and `TabBar`.
- Index row added on the component index board and hyperlinked to the page id.
- Every set gets a description (part of the lint).
- **Ship gate — design-check lint must be all zeros:** unbound solid fills/strokes; TEXT
  without `textStyleId`; generic layer names; unbound non-zero padding/radius; COMPONENT /
  COMPONENT_SET without a description. Plus a recursive overflow check.
- Ledger updated with `pageId`, `setIds`, status, version, and any new lessons.

## 9 · Build-order notes (traps that apply to this page specifically)

- **One page per `use_figma` script.** Scripts are atomic; one thrown error rolls back
  everything, including finished work elsewhere.
- **`createAutoLayout`/`createFrame` default to an opaque white fill** — set `fills = []`
  on every generated row / cell / wrapper frame, or the dark spec table renders a white
  band. This bites hardest on a table, which is almost entirely generated layout frames.
- **`createAutoLayout` defaults `clipsContent = true`** — unclip cells or focus rings get
  cut.
- **Horizontal auto-layout: `counterAxisSizingMode='FIXED'` freezes height.** For a
  fixed-width, hug-height row use `primaryAxisSizingMode='FIXED'` +
  `counterAxisSizingMode='AUTO'`. The axes flip on a vertical frame.
- **Set `layoutSizing*` after parenting** — assigned before `appendChild` they are reset.
- **`appendChild()` returns void** — use an `add(parent, node, fill)` helper.
- **Icons below 24px need stroke `2 × size ÷ 24`** — the sort chevron at 16px is 1.33.
- **Check overflow recursively**, and measure row content against the table's inner
  padding, not just the card bounds.
