# Component-by-component audit — 2026-07-28

**Scope:** all 59 component directories, audited one by one against: design-system consistency, documentation, props & stories quality, industry-standard (WAI-ARIA APG / WCAG) compliance, and developer-handoff readiness.
**Method:** mechanical sweep (structure, conventions, exports, tokens, guardrails) + four parallel deep reviews reading every component's `.tsx`, `.types.ts`, `.scss`, `.stories.tsx`, `index.ts`. The 9 highest-severity findings were independently re-verified in source before publishing.
**House rules respected:** accepted owner decisions (documented in CLAUDE.md) were not re-flagged.

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

## Priority actions

1. **Fix the Label description pattern** (sibling + `aria-describedby`) — repairs Input, NativeSelect, Checkbox, Switch, RadioGroup in one change.
2. **Open the closed prop surfaces** (Dialog, AlertDialog, Tooltip, Spinner, InputOTP → extend `*HTMLAttributes` + spread `...rest`) and fix the Alert `style` Omit — pure additive, no breaking changes.
3. **Bug wave:** the 16 verified functional bugs above (most are 1-5 line fixes).
4. **A11y wave 1 (patterns):** Chat log role + tab stop; Toast hover-pause + persistent region; ContextMenu keyboard trigger; Combobox single role; Dialog/Drawer conditional labelledby + describedby.
5. **Docs wave:** JSDoc the ~20 bare types files, prioritizing the confusing props surfaced here (Button variant×style, Tabs activationMode, ScrollArea type, Drawer closeOnOutsideClick, InputGroup align).
6. **Stories wave:** Menubar (keyboard demo), Drawer, disabled-state stories (InputGroup, Fab, Pagination — each would have caught a shipped bug), controlled-usage stories (Select, Combobox, DropdownMenu, Toggle, ModeToggler).
7. **Decide the size-vocabulary split** (document as accepted, or plan an alias migration).
