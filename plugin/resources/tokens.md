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

## Mode swap (light / dark)

Set **`data-mode`** on `<html>` — *not* `data-theme`, which is the sub-brand axis:

```html
<html data-mode="dark">
```

No provider, no runtime. Every semantic token is re-declared under `:root, [data-mode='light']` and again under `[data-mode='dark']` — everything just cascades. `<ModeToggler>` owns this attribute.

See **The three axes** below for how mode, theme and surface compose.

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

Every one of these is redefined in `[data-mode='dark']` — flip that attribute and everything reflows.

**Note the attribute names.** `data-mode` is light/dark. `data-theme` is the sub-brand, and it remaps only `--primary` and its derived family. `data-surface="aiden"` is the AI identity. They are three independent axes; nothing here is a class name.

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

### Derived `--primary` family

**There is no `--brand` token.** That model was removed — `--primary` *is* the current theme's colour, and the main brand is the absence of `data-theme`.

```
--primary            — the theme's colour (neutral slate with no data-theme)
--primary-foreground — text on a solid --primary fill
--primary-text       — --primary as TEXT on a light surface (see below)
--primary-light      — 6% tint, for surfaces (Alert backgrounds, ghost-hover)
--primary-soft       — visible tint, ONLY for the filled `secondary` button
--primary-border
--primary-hover
--primary-ring
--primary-focus
```

**`--primary-text` vs `--primary` is the one that catches people out.** Use `--primary-text` whenever the theme colour is *text* on a light or subtle surface — outline / link / secondary button labels, `Badge variant="outline"`, brand Alert and Banner titles. It nudges the colour toward the mode's text colour so mid-luminance themes clear WCAG AA. **Solid fills keep raw `--primary`**, because they pair with `--primary-foreground`, which already passes.

`--primary-light` vs `--primary-soft`: `-light` is the subtle 6% tint for surfaces and was tuned for AA text-on-tint; `-soft` is the visible tint used *only* by the filled `secondary` button, so `secondary` reads distinctly from `outline`. Don't swap them.

### Aiden — the AI surface (`data-surface='aiden'`)

A **gradient** identity, which is why it can't be a theme: a gradient can't be the single scalar `--primary` that also has to work as a border and as text.

```
--aiden-primary          — the violet → blurple → blue GRADIENT fill
--aiden-hover            — hover gradient
--aiden-outline-border   — the solid "blurple" (#5a37e6 light / #9076f9 dark)
--aiden-secondary        — low-alpha tint for the secondary button
--aiden-secondary-border
--aiden-ring
--aiden-focus
```

`data-surface='aiden'` remaps `--primary` to the solid blurple, so every *scalar* consumer (borders, focus rings, checked controls) follows for free. Anywhere `--primary` is a **background fill**, the component overrides it with the gradient — 10 components do this. Ghost stays neutral slate, the same carve-out the brand themes have.

### Category colours (chart / tag palettes)

**15 hues** (yellow and lime were removed). Each has three members, plus one global foreground:

```
--category-{hue}        — the VIVID fill: charts, dots, a solid badge
--category-{hue}-bg     — the soft tag tint (0.1 light / 0.15 dark)
--category-{hue}-text   — AA-safe text ON that tint
--category-foreground   — text on the vivid solid fill (white light / #0f172a dark)
```

Hues: `red · orange · amber · green · emerald · teal · cyan · sky · blue · indigo · violet · purple · fuchsia · pink · rose`

**Never use raw `--category-{hue}` as small text on its own tint** — that pairing fails AA for every hue in light mode. Use `-text`. The 15 `-text`-on-`-bg` pairings are gated by `npm run test:contrast`; the solid badge is deliberately best-effort and not gated.

There is also a `-hover` member per hue, kept for palette completeness but **currently unused** by any component.

### Gradients

```
--gradient-violet-cyan-emerald
--gradient-purple-rose-amber
--gradient-full-ramp
--text-gradient
--landing-gradient
```

---

## The three axes

Nothing here is a class name, and none of it needs a provider.

```html
<html data-mode="dark">            <!-- 1 · light / dark -->
  <section data-theme="db">        <!-- 2 · sub-brand accent -->
    <aside data-surface="aiden">   <!-- 3 · the AI identity -->
```

**Theme codes** — each remaps only `--primary` / `--primary-foreground`; the derived family follows via `color-mix`:

```
data-theme="db"   — indigo      data-theme="ir"   — blue
data-theme="dc"   — teal        data-theme="nb"   — emerald
data-theme="dr"   — rose        data-theme="ph"   — orange
data-theme="ec"   — cyan        data-theme="rm"   — violet
```

The **main brand is the absence of `data-theme`** — `--primary` stays neutral slate. Every palette is defined for both modes, so mode and theme swap independently.

**What does NOT move with a theme:** `--secondary` / `--muted` / `--border` chrome, the `Tooltip` tokens, the `--sidebar-*` surface, and the `ghost` button style. Those are deliberate carve-outs so quiet UI never competes with the accent.

---

## Code block palette

`--code-block` plus an 11-token syntax palette, darkened in 2026-07 so every token clears AA on the block background in **both** modes:

```
--code-keyword  --code-string   --code-comment  --code-function  --code-number
--code-variable --code-type     --code-built-in --code-attr      --code-selector --code-tag
```

`--code-attr` is amber rather than orange specifically so it stays distinct from `--code-number` in both modes.

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
.custom-accent {
  --primary: #ff0066;
  --primary-foreground: #fff;
  --primary-hover: #cc0055;
}
```

All descendants pick up the override.
