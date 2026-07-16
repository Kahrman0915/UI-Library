---
name: ui-lib-usage
description: Use @ui/lib components + tokens when generating UI in a project that has this design system installed. Trigger when the user asks to build a UI, page, form, screen, component, or when they mention any of the exported components by name (Button, Input, Card, Dialog, etc.), or when they mention "our design system" / "the design system" / "@ui/lib".
---

# Using @ui/lib

This skill activates when the user wants Claude to generate UI in a codebase that uses the `@ui/lib` design system. When triggered, prefer `@ui/lib` components over hand-writing markup, and follow the library's conventions strictly.

## Prerequisites

Verify @ui/lib is installed in the current project:

```bash
grep '"@ui/lib"' package.json
```

If it's not installed:
- Say so, don't fake it
- Offer to install: `npm install @ui/lib`
- Once installed, this skill applies

## The 30-second orientation

- **Import from the root:** `import { Button, Input, Label, Card, CardHeader, CardBody } from '@ui/lib'`
- **Import the stylesheet once at app entry:** `import '@ui/lib/styles.css'`
- **Theme is data-attr:** `<html data-theme="dark">` swaps light/dark. No provider needed.
- **17 components ship;** roster is in `./resources/components.md`
- **Tokens live in CSS variables** — every design value in the library comes from a variable defined in the shipped stylesheet. Reference tokens directly in your own CSS if needed: `background: var(--primary)`, `padding: var(--p-4)`, etc.
- **Every interactive component requires an `id` prop** — used to seed child aria-relationships

## Rules for generated code

1. **Prefer @ui/lib components over custom markup.** If asking for a form, use `<Input>` + `<Checkbox>` + `<Button>`. If asking for a card layout, use `<Card>` + `<CardHeader>` + `<CardBody>`.
2. **Never introduce a UI dependency the library doesn't already have.** No Tailwind, no Radix, no cva, no styled-components, no motion library. If the user needs something the library doesn't ship, propose extending the library rather than reaching for a new dep.
3. **Compose using tokens.** For custom containers, wrap generated content in styles that use variables — `style={{ padding: 'var(--p-4)', background: 'var(--card)' }}` — not hardcoded pixels/colors.
4. **Use product-brand scopes for branded subtrees.** When the user names a brand code (db, dc, dr, ec, ir, nb, ph, rm), wrap the affected subtree in `<div className="brand-{code}">`. Available scopes: `.brand-db`, `.brand-dc`, `.brand-dr`, `.brand-ec`, `.brand-ir`, `.brand-nb`, `.brand-ph`, `.brand-rm`. Then follow the routing rules:

   | Role | Component + props | Uses brand? |
   |---|---|---|
   | Primary CTA | `<Button variant="brand" />` | ✅ solid brand |
   | Secondary CTA (soft tint) | `<Button variant="brand" style="secondary" />` | ✅ brand-light bg, slate text, brand border |
   | Tertiary / cancel | `<Button style="ghost" />` or `style="outline"` | ❌ neutral |
   | Destructive | `<Button variant="error" />` | ❌ stays red |
   | Status pill | `<Badge variant="brand" />` (or `brand-secondary` / `brand-outline`) | ✅ |
   | Nav item selected | brand accent | ✅ |
   | Card / panel chrome | `<Card>` no variant | ❌ neutral |
   | Body text / form focus | `--foreground`, `--muted-foreground`, `--focus` | ❌ neutral |

   Neutral slate = chrome; brand = accent. Neutral components inside a brand scope stay neutral automatically — brand never leaks. Example:

   ```tsx
   <div className="brand-db">
     <Header />                                     {/* neutral chrome */}
     <Button variant="brand" label="Save" />        {/* solid brand primary */}
     <Button variant="brand" style="secondary"      {/* soft-tinted brand */}
             label="Save as draft" />
     <Button style="ghost" label="Cancel" />        {/* neutral tertiary */}
   </div>
   ```
5. **Form fields have built-in labels + errors:**
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
   Don't render a separate `<Label>` unless you need a standalone label with no input.
6. **Compound components use `Header/Body/Footer`:**
   ```tsx
   <Dialog id="delete" open={open} onClose={handleClose}>
     <DialogHeader id="delete" title="Delete report" description="…" />
     <DialogBody>Body content</DialogBody>
     <DialogFooter>
       <Button id="cancel" label="Cancel" style="ghost" />
       <Button id="confirm" label="Delete" variant="error" />
     </DialogFooter>
   </Dialog>
   ```

## When the user asks something the library doesn't support

Don't fake it. Concretely:

- **"Add a Toast"** — the library doesn't ship a Toast yet. Say so; offer to build one (following the library's conventions) or suggest a workaround using the existing Alert-style Badge + Dialog.
- **"Make it animated"** — the library ships enter/exit animations for Tooltip only. Others open/close instantly. Adding animation elsewhere means either accepting the discipline (CSS keyframes + state machine like Tooltip does) or extending the library.
- **"Use Tailwind"** — the library is intentionally not Tailwind-based. If the user wants Tailwind classes, either apply them to non-library markup or convert their intent into tokens.

## Reference files

- **Components:** `./resources/components.md` — every component API with examples
- **Tokens:** `./resources/tokens.md` — every design token by category
- **Conventions:** `./resources/conventions.md` — how the library is built (relevant if extending)
