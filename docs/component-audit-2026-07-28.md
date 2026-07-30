# Component-by-component audit — 2026-07-28

**Scope:** all 59 component directories, audited one by one against: design-system consistency, documentation, props & stories quality, industry-standard (WAI-ARIA APG / WCAG) compliance, and developer-handoff readiness.
**Method:** mechanical sweep (structure, conventions, exports, tokens, guardrails) + four parallel deep reviews reading every component's `.tsx`, `.types.ts`, `.scss`, `.stories.tsx`, `index.ts`. The 9 highest-severity findings were independently re-verified in source before publishing.
**House rules respected:** accepted owner decisions (documented in CLAUDE.md) were not re-flagged.

> **⚠ Known blind spot in this audit — it was static-only.** Every reviewer read
> source: props, types, SCSS rules, ARIA attributes, story exports. **Nobody drove
> the components.** Two real bugs were found by the owner within hours of the audit
> shipping, both invisible to source reading and both in the same class — *live
> interaction geometry*. See "Post-audit findings" at the end. Any future audit
> must include an interaction pass (below).

## Summary

**Components reviewed: 59 · Findings: ~150 · Overall score: 78/100**

| Layer | Verdict |
|---|---|
| Tokens / theming / contrast | **Exemplary** — 0 hex/rgba literals, 49 AA-gated pairings, 3-axis theming |
| File structure & conventions | **Exemplary** — 59/59 complete; forwardRef+displayName 100% |
| Type-export surface | **Exemplary** — every union re-exported from `src/index.ts` |
| Figma handoff | **Exemplary** — 59/59 doc pages, ledger + playbook in-repo |
| Stories | **Good** — avg ~6.4 stories/component; weak tail (Menubar 1, Drawer 2) |
| Props API quality | **Good with outliers** — 4 components take no `...rest` at all |
| JSDoc documentation | **Weak** — ~20 types files have zero doc comments |
| Deep a11y (APG patterns) | **Weakest layer** — ~9 high-severity gaps, several systemic |

## Per-component scores

| Component | Score | Headline issue |
|---|---|---|
| AspectRatio | 9 | fill only targets direct img/video/iframe (scss:7) |
| Blockquote | 9 | native `cite` URL unreachable after Omit |
| Direction | 9 | `Direction` type vs `DirectionProvider` component naming |
| FeaturedIcon | 9 | Empty.tsx hardcodes its class string |
| Kbd | 9 | border-bottom makes keycap 1px proud (cosmetic) |
| Skeleton | 9 | — none material |
| Input | 8.5 | `--has-left/right` classes applied but unstyled; description→name |
| Banner | 8 | no wrapping/two-line story |
| Breadcrumb | 8 | sr-only "More" inside aria-hidden (tsx:141); role="link" on Page |
| ButtonGroup | 8 | `role="group"` never labeled; inverted orientation defaults |
| Checkbox | 8 | description pollutes accessible name; no error state |
| Chip | 8 | unconditional aria-pressed |
| CloseButton | 8 | `ariaLabel` naming diverges; shipped data-testid |
| Drawer* | 8/6 | API 8; only 2 stories, 0 JSDoc, dangling aria-labelledby |
| Fab | 8 | accessible name not type-enforced (vs Chip's union) |
| Label | 8 | **description renders inside `<label>` → name pollution (systemic)** |
| NativeSelect | 8 | description→name; error not live region |
| RadioGroup | 8 | no error/errorMessage (only form control without) |
| Separator | 8 | labeled separator keeps leaf role with children |
| Slider | 8 | unnamed thumb when no label; min===max NaN |
| StatusDot | 8 | stories model the double-announce anti-pattern |
| Toggle | 8 | no controlled story; IconLeft+IconCenter both render |
| Avatar | 7 | AvatarGroup unlabeled; zero JSDoc |
| Accordion | 7 | triggers not in headings (APG); rest lands on inner body |
| Collapsible | 7 | ref and rest go to different DOM nodes (tsx:149 vs 160) |
| Empty | 7 | no role/status option for its own no-results story |
| HoverCard | 7 | role="tooltip" with interactive content; keyboard can't enter |
| Item | 7.5 | role="list" without listitem children |
| ModeToggler | 7.5 | aria-label unoverridable/unlocalizable; defaultMode desync |
| Popover | 7 | PopoverClose drops focus; no containment for role="dialog" |
| Progress | 7.5 | no aria-valuetext with custom formatter; unnamed compound path |
| ScrollArea | 7 | focusable viewport unnamed; RO misses late children |
| Switch | 7 | zero JSDoc ×11; no :active; description not describedby |
| Tabs | 7 | all triggers tabIndex −1 when nothing selected |
| Textarea | 7 | description never in aria-describedby; error not live |
| Attachment | 6 | state changes silent (no live region/aria-busy); group unnamed |
| Badge | 6 | IconCenter is a no-op duplicate of IconLeft |
| Button | 6 | onClick drops event; isLoading no aria-busy; press not RM-guarded |
| Card | 6 | CardHeader id required but dropped from DOM; hard h3 |
| Code | 6 | uncleared copy timer; no Playground; copy not announced |
| Command | 6 | dependency-less effect every render; false empty state |
| DropdownMenu | 6 | dead ctx + unreachable code; no typeahead; Tab doesn't close |
| InputGroup | 6 | **`disabled` prop does nothing**; 0/22 JSDoc |
| InputOTP | 6.5 | no ...rest → no name/onBlur/form; required never reaches input |
| Menubar | 6 | 1 story, no argTypes; no Home/End; no disabled state |
| Select | 6 | error/description ids never wired; item `label` ignored in row |
| Toast | 6 | **no pause-on-hover (WCAG 2.2.1)**; overflow skips onDismiss |
| ToggleGroup | 6 | `''` deselect sentinel; memo defeated by props-in-deps |
| Tooltip | 6 | no rest props; uncontrollable; pointer-events:none blocks APG hover |
| Alert | 5 | **`style?: AlertStyle` collides with native style (type bug)** |
| Chat | 5 | **no role="log"/aria-live on message list; scroll region no tab stop** |
| Combobox | 5 | **two role="combobox" elements**; orphaned describedby ids |
| ContextMenu | 5 | **keyboard-inaccessible trigger**; required id dead |
| Dialog | 5 | **no ...rest on any of 4 parts**; dangling aria-labelledby |
| Pagination | 5 | **disabled leaks to DOM as `<a disabled>` (React warning)** |
| Sidebar | 5 | **asChild drops onClick; Math.random breaks SSR**; no landmark |
| Spinner | 5 | no ...rest; role/label hardcoded, no decorative mode |
| AlertDialog | 4 | **no ...rest / no HTMLAttributes**; id-match contract undocumented |

\* Drawer: strong API/mechanics, weak stories+docs.

## Cross-cutting findings (systemic — fix once, benefit many)

1. **`Label.description` renders inside the `<label>`** (Label.tsx:34) → the helper text is concatenated into the accessible **name** of every consuming control: Input, NativeSelect, Checkbox, Switch, RadioGroup items. One fix (sibling + `aria-describedby` seeding) repairs 5+ components. Highest-leverage single change in the audit.
2. **"Closed" prop surfaces:** Dialog, AlertDialog, Tooltip(Content), Spinner, InputOTP take no `{...rest}` / don't extend `*HTMLAttributes` — no `data-*`, `style`, `aria-*`, handlers. Everything else in the system does this correctly; these are drift, not decisions.
3. **Minted-but-never-wired aria ids:** Alert (`-title`/`-description`), Select (`errorId`/`descriptionId`), Combobox (same), Card (`${id}-title`), ContextMenu (dead root id). Pattern: ids are seeded, nothing references them.
4. **Error messages are not live regions** anywhere (Input, Textarea, NativeSelect, Select, Combobox) — validation errors appearing after submit are silent. One `role="alert"` convention fixes all.
5. **`aria-hidden` wrapping sr-only text** silences it: Breadcrumb ellipsis (tsx:141), Pagination ellipsis (tsx:119).
6. **Hardcoded post-spread aria-labels** block localization: ModeToggler, Pagination prev/next, Command root, Spinner, Toast dismiss.
7. **Two size vocabularies:** Button/Chip (`xsmall/small/default/large`) vs 24 other components (`sm/default/lg`). A rename is breaking; at minimum document the split in CLAUDE.md as accepted or plan a major-version alias.
8. **Dead/unstyled classes:** Input `--has-left/right`, Dialog `--sticky` ×2, dead `void ctx` in DropdownMenu.
9. **Perf nits repeated 3×:** whole-`props` object in `useCallback` deps defeats context memoization in Accordion, ToggleGroup (and Menubar's register-order gotcha).

## Functional bugs (verified in source)

| # | Bug | Where |
|---|---|---|
| 1 | `style?: AlertStyle` intersects native `style` — inline styles won't compile | Alert.types.ts:16 |
| 2 | `disabled` spread onto `<a>` → invalid attr + React warning (in shipped story) | Pagination.tsx:86,103 |
| 3 | InputGroup `disabled` disables nothing (no pointer-events, inputs typeable) | InputGroup.tsx:30-43 |
| 4 | Sidebar `asChild` drops `onClick`; asSlot precedence inverted | Sidebar.tsx:454/470, 70-75 |
| 5 | `Math.random()` in Sidebar skeleton render → SSR hydration mismatch | Sidebar.tsx:541-544 |
| 6 | Toast overflow drop skips `onDismiss` + leaks timer | Toaster.tsx:76 |
| 7 | Changing Toaster `duration`/`visibleToasts` at runtime strands live toasts | Toaster.tsx:119-124 |
| 8 | Command effect w/o dep array: DOM query + setState every render | Command.tsx:167-169 |
| 9 | Command: disabled-only matches render false empty state | Command.tsx:116 |
| 10 | Select `SelectItem.label` honored in trigger, ignored in the row | Select.tsx:478 vs 509 |
| 11 | Combobox/Card/ContextMenu required `id` never reaches the DOM | Combobox.tsx:240, Card.tsx:28, ContextMenu.tsx:115 |
| 12 | Collapsible: `ref` and `...rest` land on different DOM nodes | Collapsible.tsx:149 vs 160 |
| 13 | Code copy `setTimeout` never cleared (setState after unmount) | Code.tsx:44 |
| 14 | ToggleGroup deselect emits `''` sentinel contradicting its type | ToggleGroup.tsx:69-71 |
| 15 | ModeToggler `defaultMode` never syncs `<html data-mode>` on mount | ModeToggler.tsx:58-60 |
| 16 | Sidebar `{...rest}` dropped entirely on the mobile (<768px) path | Sidebar.tsx:210-217 |

## High-severity a11y (APG/WCAG)

- **Chat:** message list has no `role="log"`/`aria-live` (replies never announced) and the scroll container has no tab stop (WCAG 2.1.1) — Chat.tsx:144.
- **Toast:** no pause-on-hover/focus → auto-dismiss races the action button (WCAG 2.2.1); live region unmounts when stack empties — Toaster.tsx:42-51, 127.
- **ContextMenu:** trigger is a bare `<div>` — no keyboard path at all (no Shift+F10); menus unnamed — ContextMenu.tsx:154-160.
- **Combobox:** two elements carry `role="combobox"` (APG violation) — Combobox.tsx:278+360.
- **Dialog/Drawer:** unconditional `aria-labelledby={id}-title` dangles when Header omitted; description never in `aria-describedby` — Dialog.tsx:155, Drawer.tsx:172.
- **AlertDialog:** no `aria-describedby` (APG requires for alertdialog); no initial-focus control.
- **HoverCard:** `role="tooltip"` containing Buttons; keyboard users can never reach content.
- **Popover:** `PopoverClose` drops focus to `<body>`; `role="dialog"` with no containment.
- **Accordion:** triggers not wrapped in headings (APG requirement).

## Status

**Waves 1–4 FIXED on branch `audit-fixes` (2026-07-28):** commits `c72e444`
(Label description / accessible names), `4c95b53` (closed prop surfaces +
Alert style Omit), `78d17a4` (the 16 functional bugs), `8afc226` (a11y
patterns: Chat role=log + tab stop, Toast pause-on-hover + persistent labeled
region, ContextMenu Shift+F10 + menu name, Combobox single combobox role +
wired describedby/invalid, Select same wiring, Dialog/Drawer conditional
labelledby + wired describedby), plus two post-audit interaction fixes:
`8750383` (Select/Combobox chevron dead strip) and `e58bda2` (floating surfaces
stay anchored; new useFloatingReposition hook, Tooltip migrated onto it).

Also fixed along the way, though not called out in those commit messages:
cross-cutting **#3** (Alert and Card now wire their minted ids), **#9** (both
Accordion and ToggleGroup extract values out of the `useCallback` deps), and
the Spinner half of **#6** (its `role`/`aria-label` now sit *before* `{...rest}`
so consumers can localize or hide it). Pagination's ellipsis half of **#5** was
fixed here; Breadcrumb's followed in wave 5b (below).

### Re-verified against source 2026-07-28 (later) — and then closed out

**All eight cross-cutting findings, all high-severity a11y items, and waves 5–7
are now done.** What follows is the record of what each one turned out to be.

**A11y items the wave-4 commit never touched — FIXED in wave 5a:**

| Item | Fix |
|---|---|
| HoverCard `role="tooltip"` on a surface containing Buttons | now `role="dialog"` named from the trigger; the trigger swapped `aria-describedby` (which flattened the whole card into one description string) for `aria-expanded` + `aria-controls` |
| HoverCard content unreachable by keyboard | Tab from the trigger now moves focus into the card — it is portaled to the end of `<body>`, so the natural tab order ran straight past it. Escape closes and restores focus; focus inside keeps it open |
| `PopoverClose` drops focus to `<body>` | restores focus to the trigger, matching what Escape already did |
| Accordion triggers not wrapped in headings | wrapped in a heading; new `headingLevel` prop (default `3`) so the page outline stays sequential |
| AlertDialog has no initial-focus control | new `initialFocusRef` on `DialogProps` (inherited by AlertDialog); the Destructive story opens on Cancel |

**Found while fixing the above — Dialog's focus trap was entirely inert.** The
focus/scroll-lock effect was keyed on `open`, but `state` is still `'closed'` on
the commit where `open` flips, so `if (state === 'closed') return null` meant no
panel in the DOM: the effect ran once against a null `panelRef`, bailed, and
never re-ran because its deps hadn't changed. **No initial focus, no Tab
containment, no scroll lock and no focus restore — on every Dialog and
AlertDialog.** Now keyed on `state`, which is exactly what the `refIds` effect
directly above it was already fixed to do, and what Drawer had always done.
Verified end-to-end: opens on the requested element, Tab wraps inside the panel,
Escape closes and restores focus, scroll lock engages and releases.

**Cross-cutting #4 — FIXED.** All five (Input, Textarea, NativeSelect, Select,
Combobox) now render their error message with `role="alert"`, so a validation
error that appears after submit is announced. Conditionally rendered on purpose:
inserting the node *is* the live-region trigger, and an always-present empty
`<p>` would carry the element's layout. (Toast's region is persistent instead,
because it is a portal container that has to exist to receive anything.)

**Cross-cutting #5, #6, #7 — FIXED (wave 5b).**

- **#5** — Breadcrumb's ellipsis had `aria-hidden` + `role="presentation"` on the
  *wrapper*, which removed the whole subtree including its sr-only "More", so the
  collapsed-items marker announced nothing. Now hides the icon only, matching
  `PaginationEllipsis`.
- **#6** — every hard-coded `aria-label` is now overridable. Defaults moved
  *before* `{...rest}` on ModeToggler, Pagination prev/next, Command root, both
  Sidebar toggles and Chat's version pager (`role`/`aria-checked` stay after the
  spread — derived state, not preference). Four sit on internal elements
  `...rest` can't reach and got props instead: `Toaster.label` /
  `.dismissLabel`, `ChatBubble.typingLabel`, `ChatMessageEdit.editLabel`,
  `Combobox.clearLabel`. A repo-wide scan now reports **zero** unoverridable
  labels. **Note the audit's list of 5 was incomplete — the real count was 11.**
- **#7** — the audit framed this as "2 vocabularies, 24 vs 2", but the actual
  split is **23 components on abbreviations** (`sm`/`default`/`lg`, with `xs` on
  Attachment / Item / InputGroupButton) against **Button and Chip alone** on the
  spelled-out `xsmall`/`small`/`large`. Owner chose to alias rather than accept
  or rename: Button and Chip now accept **both** spellings, and
  `normalizeSize` (`src/utils/size.ts`) maps the aliases onto the canonical form
  **before the class name is built** — so `ui-button--sz-small` is unchanged and
  the preview HTML and Figma mapping that key off those exact strings keep
  working. Widening a union is backward compatible, so nothing breaks; the
  spelled-out forms can be dropped at a major. Verified each pair renders an
  identical class, height, font-size and padding (`Sizes — both vocabularies`
  story).

**Cross-cutting #8 — FIXED (wave 5c).** The audit named three; a scan of every
`ui-*--modifier` emitted in TSX against every one styled in SCSS found **six**
emitted-but-unstyled classes, all confirmed inert:

| Class | Why it was dead |
|---|---|
| `ui-input-wrap--has-left` / `--has-right` | the icons are flex children carrying their own `__icon--left/--right`; the wrap modifier added nothing and styled nothing |
| `ui-input-group--disabled` / `--error` | duplicated `data-disabled` / `data-invalid` on the *same element*; the visible error border comes from the inner `.ui-input-wrap--error` |
| `ui-chat-bubble--pending` | the typing dots are a child element (`__typing`), which is what's styled |
| `ui-fab--pulse` | the sonar rings are a child element (`__rings > __ring`), which is what's animated |

The two `.ui-dialog__{header,footer}--sticky` rules were dead in *both*
directions — never emitted, and structurally unnecessary: `.ui-dialog` is a flex
column with `max-height: 85vh`, only `__body` scrolls, and header/footer are
`flex-shrink: 0` **outside** that scroll container, so `position: sticky` on them
could never apply. Verified by scrolling `LongContent` to the bottom — neither
moved a pixel. Removed.

`void ctx` in DropdownMenu was already gone (wave 3).

Preview HTML referencing the removed classes (`forms/input.html`,
`forms/input-group.html`) was updated in the same commit, per the CLAUDE.md rule.

**The scan is now an invariant worth keeping at zero.** Note the reverse
direction (styled-but-never-emitted) is *not* checkable this way — almost every
modifier is built by interpolation (`ui-avatar--sz-${size}`), so a naive scan
reports ~280 false positives.

**Wave 5 (JSDoc) — DONE.** It was bigger than the original "~20" estimate: 29 of
59 types files were bare. All 849 props now show a description in the API
reference — **548 hand-written**, up from 251, with the remaining 301 covered by
a standing-copy map in `PropsTable` for the eleven props that mean the same
thing on every component (`className`, `id`, `rel`, `disabled`, `children`, the
three `on*Change` callbacks, and the native `placeholder` / `required` / `type`
that stories surface via `args`). Source text always wins over the map.

Two mechanics worth remembering: **`{@link X}` was printing literally** in the
table (45 of them) until `prose()` learned to render it as inline code, and
**editing a `{Name}.types.ts` does not invalidate docgen for `{Name}.tsx`** — the
tables keep serving stale descriptions until Storybook restarts, which made nine
components look undocumented mid-wave.

**Wave 6 (stories) — DONE.** Eight stories added: Menubar `KeyboardNavigation`
(roving tabindex, hover-to-switch, the two v1 gaps) + `DisabledItems`; Drawer
`LongContent` + `NoCloseButton`; disabled-state stories for InputGroup, Fab and
Pagination; DropdownMenu `Controlled`.

**Writing them found two things, which is the point of the wave:**

1. **A disabled `Fab` kept pulsing.** Sonar rings advertising an action you
   can't take. Fixed in Fab.scss (`&:disabled &__rings { display: none }`).
2. **A claim in the Menubar story was wrong, and the component was right.** The
   draft said a disabled *trigger* is skipped by ArrowLeft/Right. It isn't —
   `moveFocus` walks every registered value — and that follows the APG menubar
   pattern, where disabled items stay focusable so a keyboard user learns the
   option exists. Disabled *items* **are** skipped, because `ITEM_SELECTOR`
   excludes `[data-disabled]`. The story now states both, and why they differ.

The three disabled stories each pin a bug that shipped: InputGroup's `disabled`
did nothing at all, Pagination spread `disabled` onto an `<a>` (invalid
attribute, React warning, link still clickable), and Fab's pulse ignored it.
All three are now asserted in the browser, not just eyeballed.

Separately, **`parameters.ui` prose now exists for all 59 components**
(description + tags); Button and Select additionally carry usage / composition /
a11y and are the template for the rest.

## Priority actions — the original plan, all seven now complete

These were the recommendations as written on the day of the audit. They are kept
verbatim as a record of the order the work was taken in; **every one has shipped**
(see Status above). Item 7 resolved as *accept both vocabularies*: `normalizeSize`
in `src/utils/size.ts` maps `xs`/`sm`/`lg` onto Button and Chip's
`xsmall`/`small`/`large`, so either spelling works and the emitted class name is
unchanged.

1. **Fix the Label description pattern** (sibling + `aria-describedby`) — repairs Input, NativeSelect, Checkbox, Switch, RadioGroup in one change.
2. **Open the closed prop surfaces** (Dialog, AlertDialog, Tooltip, Spinner, InputOTP → extend `*HTMLAttributes` + spread `...rest`) and fix the Alert `style` Omit — pure additive, no breaking changes.
3. **Bug wave:** the 16 verified functional bugs above (most are 1-5 line fixes).
4. **A11y wave 1 (patterns):** Chat log role + tab stop; Toast hover-pause + persistent region; ContextMenu keyboard trigger; Combobox single role; Dialog/Drawer conditional labelledby + describedby.
5. **Docs wave:** JSDoc the ~20 bare types files, prioritizing the confusing props surfaced here (Button variant×style, Tabs activationMode, ScrollArea type, Drawer closeOnOutsideClick, InputGroup align).
6. **Stories wave:** Menubar (keyboard demo), Drawer, disabled-state stories (InputGroup, Fab, Pagination — each would have caught a shipped bug), controlled-usage stories (Select, Combobox, DropdownMenu, Toggle, ModeToggler).
7. **Decide the size-vocabulary split** (document as accepted, or plan an alias migration).

   *Update 2026-07-30 — closed properly.* The alias resolution recorded above held for
   two days and then kept leaking: new code was still being written with `size="small"`
   (Chat, Code, ToastCard, the docs CodePane), because both spellings compiled. The split
   is now gone — Button and Chip moved to `xs`/`sm`/`default`/`lg`, the class moved with
   the prop, and the old spellings were deleted rather than deprecated so `tsc` enforces
   it. See the 2026-07-30 entry in CLAUDE.md.

---

## Post-audit findings — the interaction blind spot

Three bugs surfaced **after** the audit shipped, each reported by the owner from
ordinary use, none findable by reading source — and that is the point: they only
exist in *rendered geometry and live event flow*. The first two were pre-existing
and missed by all four reviewers; the third was introduced afterwards by the same
blind spot, which is why it belongs here.

| # | Bug | Why static review missed it | Fixed |
|---|---|---|---|
| 1 | **Select/Combobox: chevron + right padding were an unclickable dead strip** (~37px). Clicking the chevron did nothing; clicking the text opened the menu. | The chevron *has* `pointer-events: none` — which reads as correct, and is correct in NativeSelect. But it's a flex **sibling**, not an overlay: the button ends at x=299, the chevron sits at 307→323. They never overlap, so the click fell through to a wrap with no handler. Only measuring the rendered boxes reveals this. | `8750383` |
| 2 | **Every floating surface came unanchored when the layout moved.** Dragging the Storybook panel with a menu open left it stranded away from its trigger. | `computePosition` runs in a layout effect keyed on `open` — correct-looking code. The defect is the *absence* of a listener, and absence doesn't show up when you're reading what's there. Tooltip happened to have one; the other six didn't. | `e58bda2` |
| 3 | **A positioning `transform` on a `Button` kills its click.** Centring the docs "View Code" pill with `transform: translate(-50%, -50%)` made it jump ~43px on mousedown and fire no `click` at all. | Two files, each correct alone. `transform` **replaces**, it doesn't compose, and `.ui-button:active` sets `transform: scale(…)` at higher specificity — so the press state discards the centring and the button teleports out from under the cursor before mouseup. Applies to every press-scaled component (Button, Chip, Toggle, ToggleGroupItem). Fix: put positioning on a wrapper. | `87c4d6d` |

**Root cause of the miss:** the review prompts asked for API shape, state
coverage, ARIA wiring, story completeness, and handoff. All static. A component
can pass every one of those and still be unusable.

### Required additions to the next audit

1. **Hit-target pass.** For every composite control, measure the rendered boxes
   of the interactive element and its decorations. Assert the click target covers
   the full visual affordance. `cursor: pointer` on a region that doesn't respond
   is the specific smell — the field *looks* clickable, so users report it as
   "broken", not as "small target".
2. **Live interaction pass.** Drive each component with real event sequences
   (`pointerdown → mousedown → mouseup → click`), not synthetic `.click()`.
   Synthetic clicks skip the pointer/mouse phases where outside-click handlers,
   focus management, and open/close races actually live. During this session a
   synthetic click reported Select as working when a real one did not.
3. **Layout-change pass.** With each overlay open: resize the viewport, scroll an
   ancestor, and confirm the surface stays anchored.
4. **Absence checks.** Static review is good at "is this code right?" and bad at
   "is code missing?". Explicitly enumerate what *should* exist per pattern
   (reposition listeners, live regions, pause-on-hover, keyboard entry points)
   and check each off, rather than only reviewing what's written.

### Follow-up work these produced

- New `src/hooks/useFloatingReposition` — extracted rather than copied a 6th time;
  now used by Select, Combobox, Popover, DropdownMenu, HoverCard **and Tooltip**
  (migrated off its bespoke listeners, so there is one mechanism system-wide).
- **ContextMenu is deliberately not on it** — it anchors to a pointer position,
  not an element, so there is no trigger rect to re-measure.
