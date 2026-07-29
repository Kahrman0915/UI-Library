# @ui/lib — conventions

Only relevant if you're extending or contributing to the library. If you're just consuming components, `components.md` and `tokens.md` are what you want.

## Hard rules

1. **Runtime deps are `lucide-react` only.** Not `class-variance-authority`, `@radix-ui/*`, `framer-motion`, `motion`, `tailwindcss`, `@emotion/*`, `styled-components`, `@floating-ui/*`. Each has been explicitly rejected.
2. **No Tailwind. No CSS-in-JS.** SCSS files in the component folder, imported as a side effect at the top of the `.tsx`.
3. **Every design value goes through a token.** No hex, no rgba, no raw px literals (except a handful of geometry constants documented below).
4. **Every component uses `React.forwardRef` + `displayName` + `className` merge.**
5. **BEM class naming under a `ui-` prefix.** Never CSS Modules. Never per-component custom prefixes.
6. **`id` is required on interactive components** — it seeds child aria-relationships.

## File structure per component

```
src/components/{Name}/
├── {Name}.tsx           # forwardRef, displayName, spread ...rest
├── {Name}.types.ts      # Props + variant/size unions
├── {Name}.scss          # BEM global classes, tokens only
├── {Name}.stories.tsx   # Playground + AllStates + variant/size stories
├── {Name}.constants.ts  # OPTIONAL — only if you have runtime constants
└── index.ts             # default export + type re-exports
```

Wire the exports into `src/index.ts` after creation.

## Component template

```tsx
import { forwardRef } from 'react';
import type { WidgetProps } from './Widget.types';
import './Widget.scss';

const Widget = forwardRef<HTMLButtonElement, WidgetProps>(
  (
    { id, label, variant = 'default', size = 'default', className, ...rest },
    ref,
  ) => {
    return (
      <button
        {...rest}                                                 // spread FIRST
        ref={ref}
        id={id}
        className={`ui-widget ui-widget--${variant} ui-widget--sz-${size}${className ? ' ' + className : ''}`}
        type="button"                                             // controlled props LAST
      >
        {label}
      </button>
    );
  },
);

Widget.displayName = 'Widget';

export default Widget;
```

Types:

```ts
export type WidgetVariant = 'default' | 'error' | 'success';
export type WidgetSize = 'sm' | 'default' | 'lg';

export type WidgetProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> & {
  id: string;
  label?: string;
  variant?: WidgetVariant;
  size?: WidgetSize;
  onClick?: () => void;   // if we constrain the signature
  className?: string;
};
```

Important:
- **Extend the underlying HTMLAttributes type** so all standard HTML props flow through
- **Omit only what you redefine** — commonly `style`, `size`, `onClick`
- **Spread `{...rest}` FIRST** in JSX — this makes consumer overrides NOT clobber our controlled props (`id`, `type`, `disabled`, `onClick`)

## SCSS conventions

- BEM (`.ui-widget`, `.ui-widget__label`, `.ui-widget--error`)
- Plain `.scss` — never `.module.scss`
- Every value from a token — `padding: var(--p-2) var(--p-3)`, not `padding: 8px 12px`
- One file per component; no cross-component imports except for the shared `.ui-input-wrap` (see below)
- No `!important` — ever

### Rare literal exceptions (do not remove these)

- `-3px` on the Tooltip arrow `::after` — component-internal geometry
- `1000px` in Input's `-webkit-autofill` box-shadow — the yellow-autofill kill-switch
- (formerly `cubic-bezier(0.16, 1, 0.3, 1)` in Tooltip — now tokenized as `--ease-spring`)
- Everything in `tokens.scss` — those literals ARE the tokens

## Reusable primitives

Before writing new SCSS, check if a shared class already covers what you need:

- **`.ui-label`** (from Label.scss) — text-styling primitive with size + required + description slots. Used by Checkbox and Input internally. If you're building a form control, reuse this via `import '../Label/Label.scss'`.
- **`.ui-input-wrap`** (from Input.scss) — border + focus-within ring + hover + error + disabled states for form-field-shaped containers. Textarea uses it via a `--multi` modifier. If you're building Select's trigger or Combobox's box, reuse this.

Reusable code (`src/hooks/`, `src/utils/`):

- **`useMounted()`** — client-mount indicator. Use in every portal component to gate `createPortal` calls.
- **`computePosition(triggerRect, contentRect, side, align, sideOffset)`** — positions a floating element. Currently used by Tooltip + DropdownMenu; use in Popover, Select, Combobox, Sheet next.

## Storybook

Every component ships with stories. Minimum:

- **Playground** — Storybook controls exercise the full prop matrix
- **AllVariants** or **AllStates** — visual grid showing every combination
- State-specific stories (`Disabled`, `Loading`, `Active`, `WithIcons`) where applicable

Boot: `npm run storybook` on port 6006. Screenshots are the primary regression check.

## Verification workflow

Before shipping any change:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Boot Storybook, screenshot affected stories
npm run storybook

# 3. Grep guardrails
grep -rE "#[0-9a-fA-F]{3,8}" src/components/   # should be empty
grep -rE "rgba\("             src/components/   # should be empty
grep -rhE "^import.*from" src/components/ \
  | grep -oE "from ['\"][^'\"]+['\"]" \
  | sort -u
# ↑ only 'react', 'react-dom', 'lucide-react', '@storybook/react',
#   or relative/alias imports allowed
```

If any output violates the "allowed" set, undo whatever change introduced it.

## Design decisions to preserve

- **Vanilla React + SCSS. No exceptions unless the user approves.**
- **BEM `ui-*` prefix.** The library was renamed once; don't reintroduce old prefixes.
- **Theme codes are 2 letters** (`db`, `dc`, `dr`, `ec`, `ir`, `nb`, `ph`, `rm`), not full product names.
- **There is no `--brand` token and no `variant="brand"`.** That model was removed: `--primary` *is* the current theme's colour, and the main brand is the absence of `data-theme`. Don't reintroduce it.
- **Three theming axes, all attributes:** `data-mode` ⊥ `data-theme` ⊥ `data-surface`. Aiden is a *surface*, never a theme code.
- **Compound containers use `Header/Body/Footer` naming** (Dialog, Card), matching each other, not matching shadcn's `Header/Content/Footer`.
- **Positioning has no collision detection.** Adding it would require `@floating-ui/react` — declined.
- **Every overlay animates in and out** via the shared `usePresence` state machine (`closed → open → closing`). It must promote to `open` *synchronously during render* — deferring it to an effect mounts the content a render late, after the positioning layout-effect has already run against a null ref.
- **Reduced motion is global**, in `tokens.scss`. It collapses durations to `0.01ms`, **not** `none`: Drawer and Tooltip unmount on `animationend`, and `none` means that event never fires. Spinner is the deliberate exemption.

## Extending the library

When the user asks to add a new component:

1. Read a reference implementation for the API + visual spec + state matrix. **Do not copy code** — extract only the shape.
2. Follow the file structure above.
3. Reuse what exists: `useMounted`, `usePresence`, `useFloatingReposition`, `computePosition`, `getFocusable`, `.ui-label`, `.ui-input-wrap`, `.ui-icon-button`.
4. Add tokens to `tokens.scss` (in **both** the light and dark blocks) if the design language needs new semantic values, then run `npm run test:contrast`.
5. Ship stories — including a disabled state and a controlled-usage story.
6. Wire into `src/index.ts`.
7. JSDoc every prop in `{Name}.types.ts` — it's the only source for the docs-page API table.
8. Add a changelog entry to `parameters.ui.changelog` in the story meta.
9. Verify with the checklist above.

If the new component would need a runtime dep the library doesn't have, **stop and ask the user** — the dep list is intentional.
