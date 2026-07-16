# @ui/lib — token reference

All values in the library come from CSS custom properties defined in the shipped stylesheet. Consumers can reference them directly in their own CSS or JSX inline styles, or override them at any scope.

Import once at app entry:

```tsx
import '@ui/lib/styles.css';
```

Then reference in your own code:

```tsx
<div style={{ padding: 'var(--p-4)', background: 'var(--card)' }}>...</div>
```

Or override for a subtree:

```tsx
<div style={{ '--primary': '#ff0066' } as React.CSSProperties}>
  <Button /* now uses your custom primary */ />
</div>
```

## Theme swap

Set `data-theme` on `<html>` (or any parent) to switch semantic colors between light and dark:

```html
<html data-theme="dark">
```

No provider, no runtime. Every semantic token is re-declared under `:root, [data-theme='light']` and again under `[data-theme='dark']` — everything just cascades.

---

## Categories

### Spacing / sizing

Same numeric scale for padding, width, and height:

```
--p-0     = 0px       --p-3     = 12px      --p-8    = 32px
--p-0-5   = 2px       --p-3-5   = 14px      --p-9    = 36px
--p-1     = 4px       --p-4     = 16px      --p-10   = 40px
--p-1-5   = 6px       --p-5     = 20px      --p-11   = 44px
--p-2     = 8px       --p-6     = 24px      --p-12   = 48px
--p-2-5   = 10px      --p-7     = 28px      --p-14   = 56px
                                             ...through --p-96 (384px)
```

Same scale on `--w-*` (width) and `--h-*` (height).

### Max widths

```
--max-w-xs   = 320px    --max-w-2xl  = 672px
--max-w-sm   = 384px    --max-w-3xl  = 768px
--max-w-md   = 448px    --max-w-4xl  = 896px
--max-w-lg   = 512px    --max-w-5xl  = 1024px
--max-w-xl   = 576px    --max-w-6xl  = 1152px
                        --max-w-7xl  = 1280px
--max-w-screen-sm  = 640px
--max-w-screen-md  = 768px
--max-w-screen-lg  = 1024px
--max-w-screen-xl  = 1280px
--max-w-screen-2xl = 1536px
```

### Typography — sizes

```
--text-xs    = 12px    --text-3xl  = 30px
--text-code  = 13px    --text-4xl  = 36px
--text-sm    = 14px    --text-5xl  = 48px
--text-base  = 16px    --text-6xl  = 60px
--text-lg    = 18px    --text-7xl  = 72px
--text-xl    = 20px    --text-8xl  = 96px
--text-2xl   = 24px    --text-9xl  = 128px
```

### Typography — line heights

```
--leading-3     = 12px    --leading-8   = 32px
--leading-3-5   = 14px    --leading-9   = 36px
--leading-4     = 16px    --leading-10  = 40px
--leading-5     = 20px    --leading-11  = 44px
--leading-6     = 24px
--leading-7     = 28px
```

### Typography — weights + families

```
--font-thin        = 100    --font-medium    = 500
--font-extralight  = 200    --font-semibold  = 600
--font-light       = 300    --font-bold      = 700
--font-normal      = 400    --font-extrabold = 800
                            --font-black     = 900

--font-family        = 'Inter', sans-serif
--font-family-mono   = 'JetBrains Mono', monospace
--font-family-display = 'Inter', sans-serif
```

### Tracking (letter-spacing)

```
--tracking-tighter = -0.05em    --tracking-wide    = 0.025em
--tracking-tight   = -0.025em   --tracking-wider   = 0.05em
--tracking-normal  = 0em        --tracking-widest  = 0.1em
```

### Border widths

```
--border-w-50  = 0.5px    --border-w-200 = 1.33px
--border-w-100 = 1px      --border-w-300 = 2px
                          --border-w-400 = 4px
```

### Border radii

```
--rounded-none = 0px      --rounded-lg  = 8px
--rounded-sm   = 2px      --rounded-xl  = 12px
--rounded      = 4px      --rounded-2xl = 16px
--rounded-md   = 6px      --rounded-3xl = 24px
                          --rounded-full = 9999px
```

### Opacity

```
--o-0  = 0        --o-40  = 0.4     --o-90  = 0.9
--o-5  = 0.05     --o-50  = 0.5     --o-95  = 0.95
--o-10 = 0.1      --o-60  = 0.6     --o-100 = 1
--o-20 = 0.2      --o-70  = 0.7
--o-25 = 0.25     --o-80  = 0.8
--o-30 = 0.3
```

### Shadows

Each shadow token has color pre-baked (theme-aware — the color variables under it shift with the theme). Use directly — no need to add a color:

```
--shadow-2xs  — barely visible
--shadow-xs   — subtle single offset
--shadow-sm   — light double offset
--shadow-default
--shadow-md   — medium (Tooltip uses this)
--shadow-lg
--shadow-xl
--shadow-2xl  — dramatic
```

### Motion

```
--duration-fast    = 100ms      --ease-default        = ease
--duration-normal  = 200ms      --ease-in             = ease-in
--duration-slow    = 300ms      --ease-out            = ease-out
                                --ease-in-out         = ease-in-out
                                --ease-spring         = smooth spring, no overshoot
                                --ease-spring-strong  = spring with slight overshoot / pop

--motion-slide-sm  = 4px        --motion-slide-md     = 8px
--motion-slide-lg  = 12px
```

Springy motion is now tokenized — use `var(--ease-spring)` for the smooth spring feel that Tooltip previously used verbatim, or `var(--ease-spring-strong)` for slight-overshoot animations (the animate-ui "pop" feel).

### Z-index

```
--z-0, --z-10, --z-20, --z-30, --z-40, --z-50, --z-60, --z-70, --z-80, --z-90, --z-100
```

Layer conventions in the library:
- Dropdown menu content: `--z-50`
- Dialog overlay: `--z-50`
- Tooltip: `--z-70` (above everything else)

### Effects

```
--focus-ring-width = 3px       — every focus ring uses this
--overlay-blur     = 4px       — Dialog backdrop-filter blur amount
--tooltip-slide             = back-compat alias for --motion-slide-sm; prefer the generic name
```

---

## Semantic colors (theme-aware)

Every one of these is redefined in `[data-theme='dark']` — swap the theme attr and everything reflows.

### Core

```
--background          — page background
--foreground          — page text
--primary             — primary CTA background
--primary-foreground  — text on primary
--secondary           — secondary CTA background
--secondary-foreground
--muted               — dim background
--muted-foreground    — dim text
--accent              — highlight / hover backgrounds
--accent-foreground
--card                — card background
--card-foreground
--popover             — floating panel background
--popover-foreground
--border              — hairlines / dividers
--input               — form-field border color
--ring                — focused border color
--focus               — focus-ring color (with --focus-ring-width, above)
```

### Status families

Each has a full family: `--{status}`, `--{status}-foreground`, `--{status}-light` (low-opacity background), `--{status}-border`, `--{status}-hover`, `--{status}-ring`, `--{status}-focus`.

```
--error-*     — red
--success-*   — green
--warning-*   — orange
--info-*      — blue
```

### Brand family

```
--brand
--brand-foreground
--brand-secondary-foreground
--brand-light
--brand-border
--brand-hover
--brand-ring
--brand-focus
```

Swap via product-brand scope classes (see below).

### Aiden (AI gradient)

```
--aiden-primary
--aiden-primary-foreground
--aiden-secondary
--aiden-secondary-foreground
--aiden-border
--aiden-hover
--aiden-ring
--aiden-focus
--aiden-outline-*  (bg, hover, border, foreground, hover-foreground)
```

### Category colors (chart / tag palettes)

18 hues, each with `-bg` (10% opacity background) and `-hover`:

```
--category-red, --category-red-bg, --category-red-hover
--category-orange, --category-orange-bg, --category-orange-hover
--category-amber, --category-amber-bg, --category-amber-hover
--category-yellow, --category-yellow-bg, --category-yellow-hover
--category-lime, --category-lime-bg, --category-lime-hover
--category-green, --category-green-bg, --category-green-hover
--category-emerald, --category-emerald-bg, --category-emerald-hover
--category-teal, --category-teal-bg, --category-teal-hover
--category-cyan, --category-cyan-bg, --category-cyan-hover
--category-sky, --category-sky-bg, --category-sky-hover
--category-blue, --category-blue-bg, --category-blue-hover
--category-indigo, --category-indigo-bg, --category-indigo-hover
--category-violet, --category-violet-bg, --category-violet-hover
--category-purple, --category-purple-bg, --category-purple-hover
--category-fuchsia, --category-fuchsia-bg, --category-fuchsia-hover
--category-pink, --category-pink-bg, --category-pink-hover
--category-rose, --category-rose-bg, --category-rose-hover
```

### Gradients

```
--gradient-violet-cyan-emerald
--gradient-purple-rose-amber
--gradient-full-ramp
--text-gradient
--landing-gradient
```

---

## Product brand scopes

Wrap any subtree in one of these classes to remap `--brand-*` onto that product's colors. Every component that uses `variant="brand"` (Button, Badge) picks up the scope automatically — no component-level changes needed.

```
.brand-db     — indigo
.brand-dc     — teal
.brand-dr     — rose
.brand-ec     — cyan
.brand-ir     — blue
.brand-nb     — emerald
.brand-ph     — orange
.brand-rm     — violet
```

Each is redefined for both light and dark themes so brand + theme swap independently.

---

## Overriding tokens locally

Tokens are just CSS variables — override at any scope:

```tsx
<div style={{ '--primary': '#ff0066', '--primary-foreground': '#fff' } as React.CSSProperties}>
  <Button /* Custom primary in this subtree */ />
</div>
```

Or in a stylesheet:

```scss
.custom-brand {
  --primary: #ff0066;
  --primary-foreground: #fff;
  --primary-hover: #cc0055;
}
```

All descendants pick up the override.
