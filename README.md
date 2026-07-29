# @ui/lib

A React component library built with **vanilla SCSS + design tokens** and **zero UI dependencies** (no Tailwind, no Radix, no CSS-in-JS, no motion library, no floating-ui). 59 components, light + dark modes, 8 swappable brand themes, and a distinct AI surface — everything driven by CSS variables, so a component's look changes without touching its code.

## Install

```bash
npm install @ui/lib
```

Peer dependencies (bring your own):

```bash
npm install react react-dom
```

## Usage

Import the stylesheet once at your app root, then use components anywhere:

```tsx
// _app.tsx or main.tsx
import '@ui/lib/styles.css';
import '@ui/lib/fonts.css'; // optional — self-hosted Inter + JetBrains Mono

// anywhere
import { Button, Input, Checkbox, Card, CardHeader, CardBody } from '@ui/lib';

export default function SignIn() {
  return (
    <Card id="signin">
      <CardHeader id="signin" title="Sign in" description="Welcome back" />
      <CardBody>
        <Input id="email" label="Email" type="email" required />
        <Input id="password" label="Password" type="password" required />
        <Checkbox id="remember" label="Remember me" />
        <Button id="submit" label="Sign in" />
      </CardBody>
    </Card>
  );
}
```

`fonts.css` is a **separate, optional import** on purpose — it ships 25 subsetted `woff2` faces with their `unicode-range` intact, so scripts load lazily. Bundling it into `styles.css` would inline every face as base64 and defeat that.

## Theming

Three **independent, composable** axes. All are set as HTML attributes and inherited through CSS variables — **no context provider needed**.

**1 · Mode — light / dark.** `data-mode` on `<html>`:

```html
<html data-mode="dark"> … </html>
```

`<ModeToggler>` owns this attribute (with a View-Transitions circular reveal).

**2 · Theme — a sub-brand's colour.** `data-theme="{code}"` on `<html>` or *any* subtree. A theme remaps `--primary` and its derived family; everything reading `--primary` picks it up automatically. The absence of `data-theme` is the neutral-slate **main brand**.

```tsx
// Everything reading --primary inside this section turns indigo:
<section data-theme="db">
  <Button id="cta" label="Continue" />
  <Checkbox id="agree" label="I agree" defaultChecked />
</section>
```

Codes: `db`, `dc`, `dr`, `ec`, `ir`, `nb`, `ph`, `rm`. Neutral chrome (ghost buttons, borders, body text), the `Sidebar` surface and `Tooltip` deliberately stay neutral in every theme.

**3 · Surface — the Aiden AI identity.** `data-surface="aiden"` on a panel or subtree. Not a theme code and never in the brand picker: it's a cross-cutting identity that layers *inside* any brand, and its accent is a violet→blurple→blue **gradient** rather than a single colour.

```tsx
<section data-theme="db">           {/* brand: indigo */}
  <Button id="save" label="Save" /> {/* indigo */}
  <aside data-surface="aiden">
    <Button id="ask" label="Ask Aiden" /> {/* gradient, inside the indigo brand */}
  </aside>
</section>
```

## Components

| Category | Components |
|---|---|
| **Actions** | `Button`, `ButtonGroup`, `CloseButton`, `Fab` |
| **Forms** | `Input`, `Textarea`, `Select`, `NativeSelect`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `InputOTP`, `Field`, `InputGroup`, `Label` |
| **Feedback** | `Alert`, `Banner`, `Badge`, `Progress`, `Spinner`, `Skeleton`, `Toast`, `Empty` |
| **Overlays** | `Dialog`, `AlertDialog`, `Drawer`, `Popover`, `Tooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`, `Menubar`, `Command` |
| **Navigation** | `Tabs`, `Breadcrumb`, `Pagination`, `Sidebar`, `Item` |
| **Layout** | `Card`, `Accordion`, `Collapsible`, `ScrollArea`, `Attachment`, `Separator`, `AspectRatio`, `Blockquote`, `Code` |
| **Identity** | `Avatar` + `AvatarGroup`, `Chip`, `Toggle`, `ToggleGroup`, `Kbd`, `StatusDot`, `FeaturedIcon` |
| **AI (Aiden)** | `Chat` — 27 exports (root + 26 parts): transcript, composer, tool calls, reasoning, citations, layout shell |
| **Utility** | `ModeToggler`, `DirectionProvider` (RTL/LTR) |

250 exported values in total — 59 components plus their compound parts and the hooks, all from the same entry point.

Every component:

- Uses `React.forwardRef` — attach a ref to the underlying element.
- Accepts `className` for style overrides (merged, never clobbered).
- Extends the underlying HTML element's attributes — `data-*`, `aria-*` and event handlers all flow through via `...rest`.

Non-trivial components take a required `id`, used to seed nested aria relationships (`${id}-title`, `${id}-error`, …).

### Hooks

Exported alongside the components: `useMounted`, `useIsMobile`, `usePresence`, `useFloatingReposition`, `useAutosizeTextarea`, `useStickToBottom`, `useStreamingText`, `useRipple`.

## Design tokens

Every visual value comes from a token in [`src/styles/tokens.scss`](src/styles/tokens.scss), also importable directly (`@ui/lib/styles/tokens.scss`).

- **Spacing / sizing:** `--p-0` → `--p-96` (plus half-steps), mirrored `--w-*` / `--h-*`, and `--max-w-*`
- **Typography:** `--text-*`, `--leading-*`, `--tracking-*`, `--font-*` (weight), `--font-family` / `--font-family-mono`
- **Radii:** `--rounded-sm` (2px) → `--rounded-3xl` (24px), plus `--rounded-full`
- **Borders:** `--border-w-50` (0.5px) → `--border-w-400` (4px); `--border` + `--border-hover`
- **Shadows:** `--shadow-2xs` → `--shadow-2xl` (mode-aware; colour pre-baked into each token)
- **Core colours:** `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--popover`, `--foreground`, `--background`, `--border`, `--input`, `--ring`, `--focus`
- **Derived `--primary` family:** `-hover`, `-light`, `-soft`, `-border`, `-ring`, `-focus`, and **`--primary-text`** — the on-surface variant to use whenever `--primary` is *text* on a light background (it clears WCAG AA where raw `--primary` does not)
- **Status colours:** `--error`, `--success`, `--warning`, `--info` — each with `-foreground`, `-light`, `-soft`, `-border`, `-hover`, `-ring`, `-focus`
- **Category colours:** 15 hues for tags and charts — `--category-{hue}` (vivid fill), `-bg` (soft tint) and **`-text`** (AA-safe on that tint), plus one inverted `--category-foreground`
- **Code block:** `--code-block` plus an 11-token syntax palette (`--code-keyword`, `--code-string`, …), AA-checked in both modes
- **Aiden surface:** `--aiden-primary` (the gradient), `--aiden-hover`, `--aiden-outline-border`, `--aiden-secondary` / `-border` / `-ring` / `-focus`
- **Sidebar surface:** `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-width`, …
- **Motion:** `--duration-*` (incl. `--duration-spin`, `--duration-shimmer`, `--duration-pulse`), `--ease-*` (incl. `--ease-premium`, `--ease-entrance`, `--ease-spring`), `--motion-slide-sm/md/lg`, `--motion-scale-press`, `--stagger-step`
- **Effects:** `--focus-ring-width`, `--overlay-blur`

Consumers can override any token at any scope — `<div style={{ '--primary': '#ff0066' }}>…</div>` — and every descendant follows.

Reduced motion is handled globally: one `@media (prefers-reduced-motion: reduce)` block collapses every duration. It uses `0.01ms` rather than `none` deliberately — Drawer and Tooltip unmount on `animationend`, and `none` means that event never fires.

## Accessibility

- Every text-on-surface pairing the components use clears **WCAG AA**, enforced by `npm run test:contrast` (49 pairings, dependency-free).
- Form errors are live regions; labels, descriptions and errors wire through `aria-labelledby` / `aria-describedby` from the component's `id`.
- Overlays trap focus, close on Escape and restore focus to their trigger.
- Keyboard behaviour follows the WAI-ARIA APG per pattern.

## Development

```bash
npm install

npm run storybook     # component playground → http://localhost:6006
npm run typecheck     # tsc --noEmit
npm run test:contrast # WCAG AA guardrail over the token pairings
npm run build         # typecheck + build the library bundle into dist/
npm run build:fonts   # dist/fonts.css + subsetted woff2 (separate pipeline)
```

Storybook is the primary way to preview components and the main regression check. Every component has stories at `src/components/{Name}/{Name}.stories.tsx` and a generated docs page carrying its API reference, usage guidance and changelog.

## Dependencies

- **Runtime:** `lucide-react` (icons only)
- **Peer:** `react`, `react-dom`

That's it. No Tailwind, no Radix, no cva, no styled-components, no motion library, no floating-ui.

## Merging an older copy of this library into this one

If you're reconciling a divergent or older version of this system, start with
[`REBUILD-GUIDE.md`](./REBUILD-GUIDE.md) — it covers what's authoritative, how to match
components when the names differ, everything that changed after the split, and the rules
that must survive the merge.

## Contributing / adding a component

See [`CLAUDE.md`](CLAUDE.md) — the source of truth for conventions (file structure, API patterns, token vocabulary, theming model, verification workflow) and for the decisions that should not be relitigated. Every change to a component adds an entry to its docs-page changelog in the same commit.

## License

MIT — do whatever you want with the code, just don't blame us if it breaks.
