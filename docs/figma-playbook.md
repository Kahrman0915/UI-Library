# Figma design-system playbook — template v4 (LOCKED)

> **Read this before touching the Figma file.** It is everything a fresh session needs
> to build the next component page *exactly* like `1 · Button`, without any prior
> conversation context. Machine state (per-component status, queue) lives in
> [`figma-ledger.json`](./figma-ledger.json) — update it after every shipped page.
> The template shape is **owner-approved and locked**; don't redesign it without asking.

- **File:** `jzc2ME8xVmfX1V8OCt2HC2` (owner may rename it "@ui/lib — Design System" —
  the API cannot; `figma.root.name` is read-only).
- **Tooling:** the `use_figma` MCP tool (load the `figma-use` skill first, every session).
- **Status:** 27/57 done. **Phases 1 and 2 COMPLETE.** Next up: **Card** — the first Phase 3 composite. Queue in the ledger.
- **Button page is v1.2** — it now carries a second set, `Button/Icon-only` (120 variants). Both sets are all-zeros on lint.

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

The owner can overrule this, and did once: the Code page carries highlighted CodeBlock mock-ups even though the library has no tokenizer, because the design need was real and the code decision was worth deferring. That is fine **when it is an explicit decision, labelled as such** — the frame has a `REQUIRES A TOKENIZER, NOT BUILT` separator and a note saying what a developer would actually get. What the rule forbids is the *unlabelled* mock that quietly implies a capability.

The same rule has a constructive half: when a token family exists but nothing renders it, document it as a **reference**, not as a usage example. The Code page shows its 11 `--code-*` syntax tokens as swatches on the real `code/block` surface with their measured contrast — a designer can see and review the palette, but nobody can mistake it for a highlighter the library ships. A rendered example would have been the lie; a labelled swatch table is the documentation.

---

### Mutually exclusive props → separate sets, not one long axis

When two props are alternatives rather than dimensions — one overrides the other in
code — give each its own component set. Badge ships `variant` (12 status options) and
`category` (15 hues × soft|solid), and passing a category ignores the variant entirely.
Flattening them into one 42-option dropdown would offer a designer choices that silently
cancel each other out. Two sets (`Badge`, `Badge/Category`) make the fork explicit: pick
the set that matches the job, then pick within it. Say which wins in the Overview.

### Continuous props can't be a variant axis — say so

`AspectRatio`'s `ratio` is a plain number, so every value is legal. Figma variants must be
discrete, so the set ships six representative shapes and the **description states outright
that they are a shortcut, not the API**. Without that line a designer reads six options as
the entire surface. Same applies to any free-form numeric prop (Skeleton's width/height,
Slider's min/max).

Related: `node.targetAspectRatio` is **read-only to plugins**. Where the component's whole
point is a constraint the API can't express, size the frames correctly and flag the manual
UI toggle on the page — a stated manual step beats a silent gap.

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
  Added 2026-07-25 for Kbd + Separator: `xs/leading-none/Mono` (12) `S:0aeef0…`,
  `sm/leading-none/Mono` (14) `S:132f19…`, `xs/leading-normal/Medium Wide`
  (`--tracking-wide`) `S:66438c…`. Add a style rather than overriding one — see gotchas.
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

- **A new set that is a systematic transform of an existing one? CLONE, don't rebuild.**
  `component.clone()` preserves every binding — variable-bound fills/strokes/radii, effect
  styles, boolean-bound child visibility, the lot. `Button/Icon-only` is all 120 labelled
  Button variants cloned with three edits each (drop the label, square the padding, aiden
  gets `--rounded-full`), so theme bindings and the aiden `flag/is-dark` overlay came across
  verbatim. Read the per-variant colour binding off the node you are about to delete and
  re-apply it to whatever replaces it (`label.boundVariables.fills[0].id` → the icon's stroke).
- **Figma trims whitespace at the edges of a hugging TEXT node.** A line of code split
  into per-token coloured spans inside a horizontal auto-layout renders as
  `exportfunctionSidebar` — every trailing space is measured away. Use **non-breaking
  spaces (U+00A0)** for every space inside multi-span text: identical width in a mono
  face, never trimmed.
- **Icon stroke weight does not scale on resize in Figma — but it does in the browser.**
  SVG `stroke-width` is in viewBox units, so lucide's `2` renders 1.0px at 12px, 1.33px at
  16px, 2.0px at 24px. Figma leaves it at a flat 2px, which is why a shrunk icon looks like
  a blob. **Any icon placed below 24px needs its stroke set to `2 × size ÷ 24`.** Measure
  the real value in the browser (`computedStrokeWidth × renderedSize ÷ viewBoxSize`) rather
  than assuming. CloseButton is the carve-out — its CSS pins 1.33 units, so 0.665px at 12px.
- **Icons do not auto-tint — by decision.** They arrive as `--foreground`; the designer
  sets the colour after placing. Automatic per-variant tinting was attempted five ways and
  abandoned (per-layer overrides reach only the default glyph's layers; a colour mode
  collection needs 13 modes against Figma's cap of 10; stubs don't carry through a swap;
  hand-merging geometry corrupted the library). Stroke **weight** is variable-driven and
  does work.
- **`figma.flatten()` merges vectors correctly; hand-concatenating `vectorPaths` does not.**
  Path data lives in each node's own coordinate space, so concatenating discards every
  other node's offset and collapses the glyph. This destroyed all 1,746 icons once.
- **Verify a bulk geometry operation on ONE duplicate, with a screenshot, before running it
  across a library.** After the bad merge every property read looked perfect — "1 path,
  stroke kept, 24×24" — while every glyph was visually ruined. For geometry, pixels are the
  only verification.
- **The API can't reach instances nested inside component-set variants.** `findAll()`
  returns 0 vectors for 238 of 240 slots that render fine on canvas; only the set's default
  variant is readable. Apply nested styling at instance-creation time, before inserting.
- **A per-layer override only reaches layers that exist on the DEFAULT swap target.** If a
  swappable family has varying inner layer counts, an override applies *partially* — the
  symptom is an icon rendering half in the host's colour and half in the library default.
  Icons are therefore normalised to **one vector named `path-1`**, so a single override
  covers the whole glyph. Merge geometry at the **node** level (concatenate `vectorPaths`
  entries), never by string-joining path `d` data — that breaks any sub-path starting with
  a relative moveto.
- **A variable collection is capped at 10 modes.** Anything needing more distinct cascading
  values can't use modes at all. Check the count first: an icon-colour collection needed 14
  and was abandoned for the single-path approach above.
- **An `INSTANCE_SWAP` property swap DISCARDS nested overrides.** Uniform layer names do
  *not* save you — that only helps manual `swapComponent` in limited cases. Anything that
  must survive a swap has to come from a **variable mode set on an ancestor**, because
  modes cascade and are not overrides. Icon stroke weight works this way (collection
  `Icon`, modes 24/20/16/14/12). **Always verify on a real placed-and-swapped instance,
  never on the master** — the master can read perfectly while every real usage is wrong.
- **Give a swappable family identical inner layer names.** `instance.swapComponent()`
  discards overrides whose layer names don't match the new component, so every icon uses a
  `glyph` group over `path-1`, `path-2`… Per-glyph names silently reset the stroke colour
  and weight on every swap — which is exactly what a host component sets.
- **Bulk assets go through `upload_assets`, never through the conversation.** The full
  lucide set is ~353 KB of markup; pasting it into `use_figma` scripts would cost six
  figures of tokens. Generate ONE SVG locally with each icon wrapped in
  `<g id="{name}">` — Figma keeps the group id as the layer name, which is the whole
  name mapping — then call `upload_assets`, `curl -F file=@… ;type=image/svg+xml` the
  submitUrl, and convert the imported tree in place (~450 per script, ~85 ms each).
  Imported SVG groups **hug their glyph bounds**, so wrap each in a 24×24 frame and set
  the group's offset to `(group.xy − cellOrigin.xy)` to restore a uniform box.
- **Icons come from `node_modules`, not from community files.** `🧩 Icons` (page
  `275:32`) holds all 1,746 canonical lucide icons generated from
  `lucide-react@1.24.0` — the same package the components import, so the set cannot
  drift from what a developer can build. Aliases are excluded. Do **not** paste in another
  library: anything outside lucide-react is unbuildable under hard rule #1, and MIT /
  Apache-2.0 / paid sets all carry notices that must stay attached.
- **Vector geometry cannot be overridden inside an instance.** Figma throws
  `This property cannot be overridden in an instance` on `vectorPaths`. So a component
  with a swappable glyph needs the icon to be an **instance of an icon component plus an
  `INSTANCE_SWAP` property** — a drawn glyph locks every instance to it, which is what
  briefly made `Button/Icon-only` useless. Colour and stroke weight *are* overridable;
  geometry is not. Icon masters live on `_Template` as `_Icon/*` (24×24, stroke-width 2,
  SCALE constraints).
- **Set `layoutSizing*` AFTER parenting.** Sizing modes assigned before `appendChild` are
  reset by the new parent's auto-layout. A card built with `primaryAxisSizingMode='AUTO'`
  and then appended arrived stuck at its placeholder 10px height, with its children
  spilling over the siblings below it.
- **`use_figma` scripts are ATOMIC.** One thrown error rolls back *everything* the script
  did — including finished work on unrelated pages. A typo in a Separator helper wiped a
  completed Kbd page in the same call. **Build one component page per script.** Batch only
  the read-only passes (lint, index links, screenshots) once the pages exist.
- **Setting any property a text style owns DETACHES `textStyleId`** and trips lint rule 2.
  `letterSpacing`, `fontSize` and `lineHeight` all do it — so "apply the style, then tweak
  the tracking" silently unstyles the node. If the design needs a value no style carries,
  **create the style**: `xs/leading-none/Mono` (12), `sm/leading-none/Mono` (14) and
  `xs/leading-normal/Medium Wide` (`--tracking-wide`) were added for exactly this.
- **Component-SET wrappers need bindings too.** Figma gives every new set a default corner
  radius of 5 and whatever raw padding you set, both of which the lint flags. Bind the
  wrapper's padding to `spacing/*` and its radius to `radius/lg`.
- **When the lint flags a `_Doc/*` instance, fix the MASTER.** `_Doc/ChangelogRow` carried
  unbound 8px top/bottom padding; binding it on the master (`146:160` → `spacing/2`)
  cleared the finding on every page at once, retroactively.
- **A gradient overlay faking an un-bindable effect must be FULL-BLEED.** Figma variables
  hold solid colours only, so Skeleton's shimmer is a drawn white low-alpha gradient. Sized
  narrower than its parent, the overlay's own rect edge shows through wherever the parent
  clips to a radius — the circle read as two hard-split halves. Match the parent's size,
  `x=0`, `constraints: STRETCH/STRETCH`.
- **An auto-layout frame whose children are ALL hidden keeps its last width** — it does
  not collapse to 0, even set to HUG. So binding a boolean to a leaf text node leaves the
  container holding its old width, and the instance stays full-size: Checkbox's label-less
  instances were 185px of mostly-empty space, overflowing their 120px grid cells and
  visually spilling into the neighbouring column. **Bind visibility to the container, not
  the leaf** (`ui-label` column ← "Show label"; the description text keeps its own
  boolean inside). Then set label-less instances to `layoutSizingHorizontal='HUG'`.
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
- **Measure overflow against the TABLE's inner padding, not just the card.** The
  card-level lint only catches content escaping the card bounds, so a spec row can sit
  22px into a table's right padding and still pass. Slider's four 290px state columns
  needed the card widened from 1280 → 1440. Check
  `rowContentMaxX > tableX + tableWidth − tablePaddingRight` before shipping a wide spec.
- **Rows of many pills overflow the card.** A hugging horizontal auto-layout row will
  run past a fixed-width card rather than wrap. Set `layoutWrap='WRAP'`,
  `counterAxisSpacing`, and `layoutSizingHorizontal='FILL'` on any row that might exceed
  `cardWidth − padding` (a Props row with ~8+ pills always will).
  Same care for fixed-width table label columns: measure the longest string before sizing.
- **Composite examples: one run, corners by GLOBAL position.** When the code puts several parts inside a single
  container, the CSS runs `:not(:first-child)` / `:not(:last-child)` across *all* of them — text cells and separators
  included. Building the example from sub-groups in Figma restarts that logic and yields rounded corners in the middle of
  a control (ButtonGroup shipped with `Copy` rounded on its right, `Paste` rounded on both sides, and the `Sort by` cell
  as a free-floating pill). Read the real `borderRadius` per child out of the browser and match it literally. Where a run
  genuinely breaks — a full-width separator — nest the collapsed run inside a spacing-0 outer row instead of restarting
  the corner assignment.
- **`appendChild()` returns void, not the child.** `parent.appendChild(x).layoutSizingHorizontal='FILL'` throws
  `cannot set property of null`, and since scripts are atomic that rolls back the entire page. Use a small
  `add(parent, node, fill)` helper that appends, optionally sets sizing, and *returns the node*.
- **`layoutWrap='WRAP'` must be set AFTER `layoutMode='HORIZONTAL'`** — setting it while the frame is still vertical throws.
- **Check overflow RECURSIVELY, not just at the top level.** Comparing only each page-frame's direct children reported
  clean while both example bars sat collapsed at 100px with their contents spilling out — the failure was a level deeper
  (a horizontal bar left at `counterAxisSizingMode='FIXED'`, which freezes *height*). Walk every auto-layout frame against
  its own children, skipping `layoutPositioning==='ABSOLUTE'`.
- **Figma paints later siblings on top, exactly like the DOM — so you cannot demonstrate a CSS `z-index` lift by putting a
  focus effect on a middle child.** The neighbour that follows it covers the ring, and the canvas ends up documenting the
  *bug* rather than the fix. Draw the ring as an absolutely-positioned rect appended last. ButtonGroup's Spec does this.
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

1. Read the ledger → next component in the phase queue (next up: **Card**, first of Phase 3).
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
