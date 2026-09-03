# MANAGE pages — admin affordances (KPI · Add · Edit path)

**Date:** 2026-09-03 · **Surface:** Figma only, file `jzc2ME8xVmfX1V8OCt2HC2`, page `Admin Flow` (`2106:4324`) · **No code changes** (no Storybook changelog entry).

## Problem

The MANAGE pages (5.1–5.4) and 6.1 Access Control read as reports, not as places an admin manages things. Before this work:

| Page | Add | KPI | Row/card actions | Drawn edit path |
|---|---|---|---|---|
| 5.1 Dashboards | none | none | `⋯` menu (closed) | only on 4.5, in APPLY |
| 5.2 Banners | `New banner` | none | Switch · Edit · Delete per card | only the request-driven Apply on 4.4 |
| 5.3 Promotions | none | none | `⋯` menu (closed) | none |
| 5.4 URL Redirects | none | none | `⋯` menu (closed) | none |
| 6.1 Access Control | none | none | `⋯` menu (closed) | none |

Only 5.2 has a heading row at all; 5.1, 5.3, 5.4 and 6.1 have a bare `page-heading` in the column with nothing beside it. The design critique had already flagged that three of the six MANAGE pages cannot be edited.

## Decisions (owner, 2026-09-03)

1. **Scope:** 5.1, 5.2, 5.3, 5.4 and 6.1. **5.5 Usage Analytics and 5.6 Activity stay read-only** — analytics and a log have nothing to add; 5.5 already carries a four-tile stat row.
2. **KPI tile sits in the heading row, left of the Add button.** One number per page, derived from the page's own rows so totals reconcile (the recorded `numbersReconcile` rule).
3. **5.3 gets `Promote a dashboard`.** This is the manual path the two-edit-paths principle already grants admins (authored directly, recorded in Activity under their name). The page copy changes to say most promotions come from a request and an admin can promote directly.
4. **Edit path is drawn per page as two frames:** the `⋯` row menu open, and the edit drawer. Banners have no menu (card actions exist) and get the drawer only.
5. **Banner count reconciles to the cards:** 5.2 shows 3 active of 6, so 1.1's `Active banners` tile — and the KPI widgets cloned from it on 1.2, 1.3 and 1.6 — change from 4 to 3.
6. **Menu styling:** a state change (Decommission → Archived, End promotion early) is a plain item after a separator; only a true removal (Remove redirect, Revoke admin, Revoke access) is `destructive`. Same reasoning that made Close a quiet ghost: dressing a reversible move in red tells the admin something untrue.
7. **6.1's two adds live on their section headings** (`Add admin`, `Grant request access`), each beside the table it feeds; the page heading carries the KPI only.
8. **Add drawers are not drawn.** An add is the page's edit drawer with empty fields and a different title and verb — the recorded "same drawer, different header/verb" principle. Each page's doc panel states this.

## 1 · Heading row

Every in-scope page gets the LAND shape. Reference: `1.1`'s `page-heading row` (`2293:5143`).

```
page-heading row   HORIZONTAL · gap 32 (spacing/8) · MIN/MIN · FILL/HUG
├─ page-heading    FILL            (existing frame, unchanged)
├─ kpi             HUG             ui-card [stat — …], Card Size=sm
└─ actions         HUG · gap 16 (spacing/4) · MIN/CENTER
   └─ ui-button [New …]            Variant=default, Style=default, Size=default
```

- On 5.1, 5.3, 5.4 and 6.1 the row is **created** and the existing `page-heading` moved into it at the same column index. On 5.2 the existing `page-heading row` (`2248:2172`) gains `kpi` and its loose `ui-button [New banner]` moves into a new `actions` frame — the same fix the LAND rows got.
- 6.1's row is `[page-heading, kpi]` — no `actions` (decision 7).
- The KPI is a clone of 1.1's `ui-card [stat — pending approvals]` (`Card` set `1812:800`) with `Size=sm`. Its three text nodes are named `stat value`, `stat title` and `stat caption` and live inside a nested stat instance (`…;1811:810;…`) — set them by name, never by index (the recorded findAll-order lesson). Width hugs; no fixed width.
- Top-aligned (`MIN`) so the title, the tile and the button share the row's top edge. The tile's bottom edge will sit below the description; that is accepted — centring would float the button mid-tile.

### KPI content

| Page | Value | Label | Qualifier | Derivation |
|---|---|---|---|---|
| 5.1 | 201 | Published | across 3 products | page copy ("201 published") and 1.1's tile agree |
| 5.2 | 3 | Active | of 6 · 1 scheduled | count of cards whose switch is on and status is `active` |
| 5.3 | 2 | Live | ending within 30 days | rows whose `Status` reads Live — Originations Daily Vol and Portfolio Risk Summary (1 Scheduled and 2 Ended rows are not counted) |
| 5.4 | 3 | Active redirects | 2,306 hits this month | rows whose `Status` reads Active (the `/reports/q2-forecast` row is Inactive); qualifier is the sum of the `Hits` column over **all four** rows — 847 + 213 + 1,204 + 42 — because a hit on a now-inactive redirect still happened |
| 6.1 | 4 | Admins | 5 with request access | row counts of the two tables |

The implementation records each derived value in the ledger beside the rows it was read from.

## 2 · Add

| Page | Button | Opens |
|---|---|---|
| 5.1 | `New dashboard` | the `Edit dashboard` drawer, empty, titled `New dashboard`, primary reads `Create dashboard` |
| 5.2 | `New banner` (exists) | the `Edit banner` drawer, empty, titled `New banner`, primary `Create banner` |
| 5.3 | `Promote a dashboard` | the `Edit promotion` drawer with Dashboard as a `Combobox` (long searchable list — the Select/NativeSelect/Combobox routing rule), primary `Promote` |
| 5.4 | `New redirect` | the `Edit redirect` drawer, empty, titled `New redirect`, primary `Create redirect` |
| 6.1 | `Add admin` on the admins section heading · `Grant request access` on the request-access section heading | the respective drawer, empty |

None of these add states is drawn (decision 8); each page's doc `body` panel gains one sentence stating it.

**5.3 copy change** — the description currently reads: *"Every promotion comes from an approved Promote request and ends on its own date without anyone doing anything."* It becomes: *"Most promotions come from an approved Promote request; a platform admin can also promote a dashboard directly. Every promotion ends on its own date without anyone doing anything."*

**6.1 section headings** are today two bare `section heading` TEXT nodes sitting directly in the content column, above each table. Each is wrapped into a `section header` frame — the LAND shape (`2190:1036`): `[section heading TEXT, spacer (FILL), ui-button (HUG)]`, HORIZONTAL, gap 8 (`spacing/2`), cross-axis CENTER — with the button `Style=default, Size=sm`. The `[section header, table]` pair then sits in a `section — admins` / `section — request access` frame at gap 8, so 6.1's sections match the model asserted on the LAND frames.

## 3 · Row menu (`⋯`) — frame "a" per page

Reuse 2.4's open menu exactly: clone `ui-dropdown-menu [row actions]` (`2228:1827`, `DropdownMenu/Content` `546:52`, 224 wide, `layoutPositioning: ABSOLUTE`) and anchor it under the `⋯` of the **second row** of the page's table, so the first row stays a clean reference. Items are `DropdownMenu/Item` (`544:63`) instances; the rule is a `DropdownMenu/Separator` (`544:66`); removals use the Item's destructive variant.

| Page | Items (in order) |
|---|---|
| 5.1a Dashboards | Edit · Promote · View usage · — · Decommission |
| 5.3a Promotions | Edit dates · Open dashboard · — · End promotion early |
| 5.4a Redirects | Edit · Test link · — · **Remove redirect** |
| 6.1a Access Control (admins table) | Edit scope · — · **Revoke admin** |

The request-access table's menu (Edit level · — · **Revoke access**) is stated on 6.1's doc panel, not drawn. 5.2 has no menu frame.

## 4 · Edit drawer — frame "b" per page

Base: clone 4.5's drawer (`Drawer` set `514:236`, `Side=right`, `Show footer` on). Header: title + description **"Direct edit — no request. Recorded in Activity under your name."** (4.5's wording, verbatim). Body slot holds a `form` frame of field instances. Footer: ghost `Cancel` + default primary, both `Size=sm` — the footer convention every drawer in the file already follows.

| Frame | Title | Primary | Fields (component) |
|---|---|---|---|
| 5.1b | Edit dashboard | Save changes | **verbatim clone of 4.5's form** — Name (Input) · Project (Input) · Inventory number (Input) · Lifecycle (NativeSelect) · Tableau link (Input) |
| 5.2a | Edit banner | Save changes | Severity (NativeSelect) · Scope (NativeSelect) · Message (Textarea) · Starts (DatePicker) · Ends (DatePicker) — 4.4's apply drawer without its `was …` diff rows |
| 5.3b | Edit promotion | Save changes | Dashboard (Input, `Disabled=true` — a promotion's subject cannot change) · Starts (DatePicker) · Ends (DatePicker) · Reason (Textarea) |
| 5.4b | Edit redirect | Save changes | From (Input) · To (Input) · Reason (Textarea) · Status (NativeSelect: active / paused) |
| 6.1b | Edit admin | Save changes | Person (Input, `Disabled=true`) · Administers (three `Checkbox` rows: DART Central · Dartboards · Aiden) |

Field values are the values of the row the menu was opened on (frame "a"'s second row), so a reader can walk a → b and see the same item. `Edit request access` (Person disabled · Level NativeSelect · May file as three Checkboxes: Dashboard · Banner · General) is stated on 6.1's doc panel, not drawn.

Component ids: Input `192:281` · NativeSelect `205:233` · Textarea `199:257` · Checkbox set on page `215:32` · DatePicker field on page `2160:44` · Combobox on page `581:44`. Each drawer body is `Size=sm` fields to match 4.5.

## 5 · Frames, placement, naming

Nine new frames. Pages 5.1–5.6 are pages, not states, so sub-states take a letter:

| Frame | Section | Base |
|---|---|---|
| `5.1a  Dashboards — row menu open` | 5 · MANAGE | clone of 5.1 |
| `5.1b  Dashboards — edit drawer` | 5 · MANAGE | clone of 5.1 + scrim + drawer |
| `5.2a  Banners — edit drawer` | 5 · MANAGE | clone of 5.2 + scrim + drawer |
| `5.3a  Promotions — row menu open` · `5.3b  Promotions — edit drawer` | 5 · MANAGE | clones of 5.3 |
| `5.4a  URL Redirects — row menu open` · `5.4b  URL Redirects — edit drawer` | 5 · MANAGE | clones of 5.4 |
| `6.1a  Access Control — row menu open` · `6.1b  Access Control — edit admin` | 6 · CONFIGURE | clones of 6.1 |

- Each "a"/"b" frame is cloned **after** its base page has received the heading row, so the state frames carry the KPI and Add too.
- Scrim and drawer follow 1.3's construction: scrim absolutely positioned and sized to the frame, drawer `Side=right` flush to the frame's right edge (1.3's drawer is the measured reference: 420 wide, full height).
- Frames sit to the right of their base in the section, 80px apart, matching the section's existing rhythm.

### Records to update

- **Flow map** (`② ADMIN — FLOW MAP · diagram`, `2291:5143`): its asserted index gains the nine frame names; the LAND-section assertion script pattern is reused to check them.
- **READ FIRST** (`2122:3383`): the "status" section notes that MANAGE pages are now editable and that add = edit drawer with empty fields.
- **Doc `body` panels** on 5.1, 5.3, 5.4, 6.1: one sentence each on the add rule; 6.1 also lists the request-access menu and drawer.
- **1.1, 1.2, 1.3, 1.6:** `Active banners` value 4 → 3 (decision 5).
- **`docs/figma-ledger.json`**: one entry under `exampleScreens.adminFlow2026_09_02` recording the decisions above, the derived KPI values, and the node ids of every new frame, menu and drawer.

## Constraints

- Components and tokens only — every fill, stroke, gap, padding and radius bound; no hand-drawn geometry where a master exists. The eight-check lint (unbound paint, unstyled text, generic names, unbound geometry, overflow, clip) is all zeros on every touched frame before a page counts as done.
- Reuse over rebuild: menus are clones of 2.4's, drawers are clones of 4.5's, the KPI is a clone of 1.1's tile, 6.1's section headings reuse the LAND `section header` shape.
- Nothing on 5.5 or 5.6 changes.
- One commit per page (base + a + b), each with lint evidence in the message.

## Verification (the plan's exit criteria)

1. Every in-scope page's heading row is `[page-heading, kpi, actions]` (6.1: `[page-heading, kpi]`), gaps bound, `actions` at 16.
2. Each KPI value equals its derivation in §1 when recomputed from the page's rows.
3. Every "a" frame's menu items match §3 in order; exactly the listed removals are destructive.
4. Every "b" frame's footer is `[ghost Cancel sm, default primary sm]`; fields match §4 in order and component.
5. The flow map index contains all nine names; lint all zeros on the five base pages, nine new frames, four LAND frames touched by the banner count, and the two doc panels.

## Out of scope

Add drawers drawn as frames · a drawn `Edit request access` drawer · any change to 5.5 / 5.6 · prototype connections · code or Storybook changes.
