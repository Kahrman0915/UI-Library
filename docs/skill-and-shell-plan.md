# The skill + shell plan — making five sub-applications feel like one

> Written 2026-08-11, after reviewing shadcn/ui's skill model. Owner decisions are
> recorded in "Decisions taken" and should not be relitigated without asking.

## The goal, stated plainly

Five teams build five sub-applications on `@ui/lib`. Each carries its own brand and its
own layout. A customer moving between them must never feel they left the main
application: the spacing, the type, the chrome and the way things *behave* stay the same.

## The reframe — where the effort actually belongs

**Tokens are already enforced by construction.** Every app imports `@ui/lib/styles.css`,
so they physically cannot have different spacing scales, type ramps, radii, shadows or
motion. A rogue `padding: 13px` is possible, but it is a deliberate act, not drift.

What actually varies across five teams is **composition and chrome**:

| Already guaranteed by the package | Varies, and is what we must fix |
|---|---|
| Spacing scale, type ramp, radii, shadows | *Which* step is used for page padding vs card gap |
| Colour, mode, brand, tint | Where the brand accent is allowed to appear |
| Every component's internal behaviour | Whether a component is used at all, or hand-rolled |
| Focus rings, reduced motion, contrast | Dialog vs Drawer vs Popover for the same job |
| — | Where Aiden lives and how it opens |
| — | Form button order, destructive confirms, empty states |

So the skill must be a **composition and chrome contract**, not a token reference. A skill
that re-lists tokens spends its budget on the part that is already safe.

## The v1 that already exists, and why it went stale

`plugin/` holds a working skill — `SKILL.md` plus three reference files, 851 lines. It has
never been installed here (`.claude/skills/` holds only the stock `theme-factory`) and it
is not shipped (`package.json#files` is `["dist", "src/styles"]`).

It carries **two different stale component counts**: `SKILL.md` says 59, `manifest.json`
says 17. It documents three theming axes; there are four. It predates `data-tint`,
`ChatMarkdown`, the Aiden integration layer, `Mark` and `TabBar`.

That is the whole argument for the shape below. **Anything hand-copied from source will
drift.** shadcn solves this by generating context at runtime from `shadcn info --json`. We
already solved the same problem for tokens — a generator plus a `--check` mode that fails
the build — and we apply that here.

## Decisions taken (owner, 2026-08-11)

1. **Ship `AppShell` first, then write the skill around it.** Instructions are advisory; a
   component is structural. The skill's chrome chapter becomes "use `AppShell`" instead of
   thirty paragraphs nobody re-reads.
2. **Distribute in the npm package**, with `npx ui-lib init` copying it into a consumer's
   `.claude/skills/`. Version-locked to the library, so the skill can never describe a
   version the app does not have.
3. **`ui-lib check` reports in consuming apps, gates in the library.** A prototype must not
   break someone's CI; the design system must hold its own line.
4. **Keep v1's structure, regenerate its facts.** The shape is sound; every number in it is
   not.

---

## Phase 1 — `AppRail` and `AppShell`

> **Shipped 2026-09-07** — `src/components/AppRail/` (AppRail · AppRailItem) and
> `src/components/AppShell/` (AppShell · AppShellTabStrip · AppShellBody · AppShellWorkspace ·
> AppShellMain), with Figma pages `AppRail` and `AppShell`. The
> brand question below is resolved: nothing in the shell takes a brand; it reads its scope. Rail
> items are icon-only links, not Marks (owner's correction on shipping). The Aiden mounting
> contract is the open remainder of this phase.

The prototype at `src/prototypes/DartCentralHome.stories.tsx` is the evidence for what the
shell actually is, because it was built from the owner's real screen. Everything in it is a
library component **except one thing**, and its own comment says so: the **app rail** — the
vertical switcher of sub-applications, one themed `Mark` per app.

That is the single most important piece of shared chrome (it is literally the control that
moves a customer between the five apps) and it is the one piece nobody has.

### 1a · `AppRail` + `AppRailItem`

Each item is a `Mark` inside its own `data-theme` subtree — which is exactly why the rail
reads as a set of *applications* rather than a menu. Optional count badge, active state,
and a trailing group for account / notifications / mode / settings.

### 1b · `AppShell`

Composes the rail, an optional `TabBar`, a `Sidebar` slot, the page area, and the Aiden
mounting points. Regions as named slots, so a sub-app fills them without re-deriving the
geometry.

Two things it must own, because both were hard-won and neither is guessable:

- **`contain: layout` on the workspace.** `position: relative` does **not** create a
  containing block for a `position: fixed` child — only `transform`, `filter`,
  `perspective` and `contain` do. Without it the Sidebar's fixed panel escapes and covers
  the rail and the tab strip. Already recorded for `.ui-docs-stage`; the shell hits the
  same wall.
- **The Aiden mounting contract.** `Fab` at `--z-80`, `AidenPanel` at `--z-40` (below the
  floating surfaces at 50, so menus opened inside it paint above), expand to
  `AidenFullScreen`, and the Fab hidden while a surface is open. Five apps must not each
  re-derive this; it took a phase to get right once.

**Open for the build, not decided here:** whether `AppShell` takes a `brand` prop or reads
the `data-theme` it stands in. `Mark` deliberately has no `brand` prop — it reads its
scope. But the shell is the root that *establishes* the scope, and the rail is inherently
multi-brand (every item a different one). Resolve before writing the API.

**Candidate, not committed:** a `Page` / `PageHeader` primitive for the page archetypes
below. Decide once the archetypes are written — if all five reduce to the same header, it
is a component; if they do not, it stays a recipe.

---

## Phase 2 — Split the skill into generated and hand-written layers

This is the phase that stops the bleeding, and it is a prerequisite for the rest being
trustworthy.

`scripts/generate-skill.mjs` writes the **factual** files from source — component roster
and exports from `src/index.ts`, prop signatures from each `*.types.ts`, the token
vocabulary from `tokens.scss`, theme codes from the brand recipe, and every count.
`npm run test:skill` re-runs it with `--check` and fails on drift, exactly like
`test:tokens`.

**The rule that keeps it honest: a hand-written file may never restate a fact a machine can
read.** No counts, no rosters, no token lists in prose.

| Generated | Hand-written (judgment) |
|---|---|
| Component roster, exports, prop signatures | The routing table |
| Token vocabulary, theme codes, counts | App-shell and page grammar |
| Which components theme | Do / don't, and the hard rules |

---

## Phase 3 — The routing table

`reference/routing.md`: region → owning component, roughly 35 rows, plus the wrong answers.
This is the artifact that stops an AI hand-drawing a sidebar, and it fixes the naming
problem too (a person is an `Avatar`, and it is *called* Avatar).

It absorbs the pick-by-behaviour rules already scattered through `CLAUDE.md` —
`Select` / `NativeSelect` / `Combobox`, `Chip` / `Toggle` / `ToggleGroup`, and now
`Tabs` / `TabBar` — which were each written because this exact confusion already happened.

**Region names come from the owner.** That column is the one that does the work, and
inventing names is how "Account" happened instead of "Avatar".

---

## Phase 4 — The page grammar

What `AppShell` cannot enforce, because it is inside the content area:

- **Page archetypes** — list, detail, settings, form, empty, error. Fixed skeletons.
- **Interaction grammar** — Dialog vs Drawer vs Popover for the same job; destructive
  confirm via `AlertDialog`; toast on success; which loading state where.
- **Form grammar** — `Field` scaffolding, label and error wiring, button order and styles
  (quiet `ghost` cancel, themed primary submit), required indicators.
- **Where brand colour is allowed** — the existing routing table in `CLAUDE.md` already
  answers this and should be lifted verbatim.

---

## Phase 5 — Distribution and activation

- `skills/ui-lib/` ships in `package.json#files`.
- `npx ui-lib init` copies it into the consumer's `.claude/skills/`.
- Activation triggers on `@ui/lib` in `package.json` — our equivalent of shadcn's
  `components.json` detection.
- `ui-lib info --json` reports version, resolved brand code, whether the stylesheet is
  imported, and which axes the app sets. This is what makes the skill situational rather
  than generic, and it is what `check` reads.
- Retire `plugin/` or reduce it to a thin pointer, so there is one source and not two that
  can disagree.

---

## Phase 6 — `ui-lib check`

Report-only in consuming apps, gating in the library. Findings: hand-rolled markup where a
component exists, raw hex or px where a token exists, missing stylesheet import, misused
theming attributes, retired class names.

**Design constraint learned the hard way:** an unmatched or unresolvable case must be a
**finding**, never a silent `continue`. The contrast checker once passed a pairing that
resolved in zero contexts — indistinguishable from a pass. Same trap applies here.

---

## What this plan does not claim

A skill cannot force an AI or a developer to comply; it raises the odds and gives a shared
vocabulary. The enforcement comes from the other two legs: **the package**, which already
locks every token, and **`AppShell`**, which makes the chrome structural rather than
advisory. `check` is what makes any of it verifiable after the fact.

## Out of scope

Tailwind anything, a component registry (we ship a package, not copy-in source), MCP server
work, and OKLCH — our palette is authored and gated in sRGB with a working contrast
harness, and re-basing it would invalidate every recorded measurement.
