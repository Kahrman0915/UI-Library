# MANAGE Pages — Admin Affordances Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give 5.1–5.4 and 6.1 in the Figma Admin Flow a KPI tile and an Add button in a LAND-shaped heading row, and draw each page's edit path as a row-menu-open frame plus an edit drawer.

**Architecture:** Every write is a `use_figma` script on file `jzc2ME8xVmfX1V8OCt2HC2`, page `Admin Flow` (`2106:4324`). Nothing is built from scratch: the heading row copies 1.1's, the KPI is a clone of 1.1's stat tile at `Size=sm`, the menu is a clone of 2.4's, drawers are clones of 4.5's (form fields borrowed from 4.4's), and 6.1's section headers copy the LAND `section header`. Each page is one task ending in one commit; the test cycle is an assertion script that fails before the write and passes after, plus the design-check lint at all zeros.

**Tech Stack:** Figma Plugin API through the `use_figma` MCP tool (load the `figma:figma-use` skill before every call; pass `skillNames: "figma-use"`), Python 3 for append-only ledger edits, git.

**Spec:** `docs/superpowers/specs/2026-09-03-manage-pages-admin-affordances-design.md` — read it first.

## Global Constraints

- Figma only. **No code changes, no Storybook changelog entry.** The only repo files touched are `scripts/figma-design-check.js` (Task 1), `docs/figma-ledger.json`, and this plan's checkboxes.
- Components and tokens only — every fill, stroke, gap, padding and radius bound; no hand-drawn geometry where a master exists. **The design-check lint is all zeros on every touched frame before a page counts as done.**
- Reuse over rebuild: menus are clones of 2.4's `ui-dropdown-menu [row actions]` (`2228:1827`); drawers are clones of 4.5's drawer; the KPI is a clone of 1.1's `ui-card [stat — pending approvals]`; 6.1's section headers reuse the LAND `section header` shape (`2190:1036`).
- **Heading row (amended — see the Amendment section below): `page-heading row` HORIZONTAL · gap 64 (`spacing/16`) · MIN/MIN · FILL/HUG → `[page-heading (FILL), kpi (HUG)]`.** No `actions` in the heading row on any page.
- **Add buttons live in the filter row's `actions` cluster** at `Variant=default, Style=default, Size=sm` with a leading `+` glyph; labels exactly `New dashboard` · `New banner` · `Promote a dashboard` · `New redirect`. 6.1 has no filter row — its `Add admin` · `Grant request access` stay at `Size=sm` on the section headers.
- Menu items verb-first, in the spec's order; **only** `Remove redirect`, `Revoke admin`, `Revoke access` are destructive. `Decommission` and `End promotion early` are plain items after a separator.
- Drawer: `Side=right`, `Show footer` on, description **verbatim** "Direct edit — no request. Recorded in Activity under your name.", footer `[ghost Cancel sm, default primary sm]`, primary reads `Save changes`.
- Frame names use a letter for sub-states: `5.1a  Dashboards — row menu open` (two spaces after the number, en dash, as the file does). New frames sit 80px to the right of their base, same y.
- Nothing on 5.5 or 5.6 changes. Banner count reconciles to 3 (1.1, 1.2, 1.3, 1.6).
- `use_figma` scripts: plain JS with top-level `await` and `return`; `await figma.setCurrentPageAsync(page)` once per script; set `layoutSizingHorizontal` **after** `appendChild`; set text **by node name, never by index**; on error STOP, read it, fix, rerun — failed scripts are atomic.
- Ledger edits are append-only under `exampleScreens.adminFlow2026_09_02.manageAffordances2026_09_03`; check `git diff --numstat docs/figma-ledger.json` shows `0` deletions before committing.

### Node ids used throughout (read from the file 2026-09-03)

| Thing | Id |
|---|---|
| Admin Flow page | `2106:4324` |
| 1.1 frame · its `page-heading row` · `actions` reference | `2130:455` · `2293:5143` |
| 1.2 · 1.3 · 1.6 frames (banner KPI widgets live here) | `2273:3426` · `2274:3592` · `2310:5232` |
| LAND `section header` reference (heading · badge · spacer · View all) | `2190:1036` (spacer `2190:1042`) |
| 2.4 frame · its open row menu | `2228:1697` · `2228:1827` |
| DropdownMenu Content set · Item set · Separator | `546:52` · `544:63` · `544:66` |
| Drawer set (`Title#514:0`, `Description#514:5`, `Show footer#514:20`, `Body#514:25` SLOT) | `514:236` |
| Button label property | `Label#79:0` |
| Card set (KPI tile) — `Size` variant: default/sm/lg/xl/2xl | `1812:800` |
| 4.4 frame (Banners apply drawer — DatePicker/Textarea donors) | `2287:4761` |
| 4.5 frame (Edit dashboard drawer — the drawer base) | `2267:2597` |
| 5.1 frame · content column · table | `2152:747` · `2152:748` · `2152:882` |
| 5.2 frame · page-heading row · content column | `2154:41830` · `2248:2172` · parent of the row |
| 5.3 frame · content column · table | `2269:2988` · `2269:2989` · `2269:3061` |
| 5.4 frame · content column · table | `2270:3089` · `2270:3090` · `2270:3162` |
| 6.1 frame · content column · admins table · request-access table | `2268:2856` · `2268:2857` · `2268:2929` · `2268:3215` |
| Flow map diagram · READ FIRST panel | `2291:5143` · `2122:3383` |
| Checkbox component page | `215:32` |
| Tokens | `spacing/2`=8 · `spacing/4`=16 · `spacing/6`=24 · `spacing/8`=32 |

---

## Amendment 2026-09-03 — supersedes Step 2 of Tasks 3, 4, 5 and 6

The owner built Task 2's heading row, rejected it, and iterated to a settled shape on 5.1. **Tasks 3–6 keep every other step; only their "build the heading row" step changes.** The KPI moves out of a cloned stat tile and into Card's own header props, and the Add moves out of the heading row into the filter row.

Reference: 5.1 as built — `page-heading row` `2349:5411`, `filter-search` `2154:896`, `filter-bar` `2346:16918`, `actions` `2346:17032`.

**Heading row** (all five pages): `[page-heading (FILL), kpi (HUG)]`, HORIZONTAL, gap 64 bound to `spacing/16`, `MIN/MIN`, FILL/HUG.

**Filter row** (5.1, 5.2 — and 5.3/5.4 once the open question below is answered): `filter-search` VERTICAL gap 4 (`spacing/1`) pad 0/8/0/8 (`spacing/2`) → `filter-bar` HORIZONTAL gap 24 (`spacing/6`) `SPACE_BETWEEN/CENTER` → `[<axes>, actions]`, `actions` HUG gap 8 (`spacing/2`) `MAX/CENTER` holding one labelled Add. No icon-only buttons in the cluster — the sort was drawn and removed because the table header already sorts.

### Replacement recipe

Substitute the per-page values from the table beneath it. `KPI` uses Card's header props; do **not** clone 1.1's stat tile.

```js
const PAGE = { colId: '<content column id>', frameId: '<frame id>',
  title: '<KPI number>', desc: '<KPI label>', badge: '<KPI badge>',
  addLabel: '<New …>', hasFilterRow: true, filterSearchId: '<filter-search id or null>' };

const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const setChars = async (t, v) => { const f = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(f); t.characters = v; };

// 1. heading row [page-heading, kpi]
const col = await figma.getNodeByIdAsync(PAGE.colId);
let row = col.children.find(c => c.name === 'page-heading row');
const ph = col.children.find(c => c.name === 'page-heading') || (row && row.children.find(c => c.name === 'page-heading'));
if (!ph) throw new Error('no page-heading');
if (!row) {
  row = figma.createAutoLayout('HORIZONTAL', { name: 'page-heading row', itemSpacing: 64 });
  row.fills = []; row.clipsContent = false; row.primaryAxisAlignItems = 'MIN'; row.counterAxisAlignItems = 'MIN';
  col.insertChild(col.children.indexOf(ph), row);
  row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'HUG';
  row.appendChild(ph); ph.layoutSizingHorizontal = 'FILL';
}
row.itemSpacing = 64; row.setBoundVariable('itemSpacing', V('spacing/16'));
row.primaryAxisAlignItems = 'MIN'; row.counterAxisAlignItems = 'MIN';

// 2. KPI from 5.1's built tile — clone it, then set the three slots
const src = await figma.getNodeByIdAsync('2349:5412');   // 5.1's kpi, the reference build
let kpi = row.children.find(c => c.name === 'kpi');
if (!kpi) { kpi = src.clone(); kpi.name = 'kpi'; row.appendChild(kpi); kpi.layoutSizingHorizontal = 'HUG'; kpi.layoutSizingVertical = 'HUG'; }
const titleKey = Object.keys(kpi.componentProperties).find(k => /^Title/i.test(k));
const descKey  = Object.keys(kpi.componentProperties).find(k => /^Description/i.test(k));
if (!titleKey || !descKey) throw new Error('Card props: ' + Object.keys(kpi.componentProperties).join(','));
kpi.setProperties({ [titleKey]: PAGE.title, [descKey]: PAGE.desc });
const badge = kpi.findAll(n => n.type === 'INSTANCE' && /badge/i.test(n.name))[0];
if (badge) { const t = badge.findAll(n => n.type === 'TEXT')[0]; if (t) await setChars(t, PAGE.badge); }

// 3. the Add, in the filter row's actions cluster (skip where hasFilterRow is false)
let addId = null;
if (PAGE.hasFilterRow) {
  const stack = await figma.getNodeByIdAsync(PAGE.filterSearchId);
  if (!stack) throw new Error('no filter-search on this page');
  stack.name = 'filter-search';
  stack.paddingLeft = 8; stack.paddingRight = 8;
  stack.setBoundVariable('paddingLeft', V('spacing/2')); stack.setBoundVariable('paddingRight', V('spacing/2'));
  const bar = stack.children.find(c => c.layoutMode === 'HORIZONTAL') || stack;
  bar.name = 'filter-bar'; bar.primaryAxisAlignItems = 'SPACE_BETWEEN'; bar.counterAxisAlignItems = 'CENTER';
  bar.itemSpacing = 24; bar.setBoundVariable('itemSpacing', V('spacing/6'));
  let actions = bar.children.find(c => c.name === 'actions');
  if (!actions) {
    actions = figma.createAutoLayout('HORIZONTAL', { name: 'actions', itemSpacing: 8 });
    actions.fills = []; actions.clipsContent = false; actions.primaryAxisAlignItems = 'MAX'; actions.counterAxisAlignItems = 'CENTER';
    bar.appendChild(actions); actions.layoutSizingHorizontal = 'HUG'; actions.layoutSizingVertical = 'HUG';
    actions.setBoundVariable('itemSpacing', V('spacing/2'));
  }
  const srcAdd = await figma.getNodeByIdAsync('2353:17363');   // 5.1's New dashboard
  const add = srcAdd.clone(); actions.appendChild(add);
  const lk = Object.keys(add.componentProperties).find(k => /^Label/i.test(k));
  add.setProperties({ [lk]: PAGE.addLabel, Size: 'sm', Style: 'default' });
  add.name = `ui-button [${PAGE.addLabel}]`;
  addId = add.id;
}
const f = await figma.getNodeByIdAsync(PAGE.frameId); await f.screenshot();
return { rowId: row.id, kpiId: kpi.id, addId, rowKids: row.children.map(c => c.name) };
```

| Task | Page | colId | frameId | Title | Description | Badge | Add label | filter-search |
|---|---|---|---|---|---|---|---|---|
| 3 | 5.2 | parent of `2248:2172` | `2154:41830` | `3` | `Active banners` | `of 6` | `New banner` (move the existing button into `actions`) | `2334:12319` |
| 4 | 5.3 | `2269:2989` | `2269:2988` | `2` | `Live promotions` | `ending soon` | `Promote a dashboard` | **none — see open question** |
| 5 | 5.4 | `2270:3090` | `2270:3089` | `3` | `Active redirects` | `2,306 hits` | `New redirect` | **none — see open question** |
| 6 | 6.1 | `2268:2857` | `2268:2856` | `4` | `Admins` | `5 requesters` | — (`hasFilterRow: false`; adds go on the section headers, Task 6 Step 2 unchanged for that part) | n/a |

### Open question blocking Tasks 4 and 5

**5.3 Promotions and 5.4 URL Redirects have no filter row at all** — their content columns are `[page-heading, ui-table, body]`. The amended pattern puts the Add in a filter row they do not have. Two ways out, owner's call before those tasks run:

- **(a) Give them one**, with axes taken from their own `Status` column — 5.3: `All · Live · Scheduled · Ended`; 5.4: `All · Active · Inactive`. Consistent with 5.1, 5.2, 5.6 and 2.1–2.5, and the axes already exist as data. Adds a filter control to two pages that did not ask for one.
- **(b) A bare actions row** above the table: `filter-bar` holding only `[spacer, actions]`. Minimal, no invented filters, but a row that exists solely to hold one button.

Until this is answered, Tasks 4 and 5 stop after their heading row.

## File Structure

- **Create** `scripts/figma-design-check.js` — the eight-check lint as a pasteable snippet defining `async function designCheck(frameIds)`. Every task pastes it into a `use_figma` call. One responsibility: report unbound paint / unstyled text / generic names / unbound geometry / overflow for a list of frames, skipping instance internals and absolutely-positioned children.
- **Modify** `docs/figma-ledger.json` — one new entry `manageAffordances2026_09_03` under `exampleScreens.adminFlow2026_09_02`, grown by one sub-key per task (`bannerCount`, `5.1`, `5.2`, `5.3`, `5.4`, `6.1`, `records`).
- **Figma** — five base frames modified in place; nine new frames; four LAND frames' banner tile; two doc panels.

---

### Task 1: Lint snippet + banner count reconcile

**Files:**
- Create: `scripts/figma-design-check.js`
- Modify: `docs/figma-ledger.json`

**Interfaces:**
- Produces: `designCheck(frameIds: string[]) → { counts, allZero: boolean, findings }` — pasted verbatim into later tasks' lint steps; and the ledger entry `manageAffordances2026_09_03` that later tasks add sub-keys to.

- [ ] **Step 1: Write the lint snippet**

Create `scripts/figma-design-check.js` with exactly this content:

```js
// Design-check lint for the Figma file, as a use_figma snippet.
// Paste the whole file into a use_figma script AFTER `await figma.setCurrentPageAsync(page)`,
// then: `return await designCheck(['2152:747', '2269:2988']);`
// Checks (playbook "Design-check lint"): unbound SOLID paint, unstyled TEXT, generic layer names,
// unbound non-zero padding/radius/gap, and horizontal overflow of in-flow children.
// Skips instance internals (they belong to the master) and absolutely-positioned children
// (overlays ignore their parent's padding — that check false-positives otherwise).
async function designCheck(frameIds) {
  const GENERIC = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Component|Instance)(\s+\d+)?$/i;
  const hasVar = (n, k) => !!(n.boundVariables && n.boundVariables[k]);
  const out = { unboundPaint: [], unstyledText: [], genericName: [], unboundGeometry: [], overflow: [] };
  function walk(n, label, parent) {
    if (GENERIC.test(n.name)) out.genericName.push(`${label} ${n.type} "${n.name}" [${n.id}]`);
    if (n.type === 'TEXT' && !n.textStyleId) out.unstyledText.push(`${label} "${n.name}" [${n.id}]`);
    for (const key of ['fills', 'strokes']) {
      const arr = n[key]; if (!Array.isArray(arr)) continue;
      arr.forEach((p, i) => {
        if (p.type !== 'SOLID' || p.visible === false) return;
        const styleId = key === 'fills' ? n.fillStyleId : n.strokeStyleId;
        if (!(n.boundVariables && n.boundVariables[key] && n.boundVariables[key][i]) && !styleId)
          out.unboundPaint.push(`${label} ${n.type} "${n.name}" [${n.id}] ${key}[${i}]`);
      });
    }
    for (const p of ['paddingTop','paddingRight','paddingBottom','paddingLeft','topLeftRadius','topRightRadius','bottomRightRadius','bottomLeftRadius','itemSpacing'])
      if (p in n && n[p] !== 0 && !hasVar(n, p)) out.unboundGeometry.push(`${label} "${n.name}" [${n.id}] ${p}=${n[p]}`);
    if (parent && parent.absoluteBoundingBox && n.absoluteBoundingBox && 'layoutMode' in parent && parent.layoutMode !== 'NONE' && n.layoutPositioning !== 'ABSOLUTE') {
      const pb = parent.absoluteBoundingBox, nb = n.absoluteBoundingBox;
      const over = Math.round((nb.x + nb.width) - (pb.x + pb.width - (parent.paddingRight || 0)));
      if (over > 1) out.overflow.push(`${label} "${n.name}" [${n.id}] overflows "${parent.name}" by ${over}px`);
    }
    if (n.type === 'INSTANCE') return;
    for (const c of (n.children || [])) walk(c, label, n);
  }
  for (const id of frameIds) {
    const f = await figma.getNodeByIdAsync(id);
    if (!f) { out.genericName.push(`MISSING FRAME ${id}`); continue; }
    walk(f, f.name.slice(0, 5).trim(), null);
  }
  const counts = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length]));
  return { counts, allZero: Object.values(counts).every(v => v === 0), findings: out };
}
```

- [ ] **Step 2: Prove the snippet runs and the baseline is clean**

`use_figma` — paste the snippet after the first two lines:

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
// <paste scripts/figma-design-check.js here>
return await designCheck(['2152:747', '2154:41830', '2269:2988', '2270:3089', '2268:2856', '2130:455']);
```

Expected: `allZero: true`. If not, the finding predates this plan — record it in the task's ledger note and continue; do not fix unrelated findings here.

- [ ] **Step 3: Write the failing assertion for the banner count**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const out = [];
for (const id of ['2130:455', '2273:3426', '2274:3592', '2310:5232']) {
  const f = await figma.getNodeByIdAsync(id);
  for (const tile of f.findAll(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — active banners]')) {
    const v = tile.findOne(n => n.type === 'TEXT' && n.name === 'stat value');
    out.push({ frame: f.name.slice(0, 4).trim(), tileId: tile.id, value: v ? v.characters : null });
  }
}
return { count: out.length, allThree: out.every(o => o.value === '3'), out };
```

Expected: `count: 4`, `allThree: false` (every value is `"4"`).

- [ ] **Step 4: Write 3 into the four tiles**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const done = [];
for (const id of ['2130:455', '2273:3426', '2274:3592', '2310:5232']) {
  const f = await figma.getNodeByIdAsync(id);
  for (const tile of f.findAll(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — active banners]')) {
    const v = tile.findOne(n => n.type === 'TEXT' && n.name === 'stat value');
    if (!v) throw new Error('no stat value in ' + tile.id);
    const font = v.fontName === figma.mixed ? v.getRangeFontName(0, 1) : v.fontName;
    await figma.loadFontAsync(font);
    v.characters = '3';
    done.push(v.id);
  }
}
return { mutatedNodeIds: done };
```

- [ ] **Step 5: Re-run the Step 3 assertion**

Expected: `count: 4`, `allThree: true`.

- [ ] **Step 6: Lint the four LAND frames**

Snippet + `return await designCheck(['2130:455','2273:3426','2274:3592','2310:5232']);` → `allZero: true`.

- [ ] **Step 7: Open the ledger entry and commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02'].setdefault('manageAffordances2026_09_03', collections.OrderedDict())
e['spec'] = 'docs/superpowers/specs/2026-09-03-manage-pages-admin-affordances-design.md'
e['bannerCount'] = "1.1's 'Active banners' tile said 4; 5.2's six cards show 3 active (banners 1, 2, 6; banner 4 is draft with its switch off, 3 scheduled, 5 expired). Set to 3 on 1.1 and on the KPI widgets cloned from it on 1.2, 1.3, 1.6. A page's totals follow its rows."
e['lintSnippet'] = 'scripts/figma-design-check.js — paste into use_figma; skips instance internals and ABSOLUTE children.'
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
git diff --numstat docs/figma-ledger.json   # second number must be 0
git add scripts/figma-design-check.js docs/figma-ledger.json
git commit -m "docs(figma): reconcile the banner count to 3; add the lint snippet

1.1's Active banners tile said 4 while 5.2's cards show 3 active. Set
to 3 on 1.1 and its clones on 1.2, 1.3, 1.6. The design-check lint is
now a pasteable snippet in scripts/figma-design-check.js. Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: 5.1 Dashboards — heading row, KPI, Add, 5.1a menu, 5.1b drawer

**Files:**
- Modify: `docs/figma-ledger.json`
- Figma: `2152:747` modified; two new frames.

**Interfaces:**
- Consumes: `designCheck` from Task 1.
- Produces: the heading-row shape and the a/b construction that Tasks 3–6 repeat; ledger sub-key `5.1` with ids `rowId, kpiId, actionsId, aFrameId, menuId, bFrameId, drawerId`.

- [ ] **Step 1: Failing assertion — heading row**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const col = await figma.getNodeByIdAsync('2152:748');
const row = col.children.find(c => c.name === 'page-heading row');
if (!row) return { pass: false, reason: 'no page-heading row', colKids: col.children.map(c => c.name) };
const kpi = row.children.find(c => c.name === 'kpi'), actions = row.children.find(c => c.name === 'actions');
const t = name => { const n = kpi && kpi.findOne(x => x.type === 'TEXT' && x.name === name); return n ? n.characters : null; };
const hasVar = (n, k) => !!(n.boundVariables && n.boundVariables[k]);
const btn = actions && actions.children[0];
const result = {
  kids: row.children.map(c => `${c.name} (${c.layoutSizingHorizontal})`),
  rowGap: row.itemSpacing, rowGapBound: hasVar(row, 'itemSpacing'), align: `${row.primaryAxisAlignItems}/${row.counterAxisAlignItems}`,
  kpi: kpi ? [t('stat value'), t('stat title'), t('stat caption')] : null, kpiSize: kpi ? kpi.componentProperties['Size'].value : null,
  actionsGap: actions ? actions.itemSpacing : null, actionsGapBound: actions ? hasVar(actions, 'itemSpacing') : null,
  button: btn ? { name: btn.name, label: btn.componentProperties['Label#79:0'].value, variant: btn.mainComponent.name } : null
};
result.pass = row.children.map(c => c.name).join('|') === 'page-heading|kpi|actions' && result.rowGap === 32 && result.rowGapBound && result.align === 'MIN/MIN'
  && JSON.stringify(result.kpi) === JSON.stringify(['201', 'Published', 'across 3 products']) && result.kpiSize === 'sm'
  && result.actionsGap === 16 && result.actionsGapBound && result.button && result.button.label === 'New dashboard' && /Style=default, Size=default/.test(result.button.variant);
return result;
```

Expected: `pass: false`, `reason: 'no page-heading row'`, `colKids: ['page-heading', 'filtered table']`.

- [ ] **Step 2: Build the heading row**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const col = await figma.getNodeByIdAsync('2152:748');
const ph = col.children.find(c => c.name === 'page-heading'); if (!ph) throw new Error('no page-heading');
const idx = col.children.indexOf(ph);

const row = figma.createAutoLayout('HORIZONTAL', { name: 'page-heading row', itemSpacing: 32 });
row.fills = []; row.clipsContent = false; row.primaryAxisAlignItems = 'MIN'; row.counterAxisAlignItems = 'MIN';
col.insertChild(idx, row); row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'HUG';
row.setBoundVariable('itemSpacing', V('spacing/8'));
row.appendChild(ph); ph.layoutSizingHorizontal = 'FILL';

// KPI: clone 1.1's stat tile, Size=sm, texts by name
const f11 = await figma.getNodeByIdAsync('2130:455');
const src = f11.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — pending approvals]'); if (!src) throw new Error('no source tile on 1.1');
const kpi = src.clone(); kpi.name = 'kpi'; row.appendChild(kpi);
kpi.layoutSizingHorizontal = 'HUG'; kpi.layoutSizingVertical = 'HUG';
kpi.setProperties({ Size: 'sm' });
async function setText(root, name, value) {
  const t = root.findOne(n => n.type === 'TEXT' && n.name === name); if (!t) throw new Error('no text node ' + name);
  const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = value;
}
await setText(kpi, 'stat value', '201'); await setText(kpi, 'stat title', 'Published'); await setText(kpi, 'stat caption', 'across 3 products');

// actions: clone 5.2's New banner button, relabel
const actions = figma.createAutoLayout('HORIZONTAL', { name: 'actions', itemSpacing: 16 });
actions.fills = []; actions.clipsContent = false; actions.primaryAxisAlignItems = 'MIN'; actions.counterAxisAlignItems = 'CENTER';
row.appendChild(actions); actions.layoutSizingHorizontal = 'HUG'; actions.layoutSizingVertical = 'HUG';
actions.setBoundVariable('itemSpacing', V('spacing/4'));
const row52 = await figma.getNodeByIdAsync('2248:2172');
const srcBtn = row52.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-button [New banner]'); if (!srcBtn) throw new Error('no New banner on 5.2');
const btn = srcBtn.clone(); actions.appendChild(btn); btn.name = 'ui-button [New dashboard]'; btn.setProperties({ 'Label#79:0': 'New dashboard' });

const f = await figma.getNodeByIdAsync('2152:747'); await f.screenshot();
return { createdNodeIds: [row.id, kpi.id, actions.id, btn.id], rowId: row.id, kpiId: kpi.id, actionsId: actions.id, kpiSize: `${Math.round(kpi.absoluteBoundingBox.width)}x${Math.round(kpi.absoluteBoundingBox.height)}` };
```

Look at the screenshot: title left, tile and button top-aligned right. If `kpiSize` height exceeds 100px the `Size=sm` cascade did not reach the nested stat instance — record the measured height in the ledger note; do not restyle the tile by hand.

- [ ] **Step 3: Re-run the Step 1 assertion**

Expected: `pass: true`.

- [ ] **Step 4: Failing assertion — 5.1a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const a = page.findOne(n => n.type === 'FRAME' && n.name === '5.1a  Dashboards — row menu open');
if (!a) return { pass: false, reason: 'no 5.1a' };
const menu = a.children.find(c => c.type === 'INSTANCE' && /row actions/.test(c.name));
if (!menu) return { pass: false, reason: 'no menu' };
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63' && n.visible);
const seps = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66' && n.visible);
const labels = items.map(i => i.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const variants = items.map(i => i.mainComponent.name);
const result = { labels, variants, separators: seps.length, positioning: menu.layoutPositioning };
result.pass = labels.join('|') === 'Edit|Promote|View usage|Decommission' && seps.length === 1 && menu.layoutPositioning === 'ABSOLUTE' && !/destructive/i.test(variants[3]);
return result;
```

Expected: `pass: false`, `reason: 'no 5.1a'`.

- [ ] **Step 5: Discover the 2.4 menu's item property keys**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const menu = await figma.getNodeByIdAsync('2228:1827');
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63');
const seps = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66');
return {
  itemCount: items.length, sepCount: seps.length, itemsParent: items[0] && `${items[0].parent.type} "${items[0].parent.name}"`,
  itemProps: items[0] && Object.fromEntries(Object.entries(items[0].componentProperties).map(([k, v]) => [k, v.value])),
  itemTextNodes: items[0] && items[0].findAll(t => t.type === 'TEXT').map(t => t.name),
  variants: items.map(i => i.mainComponent.name),
  setAxes: Object.fromEntries(Object.entries(setOf(items[0].mainComponent).componentPropertyDefinitions).filter(([k, v]) => v.type === 'VARIANT').map(([k, v]) => [k, v.variantOptions]))
};
```

Expected: `itemCount: 4`, `itemsParent` is a SLOT or FRAME (items are slot content, so they can be removed and reordered), `itemProps` contains one key starting with `Label`, `setAxes` contains a `Variant` axis with an option matching `/destructive/i`. Note the exact `Label…` key and the destructive option name; the next script finds both by pattern and throws if they are absent.

- [ ] **Step 6: Build 5.1a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2152:747');
const a = base.clone(); base.parent.appendChild(a);
a.name = '5.1a  Dashboards — row menu open'; a.x = base.x + base.width + 80; a.y = base.y;

const table = a.findOne(n => n.type === 'FRAME' && n.name === 'ui-table [dashboards]');
const rows = table.children.filter(c => /^ui-table__row/.test(c.name));
const row2 = rows[1]; const cell = row2.children[row2.children.length - 1];
if (!/actions/.test(cell.name)) throw new Error('last cell is not actions: ' + cell.name);

const srcMenu = await figma.getNodeByIdAsync('2228:1827');
const menu = srcMenu.clone(); a.appendChild(menu); menu.layoutPositioning = 'ABSOLUTE';
const cb = cell.absoluteBoundingBox, ab = a.absoluteBoundingBox;
menu.x = (cb.x + cb.width) - ab.x - menu.width; menu.y = (cb.y + cb.height) - ab.y + 4;

const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63');
const labelKey = Object.keys(items[0].componentProperties).find(k => /^Label/i.test(k)); if (!labelKey) throw new Error('no Label property on Item');
const variantKey = Object.keys(items[0].componentProperties).find(k => /^Variant$/i.test(k));
const axis = variantKey && setOf(items[0].mainComponent).componentPropertyDefinitions[variantKey].variantOptions;
const plain = axis ? (axis.find(o => /^default$/i.test(o)) || axis[0]) : null;
const wanted = ['Edit', 'Promote', 'View usage', 'Decommission'];
if (items.length < wanted.length) throw new Error(`menu has ${items.length} items, need ${wanted.length}`);
for (let i = 0; i < items.length; i++) {
  if (i < wanted.length) { const props = { [labelKey]: wanted[i] }; if (variantKey && plain) props[variantKey] = plain; items[i].setProperties(props); }
  else { try { items[i].remove(); } catch (e) { items[i].visible = false; } }
}
// separator before the last item; remove any separator the clone brought
for (const s of menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66')) { try { s.remove(); } catch (e) { s.visible = false; } }
const sepMaster = await figma.getNodeByIdAsync('544:66');
const sepComp = sepMaster.type === 'COMPONENT_SET' ? sepMaster.defaultVariant : sepMaster;
const sep = sepComp.createInstance();
const last = items[wanted.length - 1]; last.parent.insertChild(last.parent.children.indexOf(last), sep);
await a.screenshot();
return { createdNodeIds: [a.id, menu.id, sep.id], aFrameId: a.id, menuId: menu.id, labelKey, plain };
```

Screenshot check: the menu hangs under row 2's `⋯`, four items with a rule before `Decommission`, nothing red.

- [ ] **Step 7: Re-run the Step 4 assertion**

Expected: `pass: true`.

- [ ] **Step 8: Discover 4.5's scrim + drawer**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const f45 = await figma.getNodeByIdAsync('2267:2597');
const drawer = f45.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const scrim = f45.children.find(c => c.name === 'scrim');
return { kids: f45.children.map(c => `${c.type} "${c.name}" ${c.layoutPositioning}`), drawer: drawer && { id: drawer.id, w: drawer.width, h: drawer.height, title: drawer.componentProperties['Title#514:0'].value }, scrim: scrim && { id: scrim.id, w: scrim.width, h: scrim.height } };
```

Expected: a `scrim` FRAME and the drawer, both `ABSOLUTE`, drawer title `Edit dashboard`, width 420. If there is no `scrim` on 4.5, the next script falls back to 1.3's (`2274:3729`).

- [ ] **Step 9: Failing assertion — 5.1b**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const b = page.findOne(n => n.type === 'FRAME' && n.name === '5.1b  Dashboards — edit drawer');
if (!b) return { pass: false, reason: 'no 5.1b' };
const drawer = b.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const scrim = b.children.find(c => c.name === 'scrim');
if (!drawer || !scrim) return { pass: false, reason: 'missing drawer or scrim' };
const footer = drawer.children.find(c => /footer/i.test(c.name));
const btns = footer ? footer.children.filter(c => c.visible && c.type === 'INSTANCE').map(c => `${c.componentProperties['Style'].value}/${c.componentProperties['Size'].value}:${c.componentProperties['Label#79:0'].value}`) : [];
const labels = drawer.findAll(t => t.type === 'TEXT' && /^label$/i.test(t.name)).map(t => t.characters);
const result = { title: drawer.componentProperties['Title#514:0'].value, desc: drawer.componentProperties['Description#514:5'].value, footer: btns, labels,
  drawerFlushRight: Math.round(drawer.x + drawer.width) === Math.round(b.width), drawerFullHeight: Math.round(drawer.height) === Math.round(b.height), scrimCovers: Math.round(scrim.width) === Math.round(b.width) && Math.round(scrim.height) === Math.round(b.height) };
result.pass = result.title === 'Edit dashboard' && result.desc === 'Direct edit — no request. Recorded in Activity under your name.' && btns.join('|') === 'ghost/sm:Cancel|default/sm:Save changes' && result.drawerFlushRight && result.drawerFullHeight && result.scrimCovers;
return result;
```

Expected: `pass: false`, `reason: 'no 5.1b'`.

- [ ] **Step 10: Build 5.1b**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2152:747');
const a = page.findOne(n => n.type === 'FRAME' && n.name === '5.1a  Dashboards — row menu open'); if (!a) throw new Error('build 5.1a first');
const b = base.clone(); base.parent.appendChild(b);
b.name = '5.1b  Dashboards — edit drawer'; b.x = a.x + a.width + 80; b.y = base.y;

const f45 = await figma.getNodeByIdAsync('2267:2597');
const srcScrim = f45.children.find(c => c.name === 'scrim') || await figma.getNodeByIdAsync('2274:3729');
const srcDrawer = f45.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
if (!srcScrim || !srcDrawer) throw new Error('4.5 scrim/drawer not found');

const scrim = srcScrim.clone(); b.appendChild(scrim); scrim.layoutPositioning = 'ABSOLUTE'; scrim.x = 0; scrim.y = 0; scrim.resize(b.width, b.height);
const drawer = srcDrawer.clone(); b.appendChild(drawer); drawer.layoutPositioning = 'ABSOLUTE';
drawer.resize(drawer.width, b.height); drawer.x = b.width - drawer.width; drawer.y = 0;
drawer.setProperties({ 'Title#514:0': 'Edit dashboard', 'Description#514:5': 'Direct edit — no request. Recorded in Activity under your name.', 'Show footer#514:20': true });
await b.screenshot();
return { createdNodeIds: [b.id, scrim.id, drawer.id], bFrameId: b.id, drawerId: drawer.id };
```

4.5's drawer already holds row 2's values (Collateral Health Dashboard · Collateral · AST-4392 · published · /views/collateral-health) and the `Cancel` / `Save changes` footer, so nothing inside it changes.

- [ ] **Step 11: Re-run the Step 9 assertion**

Expected: `pass: true`.

- [ ] **Step 12: Lint 5.1, 5.1a, 5.1b**

Snippet + `const ids = ['2152:747', ...page.findAll(n => n.type === 'FRAME' && /^5\.1[ab] /.test(n.name)).map(n => n.id)]; return await designCheck(ids);` → `allZero: true`. A `genericName` finding means a created frame kept a default name — name it and rerun.

- [ ] **Step 13: Ledger + commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02']['manageAffordances2026_09_03']
e['5.1'] = collections.OrderedDict([
  ('headingRow', "page-heading row [page-heading, kpi, actions] at 32; KPI = clone of 1.1's stat tile at Card Size=sm reading 201 / Published / across 3 products; actions holds ui-button [New dashboard] cloned from 5.2's New banner."),
  ('ids', {'rowId': '<from Step 2>', 'kpiId': '<from Step 2>', 'actionsId': '<from Step 2>', 'aFrameId': '<from Step 6>', 'menuId': '<from Step 6>', 'bFrameId': '<from Step 10>', 'drawerId': '<from Step 10>'}),
  ('5.1a', "clone of 5.1; 2.4's row menu cloned and anchored under row 2 (Collateral Health Dashboard): Edit · Promote · View usage · — · Decommission, Decommission plain (a lifecycle move, not a deletion)."),
  ('5.1b', "clone of 5.1 + 4.5's scrim and Edit dashboard drawer verbatim — its values are already row 2's; footer ghost Cancel / default Save changes at sm."),
  ('kpiMeasuredHeight', '<px from Step 2 kpiSize>')
])
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
```

Replace every `<from Step N>` with the ids the scripts returned before running. Then:

```bash
git diff --numstat docs/figma-ledger.json   # second number must be 0
git add docs/figma-ledger.json
git commit -m "docs(figma): 5.1 Dashboards — KPI, New dashboard, row menu and edit drawer

Heading row in the LAND shape with a Size=sm stat tile (201 published)
and a New dashboard action. 5.1a shows the row menu open on Collateral
Health Dashboard (Decommission plain, after a rule); 5.1b is 4.5's Edit
dashboard drawer over the page. Lint all zeros on the three frames.
Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: 5.2 Banners — actions wrapper, KPI, 5.2a edit drawer

**Files:**
- Modify: `docs/figma-ledger.json`
- Figma: `2154:41830` modified; one new frame.

**Interfaces:**
- Consumes: `designCheck`; 4.4's drawer (`2287:4761`) as the donor for Severity/Scope/Message/Starts/Ends fields.
- Produces: ledger sub-key `5.2`.

- [ ] **Step 1: Failing assertion — heading row**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const row = await figma.getNodeByIdAsync('2248:2172');
const kpi = row.children.find(c => c.name === 'kpi'), actions = row.children.find(c => c.name === 'actions');
const t = name => { const n = kpi && kpi.findOne(x => x.type === 'TEXT' && x.name === name); return n ? n.characters : null; };
const result = { kids: row.children.map(c => c.name), align: `${row.primaryAxisAlignItems}/${row.counterAxisAlignItems}`, kpi: kpi ? [t('stat value'), t('stat title'), t('stat caption')] : null, actionsKids: actions ? actions.children.map(c => c.name) : null };
result.pass = result.kids.join('|') === 'page-heading|kpi|actions' && result.align === 'MIN/MIN' && JSON.stringify(result.kpi) === JSON.stringify(['3', 'Active', 'of 6 · 1 scheduled']) && result.actionsKids && result.actionsKids[0] === 'ui-button [New banner]';
return result;
```

Expected: `pass: false`, `kids: ['page-heading', 'ui-button [New banner]']`, `align: 'MIN/CENTER'`.

- [ ] **Step 2: Add KPI and wrap the button**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const row = await figma.getNodeByIdAsync('2248:2172');
row.counterAxisAlignItems = 'MIN';
const btn = row.children.find(c => c.name === 'ui-button [New banner]'); if (!btn) throw new Error('no New banner');

const f11 = await figma.getNodeByIdAsync('2130:455');
const src = f11.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — pending approvals]');
const kpi = src.clone(); kpi.name = 'kpi'; row.insertChild(1, kpi); kpi.layoutSizingHorizontal = 'HUG'; kpi.layoutSizingVertical = 'HUG';
kpi.setProperties({ Size: 'sm' });
async function setText(root, name, value) { const t = root.findOne(n => n.type === 'TEXT' && n.name === name); if (!t) throw new Error('no text ' + name); const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = value; }
await setText(kpi, 'stat value', '3'); await setText(kpi, 'stat title', 'Active'); await setText(kpi, 'stat caption', 'of 6 · 1 scheduled');

const actions = figma.createAutoLayout('HORIZONTAL', { name: 'actions', itemSpacing: 16 });
actions.fills = []; actions.clipsContent = false; actions.primaryAxisAlignItems = 'MIN'; actions.counterAxisAlignItems = 'CENTER';
row.appendChild(actions); actions.layoutSizingHorizontal = 'HUG'; actions.layoutSizingVertical = 'HUG'; actions.setBoundVariable('itemSpacing', V('spacing/4'));
actions.appendChild(btn);
const f = await figma.getNodeByIdAsync('2154:41830'); await f.screenshot();
return { createdNodeIds: [kpi.id, actions.id], kpiId: kpi.id, actionsId: actions.id, kids: row.children.map(c => c.name) };
```

- [ ] **Step 3: Re-run Step 1** → `pass: true`.

- [ ] **Step 4: Discover 4.4's drawer form and card 2's values**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const f44 = await figma.getNodeByIdAsync('2287:4761');
const drawer = f44.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const body = drawer.children.find(c => c.type === 'SLOT');
const form = body.children[0];
const fields = form.children.map(c => ({ type: c.type, name: c.name, set: c.type === 'INSTANCE' && c.mainComponent.parent ? c.mainComponent.parent.name : null, texts: c.findAll(t => t.type === 'TEXT').map(t => `${t.name}=${JSON.stringify(t.characters)}`) }));
const f52 = await figma.getNodeByIdAsync('2154:41830');
const card2 = f52.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [banner 2 — active]');
return { formName: form.name, fields, card2Texts: card2.findAll(t => t.type === 'TEXT').map(t => t.characters), footer: drawer.children.find(c => /footer/i.test(c.name)).children.map(c => c.name) };
```

Expected: fields in order Severity (NativeSelect) · a `was …` TEXT · Scope · Message (Textarea) · Starts (DatePicker) · Ends (DatePicker) · a `was …` TEXT; each field's texts include a label-like node and a value-like node. Note the value node's name (the next script targets it by `/value|text/i` excluding `/label|placeholder/i`). `card2Texts` contains `Data Delay — Customer Service Dashboards`, its body, `Jul 14, 2026`, `No end date`.

- [ ] **Step 5: Failing assertion — 5.2a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const b = page.findOne(n => n.type === 'FRAME' && n.name === '5.2a  Banners — edit drawer');
if (!b) return { pass: false, reason: 'no 5.2a' };
const drawer = b.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const visibleKids = form.children.filter(c => c.visible).map(c => c.name);
const wasRows = form.findAll(t => t.type === 'TEXT' && t.visible && /^was/i.test(t.characters)).length;
const footer = drawer.children.find(c => /footer/i.test(c.name));
const btns = footer.children.filter(c => c.visible && c.type === 'INSTANCE').map(c => `${c.componentProperties['Style'].value}/${c.componentProperties['Size'].value}:${c.componentProperties['Label#79:0'].value}`);
const result = { title: drawer.componentProperties['Title#514:0'].value, desc: drawer.componentProperties['Description#514:5'].value, visibleKids, wasRows, footer: btns };
result.pass = result.title === 'Edit banner' && result.desc === 'Direct edit — no request. Recorded in Activity under your name.' && wasRows === 0 && btns.join('|') === 'ghost/sm:Cancel|default/sm:Save changes' && visibleKids.length === 5;
return result;
```

Expected: `pass: false`, `reason: 'no 5.2a'`.

- [ ] **Step 6: Build 5.2a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2154:41830');
const b = base.clone(); base.parent.appendChild(b); b.name = '5.2a  Banners — edit drawer'; b.x = base.x + base.width + 80; b.y = base.y;

const f44 = await figma.getNodeByIdAsync('2287:4761');
const srcScrim = f44.children.find(c => c.name === 'scrim') || await figma.getNodeByIdAsync('2274:3729');
const srcDrawer = f44.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const scrim = srcScrim.clone(); b.appendChild(scrim); scrim.layoutPositioning = 'ABSOLUTE'; scrim.x = 0; scrim.y = 0; scrim.resize(b.width, b.height);
const drawer = srcDrawer.clone(); b.appendChild(drawer); drawer.layoutPositioning = 'ABSOLUTE'; drawer.resize(drawer.width, b.height); drawer.x = b.width - drawer.width; drawer.y = 0;
drawer.setProperties({ 'Title#514:0': 'Edit banner', 'Description#514:5': 'Direct edit — no request. Recorded in Activity under your name.', 'Show footer#514:20': true });

// drop the diff rows
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
for (const t of form.findAll(t => t.type === 'TEXT' && /^was/i.test(t.characters))) { const node = t.parent === form ? t : t.parent; try { node.remove(); } catch (e) { node.visible = false; } }

// values from card 2
const card2 = base.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [banner 2 — active]');
const cardTexts = card2.findAll(t => t.type === 'TEXT').map(t => t.characters);
const title = cardTexts.find(s => /Data Delay/.test(s)); const body = cardTexts.find(s => /delayed/i.test(s));
const message = title && body ? `${title} — ${body}` : (title || body);
async function setValue(field, value) {
  const t = field.findAll(n => n.type === 'TEXT').find(n => /value|text/i.test(n.name) && !/label|placeholder|helper|error/i.test(n.name)) || field.findAll(n => n.type === 'TEXT').slice(-1)[0];
  if (!t) throw new Error('no value text in ' + field.name);
  const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = value;
}
const byName = re => form.children.find(c => re.test(c.name)); const need = (re, what) => { const n = byName(re); if (!n) throw new Error('no field ' + what); return n; };
await setValue(need(/severity/i, 'Severity'), 'Warning');
await setValue(need(/scope/i, 'Scope'), 'Dartboards');
await setValue(need(/message/i, 'Message'), message);
await setValue(need(/starts/i, 'Starts'), '07/14/2026, 9:00 AM');
await setValue(need(/ends/i, 'Ends'), 'No end date');

// footer verb
const footer = drawer.children.find(c => /footer/i.test(c.name));
const primary = footer.children.find(c => c.type === 'INSTANCE' && c.componentProperties['Style'].value === 'default');
primary.setProperties({ 'Label#79:0': 'Save changes' });
await b.screenshot();
return { createdNodeIds: [b.id, scrim.id, drawer.id], bFrameId: b.id, drawerId: drawer.id, formKids: form.children.filter(c => c.visible).map(c => c.name) };
```

- [ ] **Step 7: Re-run Step 5** → `pass: true` (if `visibleKids.length` is not 5, list them: the form must be exactly Severity · Scope · Message · Starts · Ends).

- [ ] **Step 8: Lint 5.2 and 5.2a**

Snippet + `return await designCheck(['2154:41830', page.findOne(n => n.type === 'FRAME' && n.name === '5.2a  Banners — edit drawer').id]);` → `allZero: true`.

- [ ] **Step 9: Ledger + commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02']['manageAffordances2026_09_03']
e['5.2'] = collections.OrderedDict([
  ('headingRow', "existing page-heading row gained kpi (3 / Active / of 6 · 1 scheduled — banners 1, 2, 6) and its loose New banner moved into an actions frame; cross-axis MIN like the LAND rows."),
  ('ids', {'kpiId': '<from Step 2>', 'actionsId': '<from Step 2>', 'bFrameId': '<from Step 6>', 'drawerId': '<from Step 6>'}),
  ('5.2a', "clone of 5.2 + 4.4's scrim and apply drawer retitled Edit banner with the recorded direct-edit description; the 'was …' diff rows removed; values are card 2's (Data Delay — warning, Dartboards, Jul 14 2026, no end date); Submit relabelled Save changes. No menu frame — the cards carry Switch · Edit · Delete."),
  ('addRule', 'New banner opens this drawer empty, titled New banner, primary Create banner — stated on the doc panel in Task 7, not drawn.')
])
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
git diff --numstat docs/figma-ledger.json && git add docs/figma-ledger.json && git commit -m "docs(figma): 5.2 Banners — KPI, actions wrapper and an Edit banner drawer

The heading row gains a Size=sm stat tile (3 active of 6) and its New
banner button moves into an actions frame. 5.2a is 4.4's apply drawer
retitled Edit banner, diff rows removed, holding card 2's values with a
Save changes footer. Lint all zeros. Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: 5.3 Promotions — heading row, copy, KPI, Add, 5.3a menu, 5.3b drawer

**Files:**
- Modify: `docs/figma-ledger.json`
- Figma: `2269:2988` modified; two new frames.

**Interfaces:**
- Consumes: `designCheck`; 2.4's menu; 4.5's drawer (base) and 4.4's Starts/Ends/Message fields (donors).
- Produces: ledger sub-key `5.3`.

- [ ] **Step 1: Failing assertion — heading row + copy**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const col = await figma.getNodeByIdAsync('2269:2989');
const row = col.children.find(c => c.name === 'page-heading row');
if (!row) return { pass: false, reason: 'no page-heading row', colKids: col.children.map(c => c.name) };
const kpi = row.children.find(c => c.name === 'kpi'), actions = row.children.find(c => c.name === 'actions');
const t = name => { const n = kpi && kpi.findOne(x => x.type === 'TEXT' && x.name === name); return n ? n.characters : null; };
const desc = row.findOne(n => n.type === 'TEXT' && /promotions come from/i.test(n.characters));
const result = { kids: row.children.map(c => c.name), kpi: kpi ? [t('stat value'), t('stat title'), t('stat caption')] : null, button: actions && actions.children[0] ? actions.children[0].componentProperties['Label#79:0'].value : null, desc: desc ? desc.characters : null };
result.pass = result.kids.join('|') === 'page-heading|kpi|actions' && JSON.stringify(result.kpi) === JSON.stringify(['2', 'Live', 'ending within 30 days']) && result.button === 'Promote a dashboard' && result.desc === 'Most promotions come from an approved Promote request; a platform admin can also promote a dashboard directly. Every promotion ends on its own date without anyone doing anything.';
return result;
```

Expected: `pass: false`, `reason: 'no page-heading row'`, `colKids: ['page-heading', 'ui-table [promotions]', 'body']`.

- [ ] **Step 2: Build the heading row and change the copy**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const col = await figma.getNodeByIdAsync('2269:2989');
const ph = col.children.find(c => c.name === 'page-heading'); if (!ph) throw new Error('no page-heading');
const idx = col.children.indexOf(ph);
const row = figma.createAutoLayout('HORIZONTAL', { name: 'page-heading row', itemSpacing: 32 });
row.fills = []; row.clipsContent = false; row.primaryAxisAlignItems = 'MIN'; row.counterAxisAlignItems = 'MIN';
col.insertChild(idx, row); row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'HUG'; row.setBoundVariable('itemSpacing', V('spacing/8'));
row.appendChild(ph); ph.layoutSizingHorizontal = 'FILL';

async function setChars(t, value) { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = value; }
const desc = ph.findOne(n => n.type === 'TEXT' && /^Dashboards highlighted/.test(n.characters)); if (!desc) throw new Error('description text not found');
await setChars(desc, 'Most promotions come from an approved Promote request; a platform admin can also promote a dashboard directly. Every promotion ends on its own date without anyone doing anything.');

const f11 = await figma.getNodeByIdAsync('2130:455');
const src = f11.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — pending approvals]');
const kpi = src.clone(); kpi.name = 'kpi'; row.appendChild(kpi); kpi.layoutSizingHorizontal = 'HUG'; kpi.layoutSizingVertical = 'HUG'; kpi.setProperties({ Size: 'sm' });
const setText = async (root, name, value) => { const t = root.findOne(n => n.type === 'TEXT' && n.name === name); if (!t) throw new Error('no text ' + name); await setChars(t, value); };
await setText(kpi, 'stat value', '2'); await setText(kpi, 'stat title', 'Live'); await setText(kpi, 'stat caption', 'ending within 30 days');

const actions = figma.createAutoLayout('HORIZONTAL', { name: 'actions', itemSpacing: 16 });
actions.fills = []; actions.clipsContent = false; actions.primaryAxisAlignItems = 'MIN'; actions.counterAxisAlignItems = 'CENTER';
row.appendChild(actions); actions.layoutSizingHorizontal = 'HUG'; actions.layoutSizingVertical = 'HUG'; actions.setBoundVariable('itemSpacing', V('spacing/4'));
const row52 = await figma.getNodeByIdAsync('2248:2172');
const srcBtn = row52.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-button [New banner]');
const btn = srcBtn.clone(); actions.appendChild(btn); btn.name = 'ui-button [Promote a dashboard]'; btn.setProperties({ 'Label#79:0': 'Promote a dashboard' });
const f = await figma.getNodeByIdAsync('2269:2988'); await f.screenshot();
return { createdNodeIds: [row.id, kpi.id, actions.id, btn.id], rowId: row.id, kpiId: kpi.id, actionsId: actions.id };
```

- [ ] **Step 3: Re-run Step 1** → `pass: true`.

- [ ] **Step 4: Failing assertion — 5.3a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const a = page.findOne(n => n.type === 'FRAME' && n.name === '5.3a  Promotions — row menu open');
if (!a) return { pass: false, reason: 'no 5.3a' };
const menu = a.children.find(c => c.type === 'INSTANCE' && /row actions/.test(c.name));
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63' && n.visible);
const seps = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66' && n.visible);
const labels = items.map(i => i.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const result = { labels, variants: items.map(i => i.mainComponent.name), separators: seps.length };
result.pass = labels.join('|') === 'Edit dates|Open dashboard|End promotion early' && seps.length === 1 && !/destructive/i.test(result.variants[2]);
return result;
```

Expected: `pass: false`.

- [ ] **Step 5: Build 5.3a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2269:2988');
const a = base.clone(); base.parent.appendChild(a); a.name = '5.3a  Promotions — row menu open'; a.x = base.x + base.width + 80; a.y = base.y;
const table = a.findOne(n => n.type === 'FRAME' && n.name === 'ui-table [promotions]');
const rows = table.children.filter(c => /^ui-table__row/.test(c.name)); const row2 = rows[1]; const cell = row2.children[row2.children.length - 1];
if (!/actions/.test(cell.name)) throw new Error('last cell is not actions: ' + cell.name);
const srcMenu = await figma.getNodeByIdAsync('2228:1827');
const menu = srcMenu.clone(); a.appendChild(menu); menu.layoutPositioning = 'ABSOLUTE';
const cb = cell.absoluteBoundingBox, ab = a.absoluteBoundingBox; menu.x = (cb.x + cb.width) - ab.x - menu.width; menu.y = (cb.y + cb.height) - ab.y + 4;
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63');
const labelKey = Object.keys(items[0].componentProperties).find(k => /^Label/i.test(k)); if (!labelKey) throw new Error('no Label property on Item');
const variantKey = Object.keys(items[0].componentProperties).find(k => /^Variant$/i.test(k));
const axis = variantKey && setOf(items[0].mainComponent).componentPropertyDefinitions[variantKey].variantOptions;
const plain = axis ? (axis.find(o => /^default$/i.test(o)) || axis[0]) : null;
const wanted = ['Edit dates', 'Open dashboard', 'End promotion early'];
for (let i = 0; i < items.length; i++) {
  if (i < wanted.length) { const props = { [labelKey]: wanted[i] }; if (variantKey && plain) props[variantKey] = plain; items[i].setProperties(props); }
  else { try { items[i].remove(); } catch (e) { items[i].visible = false; } }
}
for (const s of menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66')) { try { s.remove(); } catch (e) { s.visible = false; } }
const sepMaster = await figma.getNodeByIdAsync('544:66'); const sepComp = sepMaster.type === 'COMPONENT_SET' ? sepMaster.defaultVariant : sepMaster;
const sep = sepComp.createInstance(); const last = items[wanted.length - 1]; last.parent.insertChild(last.parent.children.indexOf(last), sep);
await a.screenshot();
return { createdNodeIds: [a.id, menu.id, sep.id], aFrameId: a.id, menuId: menu.id, row2: row2.name };
```

Expected `row2: 'ui-table__row [Portfolio Risk Summary]'` (Live).

- [ ] **Step 6: Re-run Step 4** → `pass: true`.

- [ ] **Step 7: Read row 2's Starts / Ends / From cells**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const table = await figma.getNodeByIdAsync('2269:3061');
const header = table.children.find(c => c.name === 'ui-table__header');
const cols = header.children.map(c => c.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const row2 = table.children.filter(c => /^ui-table__row/.test(c.name))[1];
const cell = name => row2.children[cols.indexOf(name)].findAll(t => t.type === 'TEXT').map(t => t.characters).join(' ');
return { cols, dashboard: cell('Dashboard'), starts: cell('Starts'), ends: cell('Ends'), from: cell('From') };
```

Expected: `dashboard: 'Portfolio Risk Summary'` plus its dates and a request reference. These four strings are the drawer's values in Step 9.

- [ ] **Step 8: Failing assertion — 5.3b**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const b = page.findOne(n => n.type === 'FRAME' && n.name === '5.3b  Promotions — edit drawer');
if (!b) return { pass: false, reason: 'no 5.3b' };
const drawer = b.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const kids = form.children.filter(c => c.visible).map(c => c.name);
const footer = drawer.children.find(c => /footer/i.test(c.name));
const btns = footer.children.filter(c => c.visible && c.type === 'INSTANCE').map(c => `${c.componentProperties['Style'].value}/${c.componentProperties['Size'].value}:${c.componentProperties['Label#79:0'].value}`);
const first = form.children.filter(c => c.visible)[0];
const result = { title: drawer.componentProperties['Title#514:0'].value, kids, footer: btns, firstDisabled: first && first.componentProperties['Disabled'] ? first.componentProperties['Disabled'].value : null };
result.pass = result.title === 'Edit promotion' && kids.length === 4 && /dashboard/i.test(kids[0]) && /starts/i.test(kids[1]) && /ends/i.test(kids[2]) && /reason/i.test(kids[3]) && String(result.firstDisabled) === 'true' && btns.join('|') === 'ghost/sm:Cancel|default/sm:Save changes';
return result;
```

Expected: `pass: false`.

- [ ] **Step 9: Build 5.3b**

Substitute the four strings from Step 7 into `VALUES`.

```js
const VALUES = { dashboard: '<Step 7 dashboard>', starts: '<Step 7 starts>', ends: '<Step 7 ends>', from: '<Step 7 from>' };
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2269:2988');
const a = page.findOne(n => n.type === 'FRAME' && n.name === '5.3a  Promotions — row menu open'); if (!a) throw new Error('build 5.3a first');
const b = base.clone(); base.parent.appendChild(b); b.name = '5.3b  Promotions — edit drawer'; b.x = a.x + a.width + 80; b.y = base.y;

const f45 = await figma.getNodeByIdAsync('2267:2597'); const f44 = await figma.getNodeByIdAsync('2287:4761');
const srcScrim = f45.children.find(c => c.name === 'scrim') || await figma.getNodeByIdAsync('2274:3729');
const srcDrawer = f45.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const scrim = srcScrim.clone(); b.appendChild(scrim); scrim.layoutPositioning = 'ABSOLUTE'; scrim.x = 0; scrim.y = 0; scrim.resize(b.width, b.height);
const drawer = srcDrawer.clone(); b.appendChild(drawer); drawer.layoutPositioning = 'ABSOLUTE'; drawer.resize(drawer.width, b.height); drawer.x = b.width - drawer.width; drawer.y = 0;
drawer.setProperties({ 'Title#514:0': 'Edit promotion', 'Description#514:5': 'Direct edit — no request. Recorded in Activity under your name.', 'Show footer#514:20': true });

const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const setChars = async (t, v) => { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = v; };
const labelOf = f => f.findAll(n => n.type === 'TEXT').find(n => /label/i.test(n.name));
const valueOf = f => f.findAll(n => n.type === 'TEXT').find(n => /value|text/i.test(n.name) && !/label|placeholder|helper|error/i.test(n.name)) || f.findAll(n => n.type === 'TEXT').slice(-1)[0];

// keep the first Input as "Dashboard" (disabled); drop the other 4.5 fields
const kept = form.children[0];
for (const c of form.children.slice(1)) { try { c.remove(); } catch (e) { c.visible = false; } }
kept.name = 'ui-input [Dashboard]';
await setChars(labelOf(kept), 'Dashboard'); await setChars(valueOf(kept), VALUES.dashboard);
if (kept.componentProperties['Disabled']) kept.setProperties({ Disabled: 'true' });

// borrow Starts, Ends, Message from 4.4
const drawer44 = f44.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const form44 = drawer44.children.find(c => c.type === 'SLOT').children[0];
const take = (re, what) => { const n = form44.children.find(c => re.test(c.name)); if (!n) throw new Error('4.4 has no ' + what); const cl = n.clone(); form.appendChild(cl); cl.layoutSizingHorizontal = 'FILL'; return cl; };
const starts = take(/starts/i, 'Starts'); await setChars(valueOf(starts), VALUES.starts);
const ends = take(/ends/i, 'Ends'); await setChars(valueOf(ends), VALUES.ends);
const reason = take(/message/i, 'Message'); reason.name = 'ui-textarea [Reason]'; await setChars(labelOf(reason), 'Reason'); await setChars(valueOf(reason), `Promote request ${VALUES.from}`);
await b.screenshot();
return { createdNodeIds: [b.id, scrim.id, drawer.id], bFrameId: b.id, drawerId: drawer.id, formKids: form.children.filter(c => c.visible).map(c => c.name) };
```

- [ ] **Step 10: Re-run Step 8** → `pass: true`.

- [ ] **Step 11: Lint 5.3, 5.3a, 5.3b**

Snippet + `return await designCheck(['2269:2988', ...page.findAll(n => n.type === 'FRAME' && /^5\.3[ab] /.test(n.name)).map(n => n.id)]);` → `allZero: true`.

- [ ] **Step 12: Ledger + commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02']['manageAffordances2026_09_03']
e['5.3'] = collections.OrderedDict([
  ('headingRow', "page-heading row built; KPI 2 / Live / ending within 30 days — the two Live rows are Originations Daily Vol and Portfolio Risk Summary (1 Scheduled, 2 Ended not counted); actions holds Promote a dashboard."),
  ('copyChange', "'Every promotion comes from an approved Promote request…' -> 'Most promotions come from an approved Promote request; a platform admin can also promote a dashboard directly. Every promotion ends on its own date without anyone doing anything.' The manual path the two-edit-paths principle already grants."),
  ('ids', {'rowId': '<Step 2>', 'kpiId': '<Step 2>', 'actionsId': '<Step 2>', 'aFrameId': '<Step 5>', 'menuId': '<Step 5>', 'bFrameId': '<Step 9>', 'drawerId': '<Step 9>'}),
  ('5.3a', 'row menu on Portfolio Risk Summary: Edit dates · Open dashboard · — · End promotion early (plain — ending early is a state change).'),
  ('5.3b', "Edit promotion: Dashboard (Input, disabled — the subject cannot change) · Starts · Ends (DatePicker fields borrowed from 4.4) · Reason (4.4's Message textarea relabelled); values are row 2's cells."),
  ('addRule', 'Promote a dashboard opens this drawer empty with Dashboard as a Combobox (long searchable list), primary Promote — stated, not drawn.')
])
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
git diff --numstat docs/figma-ledger.json && git add docs/figma-ledger.json && git commit -m "docs(figma): 5.3 Promotions — KPI, Promote a dashboard, row menu and edit drawer

Heading row with a Size=sm stat tile (2 live) and a Promote a dashboard
action; the page copy now admits the direct path. 5.3a opens the row
menu on Portfolio Risk Summary (End promotion early plain, after a
rule); 5.3b is an Edit promotion drawer with a disabled Dashboard field,
dates and a reason. Lint all zeros. Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: 5.4 URL Redirects — heading row, KPI, Add, 5.4a menu, 5.4b drawer

**Files:**
- Modify: `docs/figma-ledger.json`
- Figma: `2270:3089` modified; two new frames.

**Interfaces:**
- Consumes: `designCheck`; 2.4's menu; 4.5's drawer (base; its Name/Project become From/To, its Lifecycle becomes Status) and 4.4's Message (becomes Reason).
- Produces: ledger sub-key `5.4`.

- [ ] **Step 1: Failing assertion — heading row**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const col = await figma.getNodeByIdAsync('2270:3090');
const row = col.children.find(c => c.name === 'page-heading row');
if (!row) return { pass: false, reason: 'no page-heading row', colKids: col.children.map(c => c.name) };
const kpi = row.children.find(c => c.name === 'kpi'), actions = row.children.find(c => c.name === 'actions');
const t = name => { const n = kpi && kpi.findOne(x => x.type === 'TEXT' && x.name === name); return n ? n.characters : null; };
const result = { kids: row.children.map(c => c.name), kpi: kpi ? [t('stat value'), t('stat title'), t('stat caption')] : null, button: actions && actions.children[0] ? actions.children[0].componentProperties['Label#79:0'].value : null };
result.pass = result.kids.join('|') === 'page-heading|kpi|actions' && JSON.stringify(result.kpi) === JSON.stringify(['3', 'Active redirects', '2,306 hits this month']) && result.button === 'New redirect';
return result;
```

Expected: `pass: false`, `colKids: ['page-heading', 'ui-table [redirects]', 'body']`.

- [ ] **Step 2: Build the heading row**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const col = await figma.getNodeByIdAsync('2270:3090');
const ph = col.children.find(c => c.name === 'page-heading'); if (!ph) throw new Error('no page-heading');
const idx = col.children.indexOf(ph);
const row = figma.createAutoLayout('HORIZONTAL', { name: 'page-heading row', itemSpacing: 32 });
row.fills = []; row.clipsContent = false; row.primaryAxisAlignItems = 'MIN'; row.counterAxisAlignItems = 'MIN';
col.insertChild(idx, row); row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'HUG'; row.setBoundVariable('itemSpacing', V('spacing/8'));
row.appendChild(ph); ph.layoutSizingHorizontal = 'FILL';
const f11 = await figma.getNodeByIdAsync('2130:455');
const src = f11.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — pending approvals]');
const kpi = src.clone(); kpi.name = 'kpi'; row.appendChild(kpi); kpi.layoutSizingHorizontal = 'HUG'; kpi.layoutSizingVertical = 'HUG'; kpi.setProperties({ Size: 'sm' });
const setText = async (root, name, value) => { const t = root.findOne(n => n.type === 'TEXT' && n.name === name); if (!t) throw new Error('no text ' + name); const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = value; };
await setText(kpi, 'stat value', '3'); await setText(kpi, 'stat title', 'Active redirects'); await setText(kpi, 'stat caption', '2,306 hits this month');
const actions = figma.createAutoLayout('HORIZONTAL', { name: 'actions', itemSpacing: 16 });
actions.fills = []; actions.clipsContent = false; actions.primaryAxisAlignItems = 'MIN'; actions.counterAxisAlignItems = 'CENTER';
row.appendChild(actions); actions.layoutSizingHorizontal = 'HUG'; actions.layoutSizingVertical = 'HUG'; actions.setBoundVariable('itemSpacing', V('spacing/4'));
const row52 = await figma.getNodeByIdAsync('2248:2172');
const srcBtn = row52.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-button [New banner]');
const btn = srcBtn.clone(); actions.appendChild(btn); btn.name = 'ui-button [New redirect]'; btn.setProperties({ 'Label#79:0': 'New redirect' });
const f = await figma.getNodeByIdAsync('2270:3089'); await f.screenshot();
return { createdNodeIds: [row.id, kpi.id, actions.id, btn.id], rowId: row.id, kpiId: kpi.id, actionsId: actions.id };
```

- [ ] **Step 3: Re-run Step 1** → `pass: true`.

- [ ] **Step 4: Failing assertion — 5.4a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const a = page.findOne(n => n.type === 'FRAME' && n.name === '5.4a  URL Redirects — row menu open');
if (!a) return { pass: false, reason: 'no 5.4a' };
const menu = a.children.find(c => c.type === 'INSTANCE' && /row actions/.test(c.name));
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63' && n.visible);
const seps = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66' && n.visible);
const labels = items.map(i => i.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const result = { labels, variants: items.map(i => i.mainComponent.name), separators: seps.length };
result.pass = labels.join('|') === 'Edit|Test link|Remove redirect' && seps.length === 1 && /destructive/i.test(result.variants[2]) && !/destructive/i.test(result.variants[0]);
return result;
```

Expected: `pass: false`.

- [ ] **Step 5: Build 5.4a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2270:3089');
const a = base.clone(); base.parent.appendChild(a); a.name = '5.4a  URL Redirects — row menu open'; a.x = base.x + base.width + 80; a.y = base.y;
const table = a.findOne(n => n.type === 'FRAME' && n.name === 'ui-table [redirects]');
const rows = table.children.filter(c => /^ui-table__row/.test(c.name)); const row2 = rows[1]; const cell = row2.children[row2.children.length - 1];
if (!/actions/.test(cell.name)) throw new Error('last cell is not actions: ' + cell.name);
const srcMenu = await figma.getNodeByIdAsync('2228:1827');
const menu = srcMenu.clone(); a.appendChild(menu); menu.layoutPositioning = 'ABSOLUTE';
const cb = cell.absoluteBoundingBox, ab = a.absoluteBoundingBox; menu.x = (cb.x + cb.width) - ab.x - menu.width; menu.y = (cb.y + cb.height) - ab.y + 4;
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63');
const labelKey = Object.keys(items[0].componentProperties).find(k => /^Label/i.test(k)); if (!labelKey) throw new Error('no Label property on Item');
const variantKey = Object.keys(items[0].componentProperties).find(k => /^Variant$/i.test(k)); if (!variantKey) throw new Error('Item has no Variant axis — cannot mark destructive');
const axis = setOf(items[0].mainComponent).componentPropertyDefinitions[variantKey].variantOptions;
const plain = axis.find(o => /^default$/i.test(o)) || axis[0]; const red = axis.find(o => /destructive/i.test(o)); if (!red) throw new Error('no destructive option: ' + axis.join(','));
const wanted = [['Edit', plain], ['Test link', plain], ['Remove redirect', red]];
for (let i = 0; i < items.length; i++) {
  if (i < wanted.length) items[i].setProperties({ [labelKey]: wanted[i][0], [variantKey]: wanted[i][1] });
  else { try { items[i].remove(); } catch (e) { items[i].visible = false; } }
}
for (const s of menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66')) { try { s.remove(); } catch (e) { s.visible = false; } }
const sepMaster = await figma.getNodeByIdAsync('544:66'); const sepComp = sepMaster.type === 'COMPONENT_SET' ? sepMaster.defaultVariant : sepMaster;
const sep = sepComp.createInstance(); const last = items[wanted.length - 1]; last.parent.insertChild(last.parent.children.indexOf(last), sep);
await a.screenshot();
return { createdNodeIds: [a.id, menu.id, sep.id], aFrameId: a.id, menuId: menu.id, row2: row2.name };
```

Expected `row2: 'ui-table__row [/spaces/old-ops-hub]'`; screenshot shows `Remove redirect` in red after the rule.

- [ ] **Step 6: Re-run Step 4** → `pass: true`.

- [ ] **Step 7: Read row 2's From / To / Reason / Status cells**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const table = await figma.getNodeByIdAsync('2270:3162');
const header = table.children.find(c => c.name === 'ui-table__header');
const cols = header.children.map(c => c.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const row2 = table.children.filter(c => /^ui-table__row/.test(c.name))[1];
const cell = name => row2.children[cols.indexOf(name)].findAll(t => t.type === 'TEXT').map(t => t.characters).join(' ');
return { from: cell('From'), to: cell('To'), reason: cell('Reason'), status: cell('Status') };
```

Expected: `from: '/spaces/old-ops-hub'`, `status: 'Active'`, plus To and Reason strings for Step 9.

- [ ] **Step 8: Failing assertion — 5.4b**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const b = page.findOne(n => n.type === 'FRAME' && n.name === '5.4b  URL Redirects — edit drawer');
if (!b) return { pass: false, reason: 'no 5.4b' };
const drawer = b.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const kids = form.children.filter(c => c.visible).map(c => c.name);
const footer = drawer.children.find(c => /footer/i.test(c.name));
const btns = footer.children.filter(c => c.visible && c.type === 'INSTANCE').map(c => `${c.componentProperties['Style'].value}/${c.componentProperties['Size'].value}:${c.componentProperties['Label#79:0'].value}`);
const result = { title: drawer.componentProperties['Title#514:0'].value, kids, footer: btns };
result.pass = result.title === 'Edit redirect' && kids.length === 4 && /from/i.test(kids[0]) && /\bto\b/i.test(kids[1]) && /reason/i.test(kids[2]) && /status/i.test(kids[3]) && btns.join('|') === 'ghost/sm:Cancel|default/sm:Save changes';
return result;
```

Expected: `pass: false`.

- [ ] **Step 9: Build 5.4b**

Substitute Step 7's strings into `VALUES`.

```js
const VALUES = { from: '<Step 7 from>', to: '<Step 7 to>', reason: '<Step 7 reason>', status: 'active' };
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2270:3089');
const a = page.findOne(n => n.type === 'FRAME' && n.name === '5.4a  URL Redirects — row menu open'); if (!a) throw new Error('build 5.4a first');
const b = base.clone(); base.parent.appendChild(b); b.name = '5.4b  URL Redirects — edit drawer'; b.x = a.x + a.width + 80; b.y = base.y;
const f45 = await figma.getNodeByIdAsync('2267:2597'); const f44 = await figma.getNodeByIdAsync('2287:4761');
const srcScrim = f45.children.find(c => c.name === 'scrim') || await figma.getNodeByIdAsync('2274:3729');
const srcDrawer = f45.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const scrim = srcScrim.clone(); b.appendChild(scrim); scrim.layoutPositioning = 'ABSOLUTE'; scrim.x = 0; scrim.y = 0; scrim.resize(b.width, b.height);
const drawer = srcDrawer.clone(); b.appendChild(drawer); drawer.layoutPositioning = 'ABSOLUTE'; drawer.resize(drawer.width, b.height); drawer.x = b.width - drawer.width; drawer.y = 0;
drawer.setProperties({ 'Title#514:0': 'Edit redirect', 'Description#514:5': 'Direct edit — no request. Recorded in Activity under your name.', 'Show footer#514:20': true });
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const setChars = async (t, v) => { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = v; };
const labelOf = f => f.findAll(n => n.type === 'TEXT').find(n => /label/i.test(n.name));
const valueOf = f => f.findAll(n => n.type === 'TEXT').find(n => /value|text/i.test(n.name) && !/label|placeholder|helper|error/i.test(n.name)) || f.findAll(n => n.type === 'TEXT').slice(-1)[0];
// 4.5's form: Name, Project, Inventory number, Lifecycle, Tableau link
const byName = re => form.children.find(c => re.test(c.name)); const need = (re, what) => { const n = byName(re); if (!n) throw new Error('4.5 form has no ' + what); return n; };
const fFrom = need(/name/i, 'Name'), fTo = need(/project/i, 'Project'), fStatus = need(/lifecycle/i, 'Lifecycle');
for (const c of [need(/inventory/i, 'Inventory number'), need(/tableau/i, 'Tableau link')]) { try { c.remove(); } catch (e) { c.visible = false; } }
fFrom.name = 'ui-input [From]'; await setChars(labelOf(fFrom), 'From'); await setChars(valueOf(fFrom), VALUES.from);
fTo.name = 'ui-input [To]'; await setChars(labelOf(fTo), 'To'); await setChars(valueOf(fTo), VALUES.to);
fStatus.name = 'ui-native-select [Status]'; await setChars(labelOf(fStatus), 'Status'); await setChars(valueOf(fStatus), VALUES.status);
const drawer44 = f44.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const msg = drawer44.children.find(c => c.type === 'SLOT').children[0].children.find(c => /message/i.test(c.name)); if (!msg) throw new Error('4.4 has no Message');
const reason = msg.clone(); form.insertChild(form.children.indexOf(fStatus), reason); reason.layoutSizingHorizontal = 'FILL';
reason.name = 'ui-textarea [Reason]'; await setChars(labelOf(reason), 'Reason'); await setChars(valueOf(reason), VALUES.reason);
await b.screenshot();
return { createdNodeIds: [b.id, scrim.id, drawer.id], bFrameId: b.id, drawerId: drawer.id, formKids: form.children.filter(c => c.visible).map(c => c.name) };
```

- [ ] **Step 10: Re-run Step 8** → `pass: true`.

- [ ] **Step 11: Lint 5.4, 5.4a, 5.4b**

Snippet + `return await designCheck(['2270:3089', ...page.findAll(n => n.type === 'FRAME' && /^5\.4[ab] /.test(n.name)).map(n => n.id)]);` → `allZero: true`.

- [ ] **Step 12: Ledger + commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02']['manageAffordances2026_09_03']
e['5.4'] = collections.OrderedDict([
  ('headingRow', "page-heading row built; KPI 3 / Active redirects / 2,306 hits this month — three Active rows (q2-forecast is Inactive), hits summed over all four rows: 847 + 213 + 1,204 + 42; actions holds New redirect."),
  ('ids', {'rowId': '<Step 2>', 'kpiId': '<Step 2>', 'actionsId': '<Step 2>', 'aFrameId': '<Step 5>', 'menuId': '<Step 5>', 'bFrameId': '<Step 9>', 'drawerId': '<Step 9>'}),
  ('5.4a', 'row menu on /spaces/old-ops-hub: Edit · Test link · — · Remove redirect (destructive — a true removal).'),
  ('5.4b', "Edit redirect from 4.5's drawer: Name->From, Project->To, Lifecycle->Status (active), Inventory/Tableau dropped, 4.4's Message borrowed as Reason; values are row 2's cells."),
  ('addRule', 'New redirect opens this drawer empty, primary Create redirect — stated, not drawn.')
])
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
git diff --numstat docs/figma-ledger.json && git add docs/figma-ledger.json && git commit -m "docs(figma): 5.4 URL Redirects — KPI, New redirect, row menu and edit drawer

Heading row with a Size=sm stat tile (3 active, 2,306 hits) and a New
redirect action. 5.4a opens the row menu on /spaces/old-ops-hub with
Remove redirect destructive after a rule; 5.4b is an Edit redirect
drawer (From, To, Reason, Status) built from 4.5's fields. Lint all
zeros. Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: 6.1 Access Control — heading row + KPI, section headers with adds, 6.1a menu, 6.1b drawer

**Files:**
- Modify: `docs/figma-ledger.json`
- Figma: `2268:2856` modified; two new frames.

**Interfaces:**
- Consumes: `designCheck`; LAND `section header` (`2190:1036`) as the section-header shape; 2.4's menu; 4.5's drawer; the Checkbox set found in Step 8.
- Produces: ledger sub-key `6.1`.

- [ ] **Step 1: Failing assertion — heading row + sections**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const col = await figma.getNodeByIdAsync('2268:2857');
const row = col.children.find(c => c.name === 'page-heading row');
if (!row) return { pass: false, reason: 'no page-heading row', colKids: col.children.map(c => `${c.type}:${c.name}`) };
const kpi = row.children.find(c => c.name === 'kpi');
const t = name => { const n = kpi && kpi.findOne(x => x.type === 'TEXT' && x.name === name); return n ? n.characters : null; };
const secs = col.children.filter(c => /^section — /.test(c.name)).map(s => ({ name: s.name, gap: s.itemSpacing, kids: s.children.map(k => k.name), button: (() => { const h = s.children[0]; const b = h && h.children.find(k => k.type === 'INSTANCE' && /button/i.test(k.name)); return b ? `${b.componentProperties['Label#79:0'].value}/${b.componentProperties['Size'].value}` : null; })() }));
const result = { rowKids: row.children.map(c => c.name), kpi: kpi ? [t('stat value'), t('stat title'), t('stat caption')] : null, sections: secs };
result.pass = result.rowKids.join('|') === 'page-heading|kpi' && JSON.stringify(result.kpi) === JSON.stringify(['4', 'Admins', '5 with request access'])
  && secs.length === 2 && secs[0].name === 'section — admins' && secs[1].name === 'section — request access' && secs.every(s => s.gap === 8 && s.kids[0] === 'section header' && /^ui-table/.test(s.kids[1]))
  && secs[0].button === 'Add admin/sm' && secs[1].button === 'Grant request access/sm';
return result;
```

Expected: `pass: false`, `colKids` showing `page-heading`, two `TEXT:section heading`, two tables and two `body` frames.

- [ ] **Step 2: Build the heading row and the two sections**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const col = await figma.getNodeByIdAsync('2268:2857');
const setChars = async (t, v) => { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = v; };

// heading row [page-heading, kpi]
const ph = col.children.find(c => c.name === 'page-heading'); if (!ph) throw new Error('no page-heading');
const row = figma.createAutoLayout('HORIZONTAL', { name: 'page-heading row', itemSpacing: 32 });
row.fills = []; row.clipsContent = false; row.primaryAxisAlignItems = 'MIN'; row.counterAxisAlignItems = 'MIN';
col.insertChild(col.children.indexOf(ph), row); row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'HUG'; row.setBoundVariable('itemSpacing', V('spacing/8'));
row.appendChild(ph); ph.layoutSizingHorizontal = 'FILL';
const f11 = await figma.getNodeByIdAsync('2130:455');
const src = f11.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — pending approvals]');
const kpi = src.clone(); kpi.name = 'kpi'; row.appendChild(kpi); kpi.layoutSizingHorizontal = 'HUG'; kpi.layoutSizingVertical = 'HUG'; kpi.setProperties({ Size: 'sm' });
const setText = async (root, name, value) => { const t = root.findOne(n => n.type === 'TEXT' && n.name === name); if (!t) throw new Error('no text ' + name); await setChars(t, value); };
await setText(kpi, 'stat value', '4'); await setText(kpi, 'stat title', 'Admins'); await setText(kpi, 'stat caption', '5 with request access');

// sections: wrap each [section heading TEXT, table] into section — X with a section header row
const row52 = await figma.getNodeByIdAsync('2248:2172');
const srcBtn = row52.findOne(n => n.type === 'INSTANCE' && n.name === 'ui-button [New banner]');
const srcSpacer = await figma.getNodeByIdAsync('2190:1042');
const specs = [{ table: 'ui-table [admins]', section: 'section — admins', label: 'Add admin' }, { table: 'ui-table [request access]', section: 'section — request access', label: 'Grant request access' }];
const made = [];
for (const s of specs) {
  const table = col.children.find(c => c.name === s.table); if (!table) throw new Error('no ' + s.table);
  const heading = col.children[col.children.indexOf(table) - 1];
  if (!(heading.type === 'TEXT' && heading.name === 'section heading')) throw new Error('expected a section heading TEXT before ' + s.table + ', got ' + heading.type + ':' + heading.name);
  const section = figma.createAutoLayout('VERTICAL', { name: s.section, itemSpacing: 8 });
  section.fills = []; section.clipsContent = false; section.primaryAxisAlignItems = 'MIN'; section.counterAxisAlignItems = 'MIN';
  col.insertChild(col.children.indexOf(heading), section); section.layoutSizingHorizontal = 'FILL'; section.layoutSizingVertical = 'HUG'; section.setBoundVariable('itemSpacing', V('spacing/2'));
  const header = figma.createAutoLayout('HORIZONTAL', { name: 'section header', itemSpacing: 8 });
  header.fills = []; header.clipsContent = false; header.primaryAxisAlignItems = 'MIN'; header.counterAxisAlignItems = 'CENTER';
  section.appendChild(header); header.layoutSizingHorizontal = 'FILL'; header.layoutSizingVertical = 'HUG'; header.setBoundVariable('itemSpacing', V('spacing/2'));
  header.appendChild(heading);
  const spacer = srcSpacer.clone(); header.appendChild(spacer); spacer.layoutSizingHorizontal = 'FILL';
  const btn = srcBtn.clone(); header.appendChild(btn); btn.name = `ui-button [${s.label}]`; btn.setProperties({ 'Label#79:0': s.label, Size: 'sm' });
  section.appendChild(table); table.layoutSizingHorizontal = 'FILL';
  made.push({ sectionId: section.id, headerId: header.id, buttonId: btn.id });
}
const f = await figma.getNodeByIdAsync('2268:2856'); await f.screenshot();
return { createdNodeIds: [row.id, kpi.id, ...made.flatMap(m => [m.sectionId, m.headerId, m.buttonId])], rowId: row.id, kpiId: kpi.id, sections: made, colKids: col.children.map(c => c.name) };
```

Expected `colKids: ['page-heading row', 'section — admins', 'body', 'section — request access', 'body']`.

- [ ] **Step 3: Re-run Step 1** → `pass: true`.

- [ ] **Step 4: Failing assertion — 6.1a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const a = page.findOne(n => n.type === 'FRAME' && n.name === '6.1a  Access Control — row menu open');
if (!a) return { pass: false, reason: 'no 6.1a' };
const menu = a.children.find(c => c.type === 'INSTANCE' && /row actions/.test(c.name));
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63' && n.visible);
const seps = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66' && n.visible);
const labels = items.map(i => i.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const result = { labels, variants: items.map(i => i.mainComponent.name), separators: seps.length };
result.pass = labels.join('|') === 'Edit scope|Revoke admin' && seps.length === 1 && /destructive/i.test(result.variants[1]) && !/destructive/i.test(result.variants[0]);
return result;
```

Expected: `pass: false`.

- [ ] **Step 5: Build 6.1a**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const base = await figma.getNodeByIdAsync('2268:2856');
const a = base.clone(); base.parent.appendChild(a); a.name = '6.1a  Access Control — row menu open'; a.x = base.x + base.width + 80; a.y = base.y;
const table = a.findOne(n => n.type === 'FRAME' && n.name === 'ui-table [admins]');
const rows = table.children.filter(c => /^ui-table__row/.test(c.name)); const row2 = rows[1]; const cell = row2.children[row2.children.length - 1];
if (!/actions/.test(cell.name)) throw new Error('last cell is not actions: ' + cell.name);
const srcMenu = await figma.getNodeByIdAsync('2228:1827');
const menu = srcMenu.clone(); a.appendChild(menu); menu.layoutPositioning = 'ABSOLUTE';
const cb = cell.absoluteBoundingBox, ab = a.absoluteBoundingBox; menu.x = (cb.x + cb.width) - ab.x - menu.width; menu.y = (cb.y + cb.height) - ab.y + 4;
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63');
const labelKey = Object.keys(items[0].componentProperties).find(k => /^Label/i.test(k)); if (!labelKey) throw new Error('no Label property on Item');
const variantKey = Object.keys(items[0].componentProperties).find(k => /^Variant$/i.test(k)); if (!variantKey) throw new Error('Item has no Variant axis');
const axis = setOf(items[0].mainComponent).componentPropertyDefinitions[variantKey].variantOptions;
const plain = axis.find(o => /^default$/i.test(o)) || axis[0]; const red = axis.find(o => /destructive/i.test(o)); if (!red) throw new Error('no destructive option');
const wanted = [['Edit scope', plain], ['Revoke admin', red]];
for (let i = 0; i < items.length; i++) {
  if (i < wanted.length) items[i].setProperties({ [labelKey]: wanted[i][0], [variantKey]: wanted[i][1] });
  else { try { items[i].remove(); } catch (e) { items[i].visible = false; } }
}
for (const s of menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:66')) { try { s.remove(); } catch (e) { s.visible = false; } }
const sepMaster = await figma.getNodeByIdAsync('544:66'); const sepComp = sepMaster.type === 'COMPONENT_SET' ? sepMaster.defaultVariant : sepMaster;
const sep = sepComp.createInstance(); const last = items[wanted.length - 1]; last.parent.insertChild(last.parent.children.indexOf(last), sep);
await a.screenshot();
return { createdNodeIds: [a.id, menu.id, sep.id], aFrameId: a.id, menuId: menu.id, row2: row2.name };
```

- [ ] **Step 6: Re-run Step 4** → `pass: true`.

- [ ] **Step 7: Read row 2's Person and Administers cells**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const table = await figma.getNodeByIdAsync('2268:2929');
const header = table.children.find(c => c.name === 'ui-table__header');
const cols = header.children.map(c => c.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const row2 = table.children.filter(c => /^ui-table__row/.test(c.name))[1];
const cell = name => row2.children[cols.indexOf(name)].findAll(t => t.type === 'TEXT').map(t => t.characters).join(' ');
return { person: cell('Person'), administers: cell('Administers') };
```

Note both strings for Step 10; the checkboxes are checked for each product named in `administers`.

- [ ] **Step 8: Find the Checkbox set (separate page — one page switch per script)**

```js
const p = await figma.getNodeByIdAsync('215:32'); await figma.setCurrentPageAsync(p);
const sets = p.findAllWithCriteria({ types: ['COMPONENT_SET'] }).map(s => ({ name: s.name, id: s.id, axes: Object.fromEntries(Object.entries(s.componentPropertyDefinitions).filter(([k, v]) => v.type === 'VARIANT').map(([k, v]) => [k, v.variantOptions])), props: Object.keys(s.componentPropertyDefinitions) }));
return sets;
```

Expected: a set named `Checkbox` with a checked-state axis (an option matching `/true|on|checked/i`) and a `Label…` TEXT property. Note its id and the axis name for Step 10.

- [ ] **Step 9: Failing assertion — 6.1b**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const b = page.findOne(n => n.type === 'FRAME' && n.name === '6.1b  Access Control — edit admin');
if (!b) return { pass: false, reason: 'no 6.1b' };
const drawer = b.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const kids = form.children.filter(c => c.visible).map(c => c.name);
const boxes = form.findAll(n => n.type === 'INSTANCE' && /checkbox/i.test(n.name) && n.visible).map(n => n.findAll(t => t.type === 'TEXT').map(t => t.characters).join(''));
const footer = drawer.children.find(c => /footer/i.test(c.name));
const btns = footer.children.filter(c => c.visible && c.type === 'INSTANCE').map(c => `${c.componentProperties['Style'].value}/${c.componentProperties['Size'].value}:${c.componentProperties['Label#79:0'].value}`);
const result = { title: drawer.componentProperties['Title#514:0'].value, kids, boxes, footer: btns };
result.pass = result.title === 'Edit admin' && /person/i.test(kids[0]) && boxes.join('|') === 'DART Central|Dartboards|Aiden' && btns.join('|') === 'ghost/sm:Cancel|default/sm:Save changes';
return result;
```

Expected: `pass: false`.

- [ ] **Step 10: Build 6.1b**

Substitute Step 7's strings and Step 8's set id / checked-axis name.

```js
const VALUES = { person: '<Step 7 person>', administers: '<Step 7 administers>' };
const CHECKBOX = { setId: '<Step 8 id>', axis: '<Step 8 checked axis name>' };
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const V = n => { const v = vars.find(x => x.name === n); if (!v) throw new Error('token ' + n); return v; };
const base = await figma.getNodeByIdAsync('2268:2856');
const a = page.findOne(n => n.type === 'FRAME' && n.name === '6.1a  Access Control — row menu open'); if (!a) throw new Error('build 6.1a first');
const b = base.clone(); base.parent.appendChild(b); b.name = '6.1b  Access Control — edit admin'; b.x = a.x + a.width + 80; b.y = base.y;
const f45 = await figma.getNodeByIdAsync('2267:2597');
const srcScrim = f45.children.find(c => c.name === 'scrim') || await figma.getNodeByIdAsync('2274:3729');
const srcDrawer = f45.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236');
const scrim = srcScrim.clone(); b.appendChild(scrim); scrim.layoutPositioning = 'ABSOLUTE'; scrim.x = 0; scrim.y = 0; scrim.resize(b.width, b.height);
const drawer = srcDrawer.clone(); b.appendChild(drawer); drawer.layoutPositioning = 'ABSOLUTE'; drawer.resize(drawer.width, b.height); drawer.x = b.width - drawer.width; drawer.y = 0;
drawer.setProperties({ 'Title#514:0': 'Edit admin', 'Description#514:5': 'Direct edit — no request. Recorded in Activity under your name.', 'Show footer#514:20': true });
const form = drawer.children.find(c => c.type === 'SLOT').children[0];
const setChars = async (t, v) => { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = v; };
const labelOf = f => f.findAll(n => n.type === 'TEXT').find(n => /label/i.test(n.name));
const valueOf = f => f.findAll(n => n.type === 'TEXT').find(n => /value|text/i.test(n.name) && !/label|placeholder|helper|error/i.test(n.name)) || f.findAll(n => n.type === 'TEXT').slice(-1)[0];
const kept = form.children[0];
for (const c of form.children.slice(1)) { try { c.remove(); } catch (e) { c.visible = false; } }
kept.name = 'ui-input [Person]'; await setChars(labelOf(kept), 'Person'); await setChars(valueOf(kept), VALUES.person);
if (kept.componentProperties['Disabled']) kept.setProperties({ Disabled: 'true' });

// Administers: a labelled group of three checkboxes
const group = figma.createAutoLayout('VERTICAL', { name: 'ui-checkbox-group [Administers]', itemSpacing: 8 });
group.fills = []; group.clipsContent = false; group.primaryAxisAlignItems = 'MIN'; group.counterAxisAlignItems = 'MIN';
form.appendChild(group); group.layoutSizingHorizontal = 'FILL'; group.layoutSizingVertical = 'HUG'; group.setBoundVariable('itemSpacing', V('spacing/2'));
const groupLabel = labelOf(kept).clone(); group.appendChild(groupLabel); groupLabel.name = 'label'; await setChars(groupLabel, 'Administers');
const set = await figma.getNodeByIdAsync(CHECKBOX.setId); if (!set || set.type !== 'COMPONENT_SET') throw new Error('checkbox set not found');
const opts = set.componentPropertyDefinitions[CHECKBOX.axis].variantOptions;
const onOpt = opts.find(o => /true|on|checked/i.test(o)), offOpt = opts.find(o => /false|off|unchecked/i.test(o)); if (!onOpt || !offOpt) throw new Error('checked axis options: ' + opts.join(','));
for (const product of ['DART Central', 'Dartboards', 'Aiden']) {
  const checked = VALUES.administers.includes(product);
  const comp = set.children.find(c => new RegExp(`${CHECKBOX.axis}=${checked ? onOpt : offOpt}(,|$)`).test(c.name)) || set.defaultVariant;
  const box = comp.createInstance(); group.appendChild(box); box.name = `ui-checkbox [${product}]`;
  const labelKey = Object.keys(box.componentProperties).find(k => /^Label/i.test(k));
  if (labelKey) box.setProperties({ [labelKey]: product }); else { const t = box.findAll(n => n.type === 'TEXT')[0]; if (!t) throw new Error('checkbox has no label'); await setChars(t, product); }
  box.setProperties({ [CHECKBOX.axis]: checked ? onOpt : offOpt });
}
await b.screenshot();
return { createdNodeIds: [b.id, scrim.id, drawer.id, group.id], bFrameId: b.id, drawerId: drawer.id, formKids: form.children.filter(c => c.visible).map(c => c.name) };
```

- [ ] **Step 11: Re-run Step 9** → `pass: true`.

- [ ] **Step 12: Lint 6.1, 6.1a, 6.1b**

Snippet + `return await designCheck(['2268:2856', ...page.findAll(n => n.type === 'FRAME' && /^6\.1[ab] /.test(n.name)).map(n => n.id)]);` → `allZero: true`. The new checkbox group's `label` TEXT is a clone of a styled label, so `unstyledText` stays 0; if it reports, the clone lost its style — re-clone from the kept field's label.

- [ ] **Step 13: Ledger + commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02']['manageAffordances2026_09_03']
e['6.1'] = collections.OrderedDict([
  ('headingRow', "page-heading row [page-heading, kpi] — no actions: the two adds sit on their section headers. KPI 4 / Admins / 5 with request access, the two tables' row counts."),
  ('sections', "the two bare 'section heading' TEXT nodes are now inside section header frames [heading, spacer, ui-button sm] in section — admins / section — request access at gap 8 — the LAND shape; buttons Add admin and Grant request access."),
  ('ids', {'rowId': '<Step 2>', 'kpiId': '<Step 2>', 'sections': '<Step 2 sections array>', 'aFrameId': '<Step 5>', 'menuId': '<Step 5>', 'bFrameId': '<Step 10>', 'drawerId': '<Step 10>'}),
  ('6.1a', 'row menu on the admins table row 2: Edit scope · — · Revoke admin (destructive). Request-access menu (Edit level · — · Revoke access, destructive) stated on the doc panel, not drawn.'),
  ('6.1b', "Edit admin: Person (Input, disabled) · Administers as three Checkbox rows checked to match row 2's Administers cell. Edit request access (Person · Level NativeSelect · May file as three Checkboxes) stated, not drawn."),
  ('addRule', 'Add admin / Grant request access open the respective drawer empty — stated, not drawn.')
])
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
git diff --numstat docs/figma-ledger.json && git add docs/figma-ledger.json && git commit -m "docs(figma): 6.1 Access Control — KPI, section-level adds, row menu and edit drawer

Heading row with a Size=sm stat tile (4 admins, 5 with request access).
The two bare section headings become section header frames with Add
admin / Grant request access beside the table each feeds. 6.1a opens
the admins row menu (Revoke admin destructive after a rule); 6.1b is an
Edit admin drawer with a disabled Person and three product checkboxes.
Lint all zeros. Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Records — flow map index, READ FIRST, doc panels, final verification

**Files:**
- Modify: `docs/figma-ledger.json`
- Figma: `2291:5143`, `2122:3383`, the `body` panels on 5.1 / 5.3 / 5.4 / 6.1 and 5.2's doc text.

**Interfaces:**
- Consumes: the nine frame names from Tasks 2–6 and `designCheck`.
- Produces: ledger sub-key `records` + `verification`; the spec's five exit criteria checked.

- [ ] **Step 1: Discover how the flow map indexes frames**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const map = await figma.getNodeByIdAsync('2291:5143');
const hits = map.findAll(n => n.type === 'TEXT' && /5\.1|5\.4|6\.1/.test(n.characters)).map(t => ({ id: t.id, name: t.name, parent: `${t.parent.type} "${t.parent.name}"`, chars: t.characters.slice(0, 160), lines: t.characters.split('\n').length }));
return hits;
```

Expected one of two shapes — (A) a single TEXT with one line per frame, or (B) one TEXT per frame inside a row frame. The next step has both branches; run only the one that matches.

- [ ] **Step 2: Add the nine names to the index**

```js
const NAMES = ['5.1a  Dashboards — row menu open', '5.1b  Dashboards — edit drawer', '5.2a  Banners — edit drawer', '5.3a  Promotions — row menu open', '5.3b  Promotions — edit drawer', '5.4a  URL Redirects — row menu open', '5.4b  URL Redirects — edit drawer', '6.1a  Access Control — row menu open', '6.1b  Access Control — edit admin'];
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const map = await figma.getNodeByIdAsync('2291:5143');
const setChars = async (t, v) => { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = v; };
const multi = map.findAll(n => n.type === 'TEXT' && n.characters.split('\n').length > 3 && /5\.1/.test(n.characters));
if (multi.length) {                                   // shape A: one text, one line per frame
  const t = multi[0];
  const lines = t.characters.split('\n');
  const insertAfter = (prefix) => { const i = lines.findIndex(l => l.trim().startsWith(prefix)); return i; };
  const grouped = { '5.1': NAMES.slice(0, 2), '5.2': NAMES.slice(2, 3), '5.3': NAMES.slice(3, 5), '5.4': NAMES.slice(5, 7), '6.1': NAMES.slice(7, 9) };
  for (const [k, adds] of Object.entries(grouped)) { const i = insertAfter(k + ' '); if (i < 0) throw new Error('index has no line for ' + k); lines.splice(i + 1, 0, ...adds.map(a => lines[i].replace(/^(\s*).*$/, '$1') + a)); }
  await setChars(t, lines.join('\n'));
  return { mode: 'A', lines: lines.length, mutatedNodeIds: [t.id] };
}
const rowFor = k => map.findOne(n => n.type === 'TEXT' && n.characters.trim().startsWith(k + ' '));   // shape B: one text per frame
const created = [];
const grouped = { '5.1': NAMES.slice(0, 2), '5.2': NAMES.slice(2, 3), '5.3': NAMES.slice(3, 5), '5.4': NAMES.slice(5, 7), '6.1': NAMES.slice(7, 9) };
for (const [k, adds] of Object.entries(grouped)) {
  const t = rowFor(k); if (!t) throw new Error('index has no entry for ' + k);
  const rowNode = t.parent.type === 'FRAME' && t.parent.children.length <= 3 ? t.parent : t;
  let anchor = rowNode;
  for (const a of adds) { const c = rowNode.clone(); anchor.parent.insertChild(anchor.parent.children.indexOf(anchor) + 1, c); const ct = c.type === 'TEXT' ? c : c.findOne(n => n.type === 'TEXT'); await setChars(ct, a); created.push(c.id); anchor = c; }
}
return { mode: 'B', createdNodeIds: created };
```

Then re-run Step 1: every one of the nine names must appear in the returned `chars`.

- [ ] **Step 3: READ FIRST status line + doc panels**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const setChars = async (t, v) => { const font = t.fontName === figma.mixed ? t.getRangeFontName(0, 1) : t.fontName; await figma.loadFontAsync(font); t.characters = v; };
const append = async (t, s) => { await setChars(t, t.characters.replace(/\s+$/, '') + '\n\n' + s); return t.id; };
const done = [];
const rf = await figma.getNodeByIdAsync('2122:3383');
const status = rf.findOne(n => n.type === 'FRAME' && n.name === 'section — status');
const statusText = status.findAll(n => n.type === 'TEXT').filter(n => n.characters.length > 60).slice(-1)[0]; if (!statusText) throw new Error('no status body text');
done.push(await append(statusText, 'MANAGE is editable (2026-09-03): 5.1–5.4 and 6.1 carry a KPI, an Add and a drawn edit path — the ⋯ row menu open (frame a) and the edit drawer (frame b). An add opens the same drawer with empty fields and a different title; those states are stated, not drawn. 5.5 and 5.6 stay read-only.'));
const panel = {
  '2152:747': 'New dashboard opens the Edit dashboard drawer (5.1b) with empty fields, titled New dashboard, primary Create dashboard. Row menu: Edit · Promote · View usage · — · Decommission (a lifecycle move to Archived, not a deletion).',
  '2269:2988': 'Promote a dashboard opens the Edit promotion drawer (5.3b) with Dashboard as a searchable Combobox, primary Promote. Row menu: Edit dates · Open dashboard · — · End promotion early.',
  '2270:3089': 'New redirect opens the Edit redirect drawer (5.4b) with empty fields, primary Create redirect. Row menu: Edit · Test link · — · Remove redirect (destructive — a true removal).',
  '2268:2856': 'Add admin / Grant request access open the respective drawer empty. Admins row menu: Edit scope · — · Revoke admin. Request-access row menu: Edit level · — · Revoke access (both revokes destructive). Edit request access: Person · Level · May file (Dashboard · Banner · General) — same shape as 6.1b.'
};
for (const [id, s] of Object.entries(panel)) {
  const f = await figma.getNodeByIdAsync(id);
  const body = f.findAll(n => n.type === 'FRAME' && n.name === 'body').slice(-1)[0]; if (!body) throw new Error('no body panel on ' + f.name);
  const t = body.findAll(n => n.type === 'TEXT').sort((x, y) => y.characters.length - x.characters.length)[0];
  done.push(await append(t, s));
}
const f52 = await figma.getNodeByIdAsync('2154:41830');
const ph52 = f52.findOne(n => n.type === 'FRAME' && n.name === 'page-heading');
const desc52 = ph52.findAll(n => n.type === 'TEXT').sort((x, y) => y.characters.length - x.characters.length)[0];
done.push(await append(desc52, 'New banner opens the Edit banner drawer (5.2a) empty, titled New banner, primary Create banner.'));
return { mutatedNodeIds: done };
```

- [ ] **Step 4: Final verification — the spec's five exit criteria**

```js
const page = await figma.getNodeByIdAsync('2106:4324'); await figma.setCurrentPageAsync(page);
const hasVar = (n, k) => !!(n.boundVariables && n.boundVariables[k]);
const v = [];
// 1 heading rows
const cols = { '5.1': '2152:748', '5.2': null, '5.3': '2269:2989', '5.4': '2270:3090', '6.1': '2268:2857' };
const want = { '5.1': 'page-heading|kpi|actions', '5.2': 'page-heading|kpi|actions', '5.3': 'page-heading|kpi|actions', '5.4': 'page-heading|kpi|actions', '6.1': 'page-heading|kpi' };
const kpis = { '5.1': ['201','Published','across 3 products'], '5.2': ['3','Active','of 6 · 1 scheduled'], '5.3': ['2','Live','ending within 30 days'], '5.4': ['3','Active redirects','2,306 hits this month'], '6.1': ['4','Admins','5 with request access'] };
for (const [k, id] of Object.entries(cols)) {
  const row = id ? (await figma.getNodeByIdAsync(id)).children.find(c => c.name === 'page-heading row') : await figma.getNodeByIdAsync('2248:2172');
  if (!row) { v.push(`${k}: no heading row`); continue; }
  if (row.children.map(c => c.name).join('|') !== want[k]) v.push(`${k}: row kids ${row.children.map(c => c.name).join('|')}`);
  if (row.itemSpacing !== 32 || !hasVar(row, 'itemSpacing')) v.push(`${k}: row gap`);
  const kpi = row.children.find(c => c.name === 'kpi'); const t = n => kpi.findOne(x => x.type === 'TEXT' && x.name === n).characters;
  if (JSON.stringify([t('stat value'), t('stat title'), t('stat caption')]) !== JSON.stringify(kpis[k])) v.push(`${k}: kpi ${[t('stat value'), t('stat title'), t('stat caption')].join(' / ')}`);
  const actions = row.children.find(c => c.name === 'actions'); if (actions && (actions.itemSpacing !== 16 || !hasVar(actions, 'itemSpacing'))) v.push(`${k}: actions gap`);
}
// 3 menus  4 drawers  5 index
const setOf = m => (m.parent && m.parent.type === 'COMPONENT_SET') ? m.parent : m;
const menus = { '5.1a': ['Edit|Promote|View usage|Decommission', []], '5.3a': ['Edit dates|Open dashboard|End promotion early', []], '5.4a': ['Edit|Test link|Remove redirect', [2]], '6.1a': ['Edit scope|Revoke admin', [1]] };
for (const [k, [labels, redIdx]] of Object.entries(menus)) {
  const f = page.findOne(n => n.type === 'FRAME' && n.name.startsWith(k + ' ')); if (!f) { v.push(`${k}: missing`); continue; }
  const menu = f.children.find(c => c.type === 'INSTANCE' && /row actions/.test(c.name)); if (!menu) { v.push(`${k}: no menu`); continue; }
  const items = menu.findAll(n => n.type === 'INSTANCE' && n.mainComponent && setOf(n.mainComponent).id === '544:63' && n.visible);
  const got = items.map(i => i.findAll(t => t.type === 'TEXT').map(t => t.characters).join('')).join('|'); if (got !== labels) v.push(`${k}: items ${got}`);
  items.forEach((i, idx) => { const red = /destructive/i.test(i.mainComponent.name); if (red !== redIdx.includes(idx)) v.push(`${k}: item ${idx} destructive=${red}`); });
}
for (const k of ['5.1b', '5.2a', '5.3b', '5.4b', '6.1b']) {
  const f = page.findOne(n => n.type === 'FRAME' && n.name.startsWith(k + ' ')); if (!f) { v.push(`${k}: missing`); continue; }
  const d = f.children.find(c => c.type === 'INSTANCE' && c.mainComponent && c.mainComponent.parent && c.mainComponent.parent.id === '514:236'); if (!d) { v.push(`${k}: no drawer`); continue; }
  if (d.componentProperties['Description#514:5'].value !== 'Direct edit — no request. Recorded in Activity under your name.') v.push(`${k}: description`);
  const footer = d.children.find(c => /footer/i.test(c.name));
  const btns = footer.children.filter(c => c.visible && c.type === 'INSTANCE').map(c => `${c.componentProperties['Style'].value}/${c.componentProperties['Size'].value}:${c.componentProperties['Label#79:0'].value}`).join('|');
  if (btns !== 'ghost/sm:Cancel|default/sm:Save changes') v.push(`${k}: footer ${btns}`);
  if (Math.round(d.x + d.width) !== Math.round(f.width)) v.push(`${k}: drawer not flush right`);
}
const map = await figma.getNodeByIdAsync('2291:5143'); const mapText = map.findAll(n => n.type === 'TEXT').map(t => t.characters).join('\n');
for (const k of ['5.1a','5.1b','5.2a','5.3a','5.3b','5.4a','5.4b','6.1a','6.1b']) if (!mapText.includes(k + ' ')) v.push(`index missing ${k}`);
// banner count
for (const id of ['2130:455','2273:3426','2274:3592','2310:5232']) { const f = await figma.getNodeByIdAsync(id); for (const tile of f.findAll(n => n.type === 'INSTANCE' && n.name === 'ui-card [stat — active banners]')) { const t = tile.findOne(n => n.type === 'TEXT' && n.name === 'stat value'); if (t.characters !== '3') v.push(`${f.name.slice(0,4)}: active banners ${t.characters}`); } }
return { violations: v, pass: v.length === 0 };
```

Expected: `pass: true`. Fix any listed violation in the task it belongs to before continuing.

- [ ] **Step 5: Final lint across everything touched**

Snippet + 

```js
const ids = ['2152:747','2154:41830','2269:2988','2270:3089','2268:2856','2130:455','2273:3426','2274:3592','2310:5232','2291:5143','2122:3383',
  ...page.findAll(n => n.type === 'FRAME' && /^(5\.[1-4][ab]|6\.1[ab]) /.test(n.name)).map(n => n.id)];
return await designCheck(ids);
```

→ `allZero: true` (a pre-existing finding recorded in Task 1 Step 2 is the only acceptable exception, and must be the same finding).

- [ ] **Step 6: Ledger + commit**

```bash
cd /Users/kahrmanmckenzie/Projects/ui-library && python3 - <<'PY'
import json, collections
p = 'docs/figma-ledger.json'
d = json.load(open(p), object_pairs_hook=collections.OrderedDict)
e = d['exampleScreens']['adminFlow2026_09_02']['manageAffordances2026_09_03']
e['decisions'] = "Scope 5.1–5.4 + 6.1; 5.5/5.6 read-only. KPI in the heading row left of the Add. 5.3 gets Promote a dashboard (manual path; copy changed). Edit path drawn as row-menu-open + drawer per page. Banner count 4 -> 3. State changes plain in menus, only removals destructive. 6.1's adds on section headers. Add drawers stated, not drawn."
e['records'] = "Flow map index gained the nine frame names; READ FIRST status notes MANAGE is editable; doc panels on 5.1, 5.3, 5.4, 6.1 and 5.2's description state the add rule and the undrawn menus/drawers."
e['verification'] = "Exit criteria 1–5 asserted in one script: heading rows [page-heading, kpi, actions] (6.1 without actions) at 32/16 bound; KPI values 201 / 3 / 2 / 3 / 4 with their captions; menu items in order with exactly Remove redirect, Revoke admin destructive; every drawer footer ghost Cancel sm + default Save changes sm, description verbatim, flush right; index contains all nine names; banner tiles read 3. 0 violations. designCheck over 20 frames: all zeros."
json.dump(d, open(p, 'w'), indent=2, ensure_ascii=False); open(p, 'a').write('\n')
PY
git diff --numstat docs/figma-ledger.json && git add docs/figma-ledger.json && git commit -m "docs(figma): MANAGE affordances — index, doc panels and final verification

The flow map index lists the nine new frames, READ FIRST records that
MANAGE is editable, and the doc panels state the add rule and the
menus/drawers that are stated rather than drawn. Exit criteria 1–5
asserted with 0 violations; lint all zeros across the 20 touched
frames. Figma-only.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
echo "main is ahead of origin — push is the owner's."
```

---

## Self-review

- **Spec coverage:** §1 heading row + KPI → Tasks 2–6 Step 2 (values per page in each assertion). §2 Add → each Step 2; 6.1's section-level adds → Task 6 Step 2; 5.3 copy → Task 4 Step 2; add rule stated on panels → Task 7 Step 3. §3 menus → Tasks 2, 4, 5, 6 (5.2 has none, per spec). §4 drawers → Tasks 2–6 "b" steps with the spec's fields; `Edit request access` stated → Task 7 panel text. §5 naming/placement → every clone step; index/READ FIRST/panels/banner count/ledger → Tasks 1 and 7. Constraints → Global Constraints + lint steps. Verification 1–5 → Task 7 Step 4.
- **Placeholders:** the `<Step N …>` tokens are values the executor copies from the named step's returned JSON in the same task — each is named, sourced and required before the script runs. No other placeholders.
- **Consistency:** node names (`page-heading row`, `kpi`, `actions`, `section header`, `section — admins`, `ui-button [<label>]`), property keys (`Label#79:0`, `Title#514:0`, `Description#514:5`, `Show footer#514:20`, `Size`, `Style`, `Disabled`), the drawer description string and frame names are identical across tasks and match the spec.
