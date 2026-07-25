# Figma design-system playbook — template v4 (LOCKED)

> **Read this before touching the Figma file.** It is everything a fresh session needs
> to build the next component page *exactly* like `1 · Button`, without any prior
> conversation context. Machine state (per-component status, queue) lives in
> [`figma-ledger.json`](./figma-ledger.json) — update it after every shipped page.
> The template shape is **owner-approved and locked**; don't redesign it without asking.

- **File:** `jzc2ME8xVmfX1V8OCt2HC2` (owner may rename it "@ui/lib — Design System" —
  the API cannot; `figma.root.name` is read-only).
- **Tooling:** the `use_figma` MCP tool (load the `figma-use` skill first, every session).
- **Status:** 7/57 done. Phase 1: Button 1.5, Spinner 1.1, Label 1.0, Input 1.0, Textarea 1.0, NativeSelect 1.0, InputGroup 1.0 — only InputOTP left. Phase queue in the ledger.

### Adapting the recipe to non-interactive components

The four frames are the shape, not a straitjacket. Spinner set the precedent: it has
**no hover / focus / disabled** (it isn't focusable), so its Spec frame is
**sizes × colour contexts** instead of states, plus a **rotation-phase strip** (0/90/
180/270°) because Figma can't play the animation. Keep the frame *names* and the
light/dark side-by-side structure; swap the axes for whatever actually varies. Say
plainly in the Section description why the axes differ — that sentence is what teaches
the reader.

**Icons:** build lucide glyphs with `figma.createNodeFromSvg(...)` using the real path
data, then `rescale(size/24)` so the stroke keeps lucide's 2÷24 ratio. Name the inner
vector (`loader-arc`) or the lint flags it.

**Don't draw what isn't ours.** Where the browser or OS owns the rendering — a native
`<select>`'s open list, a date picker's calendar, an autofill dropdown — omit the frame
and say why in its place. NativeSelect's Spec ends with a "THE OPEN STATE — NOT DRAWN
HERE" note explaining that Chrome-on-Windows, Safari-on-macOS and the iOS wheel all
differ, so mocking one would document a lie. A stated boundary is documentation; a
plausible-looking mock is a bug waiting to be built.

---

### Compound families — model only what has visual decisions

A family's export count is not its component count. InputGroup ships six exports but
gets **one** component set (`InputGroup/Button`, 16 variants) because the other five —
Addon, Text, Input, Textarea, and the root — are *layout containers*: their look comes
entirely from the shared wrap plus their own padding, and their content is arbitrary.
Modelling them as components would produce empty boxes a designer can't use.

Document those as **slots + a composition gallery** instead: a labelled diagram of the
positions (InputGroup's Spec shows the CSS `order: 0…4` stack with each slot named),
then assembled real-world arrangements in Examples. Designers copy compositions, not
empty containers. Apply the same judgement to Chat, Sidebar, Item and Field.

## File structure (page list)

```
📖 Start Here                              165:506   ← newcomer cover; don't rebuild
✅ Rebuild Order — 57 components …          125:180   ← THE INDEX; link each shipped page
───  Phase 1 · Hubs  ───                   165:632   ← divider pages (empty)
1 · Button                                 0:1       ← the reference implementation
───  Phase 2 · Atoms  ───                  165:633
───  Phase 3 · Composites  ───             165:634
───  Phase 4 · Floating  ───               165:635
───  Phase 5 · Integrators  ───            165:636
⏳ Banner + Alert sets (migrate in Ph. 3)   14:60     ← existing sets; fold into their pages
_Template                                  146:122   ← _Doc/* masters live here
🗑 Archive / 🗑 Aiden handoff                144:180 / 116:180  ← owner deletes
```

New component pages are named `{phase} · {Name}` and inserted directly under their
phase divider (`figma.root.insertChild`). After shipping a page, find its name on the
index board (`125:183`) and set `text.hyperlink = { type:'NODE', value: pageId }` +
underline.

## The v4 page recipe

Frames **left → right**, top-aligned at `y=80`, gap `80`, width 1280 (Spec is wider).
Frame names carry **no prefix** — exactly: `Overview`, `Spec — matrix × states`,
`Theming`, `Examples · Docs · History`.

Cards are **plain auto-layout frames** styled like `_Doc/Card` (fill `color/card`,
stroke `color/border`, radius `radius/xl`, padding `spacing/8`, gap `spacing/6`,
`clipsContent=false`). **Never instance `_Doc/Card`** — instances can't take children.
`_Doc/Separator` instances (`layoutSizingHorizontal='FILL'`) divide sub-sections.

### 1 · Overview
`_Doc/PageHeader` (Title, Description, 4 chips: `Phase N · role` / `primitive|compound`
/ `N variants` / `src/components/{Name}`; hide unused chips) → sep →
**COMPOSITION section** ("What's inside · where it's used") →
`Uses inside →` TokenPills (internal deps) → `Used by →` Chips (reverse deps — mine
CLAUDE.md's composition notes) → `Props →` one line of TokenPills (just the set-modeled
props + one `⚠ code-only: …` pill) → annotation pointing at `{Name}.types.ts` → sep →
**the component set itself, nested inside the frame** (appendChild works on sets).
**No full props table — owner explicitly cut it.**

### 2 · Spec — matrix × states  *(owner's layout — keep exactly)*
Section header → **sizes strip at the top** (annotation + one instance per size) →
sep → a horizontal `Light + Dark` wrapper holding **two tables side by side**:
`Spec table — Light` and `Spec table — Dark` (the dark one gets
`setExplicitVariableModeForCollection(Mode, Dark)` and its label-caption explains the
override). Table anatomy:
- Header row: `variant · style` + columns `Enabled · Hover · Focus · Disabled`
- Variant groups delimited by **`_Doc/SeparatorLabeled`** (label = variant, uppercase)
- Rows = styles; every cell = a 132×44 frame (`clipsContent=false`) holding one instance
- Painted states: Hover = fill the variant's `-hover` variable (solid style) or
  `-light`/`accent` (ghost); Focus = apply the `Focus/{Variant}` effect style
  (all 7 exist); Disabled = `opacity 0.5`. Aiden hover isn't painted (gradient) —
  say so in the group label.

### 3 · Theming  *(only for theme-aware components — see CLAUDE.md's routing table)*
Section + "Try it: select any frame → Appearance panel → set Theme or Mode" caption →
header row of theme codes → **Light row + Dark row** of cells; each cell is a small
`color/background` frame with `setExplicitVariableModeForCollection(Theme, mode)`
(+ Mode=Dark on row 2) containing one instance labeled with the theme code.

**When you omit this frame** because the component is neutral chrome (Label, Input,
Tooltip, Sidebar chrome…), say so in one line in the TOKENS section — "all neutral,
nothing reads `--primary`, a `data-theme` wrapper leaves it unchanged". An unexplained
missing frame reads as an oversight; a stated one reads as a decision. Check first:
`--ring`, `--focus`, `--border-hover` and `--bg-input-30` are Mode-level neutrals, so a
component can look interactive and still not theme.

### 4 · Examples · Docs · History
Examples section → **light bar + identical dark bar** (full-width, explicit Mode=Dark
on the second; realistic clusters mirroring the Storybook stories) → sep →
TOKENS section + wrapped TokenPills (key tokens; note the total, point at the .scss) →
sep → two `_Doc/DoDont` rows (from CLAUDE.md's rules) → sep →
**ACCESSIBILITY "A11y contract" section**: `Keyboard →` pills row + paragraphs for
semantics / focus / loading / disabled / contrast (call out anything automated
checkers get wrong — e.g. axe can't score the aiden gradient) → sep →
VERSION HISTORY section + `_Doc/ChangelogRow` per edit (**append, never rewrite**;
seed `1.0 · date · author · Initial doc page`).

## `_Doc/*` masters (page `146:122`)

| Master | ID | Notes |
|---|---|---|
| `_Doc/PageHeader` | `146:134` | Title/Description props; 4 chip slots (hide extras via `visible=false`) |
| `_Doc/Section` | `146:139` | Overline / Title / Description props |
| `_Doc/Chip` | `146:125` | neutral metadata pill |
| `_Doc/TokenPill` | `146:142` | mono pill (tokens, classes, prop values) |
| `_Doc/Annotation` | `146:163` | small muted label (grid axes, captions) |
| `_Doc/Separator` | `157:278` | plain hairline |
| `_Doc/SeparatorLabeled` | `175:594` | line — LABEL — line; table group headings |
| `_Doc/DoDont` | `146:154` | Do/Dont props; fixed width, hugs height |
| `_Doc/ChangelogRow` | `146:160` | Version/Date/Author/Change props |
| `_Doc/PropRow` | `164:451` | kept but unused in v4 (props table was cut) |
| `_Doc/Card` | `157:276` | **style reference only — never instance** |

All masters have descriptions (Assets-panel hover). Give every new component set a
description too — it's part of the lint.

## Variables & styles (verified IDs)

- **Collections:** `Primitives` (Value) · `Mode` (Light/Dark) · `Theme`
  (Main/DB/DC/DR/EC/IR/NB/PH/RM).
- **Theme collection** (bind ALL theme-able brand color usage here — **never** to
  `Mode → brand/main/*`, or theme modes won't flip the component):
  `primary 2:44` · `primary-foreground 2:45` · `primary-hover 2:46` · `primary-light
  2:47` · `primary-soft 2:48` · `primary-border 2:49` · `primary-ring 2:50` ·
  `primary-focus 2:51` · `primary-text 35:65`. Ghost/quiet text stays
  `Mode → color/secondary-foreground` (the neutral carve-out).
- **`flag/is-dark`** boolean, Mode collection, `175:26` (Light=false, Dark=true) —
  powers the Aiden dark-gradient overlays.
- **`color/shadow`** `145:122` — all 8 `Shadow/*` effect styles bind their color to it
  (mode-aware). `Focus/*` effect styles exist per variant incl. `Focus/Aiden`; their
  drop shadows have `showShadowBehindNode:false` (keep it — otherwise rings darken
  translucent fills).
- **Text styles** (`{size}/{leading}/{weight}`): h1 `4xl/leading-none/Bold`
  `S:938cb5…`, h2 `2xl/leading-none/Semibold` `S:98e64e…`, body
  `base/leading-normal/Normal` `S:b07e84…`, sm/sm-Med/sm-Semi `S:6bdb0a…/S:ad4292…/
  S:74e17a…`, xs/xs-Med/xs-Semi `S:5c9f4c…/S:570279…/S:b0daea…`, code
  `code/leading-normal/Mono` `S:e0fb2e…` (full IDs in the ledger).
- Common primitives: `spacing/1..16` = `1:5,1:7,1:9,1:11,1:13,1:15…`, `radius/sm|md|lg|
  xl|full` = `1:122,1:124,1:125,1:126,1:129` (full map in the ledger).

## The Aiden dark pattern (REQUIRED wherever an aiden gradient appears)

Gradients can't bind to color variables, so per gradient variant: insert an
absolute-positioned rect named **`aiden-dark-gradient`** at **child index 0** (above
the frame's own fill, below content), sized to the variant, `STRETCH` constraints,
radii bound to the same radius variable, fill = linear gradient `#a78bfa → #93c5fd`
(same `gradientTransform` as the light fill; alpha `1` for solid fills, `0.10` for
secondary tints), and **bind the rect's `visible` to `flag/is-dark`**. Aiden *text*
already flips via `Mode → color/aiden-*` vars. **Never create separate
aiden-light/aiden-dark variants — mode is an axis, not a variant (owner decision).**
Button's 8 aiden gradient variants already carry this.

## Design-check lint (ship gate — must be ALL ZEROS before a page counts as done)

Sweep the new page + set (skip nodes inside instances):
1. visible SOLID fills/strokes with no `boundVariables` and no style ref
2. TEXT nodes with no `textStyleId`
3. generic layer names (`Frame N`, `Group N`, `Rectangle N`…) — name them
   (`cell`, `row`, `column labels`, `pills`, semantic frame names)
4. non-zero padding/radius not bound to a variable
5. COMPONENT / COMPONENT_SET without a description

## Plugin-API gotchas (each cost real debugging time)

- **`instance.children` omits hidden children.** A layer hidden by a boolean property
  disappears from the array, so index access (`inst.children[1]`) silently shifts or
  returns `undefined`. Always locate by name: `inst.findOne(n => n.name === 'ui-input-wrap')`.
- **Booleans can only drive `visible`.** A code prop that toggles a *layer* (Label's
  `required` asterisk, its `description` line, Button's `isLoading` spinner) maps to a
  BOOLEAN property. A prop that changes a *style* — opacity, fill, size — cannot, and
  has to become a VARIANT axis instead (Label's `disabled` is opacity 50%, so
  `Size × Disabled` = 6 variants). Decide this before building the variants.
- **Don't use `_Doc/Annotation` for prose.** Its inner text hugs, so even with the
  instance set to `FILL` a long note renders as one overflowing line. Annotations are for
  short captions and grid axes only. For anything paragraph-length, create a plain TEXT
  node with the `xs/leading-normal/Medium` style + `color/muted-foreground` and set
  `layoutSizingHorizontal='FILL'` — that wraps correctly.
- **Rows of many pills overflow the card.** A hugging horizontal auto-layout row will
  run past a fixed-width card rather than wrap. Set `layoutWrap='WRAP'`,
  `counterAxisSpacing`, and `layoutSizingHorizontal='FILL'` on any row that might exceed
  `cardWidth − padding` (a Props row with ~8+ pills always will).
  Same care for fixed-width table label columns: measure the longest string before sizing.
- **Instances can't `appendChild`** — masters pre-provision max children; instances
  hide extras (`visible=false`).
- **`createAutoLayout` defaults `clipsContent=true`** — unclip rows/cells or focus
  rings get cut.
- **Horizontal AL: `counterAxisSizingMode='FIXED'` freezes HEIGHT** (wrapped text
  clips). Fixed-width/hug-height = `primaryAxisSizingMode='FIXED'` +
  `counterAxisSizingMode='AUTO'`.
- **REST `get_screenshot` serves stale renders for freshly *modified* nodes**
  (fresh-created nodes are fine). Fallback: `node.exportAsync` — but base64 >20 kb
  truncates in tool output; export small crops or decode via a saved file.
- A COMPONENT_SET **can** be nested into an auto-layout frame.
- `figma.root.name` is read-only; Code Connect needs an Org/Enterprise Dev seat
  (currently blocked).
- Load fonts before any text: Inter Regular/Medium/Semi Bold/Bold + JetBrains Mono.

## Per-component workflow (next session starts here)

1. Read the ledger → next component in the phase queue (next up: **Spinner**).
2. Read `src/components/{Name}/{Name}.types.ts` (props → set properties),
   `{Name}.scss` (tokens consumed, BEM parts), `{Name}.stories.tsx` (matrices),
   CLAUDE.md's roster row + routing/composition notes (Used-by, Do/Don't, theming).
3. Create the page `{phase} · {Name}` under its divider; build the component set
   (variant props mirror the code unions **exactly**; bind everything; describe it),
   then the 3–4 frames per the recipe (Theming only if the component themes).
4. Special cases: compound families get one component per sub-part (`Chat/Bubble`),
   never a mega-set; aiden gradients get the dark-overlay pattern.
5. Run the lint → fix to zeros. Screenshot each frame (verify dark + themed cells
   actually flip). Link the index row. Append changelog `1.0`. Update the ledger
   (status, pageId, setIds, version).
6. After **Spinner** ships: give Button a real `isLoading` boolean property
   (instance-swap the spinner) and remove the `⚠ code-only` marker for it.
