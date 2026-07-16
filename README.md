# @ui/lib

A React component library built with **vanilla SCSS + design tokens** and **zero UI dependencies** (no Tailwind, no Radix, no CSS-in-JS). 42 components, light + dark modes, and 8 swappable brand themes — everything driven by CSS variables, so a component's look changes without touching its code.

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

## Theming

There are two independent axes, both set as attributes and both inherited via CSS variables — **no context provider needed**.

**Mode — light / dark.** Set `data-mode="light"` or `data-mode="dark"` on `<html>`:

```html
<html data-mode="dark"> … </html>
```

The `<ModeToggler>` component flips this attribute for you (with a View-Transitions circular reveal).

**Theme — a sub-brand's color.** Set `data-theme="{code}"` on `<html>` or *any* subtree. A theme remaps `--primary` to that brand's color; everything that reads `--primary` (solid buttons, checked checkboxes, radio dots, switch tracks, active chips, default badges, progress, toast actions…) picks it up automatically. The absence of `data-theme` is the neutral-slate **main brand**.

```tsx
// Everything reading --primary inside this section turns indigo:
<section data-theme="db">
  <Button id="cta" label="Continue" />                 {/* solid indigo */}
  <Checkbox id="agree" label="I agree" defaultChecked /> {/* indigo check */}
</section>
```

Available theme codes: `db`, `dc`, `dr`, `ec`, `ir`, `nb`, `ph`, `rm`. Neutral chrome (secondary/ghost buttons, borders, body text) and `Tooltip` deliberately stay neutral in every theme.

## Components

| Category | Components |
|---|---|
| **Actions** | `Button`, `ButtonGroup`, `CloseButton` |
| **Forms** | `Input`, `Textarea`, `Select`, `NativeSelect`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Field`, `InputGroup`, `Label` |
| **Feedback** | `Alert`, `Badge`, `Progress`, `Spinner`, `Skeleton`, `Toast` |
| **Overlays** | `Dialog`, `Drawer`, `Popover`, `Tooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`, `Command` |
| **Navigation** | `Tabs`, `Breadcrumb`, `Item` |
| **Layout** | `Card`, `Accordion`, `Collapsible`, `ScrollArea`, `Attachment`, `Separator`, `Sidebar`, `Empty` |
| **Identity** | `Avatar` + `AvatarGroup`, `Chip` |
| **Utility** | `ModeToggler` (light/dark toggle) |

Compound components (`Card`, `Dialog`, `Drawer`, `DropdownMenu`, `Command`, `Sidebar`, `Item`, `Field`, `Tabs`, `Breadcrumb`, `Empty`, …) export their subcomponents from the same entry point.

Every component:

- Uses `React.forwardRef` — attach a ref to the underlying element.
- Accepts `className` for style overrides (merged, never clobbered).
- Extends the underlying HTML element's attributes — `id`, `data-*`, `aria-*`, and event handlers all flow through via `...rest`.

Non-trivial components take a required `id` prop, used to seed nested aria relationships (`${id}-title`, `${id}-error`, …).

## Design tokens

Every visual value comes from a token in [`src/styles/tokens.scss`](src/styles/tokens.scss). Categories:

- **Spacing / sizing:** `--p-0` → `--p-96` (plus half-steps), mirrored `--w-*` / `--h-*`, and `--max-w-*`
- **Typography:** `--text-*`, `--leading-*`, `--tracking-*`, `--font-*` (weight), `--font-family` / `--font-family-mono`
- **Radii:** `--rounded-sm` (2px) → `--rounded-3xl` (24px), plus `--rounded-full`
- **Borders:** `--border-w-50` (0.5px) → `--border-w-400` (4px)
- **Shadows:** `--shadow-2xs` → `--shadow-2xl` (mode-aware; color pre-baked into each token)
- **Core colors:** `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--popover`, `--foreground`, `--background`, `--border`, `--input`, `--ring`, `--focus` — `--primary` carries a derived family (`-hover`/`-light`/`-soft`/`-border`/`-ring`/`-focus`) that theme scopes remap
- **Status colors:** `--error`, `--success`, `--warning`, `--info` — each with `-foreground`, `-light`, `-soft`, `-border`, `-hover`, `-ring`, `-focus`
- **Aiden (AI gradient variant):** `--aiden-primary`, `--aiden-secondary`, `--aiden-outline-*`, …
- **Sidebar surface:** `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-width`, …
- **Category colors:** `--category-red`, `--category-blue`, … — chart / tag colors, each with `-bg` and `-hover`
- **Motion:** `--duration-fast/normal/slow`, `--ease-*` (incl. `--ease-spring` / `--ease-spring-strong`), `--motion-slide-sm/md/lg`
- **Effects:** `--focus-ring-width`, `--overlay-blur`

Consumers can override any token at any scope — e.g. `<div style={{ '--primary': '#ff0066' }}>…</div>` — and every descendant component follows.

## Development

```bash
npm install

npm run storybook   # component playground → http://localhost:6006
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + build the library bundle into dist/
```

Storybook is the primary way to preview components in isolation and the main regression check. Every component has stories at `src/components/{Name}/{Name}.stories.tsx`.

## Dependencies

- **Runtime:** `lucide-react` (icons only)
- **Peer:** `react`, `react-dom`

That's it. No Tailwind, no Radix, no cva, no styled-components, no motion library, no floating-ui.

## Contributing / adding a component

See [`CLAUDE.md`](CLAUDE.md) — the source of truth for conventions (file structure, API patterns, token vocabulary, theming model, verification workflow). Every change should follow the rules there.

## License

MIT — do whatever you want with the code, just don't blame us if it breaks.
