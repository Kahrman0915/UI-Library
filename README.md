# @ui/lib

A React component library built with **vanilla SCSS + design tokens** and **zero UI dependencies** (no Tailwind, no Radix, no CSS-in-JS). 17 components, 8 semantic color families, 2 built-in themes (light + dark), and 8 product brand scopes.

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
import { Button, Input, Label, Checkbox, Card, CardHeader, CardBody } from '@ui/lib';

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

Set `data-theme="light"` or `data-theme="dark"` on `<html>` (or any parent). Every component picks up the theme via CSS variables — no context provider needed.

```html
<html data-theme="dark">
  ...
</html>
```

To create a **branded** subtree, wrap in a product brand scope:

```tsx
<div className="brand-db">
  <Button variant="brand" label="Sign in with DB" />
</div>
```

Available product scopes: `.brand-db`, `.brand-dc`, `.brand-dr`, `.brand-ec`, `.brand-ir`, `.brand-nb`, `.brand-ph`, `.brand-rm`.

## Components

| | | |
|---|---|---|
| `Avatar` + `AvatarGroup` | `Badge` | `Button` |
| `ButtonGroup` + `Separator` + `Text` | `Card` + `Header/Body/Footer` | `Checkbox` |
| `Chip` | `CloseButton` | `Dialog` + `Header/Body/Footer` |
| `DropdownMenu` + 10 subcomponents | `Input` | `Label` |
| `ScrollArea` | `Spinner` | `Textarea` |
| `Tooltip` + `Trigger` + `Content` | | |

Every component:
- Uses `React.forwardRef` — attach a ref
- Accepts `className` for style overrides
- Extends the underlying HTML element's attributes — `id`, `data-*`, `aria-*`, event handlers all flow through

Interactive components additionally require an `id` prop (used to seed nested aria relationships).

## Design tokens

Design values live in [`src/styles/tokens.scss`](src/styles/tokens.scss). Categories:

- **Spacing / sizing:** `--p-0` through `--p-96`; matching `--w-*` and `--h-*` scales
- **Typography:** `--text-*`, `--leading-*`, `--tracking-*`, `--font-*` (weight + family)
- **Radii:** `--rounded-sm` (2px) through `--rounded-3xl` (24px), plus `--rounded-full`
- **Shadows:** `--shadow-2xs` through `--shadow-2xl` (theme-aware; color pre-baked into each token)
- **Semantic colors:** `--primary`, `--secondary`, `--muted`, `--accent`, `--card`, `--popover`, `--foreground`, `--background`, `--border`, `--input`, `--ring`, `--focus`
- **Status colors:** `--error`, `--success`, `--warning`, `--info` — each with `-foreground`, `-light`, `-border`, `-hover`, `-ring`, `-focus`
- **Brand:** `--brand` + same shape; overridden per-scope via `.brand-*` classes
- **Category colors:** `--category-red`, `--category-blue`, etc. — chart / tag colors
- **Motion:** `--duration-fast/normal/slow`, `--ease-*`
- **Effects:** `--focus-ring-width`, `--overlay-blur`, `--tooltip-slide`

Consumers can override tokens by defining them at any scope — e.g. `<div style={{ '--primary': '#ff0066' }}>...` — and every descendant component follows.

## Development

```bash
# Install
npm install

# Storybook (component playground)
npm run storybook       # http://localhost:6006

# Typecheck
npm run typecheck

# Build (library bundle)
npm run build
```

Storybook is the primary way to preview components in isolation. Every component has stories under `src/components/{Name}/{Name}.stories.tsx`.

## Dependencies

**Runtime:** `lucide-react` (icons only)
**Peer:** `react`, `react-dom`

That's it. No Tailwind, no Radix, no cva, no styled-components, no motion library.

## Contributing / adding a component

See [`CLAUDE.md`](CLAUDE.md) — it's the source of truth for conventions (file structure, API patterns, token vocabulary, verification workflow). All PRs need to follow the rules there.

## License

MIT — do whatever you want with the code, just don't blame us if it breaks.
