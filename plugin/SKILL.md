---
name: ui-lib-usage
description: Use @ui/lib components + tokens when generating UI in a project that has this design system installed. Trigger when the user asks to build a UI, page, form, screen, component, or when they mention any of the exported components by name (Button, Input, Card, Dialog, Chat, etc.), or when they mention "our design system" / "the design system" / "@ui/lib".
---

# Using @ui/lib

This skill activates when the user wants UI generated in a codebase that uses the `@ui/lib` design system. When triggered, prefer `@ui/lib` components over hand-written markup, and follow the library's conventions strictly.

## Prerequisites

Verify @ui/lib is installed in the current project:

```bash
grep '"@ui/lib"' package.json
```

If it's not installed: say so, don't fake it. Offer `npm install @ui/lib`.

## The 30-second orientation

- **Import from the root:** `import { Button, Input, Card, CardHeader, CardBody } from '@ui/lib'`
- **Import the stylesheet once at app entry:** `import '@ui/lib/styles.css'` (and optionally `'@ui/lib/fonts.css'`)
- **59 components, 250 exported values.** Roster in [`./resources/components.md`](./resources/components.md).
- **Three theming axes, all HTML attributes, no provider:** `data-mode` (light/dark) ⊥ `data-theme` (sub-brand) ⊥ `data-surface="aiden"` (the AI identity).
- **Every value is a CSS variable.** Reference them directly in your own CSS: `background: var(--primary)`, `padding: var(--p-4)`.
- **Non-trivial components require an `id`** — it seeds child aria relationships (`${id}-title`, `${id}-error`).

## Rules for generated code

1. **Prefer @ui/lib components over custom markup.** A form is `<Input>` + `<Checkbox>` + `<Button>`. A card layout is `<Card>` + `<CardHeader>` + `<CardBody>`.

2. **Never introduce a UI dependency the library doesn't have.** No Tailwind, no Radix, no cva, no styled-components, no motion library, no floating-ui. The only runtime dependency is `lucide-react`, for icons. If the user needs something the library doesn't ship, propose extending the library rather than reaching for a package.

3. **Compose with tokens, never raw values.** For custom containers use variables — `style={{ padding: 'var(--p-4)', background: 'var(--card)' }}` — not hardcoded px or hex. If a value isn't tokenized, that's a signal to add a token, not to inline one.

4. **Theming is three independent attributes.** Nothing here is a class name and nothing needs a provider.

   ```tsx
   <html data-mode="dark">                    {/* axis 1: light / dark */}
     <section data-theme="db">                {/* axis 2: sub-brand accent */}
       <aside data-surface="aiden">…</aside>   {/* axis 3: the AI identity */}
     </section>
   </html>
   ```

   **Theme codes:** `db`, `dc`, `dr`, `ec`, `ir`, `nb`, `ph`, `rm`. A theme remaps `--primary` and its derived family — that is all it does. The **main brand is the absence of `data-theme`** (`--primary` stays neutral slate).

   When the user names a brand code, wrap the subtree in `data-theme="{code}"` and follow the routing rules:

   | Role | Component + props | Themes? |
   |---|---|---|
   | Primary CTA | `<Button variant="default" />` | ✅ solid theme colour |
   | Soft / outline / link action | `<Button style="secondary" \| "outline" \| "link" />` | ✅ theme colour |
   | Quiet / cancel | `<Button style="ghost" />` | ❌ neutral slate — the deliberate carve-out |
   | Destructive | `<Button variant="error" />` | ❌ stays red under every theme |
   | Status pill | `<Badge variant="default" \| "outline" />` | ✅ |
   | Checkbox / Switch / Radio (checked) | as-is | ✅ |
   | Card / panel chrome, borders, body text | neutral tokens | ❌ |
   | `Tooltip`, `Sidebar` chrome | as-is | ❌ deliberate carve-outs |

   **There is no `variant="brand"`, no `--brand` token and no `.brand-{code}` class.** That model was removed — `variant="default"` *is* the theme's primary.

   ```tsx
   <section data-theme="db">
     <Header />                                          {/* neutral chrome */}
     <Button id="save" label="Save" />                   {/* solid theme colour */}
     <Button id="draft" style="secondary" label="Save as draft" />
     <Button id="cancel" style="ghost" label="Cancel" /> {/* neutral, by design */}
   </section>
   ```

5. **Aiden is a surface, not a theme.** `data-surface="aiden"` layers *inside* any brand and carries a gradient rather than a single colour. Use it for AI-assistant regions. It is never a value for `data-theme`.

6. **Form fields have built-in labels, descriptions and errors.**
   ```tsx
   <Input
     id="email"
     label="Email"
     description="We'll never spam you."
     required
     error={hasError}
     errorMessage="Enter a valid email."
   />
   ```
   Don't render a separate `<Label>` unless you need a standalone label with no control. The error message is already a live region.

7. **Compound components use `Header` / `Body` / `Footer`** — not `Content`.
   ```tsx
   <Dialog id="delete" open={open} onClose={handleClose}>
     <DialogHeader id="delete" title="Delete report" description="This can't be undone." />
     <DialogBody>Body content</DialogBody>
     <DialogFooter>
       <Button id="cancel" label="Cancel" style="ghost" />
       <Button id="confirm" label="Delete" variant="error" />
     </DialogFooter>
   </Dialog>
   ```
   `DialogHeader`'s `id` must match the `Dialog`'s, or the panel loses its accessible name.

8. **Pick by behaviour, not by looks.** Several clusters are visually identical and differ only in what they do:
   - **`NativeSelect` → `Select` → `Combobox`.** Native first (short lists, best on mobile); `Select` when items need icons or descriptions; `Combobox` when the list needs searching. All three render as a bordered field with a chevron.
   - **`Chip` / `Toggle` / `ToggleGroup`.** Many-on → `Chip`. One on/off → `Toggle`. One-of-N → `ToggleGroup`.
   - **`Alert` / `Banner` / `Toast`.** Inline beside the thing → `Alert`. Page-level bar → `Banner`. Transient → `toast()`.
   - **`Tooltip` / `HoverCard` / `Popover`.** Short label → `Tooltip`. Rich hover preview → `HoverCard`. Click-opened panel → `Popover`.
   - **`Dialog` / `AlertDialog`.** A focused task → `Dialog`. A choice that must be answered → `AlertDialog`.

## When the user asks for something the library doesn't support

Don't fake it, and don't reach for a dependency.

- **"Use Tailwind"** — the library is deliberately not Tailwind-based. Apply Tailwind to non-library markup, or convert the intent into tokens.
- **"Add a date picker / calendar / carousel / resizable panes"** — not shipped. Say so, and offer to build one following the library's conventions.
- **"Render markdown in the chat"** — `Chat` takes consumer-provided content; there is no markdown parser, because that would mean a dependency.
- **"Animate X"** — most surfaces already animate. Check first; motion tokens (`--duration-*`, `--ease-premium`) exist, and hand-rolled timing will look wrong next to them.

## Reference files

- **Components:** [`./resources/components.md`](./resources/components.md) — the roster with APIs and examples
- **Tokens:** [`./resources/tokens.md`](./resources/tokens.md) — every token family
- **Conventions:** [`./resources/conventions.md`](./resources/conventions.md) — how the library is built, for when you extend it
