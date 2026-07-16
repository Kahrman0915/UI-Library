# @ui/lib — component reference

Every export from `@ui/lib`, its props, and a copy-pasteable example.

Quick key:
- 🔒 = interactive component; `id` is required
- 🧩 = compound component; import + use the subcomponents together

---

## Avatar 🔒 + AvatarGroup 🔒 🧩

Fallback initials + optional image + optional status badge.

```tsx
import { Avatar, AvatarGroup } from '@ui/lib';

<Avatar id="kahrman" src="/kahrman.jpg" fallback="KM" size="default" shape="circle" />

<AvatarGroup id="team" max={4} size="default">
  <Avatar id="a1" fallback="AB" />
  <Avatar id="a2" fallback="CD" />
  <Avatar id="a3" fallback="EF" />
  <Avatar id="a4" fallback="GH" />
  <Avatar id="a5" fallback="IJ" />  {/* extras collapse into a "+2" pill */}
</AvatarGroup>
```

Props: `id`, `src?`, `alt?`, `fallback?`, `size: 'sm' | 'default' | 'lg'`, `shape: 'circle' | 'square'`, `badge?`.

---

## Badge

Small pill for status / metadata. 17 variants combining color families with treatments.

```tsx
<Badge id="new" variant="success" label="New" />
<Badge id="beta" variant="brand-outline" label="BETA" />
<Badge id="failed" variant="error-outline" label="Failed" IconLeft={XIcon} />
```

Variants: `default | secondary | outline | no-background | brand | brand-secondary | brand-outline | error | error-outline | success | success-outline | warning | warning-outline | info | info-outline | aiden | aiden-outline`.

---

## Button 🔒

7 variants × 5 styles × 3 sizes + loading, icon-only, and side-icon modes.

```tsx
<Button id="save" label="Save changes" />
<Button id="cancel" label="Cancel" style="ghost" />
<Button id="delete" label="Delete" variant="error" style="outline" />
<Button id="star" iconOnly IconCenter={StarIcon} aria-label="Star" />
<Button id="loading" label="Saving…" isLoading />
```

Props: `id`, `label?`, `variant: 'default' | 'brand' | 'error' | 'info' | 'success' | 'warning' | 'aiden'`, `style: 'default' | 'secondary' | 'outline' | 'ghost' | 'link'`, `size: 'small' | 'default' | 'large'`, `disabled?`, `isLoading?`, `iconOnly?`, `IconLeft?`, `IconRight?`, `IconCenter?`, `onClick?`.

Aiden variant only supports `style: default | outline` — other styles fall back to `default`.

---

## ButtonGroup 🔒 + Separator 🔒 + Text 🔒 🧩

Row/column of buttons that share flattened corners.

```tsx
<ButtonGroup id="view" orientation="horizontal">
  <Button id="v-day" label="Day" style="outline" />
  <Button id="v-week" label="Week" style="outline" />
  <ButtonGroupSeparator id="v-sep" />
  <ButtonGroupText id="v-sort">Sort by</ButtonGroupText>
  <Button id="v-name" label="Name" style="outline" />
</ButtonGroup>
```

---

## Card 🔒 + CardHeader 🔒 + CardBody + CardFooter 🧩

Compound container with distinct sections.

```tsx
<Card id="revenue">
  <CardHeader
    id="revenue"
    title="Q4 revenue"
    description="Last 90 days"
    action={<Badge id="revenue-badge" variant="success" label="+12%" />}
  />
  <CardBody>
    <p>Body content here.</p>
  </CardBody>
  <CardFooter>
    <Button id="revenue-view" label="View report" />
  </CardFooter>
</Card>
```

---

## Checkbox 🔒

Native `<input type="checkbox">` under a custom visual. Supports indeterminate.

```tsx
const [checked, setChecked] = useState(false);
<Checkbox
  id="tos"
  label="I accept the terms of service"
  required
  checked={checked}
  onCheckedChange={setChecked}
/>

// Indeterminate (parent of a select-all group):
<Checkbox id="all" indeterminate checked={someSelected} onCheckedChange={toggleAll} />
```

Props: `id`, `checked?`, `defaultChecked?`, `indeterminate?`, `onCheckedChange?`, `label?`, `description?`, `disabled?`, `required?`, `name?`, `value?`.

---

## Chip 🔒

Toggle pill with active state.

```tsx
<Chip id="active" label="Active" active={selected === 'active'} onClick={...} />
```

Sizes: `xsmall | small | default`.

---

## CloseButton 🔒

Standalone X button. Uses `X` from `lucide-react`.

```tsx
<CloseButton id="toast-close" variant="background" onClick={dismiss} />
```

Variants: `default | background` (background lights up on hover).

---

## Dialog 🔒 + DialogHeader 🔒 + DialogBody + DialogFooter 🧩

Modal dialog. Portalled to `<body>`, focus-trapped, scroll-locked while open.

```tsx
const [open, setOpen] = useState(false);
<Dialog id="delete" open={open} onClose={() => setOpen(false)} closeOnOutsideClick>
  <DialogHeader
    id="delete"
    title="Delete report"
    description="This can't be undone."
    onClose={() => setOpen(false)}
  />
  <DialogBody>
    <p>All linked dashboards will show a broken reference.</p>
  </DialogBody>
  <DialogFooter>
    <Button id="cancel" label="Cancel" style="ghost" onClick={() => setOpen(false)} />
    <Button id="confirm" label="Delete" variant="error" onClick={handleDelete} />
  </DialogFooter>
</Dialog>
```

For inline (non-portal) usage: `<Dialog inline open onClose={noop}>...`.

---

## DropdownMenu 🔒 + 10 subcomponents 🧩

Portalled menu with keyboard nav, checkbox items, radio items, shortcuts.

```tsx
<DropdownMenu id="account">
  <DropdownMenuTrigger>
    <Button id="account-btn" label="Account" />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={openProfile}>
      <UserIcon /> Profile
      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuCheckboxItem checked={showToolbar} onCheckedChange={setShowToolbar}>
      Toolbar
    </DropdownMenuCheckboxItem>
    <DropdownMenuRadioGroup value={pos} onValueChange={setPos}>
      <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Input 🔒

Single-line text field. Composes `<Label>` internally.

```tsx
<Input
  id="email"
  label="Email"
  description="We'll never share it."
  type="email"
  placeholder="you@example.com"
  IconLeft={MailIcon}
  required
  error={hasError}
  errorMessage="Enter a valid email."
/>
```

`onValueChange(value: string)` is a convenience callback alongside standard `onChange(event)`.

---

## Label 🔒

Standalone form label. Renders `*` after text if `required`.

```tsx
<Label htmlFor="email" required description="We'll never share it.">
  Email
</Label>
<input id="email" ... />
```

Also used as the shared text-styling primitive inside Checkbox / Input / Textarea's internal labels — don't reinvent label styles.

---

## ScrollArea 🔒

Custom-thumb scrollbar (native scroll under the hood).

```tsx
<ScrollArea id="tags" orientation="vertical" type="hover" style={{ height: 240, width: 320 }}>
  <div>{lots of content}</div>
</ScrollArea>
```

`orientation: 'vertical' | 'horizontal' | 'both'`, `type: 'auto' | 'hover'`.

---

## Spinner 🔒

Rotating SVG. Used automatically inside Button when `isLoading`.

⚠️ Current implementation is a placeholder. The real design hasn't been delivered yet.

---

## Textarea 🔒

Multi-line text field. Same API surface as Input minus the icon slots.

```tsx
<Textarea
  id="bio"
  label="Bio"
  description="Shown on your profile."
  rows={4}
/>
```

Resize handle sits flush in the bottom-right corner. `resize: vertical` by default.

---

## Tooltip 🔒 + TooltipTrigger + TooltipContent 🧩

Portalled tooltip with directional enter/exit animations.

```tsx
<Tooltip id="save-tip" side="top" delayDuration={400}>
  <TooltipTrigger>
    <Button id="save" label="Save" />
  </TooltipTrigger>
  <TooltipContent>Save your changes</TooltipContent>
</Tooltip>
```

`side: 'top' | 'right' | 'bottom' | 'left'`, `align: 'start' | 'center' | 'end'`, `sideOffset: number`, `delayDuration: number` (open delay in ms).
