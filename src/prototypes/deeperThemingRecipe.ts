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
 * --primary IS THE MARK'S MIDDLE STOP — UNLESS A BRAND SAYS OTHERWISE.
 *
 * Six of the seven take the middle anchor directly. aiden authors its own
 * (`primary: { light, dark }` on its entry), and that is a supported shape
 * rather than a special case: the mark is display art with no contrast
 * constraint, --primary is a UI colour, and once in a while a brand wants them
 * to be genuinely different colours.
 *
 * This is NOT the two-value model removed below. That one had --primary sitting
 * a few percent off the middle for no reason a consumer could see — a
 * derivation artifact. aiden's is an 8.6 dE00 gap someone chose: the mark stays
 * violet (#7737e5, hue 309, chroma 100) because that is the AI identity, and
 * the accent is a calmer indigo (#5a56d3, hue 300, chroma 74) because a violet
 * that saturated is too much on every button, chip and progress bar.
 *
 * The test for adding another: can you SEE the difference, and can you say why
 * in one sentence? If not, it is drift, and the brand should just use its
 * middle stop.
 *
 * ONE COLOUR, ONE LABEL. This is the change that shaped the file.
 *
 * The middle anchor USED to be "main", with --primary a second, slightly darker
 * value derived from it — because a mark's mid stop is a display colour and did
 * not clear AA under a label. Two colours a few percent apart is a smell, so it
 * is gone: --primary IS the middle anchor.
 *
 * An intermediate pass paid for the contrast on the label side instead, giving
 * six brands a DARK --primary-foreground and db a light one. It measured fine and
 * it was a worse system: the CTA's label flipped colour depending on which
 * sub-app you were in, for reasons no consumer could see.
 *
 * So the marks moved instead. Each light middle came down its own hue — chroma
 * and hue untouched — to the lightest value where PURE WHITE clears 4.5, and
 * every brand now carries #ffffff. Measured on the shipped anchors:
 *
 *     db 4.57   nb 4.53   dc 4.53   rm 4.52   ec 4.51   ph 4.50   aiden 4.50
 *
 * SOLVE AGAINST #ffffff, NOT #f8fafc. Every theme scope in tokens.scss sets
 * --{code}-primary-foreground to pure white; #f8fafc is only the un-themed base,
 * which no branded button ever renders. An earlier solve used the base and came
 * out over-darkened. Check the scope, not the default.
 *
 * SOLVE AGAINST THE ROUNDED HEX. Stepping L* down until the float clears 4.5
 * produced #00867a (4.48) and #dc01b0 (4.49) — both fail once written as 8-bit.
 * Round inside the search loop.
 *
 * db needed no move at all; nb and dc gave up ~10 L*. The owner then re-cut the
 * DEEP stops by hand so the marks kept their depth, and those hand values are
 * what ships below — they are not derived from anything and should not be
 * "recomputed". Verified harmless to the rest of the system: because deep only
 * reaches the surfaces through a 60%-slate stock applied at single digits, the
 * re-cut moves every tinted surface by 0.0-0.6 dE00 and muted-text contrast by
 * at most 0.05.
 *
 * Dark mode is untouched and still takes the DARK label: its middles are light
 * by construction (#5688fa and friends), white on them reads 2.66-3.34, and
 * #0f172a clears at 5.1-6.4. Light carries white, dark carries ink — which is
 * what every other token in the system already does.
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
 * `on` is --primary-foreground: pure white in light for every brand, ink in dark.
 *
 * Read from the POC page's "08 · Marks — white-safe primary" bottom row, which is
 * where the middles were solved and the deeps re-cut by hand. The mark MASTERS on
 * that page still hold the pre-solve values — this file is ahead of them.
 *
 * Do not regenerate these. The middles are a contrast solve and the deeps are a
 * design judgement. Two highlights also moved by hand: nb pulled greener to sit
 * with its new middle, db opened to a brighter cyan.
 *
 * ADJACENCY IS A DECISION HERE, NOT A DEFECT. Three of the seven deeps sit in
 * the same blue family, and that is deliberate:
 *
 *   db and aiden share the deep EXACTLY (#1d43a9), so their surfaces are
 *   byte-identical. The owner's reasoning: those two applications sit inside
 *   each other constantly, and a surface that shifts as you cross that boundary
 *   is noise, not information.
 *
 *   ec was then pulled away from both (#014c93 -> #01416b, -6 L*, -13 hue) to
 *   keep the blues from collapsing into one. That took ec closer to dc
 *   (surfaces 1.7 -> 1.2 dE00) — accepted, because dc and ec do not embed in
 *   each other the way db and aiden do.
 *
 * So do NOT "fix" a small surface distance by measurement alone. Which pairs
 * are allowed to look alike is a product question about which apps sit side by
 * side, and only the owner can answer it.
 *
 * KNOWN, OPEN: aiden's mark has almost no LIGHTNESS travel below the highlight
 * — middle L* 32.6 to deep L* 32.2, half a point. It is not a flat gradient (chroma runs 112 to
 * 64, so it reads as a saturation fade, and the glass overlay supplies its own
 * lighting) but it is the only mark in the set with no light-falloff, against
 * 9.5-23.6 L* everywhere else. Fixing it means lowering the SHARED db/aiden
 * deep, which moves db too — hence not done unilaterally.
 */
export const BRAND_ANCHORS = {
  db:    { light: ['#1ee8fe', '#336bf8', '#1d43a9'], dark: ['#2de0f6', '#5688fa', '#4335d9'], on: { light: '#ffffff', dark: '#0f172a' }, icon: 'chart-column' },
  nb:    { light: ['#83d22e', '#00893a', '#0d6b5e'], dark: ['#acda27', '#1eb152', '#1b7b5e'], on: { light: '#ffffff', dark: '#0f172a' }, icon: 'file-text' },
  dc:    { light: ['#69dd94', '#00857a', '#00627a'], dark: ['#6cf198', '#00ae9f', '#007d96'], on: { light: '#ffffff', dark: '#0f172a' }, icon: 'globe' },
  ec:    { light: ['#02d1cf', '#007dbc', '#01416b'], dark: ['#00f0ed', '#0091d9', '#0064c3'], on: { light: '#ffffff', dark: '#0f172a' }, icon: 'leaf' },
  ph:    { light: ['#facf33', '#b66000', '#943c09'], dark: ['#fdd75a', '#d87819', '#a74815'], on: { light: '#ffffff', dark: '#0f172a' }, icon: 'zap' },
  rm:    { light: ['#c677ff', '#db01b0', '#9d1647'], dark: ['#c986fb', '#f721c8', '#b02267'], on: { light: '#ffffff', dark: '#0f172a' }, icon: 'heart' },
  aiden: { light: ['#80bdfa', '#7737e5', '#1d43a9'], dark: ['#8dc4fc', '#698cfa', '#7725f0'], on: { light: '#ffffff', dark: '#0f172a' }, primary: { light: '#5a56d3', dark: '#8b82f6' }, icon: 'sparkles' },
} as const;

/** --primary IS the middle anchor. No derivation, no second colour. */
export const PRIMARY_LIGHT: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, ('primary' in v ? v.primary.light : v.light[1])]),
);
export const PRIMARY_DARK: Record<string, string> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, ('primary' in v ? v.primary.dark : v.dark[1])]),
);
/** True where the UI accent is authored apart from the mark's middle stop. */
export const PRIMARY_IS_AUTHORED: Record<string, boolean> = Object.fromEntries(
  Object.entries(BRAND_ANCHORS).map(([k, v]) => [k, 'primary' in v]),
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
  --primary-highlight:  ${a.light[0]};
  --mark-mid:           ${a.light[1]};
  --primary:            ${PRIMARY_LIGHT[k]};
  --primary-deep:       ${a.light[2]};
  --primary-foreground: ${a.on.light};
}
[data-theme-poc][data-brand='${k}'][data-mode='dark'] {
  --primary-highlight:  ${a.dark[0]};
  --mark-mid:           ${a.dark[1]};
  --primary:            ${PRIMARY_DARK[k]};
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

  /* LINES ARE MOSTLY SLATE. They carry no contrast budget, so an earlier pass
     spent freely here — 20-26% of --primary — and the result was a page whose
     every hairline announced the brand. Halved: a border should read as the
     system's slate with the brand only just visible in it. Measured chroma
     across the seven brands drops 6-27 to 1-16, and dE00 off plain #cbd5e1
     drops 8.8-19.7 to 4.7-13.4.

     --ring is DELIBERATELY LEFT ALONE. It is the focus indicator, not chrome:
     WCAG 1.4.11 wants it to stand out from its surroundings, and it is the one
     line on the page whose whole job is to be noticed. Dulling it toward slate
     would make it agree with the border it sits next to. */
  --border:       color-mix(in srgb, var(--primary) calc(5% * var(--poc-str)), #cbd5e1);
  --border-hover: color-mix(in srgb, var(--primary) calc(8% * var(--poc-str)), #64748b);
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

  /* Same step as light; --ring again left at full strength. */
  --border:       color-mix(in srgb, var(--primary) calc(6% * var(--poc-str)), #64748b);
  --border-hover: color-mix(in srgb, var(--primary) calc(8% * var(--poc-str)), #cbd5e1);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);

  --sidebar:        color-mix(in srgb, var(--surface-tint) calc(14% * var(--poc-chrome, 0)), #1e293b);
  --sidebar-border: color-mix(in srgb, var(--surface-tint) calc(18% * var(--poc-chrome, 0)), #334155);
  --sidebar-accent: color-mix(in srgb, var(--surface-tint) calc(14% * var(--poc-chrome, 0)), #334155);

  --poc-band:        color-mix(in srgb, var(--surface-tint) calc(16% * var(--poc-str)), #1e293b);
  --poc-band-strong: color-mix(in srgb, var(--surface-tint) calc(26% * var(--poc-str)), #1e293b);
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--primary));
}

/* ── GRADIENTS + MARK ───────────────────────────────────────────────────────
   Just the three anchors, in order. The mark is the artwork; the hero is the
   same ramp stretched across a page band. Nothing is invented here — if the
   anchors change in Figma, both follow.

   THESE READ --mark-mid, NOT --primary. For six brands the two are the same
   value and it makes no difference. For aiden they are 9.2 dE00 apart, and
   using --primary here would drag the mark's violet toward the UI indigo — i.e.
   it would undo the entire reason the two were split. Caught exactly that way:
   the first cut of the split left var(--primary) in this block and the aiden
   mark silently turned indigo while every measurement still passed. */
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
    var(--mark-mid) 52%,
    var(--primary-deep) 100%);
  --poc-hero: linear-gradient(135deg,
    var(--mark-mid) 0%,
    var(--primary-deep) 100%);
  /* Shadows carry the DEEP anchor, GREYED. A grey shadow under a saturated
     object reads as dirt, so the brand's own dark end is still in there — but
     the raw deep put a visibly coloured wash under every card. Pre-mixing into
     slate-700 keeps the direction and drops the saturation: chroma across the
     seven falls 25-107 to 5-38. Aiden is the one that stays high, because its
     deep starts at chroma 107 — four times anything else in the set.

     The WEIGHT is unchanged, which is the point of mixing into a slate of
     almost the same lightness rather than just lowering the alpha. Measured
     over a white card the key shadow reads 1.46-1.49 against the page, where
     the raw deep read 1.40-1.55 — same depth, and tighter across brands. */
  --poc-shadow-stock: color-mix(in srgb, var(--primary-deep) 20%, #334155);
  --poc-shadow-key: color-mix(in srgb, var(--poc-shadow-stock) 22%, transparent);
  --poc-shadow-far: color-mix(in srgb, var(--poc-shadow-stock) 13%, transparent);
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
      color-mix(in srgb, var(--mark-mid) calc(16% * var(--poc-str)), transparent) 0%,
      transparent 66%);
}

/* Small NON-TEXT accents may take the highlight raw — a status dot, a chart
   point, a 2px rule. The rule for reaching for --primary-highlight is simply
   whether anything is read on top of it; if something is, it is the wrong
   token and --primary (or --primary-text) is the right one. */
/* ── THE SUITE RAMP ─────────────────────────────────────────────────────────
   The parent brand is not a colour, it is the SET. These two are the only
   things in the file that use every brand at once, and they belong on the
   suite's own page — never inside a sub-app, where the point is that one brand
   is in charge.

   Ordered around the wheel (ph -> nb -> dc -> ec -> db -> aiden -> rm) rather
   than alphabetically, so the ramp reads as a spectrum instead of a list. The
   values are the light PRIMARIES: the deeps would go muddy where they meet and
   the highlights cannot carry text.

   Light and dark are separate blocks because dark needs the dark primaries —
   using the light set on a dark page gives a ramp that reads almost black at
   the ph end. */
[data-theme-poc][data-mode='light'] .poc-suite-ramp,
[data-theme-poc][data-mode='light'] .poc-suite-text {
  --poc-ramp: linear-gradient(100deg,
    #b66000 0%, #00893a 17%, #00857a 33%, #007dbc 50%, #336bf8 67%, #5a56d3 83%, #db01b0 100%);
}
[data-theme-poc][data-mode='dark'] .poc-suite-ramp,
[data-theme-poc][data-mode='dark'] .poc-suite-text {
  --poc-ramp: linear-gradient(100deg,
    #d87819 0%, #1eb152 17%, #00ae9f 33%, #0091d9 50%, #5688fa 67%, #8b82f6 83%, #f721c8 100%);
}
[data-theme-poc] .poc-suite-ramp { background-image: var(--poc-ramp); }
[data-theme-poc] .poc-suite-text {
  background-image: var(--poc-ramp);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* the clip leaves no painted background for a focus ring or selection to sit
     on, so keep this on display type only — never on a control */
}

/* The suite bubble field: one wash per brand instead of one brand's two. Same
   alpha budget as the single-brand field, spread across six corners, so the
   page reads as "all of them" without any one of them winning. */
[data-theme-poc][data-mode='light'] .poc-suite-bubbles {
  background-image:
    radial-gradient(46% 52% at 10% 4%,  color-mix(in srgb, #007dbc 20%, transparent) 0%, transparent 70%),
    radial-gradient(42% 48% at 34% 0%,  color-mix(in srgb, #00857a 17%, transparent) 0%, transparent 70%),
    radial-gradient(44% 50% at 62% 2%,  color-mix(in srgb, #5a56d3 18%, transparent) 0%, transparent 70%),
    radial-gradient(40% 46% at 88% 8%,  color-mix(in srgb, #db01b0 15%, transparent) 0%, transparent 70%),
    radial-gradient(38% 44% at 76% 46%, color-mix(in srgb, #b66000 12%, transparent) 0%, transparent 72%),
    radial-gradient(38% 44% at 18% 52%, color-mix(in srgb, #00893a 12%, transparent) 0%, transparent 72%);
}
[data-theme-poc][data-mode='dark'] .poc-suite-bubbles {
  background-image:
    radial-gradient(46% 52% at 10% 4%,  color-mix(in srgb, #0091d9 26%, transparent) 0%, transparent 70%),
    radial-gradient(42% 48% at 34% 0%,  color-mix(in srgb, #00ae9f 22%, transparent) 0%, transparent 70%),
    radial-gradient(44% 50% at 62% 2%,  color-mix(in srgb, #8b82f6 24%, transparent) 0%, transparent 70%),
    radial-gradient(40% 46% at 88% 8%,  color-mix(in srgb, #f721c8 18%, transparent) 0%, transparent 70%),
    radial-gradient(38% 44% at 76% 46%, color-mix(in srgb, #d87819 15%, transparent) 0%, transparent 72%),
    radial-gradient(38% 44% at 18% 52%, color-mix(in srgb, #1eb152 15%, transparent) 0%, transparent 72%);
}

[data-theme-poc] .poc-dot { background: var(--primary-highlight); }
[data-theme-poc] .poc-bubble-field { background-image: var(--poc-bubble); }

/* THE GLYPH TRACKS THE LABEL. --primary-foreground is white in light and ink in
   dark, so the mark's icon matches whatever a primary button is carrying in the
   same mode. It works because dark's middles are LIGHT by construction (ink on
   them reads 5.1-6.4) — the same fact that makes dark buttons take ink.

   The glyph sits over the middle of a 140deg ramp, so the middle stop is what it
   has to clear; over the deep corner it would not, which is why this is a
   centred mark and not a full-bleed one. */
/* ── THE MARK, LAYER FOR LAYER ──────────────────────────────────────────────
   Read straight off the Figma component (128x128, radius 28.8 = 22.5%). The
   earlier version had the brand ramp and a flat white wash and stopped there,
   which is why it read as a coloured tile rather than as glass: it was missing
   four of the six layers. Bottom to top the real mark is

     1  brand ramp        linear, 3 stops
     2  radial highlight  a soft white lift above centre
     3  bloom             a pale blue glow hanging off the top-left corner
     4  sheen             a white band down the top half
     5  sparkle           a small blurred dot, upper left
     6  icon              centred at 46%

   plus one drop shadow and three inner shadows. Three further drop shadows
   exist in the component and are switched OFF — they are not reproduced here.

   GEOMETRY IS DERIVED, NOT EYEBALLED. Figma stores a gradientTransform, not an
   angle, so the ramp was solved back to CSS: its axis runs (0.5,-0.31) to
   (1.31,0.5) in unit space, which is 135deg, and projecting Figma's 0/0.52/1
   stops onto the CSS gradient line for a square box puts them at 9.7/51.6/90.3%.
   Using 0/52/100% instead — the obvious guess — compresses the whole ramp and
   loses the deep corner entirely.

   Everything is expressed in PERCENT so one rule serves 22px and 128px. The two
   exceptions take --poc-mark-px, set inline by the component, because a blur
   radius and a shadow offset cannot be a percentage. */
[data-theme-poc] .poc-mark {
  --poc-mark-px: 48px;
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
  isolation: isolate;
  overflow: hidden;
  border-radius: 22.5%;
  color: var(--primary-foreground);
  background-image:
    /* 3 · bloom — Figma has this as a 129px ellipse hung at (-39,-37); as a
       background layer that is a 25%-radius glow centred at 20%/22%. */
    radial-gradient(25% 25% at 20% 22%,
      color-mix(in srgb, #bfe0ff 23%, transparent) 0%,
      color-mix(in srgb, #bfe0ff 9%, transparent) 50%,
      transparent 100%),
    /* 2 · radial highlight — alpha is the fill's 0.7/0.3/0 times the layer's
       0.4, folded in, because CSS has no layer opacity on a background. */
    radial-gradient(35% 35% at 45% 40%,
      color-mix(in srgb, #ffffff 28%, transparent) 0%,
      color-mix(in srgb, #b2d9ff 12%, transparent) 40%,
      transparent 100%),
    /* 1 · the brand ramp */
    linear-gradient(135deg,
      var(--primary-highlight) 9.7%,
      var(--mark-mid) 51.6%,
      var(--primary-deep) 90.3%);
  box-shadow:
    0 calc(var(--poc-mark-px) * 0.023) calc(var(--poc-mark-px) * 0.047) rgba(35, 14, 75, 0.4),
    inset 0 calc(var(--poc-mark-px) * -0.031) calc(var(--poc-mark-px) * 0.063) rgba(35, 14, 75, 0.3),
    inset 0 calc(var(--poc-mark-px) * 0.023) calc(var(--poc-mark-px) * 0.047) calc(var(--poc-mark-px) * -0.016) rgba(255, 255, 255, 0.35),
    inset calc(var(--poc-mark-px) * -0.016) calc(var(--poc-mark-px) * 0.016) calc(var(--poc-mark-px) * 0.023) calc(var(--poc-mark-px) * -0.008) rgba(204, 229, 255, 0.25);
}
/* 4 · sheen — a 128x67 rectangle at the top, so 52.3% of the height. */
[data-theme-poc] .poc-mark::before {
  content: '';
  position: absolute;
  /* overhangs the sides so no vertical edge is ever inside the clip; the tile's
     own overflow:hidden trims it. No border-radius — a percentage radius here
     resolves against the BAND's box, not the tile's, giving it elliptical
     corners of its own that read as curved highlights. */
  inset: 0 -6% auto -6%;
  height: 52.3%;
  background-image: linear-gradient(180deg,
    rgba(255, 255, 255, 0.245) 0%,
    rgba(229, 242, 255, 0.074) 35%,
    rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}
/* 5 · sparkle — a 12px dot at (20,20) on a 128 box, blurred 4.
   Figma's version is a flat white circle at alpha 0.32 under a 4px layer blur,
   which at small sizes disappears into the sheen. Made more legible WITHOUT
   making it bigger or busier: a radial with a bright core and a soft falloff,
   and a tighter blur. A blurred flat disc reads as a smudge; a core with
   falloff reads as a point of light, and it survives being scaled down.
   Still static — see the MOTION block for why. */
[data-theme-poc] .poc-mark::after {
  content: '';
  position: absolute;
  left: 14.4%;
  top: 14.4%;
  width: 12%;
  height: 12%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(255, 255, 255, 0.5) 42%,
    rgba(255, 255, 255, 0.12) 72%,
    transparent 100%);
  filter: blur(calc(var(--poc-mark-px) * 0.016));
  pointer-events: none;
}
/* The glyph has to sit ABOVE the sheen, and a grid child with no z-index would
   not — ::before is painted after it in the same stacking context. */
[data-theme-poc] .poc-mark > * {
  position: relative;
  z-index: 1;
}

/* ── MOTION ─────────────────────────────────────────────────────────────────
   Opt-in, via .poc-mark--live.

   TWO AMBIENT LAYERS, AND THE SPARKLE IS NOT ONE OF THEM.

     BLOOM  drifts — a slow orbit and swell, 11s
     SHEEN  tilts  — the band swells and slides, 7.3s

   Both run long and share no common factor, so the pair never lines up and the
   composite has no visible loop.

   The SPARKLE stays exactly as Figma draws it: one blurred dot at 15.6%/15.6%,
   9.4% wide, alpha 0.32, and STATIC. Two earlier passes animated it — first a
   pulse, then three four-point stars — and both times it stopped being a
   highlight and became the thing you looked at. A mark's job is to show its
   glyph. The sparkle is a detail on the glass, not an event.

   The streak went the same way: solved faithfully from the owner's frame,
   genuinely pretty, and one more moving thing on a 26px tile. Removed.

   Everything that remains is either very slow (bloom, sheen) or only happens
   because you pointed at it (hover). Durations are literals — longer than
   anything in the token scale and tuned against each other; the reduced-motion
   block stops them rather than shortening them. */
@keyframes poc-bloom-drift {
  0%   { transform: translate3d(0, 0, 0) scale(1);       opacity: 0.85; }
  30%  { transform: translate3d(6%, 4%, 0) scale(1.14);  opacity: 1; }
  62%  { transform: translate3d(-3%, 7%, 0) scale(0.96); opacity: 0.7; }
  100% { transform: translate3d(0, 0, 0) scale(1);       opacity: 0.85; }
}
/* SCALE AND FADE ONLY — no translate, no rotate.
   The earlier version moved the sheen down 2% and rotated it 1.5deg. The sheen
   is a band pinned to the top of the tile whose BRIGHTEST point is its top edge
   (alpha 0.243), so any move that lifts that edge off y=0 exposes it: a bright
   line running the full width, sliding up and down every 7 seconds. The rotate
   did the same thing to one top corner at a time.
   transform-origin is 50% 0%, so scaleY only ever grows DOWNWARD, into the
   gradient's own falloff, and the top edge cannot move. */
@keyframes poc-sheen-tilt {
  0%   { transform: scaleY(1);    opacity: 0.72; }
  40%  { transform: scaleY(1.16); opacity: 1; }
  70%  { transform: scaleY(0.92); opacity: 0.58; }
  100% { transform: scaleY(1);    opacity: 0.72; }
}
@keyframes poc-mark-sweep {
  0%   { transform: translate3d(-140%, 0, 0) rotate(8deg); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translate3d(140%, 0, 0) rotate(8deg);  opacity: 0; }
}

[data-theme-poc] .poc-mark--live {
  transition:
    transform var(--duration-slow) var(--ease-spring),
    box-shadow var(--duration-slow) var(--ease-out);
}
/* The live mark drops only the STATIC bloom, which becomes a real element so it
   can be transformed. The sparkle stays on ::after exactly as the static mark
   has it. Re-declared in full rather than unset piecemeal — a background-image
   is one property, not a list you can reach into. */
[data-theme-poc] .poc-mark--live {
  background-image:
    radial-gradient(35% 35% at 45% 40%,
      color-mix(in srgb, #ffffff 28%, transparent) 0%,
      color-mix(in srgb, #b2d9ff 12%, transparent) 40%,
      transparent 100%),
    linear-gradient(135deg,
      var(--primary-highlight) 9.7%,
      var(--mark-mid) 51.6%,
      var(--primary-deep) 90.3%);
}
[data-theme-poc] .poc-mark--live::before {
  animation: poc-sheen-tilt 7300ms var(--ease-in-out) infinite;
  transform-origin: 50% 0%;
}

[data-theme-poc] .poc-mark__bloom {
  position: absolute;
  left: -30%;
  top: -29%;
  width: 101%;
  height: 101%;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  background-image: radial-gradient(circle at 50% 50%,
    color-mix(in srgb, #bfe0ff 23%, transparent) 0%,
    color-mix(in srgb, #bfe0ff 9%, transparent) 50%,
    transparent 100%);
  animation: poc-bloom-drift 11000ms var(--ease-in-out) infinite;
  transition: opacity var(--duration-slow) var(--ease-out);
}

[data-theme-poc] .poc-mark__sweep {
  position: absolute;
  inset: -20% -60%;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  background-image: linear-gradient(100deg,
    transparent 0%,
    rgba(255, 255, 255, 0.30) 45%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.30) 55%,
    transparent 100%);
  transform: translate3d(-140%, 0, 0) rotate(8deg);
}

/* the glyph rides above everything and moves against the tilt */
[data-theme-poc] .poc-mark--live > svg {
  transition:
    transform var(--duration-slow) var(--ease-spring),
    filter var(--duration-slow) var(--ease-out);
}

/* ── HOVER ── lift, tilt, and the shadow that has to follow it ── */
[data-theme-poc] .poc-mark--live:hover {
  transform:
    perspective(520px)
    rotateX(7deg)
    rotateY(-9deg)
    translateY(-5%)
    scale(1.05);
  box-shadow:
    /* the drop grows and swings right/down, because that is where the light
       now is — a lift with an unchanged shadow reads as a sticker */
    calc(var(--poc-mark-px) * 0.05) calc(var(--poc-mark-px) * 0.11) calc(var(--poc-mark-px) * 0.19) calc(var(--poc-mark-px) * -0.03) rgba(35, 14, 75, 0.45),
    inset 0 calc(var(--poc-mark-px) * -0.031) calc(var(--poc-mark-px) * 0.063) rgba(35, 14, 75, 0.3),
    inset 0 calc(var(--poc-mark-px) * 0.031) calc(var(--poc-mark-px) * 0.055) calc(var(--poc-mark-px) * -0.016) rgba(255, 255, 255, 0.5),
    inset calc(var(--poc-mark-px) * -0.016) calc(var(--poc-mark-px) * 0.016) calc(var(--poc-mark-px) * 0.023) calc(var(--poc-mark-px) * -0.008) rgba(204, 229, 255, 0.25);
}
/* parallax: the glyph goes the OTHER way and casts its own shadow, which is
   what actually sells the depth — the glass turns, the icon floats over it */
[data-theme-poc] .poc-mark--live:hover > svg {
  transform: translate3d(4%, -4%, 0) scale(1.06);
  filter: drop-shadow(0 calc(var(--poc-mark-px) * 0.02) calc(var(--poc-mark-px) * 0.035) rgba(35, 14, 75, 0.45));
}
[data-theme-poc] .poc-mark--live:hover .poc-mark__sweep { animation: poc-mark-sweep 1100ms var(--ease-out); }
[data-theme-poc] .poc-mark--live:hover .poc-mark__bloom { opacity: 1.3; }

@media (prefers-reduced-motion: reduce) {
  /* the global block in tokens.scss zeroes DURATIONS; an infinite animation at
     0.01ms still churns frames, so these stop outright. */
  [data-theme-poc] .poc-mark__bloom,
  [data-theme-poc] .poc-mark--live::before,
  [data-theme-poc] .poc-mark--live:hover .poc-mark__sweep { animation: none; }
  [data-theme-poc] .poc-mark--live:hover,
  [data-theme-poc] .poc-mark--live:hover > svg { transform: none; }
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
