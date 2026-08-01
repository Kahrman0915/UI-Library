/**
 * The deeper-theming recipe — THREE ANCHORS PER BRAND.
 *
 * Lives outside the .stories.tsx file deliberately: every named export from a
 * CSF file is indexed as a story, so exporting POC_CSS from there would have
 * Storybook try to render a string as a component.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE NORTH STAR IS THE MARK.
 *
 * The Figma app marks (🧪 POC — App marks) are not decoration; they turned out
 * to be the brand definition. Each one is a three-stop gradient, and each stop
 * has a distinct job:
 *
 *     HIGHLIGHT   the upper corner. Reaches OUT of the brand's hue family —
 *                 db's indigo opens on teal, ph's orange opens on yellow. It is
 *                 the lightest, airiest colour the brand owns.
 *     MAIN        the body. What a person means when they name the brand.
 *     DEEP        the shadow end. Where the mark grounds itself.
 *
 * Every earlier round of this file tried to theme from ONE number (--primary)
 * and kept running out of room — the wheel is only 360 degrees and eight brands
 * plus the semantics do not fit. Three anchors is not three times the colour, it
 * is three times the STRUCTURE: each anchor has a natural surface it belongs on,
 * so the brand reaches further without any of them fighting.
 *
 *     highlight  ->  tinted surfaces: bands, the rail, secondary panels
 *     main       ->  the accent: CTAs, selection, active nav  (via --primary)
 *     deep       ->  shadow, depth, the dark end of every gradient
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ONE DERIVATION THAT MATTERS.
 *
 * The mark's MAIN stop is a display colour, not a UI colour. Measured with the
 * real label (--primary-foreground, #f8fafc) on it, SIX of the seven fail AA:
 *
 *     dc 3.01   nb 3.11   aiden 3.47   ph 3.50   ec 3.83   rm 3.85   db 4.36
 *
 * So --primary is NOT the main stop. It is the main stop walked down its own hue
 * until the label clears 4.5, keeping every degree of hue and as much chroma as
 * the gamut allows.
 *
 * SOLVE AGAINST THE REAL FOREGROUND, NOT WHITE. The first pass targeted #ffffff
 * and every brand then measured 4.36-4.42 in the audit — a failure. The label is
 * --primary-foreground, which is #f8fafc, about 4% darker than white and worth
 * ~0.2 of ratio. Solving against the actual token clears all seven at 4.62-4.67.
 * The audit caught this; nothing about the values looked wrong by eye.
 *
 * Dark mode needs no such derivation. --primary there carries #0f172a, and every
 * mark's dark main stop already clears it (5.1 to 6.4), so the anchor is raw.
 * That asymmetry is the whole reason the two modes are separate blocks rather
 * than one recipe with a sign flip.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Two color-mix facts that shaped the rest:
 *
 * A custom property CANNOT reference itself — `--background: color-mix(…,
 * var(--background))` is a cycle and resolves to `unset`. The bases below are
 * literals copied from tokens.scss. That is the single biggest ADOPTION cost:
 * real adoption needs a raw neutral layer with the semantics derived from it.
 *
 * `color-mix` AVERAGES alpha, so a translucent token must be rebuilt against
 * `transparent` rather than mixed into.
 *
 * STRUCTURAL WARNING, learned four times: everything below is one template
 * literal, and prose accidentally left OUTSIDE a comment is silently valid-ish
 * CSS that makes the parser discard the declarations after it. Every time, the
 * contrast sweep still reported PASS, because an override that never applied is
 * indistinguishable from one that agrees with the baseline. If you edit this
 * block, re-run the structural check in the commit message.
 */

/** The three anchors, straight off the Figma marks. Light and dark share hue. */
export const BRAND_ANCHORS = {
  db:    { light: ['#17d1e6', '#336bf8', '#300db0'], dark: ['#2de0f6', '#5688fa', '#4335d9'], icon: 'chart-column' },
  nb:    { light: ['#a6d22e', '#1ba44b', '#0d6b51'], dark: ['#acda27', '#1eb152', '#1b7b5e'], icon: 'file-text' },
  dc:    { light: ['#69dd94', '#01a395', '#01748b'], dark: ['#6cf198', '#00ae9f', '#007d96'], icon: 'globe' },
  ec:    { light: ['#02d1cf', '#0186c8', '#0158aa'], dark: ['#00f0ed', '#0091d9', '#0064c3'], icon: 'leaf' },
  ph:    { light: ['#facf33', '#c86f16', '#943c09'], dark: ['#fdd75a', '#d87819', '#a74815'], icon: 'zap' },
  rm:    { light: ['#c677ff', '#e51db9', '#9b1559'], dark: ['#c986fb', '#f721c8', '#b02267'], icon: 'heart' },
  aiden: { light: ['#80bdfa', '#597ef9', '#6815d7'], dark: ['#8dc4fc', '#698cfa', '#7725f0'], icon: 'sparkles' },
} as const;

/**
 * --primary per brand: the MAIN anchor dropped along its own hue until the label
 * (--primary-foreground, #f8fafc) clears 4.5. Solved offline and pinned, because
 * CSS cannot search for a contrast target inside an expression. Re-solve these
 * whenever a mark's main stop changes in Figma.
 */
export const PRIMARY_LIGHT: Record<string, string> = {
  db: '#2f66f3', nb: '#0b8339', dc: '#0b7f74', ec: '#0b78b2',
  ph: '#ac5d09', rm: '#d011a8', aiden: '#4768e1',
};
/** Dark needs no derivation — the raw main anchor already clears dark text. */
export const PRIMARY_DARK: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, v.dark[1]]),
);

export type BrandKey = keyof typeof BRAND_ANCHORS;
export const BRAND_KEYS = Object.keys(BRAND_ANCHORS) as BrandKey[];
/** aiden is a SURFACE, not one of the sub-apps. */
export const SUB_BRANDS = BRAND_KEYS.filter((k) => k !== 'aiden');

/** Per-brand anchor + primary declarations, emitted for every brand and mode. */
function anchorBlocks(): string {
  return BRAND_KEYS.map((k) => {
    const a = BRAND_ANCHORS[k];
    return `[data-theme-poc][data-brand='${k}'][data-mode='light'] {
  --brand-highlight: ${a.light[0]};
  --brand-main:      ${a.light[1]};
  --brand-deep:      ${a.light[2]};
  --primary:         ${PRIMARY_LIGHT[k]};
}
[data-theme-poc][data-brand='${k}'][data-mode='dark'] {
  --brand-highlight: ${a.dark[0]};
  --brand-main:      ${a.dark[1]};
  --brand-deep:      ${a.dark[2]};
  --primary:         ${PRIMARY_DARK[k]};
}`;
  }).join('\n');
}

export const POC_CSS = `
/* ── THE ANCHORS ────────────────────────────────────────────────────────────
   Three literals per brand per mode, and one derived --primary. Everything
   below this point is expressed in terms of these four and nothing else — no
   brand name appears again in the whole stylesheet. That is the test of whether
   the model actually holds: adding an eighth brand is four more lines here and
   zero changes anywhere else. */
${anchorBlocks()}

/* ── LIGHT ──────────────────────────────────────────────────────────────────
   THE PAGE STAYS WHITE. Stated as a declaration rather than an omission so it
   reads as a decision. It also keeps every semantic -light tint composited over
   the surface the system was designed against, which is what makes the whole
   alert family safe without re-derivation. */
[data-theme-poc][data-mode='light'] {
  --background: #ffffff;
  --card:       #ffffff;
  --popover:    #ffffff;

  /* THE HIGHLIGHT IS THE TINT SOURCE. This is the payoff of the three-anchor
     model. Earlier rounds mixed --primary into white and got a starved, muddy
     tint, because a primary is dark by construction — it has to carry white
     text. The highlight anchor is already the light, airy end of the brand, so
     a surface built from it is bright AND saturated at the same time.
     Measured: muted-foreground on these bands reads 6.7-6.9 across all seven
     brands, against the ~6.2 the primary-derived tint managed. */
  --secondary: color-mix(in srgb, var(--brand-highlight) calc(26% * var(--poc-str)), #e2e8f0);
  --accent:    color-mix(in srgb, var(--brand-highlight) calc(32% * var(--poc-str)), #f1f5f9);
  --input:     color-mix(in srgb, var(--brand-highlight) calc(26% * var(--poc-str)), #e2e8f0);
  /* --muted carries the tightest text pairing in the system and CLAUDE.md names
     it. The loss here is small but not tunable — see the audit story. */
  --muted:     color-mix(in srgb, var(--brand-highlight) calc(14% * var(--poc-str)), #cbd5e1);

  /* Borders and rings take MAIN, not the highlight: they are not text
     backgrounds, so there is no contrast budget to protect, and main is the
     colour a person would name if asked what the brand is. */
  --border:       color-mix(in srgb, var(--brand-main) calc(20% * var(--poc-str)), #cbd5e1);
  --border-hover: color-mix(in srgb, var(--brand-main) calc(26% * var(--poc-str)), #64748b);
  --ring:         color-mix(in srgb, var(--brand-main) calc(30% * var(--poc-str)), #94a3b8);

  /* CHROME. The rail is greyed rather than merely lightened — pre-mixing the
     brand into slate drops chroma while keeping the hue readable, so it reads
     as grey leaning the brand's way. A rail that shouts is the loudest tell of
     a cheap theme, and the mark carries identity now so the rail does not have
     to. */
  --poc-rail-stock: color-mix(in srgb, var(--brand-main) 28%, #64748b);
  --sidebar:         color-mix(in srgb, var(--poc-rail-stock) calc(20% * var(--poc-chrome, 0)), #f8fafc);
  --sidebar-border:  color-mix(in srgb, var(--poc-rail-stock) calc(30% * var(--poc-chrome, 0)), #e2e8f0);
  --sidebar-accent:  color-mix(in srgb, var(--poc-rail-stock) calc(34% * var(--poc-chrome, 0)), #f1f5f9);

  /* BAND — the alternating marketing strip, built from the highlight. */
  --poc-band:        color-mix(in srgb, var(--brand-highlight) calc(22% * var(--poc-str)), #ffffff);
  --poc-band-strong: color-mix(in srgb, var(--brand-highlight) calc(42% * var(--poc-str)), #ffffff);
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--brand-main));
}

/* ── DARK ───────────────────────────────────────────────────────────────────
   Dark tints its page: --muted-foreground on --muted sits near 8.3 there
   against light's 5.0, so the headroom exists. The stock is anchored to the
   dark page so the mix moves CHROMA without moving luminance — otherwise every
   surface lifts and the background -> card -> popover ramp flattens. */
[data-theme-poc][data-mode='dark'] {
  --poc-tint: color-mix(in srgb, var(--brand-main) 30%, #0f172a);

  --background: color-mix(in srgb, var(--poc-tint) calc(40% * var(--poc-str)), #0f172a);
  --card:       color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #1e293b);
  --popover:    color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #475569);
  --secondary:  color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #1e293b);
  --accent:     color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #334155);
  --muted:      color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #334155);
  --input:      color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #475569);

  --border:       color-mix(in srgb, var(--brand-main) calc(22% * var(--poc-str)), #64748b);
  --border-hover: color-mix(in srgb, var(--brand-main) calc(28% * var(--poc-str)), #cbd5e1);
  --ring:         color-mix(in srgb, var(--brand-main) calc(30% * var(--poc-str)), #94a3b8);

  /* Dark's rail carries LIGHT foregrounds and dark-mode brand colours are
     LIGHTER than the rail they mix into, so tinting RAISES luminance and eats
     contrast — the opposite direction to light, hence smaller numbers. */
  --poc-rail-stock: color-mix(in srgb, var(--brand-main) 30%, #64748b);
  --sidebar:        color-mix(in srgb, var(--brand-main) calc(26% * var(--poc-chrome, 0)), #1e293b);
  --sidebar-border: color-mix(in srgb, var(--brand-main) calc(32% * var(--poc-chrome, 0)), #334155);
  --sidebar-accent: color-mix(in srgb, var(--brand-main) calc(22% * var(--poc-chrome, 0)), #334155);

  --poc-band:        color-mix(in srgb, var(--brand-deep) calc(34% * var(--poc-str)), #1e293b);
  --poc-band-strong: color-mix(in srgb, var(--brand-deep) calc(54% * var(--poc-str)), #1e293b);
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--brand-main));
}

/* ── GRADIENTS + MARK ───────────────────────────────────────────────────────
   Both are just the three anchors, in order. The mark is the artwork; the hero
   is the same ramp stretched across a page band. Nothing is invented here — if
   the anchors change in Figma, both follow. */
[data-theme-poc] {
  --poc-mark: linear-gradient(140deg,
    var(--brand-highlight) 0%,
    var(--brand-main) 52%,
    var(--brand-deep) 100%);
  --poc-hero: linear-gradient(135deg,
    var(--brand-main) 0%,
    var(--brand-deep) 100%);
  /* Shadows carry the DEEP anchor. A grey shadow under a saturated object reads
     as dirt; one holding the object's own dark end reads as light falling. */
  --poc-shadow-key: color-mix(in srgb, var(--brand-deep) 22%, transparent);
  --poc-shadow-far: color-mix(in srgb, var(--brand-deep) 13%, transparent);
  --poc-shadow-amb: color-mix(in srgb, var(--foreground) 6%, transparent);
}

[data-theme-poc] .poc-mark {
  display: grid;
  place-items: center;
  flex: none;
  border-radius: 22.5%;
  color: #ffffff;
  background-image:
    linear-gradient(180deg, color-mix(in srgb, #ffffff 26%, transparent) 0%, transparent 52%),
    var(--poc-mark);
  box-shadow:
    0 1px 1px var(--poc-shadow-key),
    0 6px 16px var(--poc-shadow-far),
    inset 0 -4px 8px color-mix(in srgb, var(--brand-deep) 30%, transparent),
    inset 0 3px 6px color-mix(in srgb, #ffffff 35%, transparent);
}

[data-theme-poc] .poc-hero { background-image: var(--poc-hero); }
[data-theme-poc] .poc-hero-cta > .ui-button { background-image: var(--poc-hero); }
[data-theme-poc] .poc-band { background: var(--poc-band); }
[data-theme-poc] .poc-band-strong { background: var(--poc-band-strong); }
[data-theme-poc] .poc-rail {
  background-image: linear-gradient(180deg,
    var(--sidebar) 0%,
    color-mix(in srgb, var(--sidebar) 82%, var(--background)) 100%);
  box-shadow: inset -1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent);
}
[data-theme-poc] .ui-card {
  background-image: linear-gradient(180deg,
    color-mix(in srgb, var(--brand-highlight) 4%, transparent) 0%, transparent 42%);
  box-shadow:
    0 1px 1px var(--poc-shadow-amb),
    0 4px 12px var(--poc-shadow-far),
    0 20px 48px var(--poc-shadow-far);
  transition: box-shadow var(--duration-normal) var(--ease-out),
              transform var(--duration-normal) var(--ease-out);
}
[data-theme-poc] .ui-card--interactive:hover {
  transform: translateY(calc(-1 * var(--motion-slide-sm)));
  box-shadow:
    0 1px 1px var(--poc-shadow-amb),
    0 8px 20px var(--poc-shadow-far),
    0 32px 64px var(--poc-shadow-key);
}
@media (prefers-reduced-motion: reduce) {
  /* the global block in tokens.scss collapses DURATIONS only, so a transform
     would still teleport */
  [data-theme-poc] .ui-card--interactive:hover { transform: none; }
}
[data-theme-poc] .poc-display { letter-spacing: var(--tracking-tight); }
[data-theme-poc] .poc-stat {
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
  background-image: var(--poc-hero);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
`.trim();
