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
 *     PRIMARY     the body. What a person means when they name the brand — and
 *                 literally --primary, the same value the CTA is painted with.
 *     DEEP        the shadow end. Where the mark grounds itself, and the source
 *                 every tinted surface is built from.
 *
 * Every earlier round of this file tried to theme from ONE number and kept
 * running out of room — the wheel is only 360 degrees and eight brands plus the
 * semantics do not fit. Three anchors is not three times the colour, it is three
 * times the STRUCTURE: each anchor has a natural home, so the brand reaches
 * further without any of them fighting.
 *
 *     highlight  ->  --primary-highlight. Gradients, marketing bubbles, and
 *                    small non-text accents (a status dot). NEVER behind text.
 *     primary    ->  --primary itself, which feeds the whole existing family in
 *                    tokens.scss: -hover, -light, -soft, -border, -ring, -focus,
 *                    -text. Those are color-mix over var(--primary), so setting
 *                    the one value re-derives all seven for free.
 *     deep       ->  --primary-deep. The slate surfaces (background, card,
 *                    popover, secondary, accent, muted, input, the rail, bands)
 *                    plus shadow.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE COLOUR, NOT TWO. This is the change that shaped the file.
 *
 * The middle anchor USED to be "main", and --primary was a second, slightly
 * darker value derived from it — because a mark's mid stop is a display colour
 * and, measured with a LIGHT label (#f8fafc), six of the seven failed AA:
 *
 *     dc 3.01   nb 3.11   aiden 3.47   ph 3.50   ec 3.83   rm 3.85   db 4.36
 *
 * Two colours a few percent apart is a smell, so it is gone. --primary IS the
 * middle anchor. The contrast is paid for on the OTHER side instead: each brand
 * declares its own --primary-foreground, and for six of seven that is the DARK
 * label. Measured that way the same anchors clear comfortably:
 *
 *     dc 5.67   nb 5.49   aiden 4.91   ph 4.88   ec 4.51   rm 4.51   db 4.51
 *
 * db is the exception and keeps the light label: blue is the darkest hue at full
 * chroma, so it is the one that can carry white. That is not an inconsistency to
 * paper over — it is exactly the job --primary-foreground exists to do.
 *
 * Three middles moved to get there, in LIGHTNESS ONLY, all under 1 ΔE. The
 * alternative — keep a light label everywhere — needs nb and dc to fall 12 L*,
 * which visibly deepens those marks. Both sets are exported so the choice can be
 * looked at side by side; see WHITE_LABEL_PRIMARY.
 *
 * Dark mode needed nothing: --primary-foreground is #0f172a there already, and
 * every dark middle clears it at 5.1-6.4.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SURFACES COME FROM DEEP, AND THEY MOVE ONLY SLIGHTLY. An earlier pass built the
 * light surfaces from the HIGHLIGHT anchor, on the reasoning that a light surface
 * wants a light source colour. It measured well and looked wrong: a highlight is
 * the brightest, most saturated colour the brand owns, so a panel built from it
 * announces itself. Sub-apps are supposed to feel like one suite — the surface
 * should COMPLEMENT the accent, not compete with it.
 *
 * So the tint source is the deep anchor, desaturated toward slate first (the
 * --surface-tint stock) and then applied at single digits. The target is a
 * surface that shifts ~4-8 dE00 off the neutral: you can see it when a brand
 * sits next to another brand, and you never read it as "a coloured page". Deep
 * also has the property that makes this cheap — it is high-chroma, so a few
 * percent buys real hue, and the luminance cost stays small.
 *
 * The same rule runs in BOTH modes, which the earlier pass did not manage (it was
 * highlight in light and main in dark, an inconsistency nobody had decided on).
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

/**
 * The three anchors, straight off the Figma marks: [highlight, PRIMARY, deep].
 * `on` is that brand's --primary-foreground — see ONE COLOUR above for why it
 * varies per brand instead of being one value for the whole system.
 *
 * Three light middles were nudged in LIGHTNESS ONLY so the label clears 4.5.
 * Hue and chroma are untouched, and every move is under 1 ΔE — invisible beside
 * the original, which is the point. Figma needs the same three:
 *
 *     db  #336bf8 -> #2e69f5   (-0.9 L*, ΔE 0.9)   carries the light label
 *     ec  #0186c8 -> #0587c9   (+0.3 L*, ΔE 0.3)   carries the dark label
 *     rm  #e51db9 -> #e720ba   (+0.5 L*, ΔE 0.5)   carries the dark label
 */
export const BRAND_ANCHORS = {
  db:    { light: ['#17d1e6', '#2e69f5', '#300db0'], dark: ['#2de0f6', '#5688fa', '#4335d9'], on: { light: '#f8fafc', dark: '#0f172a' }, icon: 'chart-column' },
  nb:    { light: ['#a6d22e', '#1ba44b', '#0d6b51'], dark: ['#acda27', '#1eb152', '#1b7b5e'], on: { light: '#0f172a', dark: '#0f172a' }, icon: 'file-text' },
  dc:    { light: ['#69dd94', '#01a395', '#01748b'], dark: ['#6cf198', '#00ae9f', '#007d96'], on: { light: '#0f172a', dark: '#0f172a' }, icon: 'globe' },
  ec:    { light: ['#02d1cf', '#0587c9', '#0158aa'], dark: ['#00f0ed', '#0091d9', '#0064c3'], on: { light: '#0f172a', dark: '#0f172a' }, icon: 'leaf' },
  ph:    { light: ['#facf33', '#c86f16', '#943c09'], dark: ['#fdd75a', '#d87819', '#a74815'], on: { light: '#0f172a', dark: '#0f172a' }, icon: 'zap' },
  rm:    { light: ['#c677ff', '#e720ba', '#9b1559'], dark: ['#c986fb', '#f721c8', '#b02267'], on: { light: '#0f172a', dark: '#0f172a' }, icon: 'heart' },
  aiden: { light: ['#80bdfa', '#597ef9', '#6815d7'], dark: ['#8dc4fc', '#698cfa', '#7725f0'], on: { light: '#0f172a', dark: '#0f172a' }, icon: 'sparkles' },
} as const;

/** --primary IS the middle anchor now. No derivation, no second colour. */
export const PRIMARY_LIGHT: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, v.light[1]]),
);
export const PRIMARY_DARK: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, v.dark[1]]),
);

/**
 * THE ALTERNATIVE, kept so the choice can be looked at rather than argued about.
 *
 * If every brand must keep a LIGHT label on its CTA — the look the library ships
 * today — then the middle anchor has to fall until white clears 4.5, and for the
 * bright hues that is a long way down: nb -11.5 L*, dc -12.6 L*. The marks would
 * visibly deepen through the middle. These are those values.
 */
export const WHITE_LABEL_PRIMARY: Record<string, string> = {
  db: '#2f66f3', nb: '#0b8339', dc: '#0b7f74', ec: '#0b78b2',
  ph: '#ac5d09', rm: '#d011a8', aiden: '#4768e1',
};

export type BrandKey = keyof typeof BRAND_ANCHORS;
export const BRAND_KEYS = Object.keys(BRAND_ANCHORS) as BrandKey[];
/** aiden is a SURFACE, not one of the sub-apps. */
export const SUB_BRANDS = BRAND_KEYS.filter((k) => k !== 'aiden');

/** Per-brand anchor + primary declarations, emitted for every brand and mode. */
function anchorBlocks(): string {
  return BRAND_KEYS.map((k) => {
    const a = BRAND_ANCHORS[k];
    return `[data-theme-poc][data-brand='${k}'][data-mode='light'] {
  --primary-highlight:  ${a.light[0]};
  --primary:            ${a.light[1]};
  --primary-deep:       ${a.light[2]};
  --primary-foreground: ${a.on.light};
}
[data-theme-poc][data-brand='${k}'][data-mode='dark'] {
  --primary-highlight:  ${a.dark[0]};
  --primary:            ${a.dark[1]};
  --primary-deep:       ${a.dark[2]};
  --primary-foreground: ${a.on.dark};
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

  /* THE TINT STOCK — the deep anchor, greyed. Deep alone is high-chroma AND
     uneven across brands (db sits at C96, dc at C28), so mixing it raw makes
     some brands read tinted while others do not. Pre-mixing 40% slate-600
     compresses both chroma and lightness toward a common point, so one
     percentage below produces a comparable shift for every brand.
     Deep, not highlight: the surface must sit UNDER the accent, not beside it. */
  --surface-tint: color-mix(in srgb, var(--primary-deep) 60%, #475569);

  /* SLIGHT, ON PURPOSE. Each surface lands 4-8 dE00 off its neutral base — the
     range where a brand is legible against another brand but never legible as
     "a coloured panel". Percentages differ per token only because the bases do:
     --accent is the near-white row-hover surface and can take the most; --muted
     is the darkest and carries the system's tightest muted-text pairing, so it
     takes the least. Worst muted-foreground reading across all seven brands:
     accent 5.61, secondary/input 5.19, muted 4.56 — all above AA, against
     baselines of 6.92 / 6.15 / 5.10. */
  --accent:    color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #f1f5f9);
  --secondary: color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc-str)), #e2e8f0);
  --input:     color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc-str)), #e2e8f0);
  --muted:     color-mix(in srgb, var(--surface-tint) calc(7%  * var(--poc-str)), #cbd5e1);

  /* Lines take --primary itself, not the deep stock: they are not text
     backgrounds, so there is no contrast budget to protect, and a line agreeing
     with the accent is the point. */
  --border:       color-mix(in srgb, var(--primary) calc(20% * var(--poc-str)), #cbd5e1);
  --border-hover: color-mix(in srgb, var(--primary) calc(26% * var(--poc-str)), #64748b);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);

  /* CHROME. The rail is a surface, so it takes the same stock at the same order
     of magnitude — no second recipe. A rail that shouts is the loudest tell of a
     cheap theme, and the mark carries identity now so the rail does not have to. */
  --sidebar:         color-mix(in srgb, var(--surface-tint) calc(9%  * var(--poc-chrome, 0)), #f8fafc);
  --sidebar-border:  color-mix(in srgb, var(--surface-tint) calc(14% * var(--poc-chrome, 0)), #e2e8f0);
  --sidebar-accent:  color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-chrome, 0)), #f1f5f9);

  /* BAND — the alternating marketing strip. Same stock, same restraint: a band
     is still a surface people read on. It is allowed to be the loudest of them
     because it is a deliberate strip rather than page chrome, and even then
     band-strong only reaches ~9 dE00 off white. */
  --poc-band:        color-mix(in srgb, var(--surface-tint) calc(7%  * var(--poc-str)), #ffffff);
  --poc-band-strong: color-mix(in srgb, var(--surface-tint) calc(13% * var(--poc-str)), #ffffff);
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--primary));
}

/* ── DARK ───────────────────────────────────────────────────────────────────
   Same rule, same anchor, same order of magnitude. Dark DOES tint its page —
   there is no white-page carve-out here — but the shift is the same 3-8 dE00
   the light surfaces take, so the two modes read as one system rather than two
   recipes. Dark has far more headroom (muted text on --muted is 8.4 against
   light's 5.1) and deliberately does not spend it. */
[data-theme-poc][data-mode='dark'] {
  /* Greyed toward slate-500 rather than slate-600: the dark deep anchors are
     lighter than their light counterparts, and a mid-slate keeps the stock from
     collapsing into the page it is about to tint. */
  --surface-tint: color-mix(in srgb, var(--primary-deep) 60%, #64748b);

  --background: color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #0f172a);
  --card:       color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #1e293b);
  --popover:    color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #475569);
  --secondary:  color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #1e293b);
  --accent:     color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #334155);
  --muted:      color-mix(in srgb, var(--surface-tint) calc(10% * var(--poc-str)), #334155);
  --input:      color-mix(in srgb, var(--surface-tint) calc(12% * var(--poc-str)), #475569);

  --border:       color-mix(in srgb, var(--primary) calc(22% * var(--poc-str)), #64748b);
  --border-hover: color-mix(in srgb, var(--primary) calc(28% * var(--poc-str)), #cbd5e1);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);

  --sidebar:        color-mix(in srgb, var(--surface-tint) calc(14% * var(--poc-chrome, 0)), #1e293b);
  --sidebar-border: color-mix(in srgb, var(--surface-tint) calc(18% * var(--poc-chrome, 0)), #334155);
  --sidebar-accent: color-mix(in srgb, var(--surface-tint) calc(14% * var(--poc-chrome, 0)), #334155);

  --poc-band:        color-mix(in srgb, var(--surface-tint) calc(16% * var(--poc-str)), #1e293b);
  --poc-band-strong: color-mix(in srgb, var(--surface-tint) calc(26% * var(--poc-str)), #1e293b);
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--primary));
}

/* ── GRADIENTS + MARK ───────────────────────────────────────────────────────
   Both are just the three anchors, in order. The mark is the artwork; the hero
   is the same ramp stretched across a page band. Nothing is invented here — if
   the anchors change in Figma, both follow. */
[data-theme-poc] {
  /* The scope declares its own text colour. Without this the subtree INHERITS
     whatever colour the surrounding page had — and since a POC scope carries its
     own data-mode, a dark demo sitting on a light Storybook page inherited light
     text and rendered #0f172a on a near-black shell. Only elements that set a
     colour of their own (the components) looked right, which is exactly the kind
     of half-correct that survives a screenshot. */
  color: var(--foreground);

  --poc-mark: linear-gradient(140deg,
    var(--primary-highlight) 0%,
    var(--primary) 52%,
    var(--primary-deep) 100%);
  --poc-hero: linear-gradient(135deg,
    var(--primary) 0%,
    var(--primary-deep) 100%);
  /* Shadows carry the DEEP anchor. A grey shadow under a saturated object reads
     as dirt; one holding the object's own dark end reads as light falling. */
  --poc-shadow-key: color-mix(in srgb, var(--primary-deep) 22%, transparent);
  --poc-shadow-far: color-mix(in srgb, var(--primary-deep) 13%, transparent);
  --poc-shadow-amb: color-mix(in srgb, var(--foreground) 6%, transparent);

  /* THE BUBBLE FIELD — where the highlight earns its own token. Two soft radial
     washes, highlight in one corner and primary in the other, over whatever
     surface is underneath. Nothing is read ON a bubble (they sit behind a
     centred column), so the highlight is free here in a way it never is on a
     panel: this is the one place the brand gets to be as bright as the mark.
     Alpha is what keeps it safe — the wash is 22%/16% of the anchor, so it
     tints the page rather than replacing it, and the same declaration works on
     a white light page and a tinted dark one. */
  --poc-bubble:
    radial-gradient(80% 62% at 12% 0%,
      color-mix(in srgb, var(--primary-highlight) calc(22% * var(--poc-str)), transparent) 0%,
      transparent 68%),
    radial-gradient(72% 58% at 92% 12%,
      color-mix(in srgb, var(--primary) calc(16% * var(--poc-str)), transparent) 0%,
      transparent 66%);
}

/* Small NON-TEXT accents may take the highlight raw — a status dot, a chart
   point, a 2px rule. The rule for reaching for --primary-highlight is simply
   whether anything is read on top of it; if something is, it is the wrong
   token and --primary (or --primary-text) is the right one. */
[data-theme-poc] .poc-dot { background: var(--primary-highlight); }
[data-theme-poc] .poc-bubble-field { background-image: var(--poc-bubble); }

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
    inset 0 -4px 8px color-mix(in srgb, var(--primary-deep) 30%, transparent),
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
/* The card carries NO brand fill. It used to take a 4% highlight sheen down its
   top edge; that is a surface people read on, so under the deep-only rule it
   goes. Depth comes from the shadows instead — which are the deep anchor, so the
   card is still lit by the brand without being coloured by it. */
[data-theme-poc] .ui-card {
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
