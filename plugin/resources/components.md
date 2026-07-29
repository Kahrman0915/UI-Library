# @ui/lib — component reference

59 components, 250 exported values, all from `@ui/lib`.

**Full prop tables live in Storybook** (`npm run storybook` → any component → Docs). Every prop there carries a description generated from the source, so it cannot drift from the code. This file is the roster and the judgement calls: what exists, what to reach for, and the traps.

Quick key: 🔒 = requires an `id` · 🧩 = compound, use the parts together

---

## The roster

### Actions
| Component | What it's for |
|---|---|
| `Button` 🔒 | The commit. 6 variants × 5 styles × 4 sizes, plus `isLoading` and `iconOnly`. |
| `ButtonGroup` 🧩 | Joins adjacent buttons into one unit. Presentational — for one-of-N use `ToggleGroup`. |
| `CloseButton` 🔒 | The dismissal X. Only ever a dismissal. |
| `Fab` 🔒 | Viewport-pinned launcher for the one always-available action. Carries the Aiden gradient. |

### Forms
| Component | What it's for |
|---|---|
| `Input` 🔒 | Single-line field, with label / description / error / icons built in. |
| `Textarea` 🔒 | Multi-line. Reuses Input's field chrome. |
| `NativeSelect` 🔒 🧩 | The OS `<select>`, restyled. **The default pick.** |
| `Select` 🔒 🧩 | Floating listbox for rich items (icons, descriptions, groups). |
| `Combobox` 🔒 | The only one with a **search field**. For long lists. |
| `Checkbox` 🔒 | On/off, committed on submit. Supports `indeterminate`. |
| `RadioGroup` 🔒 🧩 | One of a small visible set. |
| `Switch` 🔒 | A setting that applies **immediately**. |
| `Slider` 🔒 | A value along a range; `range` gives two thumbs. |
| `InputOTP` 🔒 | One-time code. Slots are visual; one real input underneath. |
| `Field` 🧩 | Scaffolding (label / description / error) around a control you supply. |
| `InputGroup` 🧩 | A field flanked by addons sharing one border. |
| `Label` | The shared label primitive. Rarely needed directly. |

### Feedback
| Component | What it's for |
|---|---|
| `Alert` 🔒 | Inline message beside the thing it describes. |
| `Banner` 🔒 | Full-bleed page-level announcement bar. |
| `Badge` 🔒 | Status / category pill. 12 variants + 15 category hues. |
| `Progress` 🧩 | Determinate, or `indeterminate` for unknown length. |
| `Spinner` 🔒 | Indeterminate loading. Keeps spinning under reduced motion, deliberately. |
| `Skeleton` | Placeholder in the shape of what's loading. |
| `Toast` 🧩 | Imperative: render `<Toaster>` once, call `toast()` anywhere. |
| `Empty` 🧩 | The nothing-here state. |

### Overlays
| Component | What it's for |
|---|---|
| `Dialog` 🔒 🧩 | Modal for one focused task. |
| `AlertDialog` 🔒 🧩 | A choice that must be answered. No outside-click, no X. |
| `Drawer` 🔒 🧩 | Panel from any edge. |
| `Popover` 🔒 🧩 | Click-opened floating panel. |
| `Tooltip` 🔒 🧩 | Short label on hover/focus. Never themed. |
| `HoverCard` 🔒 🧩 | Rich hover preview. |
| `DropdownMenu` 🔒 🧩 | Menu of **actions** (11 parts). |
| `ContextMenu` 🔒 🧩 | Right-click menu (14 parts). The only family with submenus. |
| `Menubar` 🔒 🧩 | Desktop menu bar. Built on DropdownMenu. |
| `Command` 🔒 🧩 | The ⌘K palette. |

### Navigation
`Tabs` 🔒 🧩 · `Breadcrumb` 🧩 · `Pagination` 🧩 · `Sidebar` 🧩 (23 parts, ⌘B, mobile → Drawer) · `Item` 🧩 (generic list row)

### Layout
`Card` 🔒 🧩 · `Accordion` 🔒 🧩 · `Collapsible` 🔒 🧩 · `ScrollArea` 🔒 · `Attachment` 🧩 (file rows) · `Separator` · `AspectRatio` · `Blockquote` · `Code` + `CodeBlock` 🔒

### Identity
`Avatar` 🔒 + `AvatarGroup` 🔒 · `Chip` 🔒 · `Toggle` 🔒 · `ToggleGroup` 🔒 🧩 · `Kbd` · `StatusDot` · `FeaturedIcon`

### AI — Aiden
`Chat` 🧩 — 27 exports (the root plus 26 parts): transcript (`ChatMessageList`, `ChatMessage`, `ChatBubble`), composer, `ChatToolCall`, `ChatReasoning`, `ChatCitation` / `ChatSources`, `ChatGreeting`, `ChatLayout`. Content is consumer-provided; **there is no markdown parser**.

### Utility
`ModeToggler` 🔒 (owns `data-mode`) · `DirectionProvider` + `useDirection` (RTL/LTR)

### Hooks
`usePresence` · `useAutosizeTextarea` · `useStickToBottom` · `useStreamingText` · `useRipple` · `useSidebar` · `useDirection`

`useMounted`, `useIsMobile` and `useFloatingReposition` are internal to the library and are **not** importable from `@ui/lib`.

---

## The ones you'll use most

### Button

```tsx
<Button id="save" label="Save changes" />                       {/* theme's primary */}
<Button id="draft" label="Save as draft" style="secondary" />
<Button id="cancel" label="Cancel" style="ghost" />             {/* neutral, always */}
<Button id="delete" label="Delete" variant="error" />
<Button id="star" iconOnly IconCenter={Star} aria-label="Star" />
<Button id="saving" label="Saving…" isLoading />
```

`variant` = **which colour family** (`default | error | info | success | warning | aiden`).
`style` = **how much emphasis** (`default | secondary | outline | ghost | link`).
Two independent axes, and the most confusable pair in the library. The native CSS `style` attribute is Omitted to make room — use `className` for one-offs.

Sizes accept **either vocabulary**: `xsmall|small|default|large` or `xs|sm|default|lg`. They normalize to the same class; prefer the abbreviations, which match the other 23 components.

`onClick` receives **no event**. Reach for a plain `<button>` if you need one.

### Form field

```tsx
<Input
  id="email" label="Email" type="email"
  description="We'll never spam you."
  required error={hasError} errorMessage="Enter a valid email."
/>
```

The same shape works on `Textarea`, `NativeSelect`, `Select`, `Combobox`, `InputOTP`. `description` is exposed via `aria-describedby`, **not** folded into the accessible name. `errorMessage` is announced when it appears.

### Card

```tsx
<Card id="plan" interactive>
  <CardHeader id="plan" title="Pro" description="Everything in Free, plus…" />
  <CardBody>…</CardBody>
  <CardFooter><Button id="pick" label="Choose" /></CardFooter>
</Card>
```

`interactive` is **visual only** — it does not make the card operable. Put the real link or button inside.

### Dialog

```tsx
<Dialog id="delete" open={open} onClose={close}>
  <DialogHeader id="delete" title="Delete report" description="This can't be undone." />
  <DialogBody>…</DialogBody>
  <DialogFooter>
    <Button id="cancel" label="Cancel" style="ghost" onClick={close} />
    <Button id="ok" label="Delete" variant="error" />
  </DialogFooter>
</Dialog>
```

`DialogHeader`'s `id` **must match** the Dialog's. For a confirmation use `AlertDialog`, and set `initialFocusRef` to the least destructive action.

### Toast

```tsx
<Toaster />                       // once, at app root
toast.success('Saved');           // anywhere
toast.error('Could not save', { action: { label: 'Retry', onClick: retry } });
```

### Badge

```tsx
<Badge id="new" variant="success" label="New" />
<Badge id="beta" variant="outline" label="BETA" />
<Badge id="topic" category="violet" label="Design" />           {/* soft tag */}
<Badge id="live" category="red" categoryStyle="solid" label="Live" />
```

`category` overrides `variant`. 15 hues.

---

## Choosing between look-alikes

These are visually identical and differ only in behaviour — a mockup can't tell you which is meant.

| If the user wants… | Reach for |
|---|---|
| A short, simple option list (esp. mobile) | `NativeSelect` |
| Options with icons, descriptions or groups | `Select` |
| A long list the user should filter by typing | `Combobox` |
| Several filters, any number active | `Chip` |
| One standalone on/off | `Toggle` |
| Exactly one of N (view switcher, status filter) | `ToggleGroup` |
| A message beside the thing it describes | `Alert` |
| A page-wide announcement bar | `Banner` |
| Something transient | `toast()` |
| A short label for a control | `Tooltip` |
| A rich preview on hover | `HoverCard` |
| A panel the user clicks open | `Popover` |
| A menu of actions | `DropdownMenu` |
| Picking a value | `Select` |
| A setting that applies now | `Switch` |
| A choice committed on submit | `Checkbox` |

---

## Traps worth knowing

- **`id` is required** on non-trivial components and seeds child ids. Compound headers (`DialogHeader`, `DrawerHeader`, `CardHeader`) must repeat the parent's `id`.
- **Never put a positioning `transform` on a `Button`.** Its `:active` press-scale replaces `transform` wholesale, so the button teleports out from under the cursor and the click never fires. Put positioning on a wrapper.
- **`Alert` Omits the native `style` attribute** — `style` there is the visual style (`default | outline`). Use `className`.
- **`Collapsible` / `Accordion` content must not carry its own padding** — it leaks into the grid row's min-size and the panel won't fully collapse. Pad an inner element.
- **Floating surfaces have no collision detection.** They won't flip near a viewport edge; place them with `side` / `align`.
- **`Toaster` takes no `id` and no `...rest`** — a deliberate exception to both rules, being a mount-once singleton.
