# Chrome — pending code changes

> Started as a colour record; it now covers spacing and structure too. Filename kept so
> earlier links still resolve.

**Status: NOT APPLIED. Figma is ahead of the code on purpose.**

The owner is working the chrome colour out in Figma first (file `jzc2ME8xVmfX1V8OCt2HC2`,
page `App Shell`) and has asked that `src/` stay untouched until they say. This file is the
running list of what has to land in code when that happens, so nothing is rediscovered.

Every entry records the Figma change, the exact code edit it implies, and anything the
change breaks or makes stale. Add to the bottom; don't rewrite history.

Started 2026-09-12.

**A checkbox version of this list lives in Figma** on the page `✅ Code changes to make` (37 code
items grouped by file). Keep the two in step when an item is added or lands.

**Figma to-do DONE 2026-09-14:** the sidebar right-click menu on the Page 119 space page is
built (item 14). No code change came with it.

---

## 1 · Dark sidebar surface → slate-850 `#172033`

**Decided.** The rail and sidebar were `#1e293b` (slate-800), the same value as `--card`,
so the chrome and every card sitting on the page were one plane. Slate-900 `#0f172a` (what
the owner had been trialling by removing the fills) merged the chrome into the body
instead. Slate-850 is the midpoint and the only one of the three that separates from both.

Measured against the two planes it has to sit between:

| Dark chrome | vs body `#0f172a` | vs cards `#1e293b` |
|---|---|---|
| slate-900 `#0f172a` | 1.00 | 1.22 |
| **slate-850 `#172033`** | **1.10** | **1.11** |
| slate-800 `#1e293b` | 1.22 | 1.00 |

### Done in Figma

`sidebar/background` and `sidebar/base`, **Dark mode only**, `#1e293b` → `#172033`.
Light stays `#f8fafc` (slate-50, already correct). The scratch `Dark · chrome proposal`
mode was left alone.

Both variables had to move together: the Figma masters bind the sidebar panel and the rail
to `sidebar/background` but the header and footer strips to `sidebar/base`, so changing one
would have split the header off from the body. See item 2 — that split should not exist.

### To do in code

`src/styles/tokens.scss`, the `[data-mode='dark']` block:

```scss
--base-sidebar: #172033;   /* was #1e293b — line ~958 */
```

**That is the whole change.** `--sidebar: var(--base-sidebar)` and the themed
`--sidebar: color-mix(…, var(--base-sidebar))` both derive from it, so the public token and
all seven brand scopes follow. No component touches `--base-sidebar` directly (verified by
grep), which is what makes it a one-line edit.

### Consequences

- **The row hover needs nothing in code.** `Sidebar.scss` computes it live as
  `color-mix(in srgb, var(--sidebar-accent) 55%, var(--sidebar))` at lines 451 and 585, so
  it re-resolves against the new surface on its own.
- **Figma's copy of that hover is now stale.** Figma has no `color-mix`, so
  `sidebar/accent-hover` holds the pre-computed result by hand. It still reads `#2a3649`,
  derived from the old `#1e293b`. The same formula over `#172033` gives **`#263246`**.
  Not changed yet — the owner is taking one step at a time. This is the hazard the ledger
  already flags: nothing links that variable back to its two inputs.
- **Also still bound to the hover token where it should be the active token.** The nav row
  marked active in the owner's frames paints `sidebar/accent-hover` rather than
  `sidebar/accent`, so active and hover are indistinguishable. Separate fix, logged here
  because it interacts: correcting it is what makes a darker chrome viable in light mode.
- **Contrast gate.** `npm run test:contrast` gates text on surfaces. `--sidebar` is not in
  its pairing list today, so this change is not covered either way. Worth adding
  `sidebar-foreground` on `sidebar` when the code change lands.

---

## 2 · The duplicate sidebar surface tokens

**Figma side DONE 2026-09-12. Code side pending, and it is NOT the same edit — read the
warning below before touching `tokens.scss`.**

The owner asked why there are two background tokens for one
surface. There are effectively three names, and only one of them earns its place.

| Name | Where | Read by |
|---|---|---|
| `--base-sidebar` | tokens.scss, both modes | the `--sidebar` derivation only |
| `--sidebar` | tokens.scss, derived | every component |
| `--sidebar-background` | tokens.scss, both modes | **nothing** |

**The legitimate pair is `--base-sidebar` / `--sidebar`, and it exists for one reason.**
A custom property cannot reference itself: `--sidebar: color-mix(…, var(--sidebar))` is a
cycle that CSS resolves to invalid, silently, with no error. So the literal has to live in
a separate variable and the tint mixes against that. `--base-sidebar` is the input,
`--sidebar` is the output components read. This is the same shape all thirteen tintable
surfaces use.

**`--sidebar-background` is dead.** Declared `#f8fafc` / `#1e293b` and read by nothing in
`src/`. It predates the tint work and was never removed. Candidate for deletion.

**In Figma the pair buys nothing and is bound inconsistently.** Figma cannot do
`color-mix`, so it applies the rail tint as a second translucent paint layered over the
surface rather than deriving a value. That means the Figma mirror never needed the twin at
all — `sidebar/base` and `sidebar/background` are two copies of one literal. Worse, they
are bound to different parts:

| Figma variable | Bindings | Bound to |
|---|---|---|
| `sidebar/base` | 42 | Sidebar header and footer strips, spec frames |
| `sidebar/background` | 29 | the Sidebar panel variants, the `Sidebar` frames, `AppRail` |

**That split mirrors a distinction the build does not have.** In `Sidebar.scss` the header
and footer set no background at all — they are transparent and sit on the panel's own
`--sidebar`. So the Figma file gives two names to one surface and then paints two different
parts with them, which is exactly how the two drift apart later.

### Done in Figma

Collapsed to `sidebar/background`. **68 fills rebound across 12 pages, not the 42 first
counted** — the first scan only covered the `Sidebar`, `AppRail` and `AppShell` pages and
missed the flow screens, both dashboards, the spacing page and `TEST`. No strokes were
bound to it. Zero bindings remain.

| Page | Rebound | | Page | Rebound |
|---|---|---|---|---|
| Sidebar | 37 | | Request Flow | 1 |
| Dashboard — built from components | 8 | | Whats New | 1 |
| AppShell | 5 | | Dashboard — handoff | 1 |
| Spacing · applied to built screens | 4 | | Chat — showcase | 1 |
| App Shell | 4 | | TEST | 1 |
| Admin Flow | 3 | | Dashboard — brand palettes | 2 |

`sidebar/base` was renamed **`_deprecated/sidebar-base`** rather than deleted, following
the file's own precedent that archiving is reversible and deletion is the owner's call. It
now has zero bindings and can be removed whenever they say.

**Tinting is unaffected, and the collapse actually improves it.** The Figma tint is a
second translucent paint layered over the surface, not a derived value: `ui-sidebar` carries
`sidebar/background` at opacity 1 with `rail/sidebar` at **0.04** over it, matching the code's
4%. `rail/sidebar` lives in its own `Tint rail` collection with `Off` (fully transparent)
and `On` (aliased to the brand tint) modes, so it never touched the base/background pair.
It already targeted `sidebar/background`, which is the one we kept — so the header and
footer strips, previously on `sidebar/base`, are now tintable where before they would have
stayed untinted while the panel around them moved.

Verified by screenshot: the `Spec · Cobalt · Dark` dashboard still renders its tinted rail,
and the `App Shell · 1440` instance is unchanged with the header still in lockstep with the
panel.

### To do in code — DIFFERENT EDIT, DO NOT MIRROR THE FIGMA ONE

**Deleting `--base-sidebar` would break the rail tint in all seven brand scopes.** In code
the pair is not a duplicate; it is the input and output of a derivation that cannot be
written any other way. Figma could collapse only because it layers a paint instead of
mixing a value.

The code change is one deletion, and it is the *third* token, not the twin:

```scss
/* DELETE from both mode blocks in tokens.scss (lines ~537 and ~1024) */
--sidebar-background: #f8fafc;   /* light */
--sidebar-background: #1e293b;   /* dark  */
```

Read by nothing in `src/` (verified by grep). It predates the tint work and was never
removed. **Keep `--base-sidebar` and `--sidebar` exactly as they are.**

---

## 3 · The top bar now matches the sidebar

**Figma side DONE 2026-09-12.** The top bar, the rail and the sidebar are now one colour.

The top bar was painting from the *page* palette (`surface/*`) while the rail and sidebar
paint from the *sidebar* palette (`sidebar/*`). That is why it stayed on the page colour
when items 1 and 5 moved everything else. This was not a value to change, it was the wrong
palette.

### Done in Figma

28 paints rebound across the `AppShell` master's `TabStrip` subtree and every `TabBar`
master:

| From | To | Count | What it is |
|---|---|---|---|
| `surface/background` | `sidebar/background` | 7 | the bar itself and the tab bar inside it |
| `surface/border` | `sidebar/border` | 17 | the rule under the bar and the tab edges |
| `surface/accent` | `sidebar/accent` | 4 | the open tab, tab hover, new-tab hover |

The border had to move with the fill. Dark `surface/border` is `#64748b` against
`sidebar/border` at `#334155`, so leaving it would have drawn a bright page-coloured rule
under a sidebar-coloured bar. The accent moved for a different reason: both resolve to
`#334155` today so nothing changed visually, but leaving the tab on `surface/accent` means
it silently drifts off the sidebar palette the next time the page accent moves.

### To do in code

- `src/components/AppShell/AppShell.scss` — the strip's `background` and its bottom
  `border-color` → `--sidebar` / `--sidebar-border`.
- `src/components/TabBar/TabBar.scss` line 13 — `background: var(--background)` →
  `var(--sidebar)`, and the `border-block-end` → `--sidebar-border`.
- The same file's tab rules: the `--accent` hover and open fills → `--sidebar-accent`, and
  the remaining `--border` rules on the tab edges and the trailing controls →
  `--sidebar-border`.

**Check the active-tab underline afterwards.** It is `--primary`, and it now sits on the
sidebar surface rather than the page surface. It was legible on both in Figma but it was
never measured against the new ground.

Changelog entries required on `AppShell` and `TabBar` stories.

### 3a · The open tab now paints the page surface

Moving the bar onto the sidebar palette exposed an older problem in the open tab, which was
then fixed separately.

**The open tab used to mean two different things.** It painted the accent in both modes,
which is *lighter* than the bar in dark and *darker* than it in light. So the selected tab
read as raised in one mode and recessed in the other, from one token. In light it was also
the exact same value as the border around it, `#e2e8f0` both, so the tab's own edge vanished
into its fill.

**Now it paints `surface/background`, the page colour, in both modes.** That is the browser
model: the active tab is continuous with the document it opens onto. One rule instead of two.

| | Bar | Open tab | |
|---|---|---|---|
| Light | `#f8fafc` | `#ffffff` | lighter than the bar |
| Dark | `#172033` | `#0f172a` | darker than the bar |

The direction still differs by mode, but that is now a consequence of one consistent rule
rather than an inconsistency: the page is lighter than the frame in light and darker in dark.
Every browser resolves it the same way.

**Hover deliberately stayed on `sidebar/accent`.** Hover is a transient highlight on the bar,
so it belongs to the bar's palette. Only the selected tab belongs to the page.

Applied to the `TabBar/Tab` `State=Open` variant, plus 5 instances that carried an override.

Code: in `TabBar.scss`, the open tab's background → `var(--background)`, while the hover
rule goes to `--sidebar-accent` per item 3. Do not give them the same value.

---

## 4 · App rail internal spacing

**Figma side DONE 2026-09-12** for the two self-contained values. The rail width is
deliberately held back — see item 5.

Taken from the owner's `my edits` frame. Diffing their rail instance against the `AppRail`
master turned up three differences, not one:

| | Master was | Owner's | Status |
|---|---|---|---|
| Applications, padding-top | 4 | **12** | applied |
| Applications, item gap | 4 | **8** | applied |
| Rail width | 48 | 52 | **held, see item 5** |

Everything else already matched: the header slot at `[4,0,4,0]`, the footer at `[8,0,8,0]`
with a gap of 4, and every item at 36 x 36.

### Done in Figma

On the `AppRail` master (`2668:226`), the `Applications` slot (`2668:239`). Both properties
had been bound to `spacing/1`; they are now bound rather than hand-set, per the file's
tier-4 rule that geometry on a doc page is the spec:

- `paddingTop` → `spacing/3` (12)
- `itemSpacing` → `spacing/2` (8)

### To do in code

`src/components/AppRail/AppRail.scss`:

```scss
/* .ui-app-rail__apps — line ~33 and ~37 */
gap: var(--p-2);          /* was --p-1 */
padding-top: var(--p-3);  /* was --p-1 */
```

**There is a standing comment directly above that gap that will be wrong afterwards.**
Lines 24 and following explain the gap is 4 "matching the Sidebar's menu gap, because these
two stand side by side and are read as one piece of chrome". That reasoning was the owner's
own, recorded on 2026-09-11 when the rail moved from `--p-0-5` to `--p-1` to match. Moving
the rail to 8 breaks that pairing unless the Sidebar menu gap moves with it. Either rewrite
the comment or raise the sidebar gap in the same change. Flagged, not decided.

The footer's `gap: var(--p-1)` at line 45 is a different run and stays at 4.

Changelog entry required on `AppRail.stories.tsx` when this lands.

---

## 5 · Chrome widths — rail 52, sidebar 252, collapsed rail 52

**Figma side DONE 2026-09-12.** The owner's call: take the rail to 52, give the 4 back from
the sidebar so the body does not move, and bring the collapsed sidebar to 52 so the two
icon columns match.

| | Rail | Sidebar | Chrome | Main 1440 | Main 1920 |
|---|---|---|---|---|---|
| Before | 48 | 256 | 304 | 1136 | 1616 |
| **After** | **52** | **252** | **304** | **1136** | **1616** |

Measured after the change on both shell proofs: rail 52, sidebar 252, main **1136** and
**1616** exactly. Nothing downstream moved.

### Done in Figma

- `AppRail` master (`2668:226`) 48 → 52.
- `Sidebar` set (`1858:783`): the five `Collapsed=false` variants 256 → 252, the five
  `Collapsed=true` variants 48 → 52.
- `AppShell` master (`2669:605`): rail instance → 52, sidebar instance → 252. The
  `Main content` slot is FILL so it recomputed to 1136 on its own.
- The hidden panel-spanning regions repaired to FILL, so they land at the right width when
  someone turns them on: `separator` 240 → 236, `g2 row 3` and `submenu indent` 224 → 220,
  `submenu` → 206 (the 14px indent). In the collapsed variants these correctly resolve to 20.
- File-wide sweep: only **2** instances were pinned to the old widths and needed resizing,
  both on the `Sidebar` page. Every other instance followed its master, including all the
  flow screens. The owner's own `my edits` exploration frames were deliberately skipped.

### To do in code

`src/styles/tokens.scss`:

```scss
--app-rail-width: 3.25rem;      /* 52, was 3rem */
--sidebar-width: 15.75rem;      /* 252, was 16rem */
--sidebar-width-icon: 3.25rem;  /* 52, was 3rem — keeps the collapsed sidebar
                                   matching the rail beside it */
```

Five rules read `--sidebar-width`, including the offcanvas transforms, and they all follow.
`--sidebar-width-mobile` is unaffected. The header comment in `AppShell.scss` line 3 states
`strip 48 · rail 48 · sidebar 256 → Main Content 1136 at 1440, 1616 at 1920` and needs the
two numbers corrected; the 1136 and 1616 are still right. `AppRail.scss` line 1 also says
"48 wide".

Changelog entries required on `AppRail`, `Sidebar` and `AppShell` stories.

### Known cost, accepted by the owner

**Neither new width is on the spacing ramp.** 48 was `--w-12` and 256 was `--w-64`; the
ramp jumps 48 → 56 and 240 → 256, so there is no rung at 52 or 252, and no Figma
`spacing/*` variable at either. Both values live in bespoke panel-geometry constants, the
same class as the Toast stack width and the TabBar tab caps that the rare-exceptions list
already covers, so this is allowed. It was on the ramp before and now is not. Recorded so
nobody "corrects" it back later.

---

## 6 · Sidebar header and content spacing

**Figma side DONE 2026-09-13. Final state below; the history is at the end of this item.**

Two goals, both from the owner:

1. The sidebar header's bottom border meets the rail header's bottom border, with no jog.
2. The header's logo tile starts on the same left edge as the rows below it.

The owner settled it by editing the light App Shell proof directly: hid the meta line, set
the header padding, and tightened the sidebar content padding. Those edits were then carried
into the components.

### Final values

| | Before today | Now |
|---|---|---|
| Header padding, top/bottom | 8 | **6** |
| Header padding, left/right | 8 | **12** |
| Header meta line ("Workspace") | shown | **hidden by default** |
| Sidebar content padding | 8 | **4** |
| Group padding | 8 | 8, unchanged |

### Why these numbers work

**Height.** With the meta line hidden, the header row is the 32px tile. 6 + 32 + 6 = **44**,
the same height as the rail header (4 + 36 + 4). Both bottom borders sit at **y 92**.

**Left edge.** Rows start at content padding 4 + group padding 8 = **12**. The header's left
padding is **12**, so the tile starts at x 12 too.

Every value is on a token: 6 is `--p-1-5`, 12 is `--p-3`, 4 is `--p-1`.

### Done in Figma

- `Sidebar/Header` master (`1394:416`): padding `[6, 12, 6, 12]`, bound to `spacing/1-5`
  and `spacing/3`.
- New boolean **`Show meta`** on `Sidebar/Header`, **default off**, bound to the meta text's
  visibility. The `Meta` text property is still there for anyone who turns it back on.
- `Sidebar` set, all 10 variants: `content` padding 8 → 4, bound to `spacing/1`. Content gap
  stays 8, group padding stays 8.

**Verified on every App Shell instance in the file, 14 of 15 aligned on both edges**: header
bottom at y 92 matching the rail, tile at x 12 matching the rows. That covers the Request
Flow, Admin Flow and Whats New screens, the spacing page, both shell proofs and the AppShell
page.

**The one that did not align is an old exploration**, `shell · Proposed · Mode = Dark ·
chrome proposal` inside the `Chrome · colour proposal (before / after)` frame on the App Shell
page. Its rail header carries a 52px override from the earlier colour proposal, so its rail
line sits at y 100. Left alone; it predates all of this.

### Consequences to know

- **RESOLVED — every header is 44.** The component's default tile was a 24px `Mark`, which
  made the 14 headers on the `Sidebar` doc page 36 while the shell (which swaps in a 32px
  `FeaturedIcon`) was 44. The default `Mark` is now `Size=default`, its 32px size. Verified:
  all 30 `Sidebar/Header` instances in the file measure 44.
- **RESOLVED — the footer lines up.** `Sidebar/Footer` (`1394:474`) now pads 12 at the sides,
  bound to `spacing/3`, top and bottom unchanged at 8. Its row starts at x 12, width 228, the
  same as every row above it. The master's own frame was also still 256 wide and is now 252.
  In the collapsed variants the footer row is 28 wide with its icon centred at x 26 of 52, so
  nothing clips.
- **The search field** now sits at x 4 (content padding only). It was at x 8 before, 8px left
  of the rows then as now, so its relationship to the rows is unchanged.
- **Collapsed sidebar.** Content padding 4 widens the collapsed inner column from 20 to 28.
  The 32px icon rows were already wider than that column before today, so this reduces an
  existing overflow rather than creating one.

### To do in code

`src/components/Sidebar/Sidebar.scss`. The header shares one rule with the footer today:

```scss
.ui-sidebar__header,
.ui-sidebar__footer { gap: var(--p-2); padding: var(--p-2); … }
```

Split the header out and leave the footer as it is:

```scss
.ui-sidebar__header {
  padding: var(--p-1-5) var(--p-3);  /* was --p-2 — 6 / 12 */
  border-bottom: var(--border-w-100) solid var(--sidebar-border);
}

.ui-sidebar__content {
  padding: var(--p-1);               /* was --p-2 — line ~305 */
}

.ui-sidebar__footer {
  padding-inline: var(--p-3);        /* was --p-2 — rows start at 12 */
  border-top: var(--border-w-100) solid var(--sidebar-border);
}
```

**The 32px header tile is not a component change in code either.** `SidebarHeader` renders
whatever the consumer passes. Use `Mark size="default"` (32) in `AppShell.stories.tsx` and in
any app that builds a shell; `sm` (24) makes the header 36 and it will no longer meet the rail
header.

**The 12 is really content padding plus group padding (4 + 8).** Nothing links them. If
either changes, the header's side padding has to follow by hand.

**"Hide the meta line" is not a code change to the component.** In code `SidebarHeader`
renders whatever children the consumer passes; there is no meta prop. Drop the second line
from the header content in `AppShell.stories.tsx`, and in any app that builds a shell.

**Verify in Storybook, don't assume.** In CSS both headers carry a 1px bottom border that is
added to the box, where Figma draws it inside. They stay level only if the sidebar header row
really is 32px in the build. Measure the App Shell story before calling it aligned.

**Scope.** `.ui-sidebar__header` and `.ui-sidebar__content` are used by every sidebar: the
Sidebar and App Shell stories, the FullScreenDialog story and five prototypes. That matches
Figma, where the change went into the shared masters.

Changelog entry required on `Sidebar.stories.tsx`.

### Doc pages brought up to date (Figma only)

The `Sidebar`, `AppRail` and `AppShell` component pages were audited for every value this
record changed, and corrected on 2026-09-13. Nothing here needs a code change; it is listed
so the Storybook docs get the same corrections when the code lands.

- **AppShell page:** rail 48 → 52 and sidebar 256 → 252 in the page header, the Overview
  pills, the Spec arithmetic (`48 + 52 + 252`) and the Spec pills. The tokens paragraph now
  says the tab strip shares the `--sidebar-*` palette and `--sidebar-border`, and that the open
  tab paints the page colour with a 10% tint. Changelog 1.2 added.
- **AppRail page:** "52px wide" chip, all four specimen labels, the Spec pills (`52`, tiles
  `--p-2` apart), the Do/Don't (`52 + 252`, and "six" brands — it still said eight, two retired
  brands ago). The Overview claimed the rail's tile gap matched the sidebar menu gap; that is no
  longer true and now says so. Changelog 1.3 added.
- **Sidebar page:** width tokens `15.75rem` / `3.25rem` in the Docs and Spec pills, the
  collapse captions `252px` / `52px`. Three new metrics pills document the header, content and
  footer spacing, which had not been on the page at all. Changelog 1.14 and 1.15 added.
- **Component descriptions** (what Assets and Dev Mode show): `AppRail`, `AppShell`, `Sidebar`,
  `Sidebar/Header` and `Sidebar/Footer` updated with the new widths and spacing. **Two of them
  were escaped more than once** — `AppShell`'s code sample displayed as `&amp;lt;AppShell` —
  from the description setter's read-modify-write trap. Both now store a single escape, which
  displays correctly.

### History

Earlier the same day the header went to `[4, 16, 4, 16]` with the meta line still showing
(4 + 36 + 4 = 44, tile at x 16 against rows at 16). The owner then replaced that with the
values above from their own edit. The `[4, 16, 4, 16]` values are superseded; do not apply
them.

---

## 7 · The App Shell page now holds only the final shells

**Figma only, 2026-09-13. No code change.**

All the testing frames were removed from the `App Shell` page: the owner's `my edits` frame,
the two dark and four light colour proofs with their captions, the light proof carrying the
owner's one-off overrides, and the older `Chrome · colour proposal (before / after)` frame
with its `Today · Mode = Dark` label. None of them contained a component master, so nothing
else in the file lost anything. **Node ids quoted earlier in this record for those proofs no
longer exist.**

The page is now a 2 × 2 grid of real `AppShell` instances, sizes as rows, light left, dark
right, each with a caption:

| | Light | Dark |
|---|---|---|
| 1440 | `3069:4352` | `2670:668` |
| 1920 | `3069:4553` | `2670:1095` |

Each is pinned to Mode, Brand Indigo and its `Space · width`. The two light shells are fresh
copies of the dark originals rather than the earlier light proof, so they carry no leftover
overrides. All four measure rail 52 · sidebar 252 · main 1136 (1440) or 1616 (1920), and in
all four the sidebar header's bottom border is level with the rail header's.

The `Dark · chrome proposal` variable mode is now used by nothing on this page. It was left in
place; removing a mode is a variables change and the owner has not asked for one.

---

## 8 · Owner's shell edits promoted into the AppShell component

**Figma side DONE 2026-09-13 for seven edits. Two more are HELD — see the end of this item.**

The owner edited the `App Shell · 1440 · Light` instance directly. A node-by-node diff against
its untouched dark twin found 40 differences, which reduce to nine real edits. Seven were
carried into the masters so every shell gets them.

### Promoted

| Edit | Where it now lives |
|---|---|
| "Dart Central" wordmark beside the logo icon, `base/leading-normal/Medium` on `text/foreground` | `AppShell` master, `Logo` slot, now hugging with padding 8 / 20 |
| Ask Aiden as an icon-only button: `Button/Icon-only`, aiden, default style, sm, sparkles glyph | `AppShell` master, `Actions` slot (the labelled secondary button was removed) |
| Second sample tab reads "DartBoards" with the layout-dashboard glyph | `AppShell` master's `TabBar` |
| Sidebar header: "Kahrman’s Home", meta "customize workspace" shown, house glyph | `AppShell` master's nested `Sidebar` |
| Admin group shows three rows: Overview, Integrations, Billing | `AppShell` master's nested `Sidebar` |
| Meta line on `xs/leading-none/Normal` (12/12), so a header with meta on is still 44 | `Sidebar/Header` master — keeps every header level with the rail whether meta is on or off |
| Open tab tint 10% → **8%** | `TabBar/Tab` `State=Open` master, plus 29 overriding nodes |

**The four shells on the App Shell page carried older overrides on their sidebars**, so a change
to the master could not reach them. Rather than reset those (which would also reset the menu
labels), the same header, meta, glyph and admin-row values were applied to the other three.
All four now match, and all 15 shells in the file still have the sidebar header level with the
rail header.

### Consequence to know

**The logo cell no longer sits over the rail.** In code `.ui-app-shell__logo` is
`width: var(--app-rail-width)` on purpose, so the divider after the logo lines up with the
rail's right edge. With a wordmark the cell hugs its content at 158, and the divider lands at
x 158 with nothing below it. (In Figma it had already drifted 4px when the rail went to 52 and
the logo slot stayed a fixed 48; code would have followed the token.) Accepted as the owner's
design; recorded so the code change is deliberate.

### To do in code

`src/components/AppShell/AppShell.scss`:

```scss
&__logo {
  /* width: var(--app-rail-width);  REMOVE — the cell now hugs icon + wordmark */
  justify-content: flex-start;
  padding-inline: var(--p-2) var(--p-5);   /* 8 / 20 */
}
```

`AppShell.stories.tsx`, and any app that builds a shell:

- `logo` = the icon button followed by the "Dart Central" wordmark at `--text-base` /
  `--leading-6`, `--font-medium`, `--foreground`.
- `actions` = Ask Aiden as an icon-only `Button` (`variant="aiden"`, `size="sm"`, Sparkles),
  with `aria-label="Ask Aiden"` — it loses its visible label, so the name has to be explicit.
- `SidebarHeader` content: name, then the meta line at `--text-xs` / `--leading-3` on
  `--muted-foreground`, beside a 32px tile.

**The 8% tint is mode-correct in code for free.** `--primary-soft` is already 8% in light and
10% in dark. Figma can only hold one paint opacity, so its open tab is 8% in both modes.

### HELD — two edits not promoted

**1. REVERTED 2026-09-13 — the line under the top bar stays `sidebar/border`.** The owner first asked for the whole line darker, then asked for the change undone. Every component-backed strip and tab bar (38 nodes, including all masters and all 15 shells) is on `sidebar/border`, which is what item 3 already specifies for code — **no change to item 3.** The owner's original override on the light 1440 shell was reverted with it. The original analysis is kept below for reference.

~~The line under the top bar, `sidebar/border` → `surface/border`.~~ Only the `TabStrip`
frame's own bottom stroke was changed. But the `TabBar` inside it draws its own bottom stroke
across x 158–1394, on top, still `sidebar/border`. So the stronger line shows only under the
logo and the Ask Aiden button, and the lighter one under the tabs — two weights on one line.
To make the whole rule stronger, the `TabBar` master's bottom stroke has to change too. In dark
`surface/border` is `#64748b`, about twice the contrast of the rail and sidebar edges
(`#334155`), so the top line would outrank every vertical line in the frame. Needs the owner's
call on both points.

**2. The search field's fill, `surface/bg-input-30` opacity 0.04 → 1.** This is a file-wide
Figma bug, not a shell change. The variable is white at full strength in light and white at 4%
in dark. Figma drops a bound variable's alpha and renders the paint's own opacity, so no single
opacity is right in both modes: 0.04 makes light inputs transparent, 1 makes dark inputs solid
white. The file is already split — **931 input fills at opacity 1 and 680 at 0.04, across 41
pages**. The owner's edit fixes light on one field and would break dark if promoted. A real fix
changes how the variable is modelled, which is a variables change. Not started.

---

## 9 · Page 119 browse page rebuilt, and two component fixes it exposed

**Figma only, 2026-09-13. No code change needed for either fix.**

The owner's dashboard browse page was rebuilt from scratch on Page 119 as four App Shell
screens — grid and rows, at 1440 and 1920, light — from component instances only. Nothing was
copied from the original frames, which were left in place.

**Header revised at the owner's request.** The first build used `PageHeader` with its toolbar
row, putting search and the controls on a second line under the title; with the large title that
made the header about 200px tall at 1440. Now the title is `Size=default` (24px, the rule for
working screens) with search, Filter, sort and the view switch in the header's `Actions` slot on
the title row: 56px at 1440. This departs from the recorded rule that a page's search belongs in
`toolbar` — the owner's call, for vertical space. **Filter is a `Toggle` (outline), not an outline
`Button`:** in the default variant an outline button reads `--primary-text` and `--primary-border`,
so it rendered blue beside the neutral sort field and view switch; the outline Toggle is the
neutral bordered control, and Filter opens and closes a panel, which is toggle behaviour.

**Then grouped into one section (owner, same day).** The owner removed the rule and tightened the
header-to-cards gap on one screen, then asked for the header and the content to share one
auto-layout frame with a separator. All four screens are now
`PageContainer › Stack level 3 "Section · Browse dashboards" › [PageHeader, Separator, grid or list]`,
so header → rule → content sit at L3 (16 at 1440, 24 at 1920) instead of the page's L1 between
header and content. `Stack` is the system's auto-layout frame; the `Section` component was not used
because its heading is a sub-heading (`h2`) and this is the page title. In Figma the
`PageContainer`'s own "Page header" slot is hidden, since the header now lives in the section; in
code that slot does not exist — `PageContainer` just receives the section as its child — so no
component change. **Moving an existing node between two slots inside an instance leaves a dead
reference** (the moved node reports an id that no longer exists), so the header was rebuilt in place
rather than moved.

**The grid reflows by itself.** Cards fill a wrapping Stack with a minimum width bound to
`width/80` (320) and a gap on `space/3-block`. At 1440 that gives three columns (347 each, gap
16); at 1920 four (362 each, gap 24, the ladder's × 1.5). Covers are a locked 16:9 AspectRatio.

**Dark versions, meta row and icon colour (owner, same day).** All four screens now have dark
copies beside them, pinned to Mode Dark. On the cards the date and views row fills the width with
date left and views right; on the rows view they stay side by side, because the content column is
too wide for space-between to read as one row.

**Every icon was coloured to match what it sits with**, as instance overrides on these screens:
the date and views icons take the muted colour of their text (48 per screen), the image
placeholders take muted (12 per screen), and icons inside controls take their control's label or
placeholder colour — the search field's icon to muted, the Share button's icon to `primary-text`.
In code none of this is needed: lucide renders `stroke="currentColor"`, and `.ui-input__icon` is
`--muted-foreground`.

**Open — this is a component-level Figma defect, not a page one.** Icon components bind their
strokes to `text/foreground`, and a colour set on a nested icon inside a master is discarded when
an instance swaps the glyph, which almost every instance does. So in Figma: every `Input` icon is
foreground where code is muted, and every `Button` icon in a style whose label is not foreground
(outline, secondary, link, ghost) mismatches its label. The page overrides fix these screens only.
A real fix needs icons that inherit colour, which Figma instances cannot do by swap; the variable-
mode workaround the Tabs indicator uses only works when the target equals a mode's foreground.

### Fixes made on the way

- **`ToggleGroup` gained `Show item 3`** (boolean, default on, bound in all 24 variants). It
  could not show fewer than three items, and the grid/rows view switcher has two. Default on,
  so no existing ToggleGroup changed. No code change: `ToggleGroup` takes any number of items.
  **Incomplete on its own — the owner caught it.** The Figma master rounds the outer corners by
  position: item 1 carries the left radii, item 3 the right, item 2 none, and items 4–8 are
  rounded on all four sides. So hiding item 3 leaves a group with no right-hand end, and
  showing item 4 or more gives pill-shaped middle items. Code has no such problem: it uses
  `:first-child` / `:last-child`. On Page 119 the two-item switcher gets its right radii as an
  instance override on item 2, bound to the same radius variable item 1 uses. **Open:** the
  master wants restructuring so the group frame owns the outer radius and border and the items
  are square with dividers, which renders correctly at any count.
- **`Toolbar` `Justify=between` did not justify.** The variant was laid out identically to
  `start`, so it never pushed its groups apart. It now uses space-between. This changed **33
  instances**, 24 of them on Admin Flow, which now render the way their setting always claimed.
  No code change: `justify="between"` already works in the build.

### Worth knowing for next time

- **A Stack instance keeps its master's fixed width and clips.** Stacks used for small inline
  runs (an icon plus a label) must be set to hug, or their later children silently vanish.
- **`AspectRatio`'s slot is named `Content`, the same as `Item`'s.** Searching a row for
  "Content" finds the thumbnail's slot first.
- **The screenshot service can return a cached image for minutes.** `node.screenshot()` from
  inside a script renders the current state.

---

## 10 · Icons take their component's label colour, and survive an icon swap

**Figma only, 2026-09-13. No code change: lucide already renders `stroke="currentColor"` and
`.ui-input__icon` is `--muted-foreground`.**

Every icon component bound its strokes straight to `text/foreground`. A colour set on a nested
icon inside a master is an override, and an override is discarded when an instance swaps the
glyph — which nearly every Button and Input instance does. So `Input` icons rendered foreground
where code is muted, and every Button icon in a style whose label is not foreground (secondary,
outline, link, status and aiden styles) mismatched its label.

### How it works now

- **A variable mode, not an override, carries the colour.** New variable `icon/color`. All
  1,746 `Icon/*` components now bind to it instead of `text/foreground` (1,792 paints). Its
  default mode is foreground, so any icon not inside a component that asks otherwise looks
  exactly as before.
- **Each component pins the mode matching its label.** 240 `Button` and 240 `Button/Icon-only`
  variants pin the mode for their label token; all 24 `Input` variants pin `muted`. A mode
  cascades to whatever icon sits inside and is not lost on a swap.
- **Two collections, because the plan allows 10 modes per collection and 15 colours were
  needed.** `Icon colour` holds 9 modes: foreground, muted, primary-foreground, primary-text,
  secondary-foreground, status-foreground, status, aiden-foreground, aiden. The two status modes
  alias into `Icon status`, which has error / info / success / warning. A status button pins
  both (for example `status` + `error`).
- **243 stale colour overrides inside the variants were cleared**, plus the ones on the
  hidden leading and trailing icons (below).

Verified on fresh instances with both glyphs swapped, in light and dark: every leading icon,
trailing icon and icon-only glyph resolves to exactly its label's colour, and the Input's
search icon to muted.

### Traps hit

- **A hidden icon inside a master cannot be read or edited.** Button's leading and trailing
  icons are hidden by default, so a sweep saw no vectors in them and left their old
  `text/foreground` overrides in place — which Figma then carried onto every swapped-in glyph.
  Fix: unhide, rebind, restore visibility.
- **The Figma connection dropped mid-write** and the change had in fact applied. Re-checking
  state before rerunning is what showed it.

### Not yet covered

Other components with icons — `Toggle`, `Badge`, menu items, `Sidebar` rows, `TabBar` tabs —
still resolve the default foreground mode. Each can adopt the same fix by pinning its label's
`Icon colour` mode on its variants. Instances that already carry an explicit icon colour
override (including the browse screens on Page 119) keep it.

---

## 11 · Page 119 space page rebuilt to match the browse page

**Figma only, 2026-09-14. No code change.**

The owner's "space page" frame was rebuilt as four App Shell screens (1440 and 1920, light and
dark) below the browse screens, from components only, with the same structure the browse page
settled on: `PageContainer` › `Stack` level 3 section › [`PageHeader` default size with actions
on the title row, `Separator`, content]. Header actions: download and share as ghost icon-only
Buttons, "Edit space" as an outline Button with a pencil.

**The grid is blocks of equal size (owner's correction, same day).** The first build was a
masonry of free-flowing columns; the owner wanted one thumbnail card to occupy the same block as
two compact cards stacked. Each row is a `Stack` of equal-width blocks; a block is either one
thumbnail card or a `Stack` of two compact cards. Compact cards are `Card Size=sm` with a
FeaturedIcon tile, a one-line truncated description, a rule and the link. **The pair sets the
row height at its natural size; the thumbnail card fills the row, and its image fills whatever
height remains** — so the equality holds at any width instead of being tuned by pixels. Measured:
thumbnail = pair = 260 at 1440 (122 + 16 + 122) and 268 at 1920, the source's own 268. Every row
must contain at least one pair, or it has nothing to take its height from. Three blocks per row
at 1440 (6 blocks), four at 1920 (8 blocks). In code: CSS grid with auto rows, the pair a
two-row subgrid, the thumbnail image `flex: 1`.

**Traps:** `lockAspectRatio()` locks whatever proportion the frame has at that moment, so
swapping an AspectRatio's `Ratio` variant afterwards changes nothing. And a card's content can
silently overflow a height it is stretched to — the first build clipped every compact card's
link at 96 px against a 122 px need.

The image placeholders pin the new `Icon colour` = `muted` mode on their AspectRatio (item 10),
so the glyph is muted without an override.

**The card menu (owner's call, same day): a radio group for card layout, and a destructive
item.** Built as two extra screens, `Space · 1440 · Light/Dark · card menu open`, with a
`DropdownMenu` opening under the first card's "more" button: a "Card layout" label, a radio
group (Compact / Thumbnail, Thumbnail selected), a separator, "Dashboard info", a separator, and
"Remove from space" as a destructive item. The source's "Card layout ▸" submenu became the radio
group, which `DropdownMenu` already supports. The sidebar's right-click "Make default space /
Rename space" menu (`ContextMenu`) was not built.

### `DropdownMenu/Item` gained a destructive variant — CODE CHANGE REQUIRED

**Figma:** the set gained `Variant = default / destructive` (3 → 6 variants), matching
`ContextMenu/Item`: label `status/error/base`, hover fill `status/error/light` at 6%. The icon
takes the error colour through the `Icon colour = status` + `Icon status = error` modes (item 10),
so it stays red when the glyph is swapped. Existing items became `Variant=default` and did not
change. **`ContextMenu/Item`'s destructive icon was an override with the same swap problem and now
uses the modes too.**

**Trap:** cloning a variant into its own set does not keep its layers' component-property
references. The destructive clones rendered their original "Settings ⌘," text because their label,
icon and shortcut layers were not linked to `Label`, `Icon`, `Show icon`, `Shortcut` and `Show
shortcut`; the links were copied across from the default variants by layer name.

**Code:** `DropdownMenuItem` has no `variant` today. Add it the way `ContextMenuItem` has it:
`variant?: 'default' | 'destructive'` in `DropdownMenu.types.ts`, a `ui-dropdown-menu__item--destructive`
modifier, and in `DropdownMenu.scss`:

```scss
&--destructive {
  color: var(--error);
  &:hover:not([data-disabled]),
  &:focus-visible:not([data-disabled]) {
    background: var(--error-light);
    color: var(--error);
  }
}
```

The same rule exists in `ContextMenu.scss` (line ~59). This is the fifth menu-item style copy the
roster says to avoid; if it lands, it is the moment to extract a shared menu-item base. Changelog
entry required on `DropdownMenu.stories.tsx`.

---

## 12 · A quieter sidebar, after the v11 comparison

**Figma, 2026-09-14. CODE CHANGE REQUIRED for every part.**

The owner compared our shell with the Figma Make "DART Central v11" frame and asked for five
things from it: muted links that light up on hover and when active, small uppercase group
labels, a softer active row with hover still distinct, a plain "Home" header, and a red count
badge. All five were made in the components, so every shell that uses `AppShell` picked them up
(30 sidebar headers across App Shell, Page 119, What's New, Request Flow, Admin Flow, the
spacing page and the AppShell page).

### 12a · New token: `--sidebar-muted-foreground`

Resting links in the sidebar and the rail. Light **slate-500 `#64748b`** (4.55:1 on the light
sidebar), dark **slate-400 `#94a3b8`** (6.35:1 on `#172033`). Dark deliberately does not use
slate-500, which is 3.42:1 there and fails AA. It is not `--muted-foreground`, because dark
`--muted-foreground` is slate-200 and only 1.18:1 away from the foreground, so it does not mute.

```scss
// light block
--sidebar-muted-foreground: #64748b;
// dark block
--sidebar-muted-foreground: #94a3b8;
```

Figma: `sidebar/muted-foreground` in `Mode`, plus a 10th `Icon colour` mode, `sidebar-muted`,
which aliases it. Add the pair to `scripts/contrast-check.mjs`
(`['sidebar-muted-foreground','sidebar']`). **The Icon colour collection is now full at 10
modes.** The next icon colour needs a second collection.

### 12b · Links rest muted, brighten on hover, active is foreground and medium

`Sidebar.scss`, `.ui-sidebar__menu-button` and `.ui-sidebar__menu-sub-button`:

```scss
color: var(--sidebar-muted-foreground);          // was --sidebar-foreground
&:hover  { color: var(--sidebar-accent-foreground); }
&--active { color: var(--sidebar-accent-foreground); font-weight: var(--font-medium); } // weight already there
```

Lucide icons use `currentColor`, so the glyph follows with no extra rule. In Figma the icon
follows through the `Icon colour` mode on each variant (`sidebar-muted` at rest). **The `outline`
state is muted too.**

`AppRail.scss`, `&__item`: `color: var(--sidebar-muted-foreground)` at rest; hover and active
set `color: var(--sidebar-accent-foreground)`. Figma pins `Icon colour = sidebar-muted` on the
rail item's button when `Active=false` and `foreground` when `Active=true`.

### 12c · Softer active fill, hover distinct from it

Figma: active fill is `sidebar/accent` at 70%, hover is `sidebar/accent` at 35%. Figma cannot mix
colours, so these are paint opacities over the sidebar. In code:

```scss
// Sidebar.scss — menu button and sub button
&:hover:not(...) { background: color-mix(in srgb, var(--sidebar-accent) 35%, var(--sidebar)); }
&--active        { background: color-mix(in srgb, var(--sidebar-accent) 70%, var(--sidebar)); }

// AppRail.scss — &__item: same two values. This also fixes the flagged
// "hover and active are the same paint" note in that file; delete the note.
```

Hover was 55%, which sat too close to a solid active. `sidebar/accent-hover` (the old 55% value)
is no longer used by the sidebar rows in Figma; leave the variable until code lands, then delete
it. **The AppRail/Item Figma set still has no hover variant**, so rail hover exists in code only.

### 12d · Group labels: small, uppercase, letter-spaced

`.ui-sidebar__group-label`:

```scss
font-weight: var(--font-semibold);     // was --font-medium
letter-spacing: var(--tracking-wider); // Figma: 5%
text-transform: uppercase;
color: var(--sidebar-muted-foreground); // was --muted-foreground
```

Figma: new text style `xs/leading-normal/SemiBold Upper` (12, semibold, 5%, UPPER) on
`Sidebar/GroupLabel`. The label's text stays as typed ("Admin"); the uppercase is the style.
Height stays 32.

### 12e · Quiet header: "Home", no tile, no meta

`Sidebar/Header` gained **`Show visual`** (default on), which hides the Mark tile. The header now
has **min-height 44**, so with the tile gone it still lines up with the rail header (all 30
headers measured 44 tall; bottom edge at y 92 on the top-of-page shells). Every sidebar header inside `AppShell` is set
to Name "Home", Show meta off, Show visual off. Headers outside the shell (Sidebar docs, the
dashboards) still show the tile.

Code: the header is composed by the app, so this is mostly a usage change: render the title with
no `Mark` and no description. Add `min-height: var(--h-11)` to `.ui-sidebar__header` so a
text-only header keeps the rail alignment, and make the title `--text-sm` semibold,
`--sidebar-foreground`. Update the `AppShell` stories to the plain "Home" header.

### 12f · Red count badge

`Sidebar/MenuButton`'s badge is now a red pill: fill `status/error/base`, text
`status/error/foreground`, full radius, 20 min width and height, 6 side padding. `Show badge`
now drives the pill; `Badge` still drives the number.

```scss
.ui-sidebar__menu-badge {
  background: var(--error);
  color: var(--error-foreground);
  border-radius: var(--rounded-full);  // was --rounded-md
  padding: 0 var(--p-1-5);             // was --p-1
  font-weight: var(--font-semibold);
}
```

Check `--error-foreground` on `--error` at 12px in both modes with `test:contrast` before
shipping. The rail's unread `StatusDot` is unchanged.

**Changelog rows needed:** `Sidebar.stories.tsx`, `AppRail.stories.tsx`, `AppShell.stories.tsx`.

**Traps:** the first rebind pass reported success but the icons in the shells stayed white,
because 132 row and rail instances carried their own hard-set glyph stroke (`sidebar/foreground`,
`text/secondary-foreground`) that overrode the mode. They now bind `icon/color`. Also, the
`hover` variants of `MenuButton` and `MenuSubButton` had lost their property links (the clone
bug from item 11) and were relinked before restyling.

---

## 13 · The sidebar collapse button says what it does

**Figma, 2026-09-14. CODE CHANGE REQUIRED.**

The owner reviewed the collapse button at the top of the rail. **Where it sits is right:** it
stays in one place whether the sidebar is open or closed. **And collapsing already works the
right way:** the sidebar goes away entirely and the rail is the collapsed view. There is no
icon-only sidebar in the shell. Three changes came out of the review.

### 13a · The glyph follows the state, with a tooltip

**Figma:** new set **`AppRail/SidebarTrigger`**, `Sidebar = open | closed`, on the AppRail page
beside the other masters. `open` shows **panel-left-close**, `closed` shows
**panel-left-open**; both are the ghost icon-only Button. It replaced the plain panel-left
button in the `AppRail` master's header slot and in the `AppShell` master, so all 29 shells now
show it. The AppRail Spec (light and dark) shows both states with their tooltips, "Collapse
sidebar ⌘B" and "Expand sidebar ⌘B".

**Code**, `Sidebar.tsx` › `SidebarTrigger` (today it always renders `PanelLeft` with a fixed
"Toggle sidebar" label):

```tsx
const { state, toggleSidebar } = useSidebar();
const open = state === 'expanded';
<button
  aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}   // before {...rest}, as now
  {...rest}
  aria-expanded={open}                                        // derived state, after rest
  aria-controls={sidebarId}                                   // if the panel has an id
>
  {open ? <PanelLeftClose aria-hidden="true" /> : <PanelLeftOpen aria-hidden="true" />}
</button>
```

Wrap it in a `Tooltip` showing the label plus the shortcut (`⌘B`, or `Ctrl+B` off Mac).
`SidebarTrigger` is used inside Sidebar too, so the label and icon change reaches every consumer.
Changelog row on `Sidebar.stories.tsx`.

### 13b · It does not read as the first application

**Figma:** the trigger's glyph pins `Icon colour = sidebar-muted` (item 12), and the
Applications slot starts **16** below the header, not 12. **This supersedes item 4's
`padding-top: var(--p-3)`.**

**Code:**
- `AppRail.scss`: `&__apps { padding-top: var(--p-4) }`.
- The trigger in the rail header takes `color: var(--sidebar-muted-foreground)`, with
  `--sidebar-accent-foreground` on hover.

### 13c · Clicking the active application toggles the sidebar

Behaviour only, no Figma visual. It is written on the AppRail page (Docs prose, a ⌘B keyboard
pill, and changelog 1.4) so no one designs a different action for the active app.

**Code**, `AppRail.tsx` › `AppRailItem`: when `active`, `onClick` calls `event.preventDefault()`
then `toggleSidebar()`. An active item is an `<a href>` to the page you are already on, so
without `preventDefault` it reloads the route. Read the sidebar context without throwing:
`AppRail` can render outside a `SidebarProvider`, and today `useSidebar` throws there, so use an
optional read (or a `useSidebarOptional`) and do nothing when there is no provider. Call the
consumer's own `onClick` first and stop if it called `preventDefault`. Changelog row on
`AppRail.stories.tsx`.

### 13d · Story fix: the AppShell story uses the wrong collapse mode

`AppShell.stories.tsx` renders `<Sidebar collapsible="icon">`, which shrinks the sidebar to a
second icon column beside the rail. The shell's real behaviour is to hide it:
`collapsible="offcanvas"` (the Sidebar default, so the prop can simply be dropped). The
`AppRail.stories.tsx` header uses a `LayoutGrid` glyph labelled "Collapse sidebar"; use
`SidebarTrigger` there too so the story does not show an app-launcher icon.

---

## 14 · Sidebar right-click menu on the space page

**Figma only, 2026-09-14. No code change.**

Two new screens under the card-menu pair: `Space · 1440 · Light/Dark · sidebar menu open`. A
`ContextMenu` opens where the pointer landed on the "Servicing operations" row, with "Make
default space" (star, shown in its hover state) and "Rename space" (pencil). It is placed in
the Main content slot at absolute position with that slot's clipping turned off, so it can
overlap the sidebar edge the way a real context menu does.

**The space screens' sidebar had no spaces in it**, so there was nothing to right-click. All six
Space screens (1440 and 1920, light and dark, plus the two card-menu screens) now show group 1
Search, Dashboards, Recent, Favourites, and a `Primary workspace` group with **Servicing
operations** (active, the space the page shows), Collections desk and Create new space. The
browse screens still show the placeholder rows; they want the same treatment.

**Noticed, not changed:** in dark mode `ContextMenu`'s hover row paints `surface/accent`
(slate-700) on a slate-600 popover, so the hovered row is darker than the menu around it. Every
menu family does this, so it is a system question, not a fix for this screen.

---

## 15 · Ask Aiden is a ghost icon-only button

**Figma, 2026-09-14. CODE CHANGE REQUIRED. Supersedes item 8's `variant="aiden" size="sm"`.**

The owner set the example on `App Shell · 1440 · Dark`: Ask Aiden in the top bar is a plain
**ghost icon-only Button** at the default size (36), with the sparkles glyph at 20 in the neutral
secondary-foreground colour. No gradient fill. The `AppShell` master's Actions slot now holds
exactly that, and every shell follows: 31 AppShell instances, 9 of which still had the old text
"Ask Aiden" button (`App Shell · 1440 · Light` and the eight Page 119 browse screens) and were
replaced.

**Code**, `AppShell.stories.tsx` (and any app composing the shell):

```tsx
<Button
  id="shell-ask-aiden"
  variant="default"
  style="ghost"
  iconOnly
  IconCenter={() => <Sparkles size={20} aria-hidden="true" />}
  aria-label="Ask Aiden"
/>
```

Ghost in the `default` variant is the neutral-slate carve-out, so it does not theme and does not
compete with the page's primary action. Wrap it in a `Tooltip` reading "Ask Aiden" so the
icon-only control still names itself on hover. Update the `AppShell` roster note in `CLAUDE.md`
("actions = Ask Aiden alone") only if it names the gradient. Changelog row on
`AppShell.stories.tsx`.

---

## 16 · What's New article: auto-advancing "How to get started" steps

**Figma, 2026-09-14. No component change, but the pattern has no component in code — decide
before building it.**

The Introducing Dartboards article (both modes, rebuilt from the updated v11 frame) shows its
three getting-started steps in one `Card` that steps through on its own. The top of the card is
a step bar: one `Progress` (size sm) per step with the step name as its label, so the running
step fills while it plays. Steps 1 and 2 read "Done" at 100, step 3 reads "Now" at 50. A ghost
icon-only pause button sits at the end of the bar. Below is the running step's content (Step 3
of 3, title, description, tips) beside its video.

**Code has no component for this.** Built from parts it would be `Tabs` semantics (each step is a
clickable tab, its panel shipped beside it) plus a timer and a `Progress` per trigger. Needed
whichever way it lands:
- auto-advance on a timer tied to each step's video length, looping or stopping after step 3;
- a **pause/play control**, required by WCAG 2.2.2 for anything that moves on its own for more
  than five seconds;
- no auto-advance under `prefers-reduced-motion` (steps stay clickable);
- clicking a step jumps to it and restarts its bar.

If a second page wants it, promote it to a component (`Tabs` `variant="steps"` or a separate
`Stepper`). Until then it is a composition on this page only.

**Standalone copy for Figma Motion (owner's call, same day).** The owner asked for the step-through
to be built as a standalone, not a component. Two top-level frames sit under the articles on the
Whats New page: `Get started · step-through · light (standalone)` and `· dark (standalone)`.
They were assembled from the same library parts and then **fully detached**: no instances or
slots remain, but every fill, stroke, text style and spacing is still bound to its variable, so
both modes still resolve. They hold **all three step panels** (`Step 1 · panel` …
`Step 3 · panel`, 1 and 2 hidden) and the three progress bars, so Motion can animate the bars
and swap panels. Keyframes cannot be written inside an instance, which is the reason for
detaching. **Steps 1 and 2 copy is a draft** written from the v11 "What's included" text; the owner
has not supplied it. The article frames still show the composed card.

---

## 5a · Superseded — the original hold

Kept for the reasoning. **Not applied, on purpose.** The owner's rail is 52 wide. Taking
that alone is not a rail change, it is a change to the width every page is drawn at.

`AppShell` composes rail + sidebar + main across a fixed viewport, so the rail's width comes
straight out of the content window:

| | Rail | Sidebar | Main at 1440 | Main at 1920 |
|---|---|---|---|---|
| Today | 48 | 256 | **1136** | **1616** |
| Rail 52 alone | 52 | 256 | 1132 | 1612 |
| Owner's frame | 52 | 232 | 1156 | 1636 |

1136 and 1616 are not incidental. They are the widths every flow screen is drawn at, across
roughly 84 `PageContainer` instances, and the Admin Flow screens are each exactly 1136.
Moving the rail alone leaves all of them 4px wider than the container they sit in.

The owner's own frame narrows the sidebar to 232 at the same time, which lands on 1156. So
the width is really one decision about the content window, taken across the rail and the
sidebar together, not two independent ones. Settle it once and redraw the flow screens to
whatever number comes out.

Resolved by item 5 above: the sidebar gave back the 4, so 1136 and 1616 held and nothing
had to be redrawn.

---

## Traps worth keeping

Things that cost time on this pass and will cost it again.

**`layoutSizingHorizontal` reads `FIXED` on a hidden node no matter what it really is.** A
detector that scans for FIXED will flag every hidden region in the file as a defect. The
only way to read the true value is to unhide the node, read, and re-hide. Fifteen nodes
were reported as "still FIXED" here and all fifteen were already FILL.

**Setting a child to FILL while its parent is hidden collapses it.** A hidden parent does
not participate in auto-layout, so the child resolves against nothing and lands at its
minimum, 20 here rather than 220. Unhide the *whole ancestor chain* first, set sizing, then
restore visibility in reverse order. This is the hide-last rule, and the ancestor half of
it is the part that is easy to miss.

**A rejected tool call may already have run.** The script that darkened the top bar's line
was rejected by the owner, yet the masters came back holding the new value: the rejection
arrived after Figma had applied the write. Never assume a rejected write did nothing — read
the file before and after. And scope an undo to exactly what that write touched: a blanket
"revert every `surface/border` bottom line" also caught four hand-drawn frames (`Chat —
showcase`, two on `TEST`, `Page 93`) that had used `surface/border` since before this work,
and they had to be restored.

**A number that looks wrong may be the collapsed variant.** `submenu → 20` read as a
failure and was correct: in a 52-wide collapsed sidebar, 52 minus two lots of 16 padding is
20. Check which variant a number came from before calling it a bug.

---

## Landed in code — 2026-09-15 (branch `code-fixes`, not yet committed)

Every item on the Figma "✅ Code changes to make" page is implemented. `tsc`, `npm run build`,
the guardrail greps and `npm run test:contrast` all pass, and the App Shell story was checked in
the browser in light and dark mode.

- **Geometry:** rail 52 and sidebar 252, so Main is still 1136 at x 304 (1440). The rail header
  now has the sidebar header's `--h-11` minimum, so **both headers measure 44 and both bottom rules
  sit at y 92**, matching the Figma spec. Without it the rail header was 37, because the collapse
  button in code is 28px, not the 36px tile Figma draws.
- **One value differs from Figma: light `--sidebar-muted-foreground` is `#5b687c`, not slate-500
  `#64748b`.** The contrast gate runs every brand × tint. On the `rm` rail with `data-tint="rail"`,
  slate-500 measured **3.79:1**, below AA. `#5b687c` is the lightest value that clears AA in every
  context (worst 4.51:1, `nb` tinted rail). Dark stays slate-400. **The Figma variable still holds
  slate-500 and should move to match — owner's call.**
- **Active-item toggle:** clicking the active `AppRailItem` collapses and reopens the sidebar
  without navigating, and the trigger's label and `aria-expanded` follow. Inactive items are
  unaffected.
- **Menu-item copies:** `DropdownMenuItem variant="destructive"` copies the ContextMenu rule into
  an existing copy, so the count stays at four. No shared base was extracted.
- **Page header exception** is recorded in CLAUDE.md's `PageHeader` row.
