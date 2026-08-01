/**
 * The deeper-theming recipe, extracted so the Adoption story can read the exact
 * same source the specimens render from — no second copy to drift.
 *
 * It lives OUTSIDE the .stories.tsx file deliberately: every named export from a
 * CSF file is indexed as a story, so exporting POC_CSS from there would have
 * Storybook try to render a string as a component.
 */

/**
 * Two `color-mix` facts that shaped this recipe:
 *
 * A custom property CANNOT reference itself — `--background: color-mix(…,
 * var(--background))` is a cycle and resolves to `unset`. So the bases below
 * are literals copied from tokens.scss. That is the single biggest ADOPTION
 * cost: real adoption needs a layer of raw neutral tokens with the semantic
 * ones derived from them.
 *
 * `color-mix` AVERAGES alpha, so a translucent token must be rebuilt against
 * `transparent` rather than mixed into.
 *
 * STRUCTURAL WARNING, learned twice the hard way: everything below is one
 * template literal, and prose accidentally left OUTSIDE a comment is silently
 * valid-ish CSS that makes the parser discard the declarations after it. Both
 * times the contrast sweep still reported PASS, because an override that never
 * applied is indistinguishable from one that agrees with the baseline. If you
 * edit this block, re-run the structural check in the commit message.
 */
export const POC_CSS = `
/* ── LIGHT ──────────────────────────────────────────────────────────────────
   THE PAGE STAYS WHITE. Stated as an explicit declaration rather than an
   omission, so it is obvious this is a decision and not an oversight.

   Everything the earlier rounds fought about disappears here: the semantic
   -light tints ship as rgba() and composite over whatever is behind them,
   which the whole system assumes is white. Leave the page white and that
   assumption holds, so error/success/warning/info keep their exact shipped
   contrast with no re-derivation at all. */
[data-theme-poc][data-mode='light'] {
  /* Pre-mixing the brand with white carries the hue without the darkening.
     Mixing raw --primary into a light surface only darkens it, and darkening a
     surface under dark text COSTS contrast. */
  --poc-tint: color-mix(in srgb, var(--primary) 45%, #ffffff);

  --background: #ffffff;
  --card:       #ffffff;
  --popover:    #ffffff;

  /* The tint lives on the SECONDARY surfaces — the ones that are already not
     white today, so tinting them changes their hue rather than their role. */
  --secondary: color-mix(in srgb, var(--poc-tint) calc(28% * var(--poc-str)), #e2e8f0);
  --accent:    color-mix(in srgb, var(--poc-tint) calc(34% * var(--poc-str)), #f1f5f9);
  --input:     color-mix(in srgb, var(--poc-tint) calc(28% * var(--poc-str)), #e2e8f0);
  /* Most conservative number here — --muted carries the tightest text pairing in
     the whole system, and CLAUDE.md calls it out by name.

     This one costs something and the cost is NOT tunable. muted-foreground on
     --muted is 5.10 today; tinting takes it to 4.94 at 14% and 4.87 at 20% —
     but also 4.97 at 10%, so the loss is nearly flat across the range. It comes
     from mixing the pastel stock into slate-300 at all, not from how much. 14%
     is chosen for the margin rather than the hue, since a surface this small
     contributes almost no identity anyway. Still clears AA at 4.94, but it is a
     genuine regression against today and should be re-derived, not tinted, if
     this is ever adopted. */
  --muted:     color-mix(in srgb, var(--poc-tint) calc(14% * var(--poc-str)), #cbd5e1);

  /* Borders use RAW --primary, not the stock: they are not text backgrounds, so
     there is no contrast budget to protect, and the stock would wash the hue out
     exactly where it needs to read. */
  --border:       color-mix(in srgb, var(--primary) calc(20% * var(--poc-str)), #cbd5e1);
  --border-hover: color-mix(in srgb, var(--primary) calc(26% * var(--poc-str)), #64748b);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);

  /* CHROME — the rail. THE RAIL STEPS BACK in this round. Earlier rounds pushed
     it to 44% raw primary because it was the only surface with the headroom to
     carry identity. It is not any more: the mark now clears 0.10 separation at
     every gradient stop, so the rail no longer has to shout — and a rail that
     shouts is the single loudest tell of a cheap theme.

     GREYED, not merely lightened, and the distinction is the whole point.
     Dropping the percentage alone gives a PALE version of the same saturated
     hue, which reads as washed out. Pre-mixing the brand into slate-500 first
     drops the CHROMA while keeping the hue identifiable, so the rail reads as
     grey that happens to lean the brand's way.

     TWO THINGS FELL OUT OF THIS, both measured after the change rather than
     predicted before it:

     (a) The guard rail is gone. muted-foreground on the rail was 3.98 and
         failing at 55%; at a greyed 20% it measures 5.64 and PASSES. The whole
         "every component inside the rail must use --sidebar-* foregrounds"
         constraint simply evaporates. A quieter rail is not just calmer, it is
         structurally less demanding of everything placed on it.
     (b) The rail stops differentiating brands — separation across the three
         collapses to 0.003-0.014, i.e. nothing. That is the deliberate trade,
         and it is only affordable because the mark now carries identity on its
         own. Turn the marks off and this rail says nothing about which app you
         are in.

     It also lands much closer to the recorded decision it was straining:
     CLAUDE.md lists --sidebar beside Tooltip as deliberately un-themed neutral
     chrome. At 20% of a greyed stock (chroma ~0.015 against the 55% version's
     0.103) it is nearly that, rather than a reversal of it. */
  --poc-rail-stock: color-mix(in srgb, var(--primary) 28%, #64748b);
  --sidebar:        color-mix(in srgb, var(--poc-rail-stock) calc(20% * var(--poc-chrome, 0)), #f8fafc);
  --sidebar-border: color-mix(in srgb, var(--poc-rail-stock) calc(30% * var(--poc-chrome, 0)), #e2e8f0);
  --sidebar-accent: color-mix(in srgb, var(--poc-rail-stock) calc(34% * var(--poc-chrome, 0)), #f1f5f9);

  /* BAND — the alternating marketing section. A full-bleed tinted strip is the
     one place a white-page product can spend real colour on a large area,
     because the band is a deliberate break in the page rather than the page. */
  --poc-band:        color-mix(in srgb, var(--poc-tint) calc(26% * var(--poc-str)), #ffffff);
  --poc-band-strong: color-mix(in srgb, var(--poc-tint) calc(48% * var(--poc-str)), #ffffff);
  /* The DARKEST point of the band gradient, broken out as its own token so the
     audit can measure the worst case rather than the average. A gradient's
     contrast is only as good as its deepest stop under text. */
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--primary));
}

/* ── DARK ───────────────────────────────────────────────────────────────────
   Dark DOES tint its page: --muted-foreground on --muted sits at 8.3:1 there
   against light mode's 5.0, so the headroom exists. The stock is anchored to
   the dark page so the mix moves CHROMA without moving luminance — otherwise
   tinting would lift every surface and flatten the background -> card ->
   popover ramp that dark mode already has and light mode lacks. */
[data-theme-poc][data-mode='dark'] {
  --poc-tint: color-mix(in srgb, var(--primary) 30%, #0f172a);

  --background: color-mix(in srgb, var(--poc-tint) calc(40% * var(--poc-str)), #0f172a);
  --card:       color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #1e293b);
  --popover:    color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #475569);
  --secondary:  color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #1e293b);
  --accent:     color-mix(in srgb, var(--poc-tint) calc(35% * var(--poc-str)), #334155);
  --muted:      color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #334155);
  --input:      color-mix(in srgb, var(--poc-tint) calc(30% * var(--poc-str)), #475569);

  --border:       color-mix(in srgb, var(--primary) calc(22% * var(--poc-str)), #64748b);
  --border-hover: color-mix(in srgb, var(--primary) calc(28% * var(--poc-str)), #cbd5e1);
  --ring:         color-mix(in srgb, var(--primary) calc(30% * var(--poc-str)), #94a3b8);

  /* Dark's rail carries LIGHT foregrounds, and dark-mode primaries are LIGHTER
     than the rail they mix into, so tinting here RAISES luminance and eats
     contrast — the opposite direction to light. Measured: accent at 45% -> 4.17
     FAIL, at 38% -> 4.78 thin, at 32% -> 5.31 used. */
  --sidebar:        color-mix(in srgb, var(--primary) calc(32% * var(--poc-chrome, 0)), #1e293b);
  --sidebar-border: color-mix(in srgb, var(--primary) calc(38% * var(--poc-chrome, 0)), #334155);
  --sidebar-accent: color-mix(in srgb, var(--primary) calc(26% * var(--poc-chrome, 0)), #334155);

  --poc-band:        color-mix(in srgb, var(--poc-tint) calc(36% * var(--poc-str)), #1e293b);
  --poc-band-strong: color-mix(in srgb, var(--poc-tint) calc(56% * var(--poc-str)), #1e293b);
  --poc-band-deep:   color-mix(in srgb, var(--poc-band) 88%, var(--primary));
}

/* ── The APP MARK ───────────────────────────────────────────────────────────
   The one surface in the UI where colour is free: nothing sits on top of it, so
   it carries no contrast constraint whatsoever. Lightness and chroma are pinned
   to literals and only the hue is inherited, so the marks share one envelope by
   construction rather than by style guide.

   That guarantee is only mechanical INSIDE sRGB. oklch(0.62 0.21 h) is
   unreachable at many hues, so the browser gamut-maps it, and gamut mapping
   moves the two things meant to be pinned. Measured chroma spread across the
   full palette: 0.0907 at C=0.21, 0.0195 at 0.13, 0.0016 at 0.11. This keeps
   the vivid 0.21 deliberately — muted marks defeat the purpose — so the honest
   framing is "one recipe, gamut permitting". display-p3 would buy both.

   Relative colour syntax is a newer floor than color-mix: Chrome 119+, Safari
   16.4+, Firefox 128+. Flagged, not free. */
[data-theme-poc] {
  /* HUE TRAVELS. The first version held one hue and moved only lightness, which
     is why it read as a tinted chip rather than an object. Real icon sets of
     this kind move through a RANGE of hue — the light end sits one neighbour
     back, the dark end lands a good way forward — and that arc is most of what
     makes them look rich instead of flat.

     CHROMA STAYS PINNED, and an attempt to make it RELATIVE was reverted —
     recorded here because the failure is instructive.

     Pinning chroma means a deliberately muted brand still gets a vivid mark,
     which looked wrong once db moved to the Teams-like desaturated purple: the
     primary separated cleanly from the Aiden surface (0.055 -> 0.114) while its
     MARK stayed 0.061 away, because the mark ignores the brand's chroma. So the
     stops were changed to multipliers of the brand's own chroma (x0.85 / x1.05
     / x0.95), which fixed exactly that — db's mark stops went to 0.259 / 0.122
     / 0.162 against Aiden, all clear.

     IT BROKE THE THING THE POC EXISTS FOR. The eight primaries were darkened to
     clear AA, so their chroma is only ~0.10-0.13; multiplying that produced
     marks at C 0.08-0.11 instead of the pinned 0.17-0.21. Every mark lost its
     vividness, and dc/ec — the closest pair, the whole reason for this work —
     fell from 0.129 to 0.066, back under the "reads as a different colour"
     threshold. A fix aimed at one pair regressed the pair that matters most.

     The lesson generalises: the mark is the surface where colour is FREE, and
     tying it to the primary re-imports the primary's AA constraint through the
     back door. Marks should be authored against their own budget.
     db's mark still sits 0.061 from an Aiden stop — an open item, not solved.

     The mid stop stays exactly on the brand hue, so the dominant colour of the
     mark is still the brand's own. The arc is decoration around it, not a
     redefinition of it. */
  --poc-mark:
    /* Second plane: a brighter, counter-rotated bloom in the top corner. The
       reference icons get their depth from overlapping FORMS catching light at
       different angles, not from a single ramp — this is the cheapest honest
       approximation of that with no artwork. */
    radial-gradient(125% 125% at 16% 10%,
      oklch(from var(--primary) 0.84 0.18 calc(h - 30)) 0%,
      transparent 58%),
    linear-gradient(140deg,
      oklch(from var(--primary) 0.80 0.17 calc(h - 12)) 0%,
      oklch(from var(--primary) 0.63 0.21 h) 52%,
      oklch(from var(--primary) 0.47 0.19 calc(h + 26)) 100%);

  /* Hero gradient. PROVABLY AA-safe: every stop lies on the segment --primary
     -> --foreground, and --primary-foreground is by construction the opposite
     pole to --foreground, so contrast against the label only ever INCREASES.
     The obvious "bright open, deep close" shape breaks — lightening a primary
     15% toward white can fail outright — which is why this moves the other way. */
  --poc-hero-far: color-mix(in srgb, var(--primary) 76%, var(--foreground));
  --poc-hero: linear-gradient(135deg, var(--primary) 0%, var(--poc-hero-far) 100%);
}

/* ── DEPTH ──────────────────────────────────────────────────────────────────
   A flat tint reads as "somebody changed a hex value". Depth is what makes it
   read as a designed surface. All of this is existing tokens plus color-mix —
   no images, no filters, no dependencies, nothing new to install.

   ONE RULE MAKES EVERY GRADIENT HERE MODE-SAFE: fade toward --background.
   That lightens in light mode and darkens in dark mode, so the gradient always
   moves AWAY from the mode's own foreground and contrast along it can only
   improve. Fading toward #ffffff instead is correct in light and inverts in
   dark — which is the usual way a gradient silently breaks a dark theme.

   The elevation ladder, deliberately ordered rather than decorative:
     band     RECESSED   inset hairlines, reads as cut INTO the page
     page     0          the datum
     card     RAISED     tinted shadow plus a lit top edge
     mark     FLOATING   coloured glow, reads as a physical object

   Shadows carry the BRAND HUE rather than neutral black. A grey shadow under a
   saturated object looks like dirt; a shadow holding a little of the object's
   own colour reads as light falling on it. This is most of why the Office icons
   feel physical and a flat rounded square does not. */
[data-theme-poc] {
  /* Softer and further than round 5. A tight, dark shadow reads as cheap; a wide
     one at low alpha reads as expensive, because it is what a large diffuse
     light source actually does. Three layers, each roughly tripling the blur of
     the last — contact, mid, ambient. That ladder is most of the difference
     between a card that looks stuck on and one that looks placed. */
  --poc-shadow-key: color-mix(in srgb, var(--primary) 14%, transparent);
  --poc-shadow-far: color-mix(in srgb, var(--primary) 9%, transparent);
  --poc-shadow-amb: color-mix(in srgb, var(--foreground) 6%, transparent);

  /* GRAIN. A perfectly smooth gradient is the giveaway of a cheap one — real
     printed and photographed colour has tooth. This is an inline SVG turbulence
     filter as a data URI: self-contained, no network, no dependency, and it
     costs nothing to keep at an opacity low enough to be felt and not seen.
     Kept to the two loudest surfaces only; grain over body copy is noise. */
  --poc-grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E");
}

/* ── db, proposed: the INDIGO ───────────────────────────────────────────────
   PROPOSAL ONLY. tokens.scss is NOT modified — --db-primary there is still
   #6063f1. This overrides --primary inside the POC scope so the change can be
   looked at before it is committed anywhere real. Specificity is (0,3,0),
   which beats the (0,1,0) [data-theme='db'] scope; the derived --primary-hover
   / -soft / -text family follows automatically, because those are declared with
   color-mix over var(--primary) and resolve against the final cascaded value.

   THE BRIEF CHANGED, AND SO DID THIS COLOUR — twice, worth recording.

   It was first moved to a Teams-like muted purple (#6264a7) to push db AWAY
   from the Aiden surface, which measured well: aiden 0.055 -> 0.114, ir 0.061
   -> 0.121, rm 0.083 -> 0.147. Then the actual requirement arrived: db and
   Aiden are the two flagships and are MEANT to read as a pair. Every one of
   those numbers was an improvement against a target nobody had set.

   So db goes to indigo at 276 degrees — which is, almost exactly, where it
   already was. Today's #6063f1 sits at 277, and so does Tailwind's indigo-500.
   The colour barely moves; what changed is that its closeness to Aiden is now
   the design rather than the defect.

     db     #5b64d4 light / #707bf6 dark    276°   white-text 4.98
     aiden  #1277c2 -> #251af7 -> #791bf8   248 -> 268 -> 292

   db SITS INSIDE AIDEN'S SWEEP. Aiden's middle stop is 268 and db is 276 —
   eight degrees apart. Aiden travels through indigo; db IS the indigo, the
   still point of the same colour. That is a stronger statement of "these two
   belong together" than any amount of near-miss hue tuning, and it only works
   because Aiden was turned to START at blue rather than end there.

   Measured: solid 0.080 apart, marks 0.026. The mark figure is very close —
   close enough that colour alone will not separate them, which is deliberate
   here and is why the two are distinguished by BEHAVIOUR instead: Aiden's hue
   travels, db's holds. See the .poc-mark--hold block. */
[data-theme-poc][data-theme='db'][data-mode='light'] { --primary: #5b64d4; }
[data-theme-poc][data-theme='db'][data-mode='dark']  { --primary: #707bf6; }

/* ── AIDEN'S MARK ───────────────────────────────────────────────────────────
   Aiden is a SURFACE, not a brand, so its mark is the one deliberate exception
   to the recipe. The brand arc runs -12 / 0 / +26 — hue INCREASING as the mark
   darkens — and Aiden's gradient runs the other way, magenta down to blurple.
   Forcing Aiden through the brand arc would invert the one thing that is
   actually its identity.

   So it keeps the brand LIGHTNESS ladder (0.80 / 0.63 / 0.47), which is what
   makes it sit in the family, and its own hue direction (322 -> 300 -> 278),
   which is what keeps it Aiden. Same object, its own signature.

   IT TRAVELS BLUE -> INDIGO -> VIOLET (248 -> 268 -> 292), 44 degrees, which
   is the classic AI sweep and the widest arc any version of this has had.

   Two earlier passes were wrong in different ways. One rotated Aiden toward
   MAGENTA to free the blue slot for a sub-brand: it measured well and gave up
   the convention that makes Aiden legible as "the AI" at a glance. The next
   started at violet and only reached blue-violet, so it read purple-dominant
   rather than blue-purple. Starting at BLUE and sweeping up into violet is
   what actually looks like AI, and it is also the direction that lets db sit
   inside the sweep rather than beside it.

   Hues are taken at MARK lightness rather than surface lightness: a mark
   carries no text, so each stop runs near the sRGB gamut ceiling instead of
   being held to white-text contrast. That is why it reads more vivid than the
   surface gradient it comes from.

   THE BLUE END IS NOT A COLLISION, IT IS THE POINT. db is the other flagship
   and is meant to feel closely linked, so it sits at 248 — just off Aiden's
   blue end — and measures 0.056 away. Several earlier rounds spent effort
   trying to push those two APART; that was optimising against the wrong
   target. The other three brands clear Aiden comfortably (Green 0.206,
   Amber 0.247, Rose 0.115).

   The selector DOUBLES the class — .poc-mark.poc-mark--aiden, (0,3,0) — rather
   than relying on source order. Both rules set background-image at the same
   (0,2,0) specificity, so whichever comes last wins; the first attempt sat
   ABOVE .poc-mark and lost silently, rendering Aiden with the brand recipe and
   the neutral slate hue. Ordering is not a guarantee, specificity is. */
[data-theme-poc] .poc-mark.poc-mark--aiden {
  --poc-shadow-key: color-mix(in srgb, #251af7 24%, transparent);
  --poc-shadow-far: color-mix(in srgb, #597ef9 16%, transparent);
  background-image:
    linear-gradient(180deg, color-mix(in srgb, #ffffff 26%, transparent) 0%, transparent 52%),
    radial-gradient(125% 125% at 16% 10%, #bfe0ff 0%, transparent 58%),
    linear-gradient(140deg, #89c4fc 0%, #597ef9 52%, #6815d7 100%);
}

/* ── db's MARK — the hue HOLDS ─────────────────────────────────────────────
   db is the other flagship and is meant to read as Aiden's sibling, so the two
   are separated by BEHAVIOUR rather than by distance on the wheel:

     Aiden   the hue TRAVELS   300 -> 288 -> 268     movement, magic
     db      the hue HOLDS     276 -> 276 -> 276     one colour, only light

   All three stops sit on the brand hue and only lightness moves. That is a
   direct inversion of what round 3 of this file concluded — a single-hue ramp
   was called out there as exactly why the first marks "read as a tinted chip
   rather than an object". It did, for a brand that needed to stand alone. For
   the calm sibling of a gradient it is the point: db looks solid and settled
   precisely because it does not shimmer, and Aiden looks alive because it is
   the only thing that does.

   It is NOT a fade to white. The ramp runs light-indigo -> indigo -> deep
   indigo (#acb9fc -> #6d78f9 -> #4445c2), holding real chroma at every stop.
   Taking it to actual white lands around #dee4f5 at the top and goes pale and
   washed out at mark size — measured, not assumed.

   Linked, as intended: solid 0.126 from Aiden, mark 0.043. */
[data-theme-poc] .poc-mark.poc-mark--hold {
  background-image:
    linear-gradient(180deg, color-mix(in srgb, #ffffff 26%, transparent) 0%, transparent 52%),
    radial-gradient(125% 125% at 16% 10%,
      oklch(from var(--primary) 0.88 calc(c * 0.70) h) 0%, transparent 58%),
    linear-gradient(140deg,
      oklch(from var(--primary) 0.80 0.15 h) 0%,
      oklch(from var(--primary) 0.63 0.21 h) 52%,
      oklch(from var(--primary) 0.47 0.19 h) 100%);
}

[data-theme-poc] .poc-mark {
  display: grid;
  place-items: center;
  flex: none;
  border-radius: var(--rounded-xl);
  color: #ffffff;
  /* Sheen over hue: the top-down white wash is what turns a flat gradient chip
     into something that looks lit from above. */
  background-image:
    linear-gradient(180deg, color-mix(in srgb, #ffffff 26%, transparent) 0%, transparent 52%),
    var(--poc-mark);
  box-shadow:
    0 1px 1px var(--poc-shadow-key),
    0 var(--p-1-5) var(--p-4) var(--poc-shadow-far),
    inset 0 1px 0 color-mix(in srgb, #ffffff 40%, transparent);
}

/* HERO. Both overlays move toward --foreground, never toward white, so the
   AA proof still holds: every point on this surface is somewhere on the segment
   --primary -> --foreground, and contrast against --primary-foreground can only
   INCREASE. Depth here is free of contrast risk by construction, which is
   exactly why the darkening direction was chosen over the prettier one. */
/* NO GRAIN ON THE HERO, and the reason is worth keeping. The hero label is
   --primary-foreground on --primary, and --primary is tuned to clear AA by a
   hair: measured 4.57-4.61 across the three brands. Any LIGHTENING overlay eats
   that margin, and the grain at 0.055 took it to 4.17-4.20 — under the floor.
   It looked fine and would have shipped a failure.
   The hero gets its richness from the two darkening radials instead, which move
   along --primary -> --foreground and therefore can only raise contrast. A
   surface with no headroom gets no overlay; that is the rule, not a one-off. */
[data-theme-poc] .poc-hero {
  background-image:
    radial-gradient(70% 90% at 82% 115%, color-mix(in srgb, var(--foreground) 42%, transparent) 0%, transparent 62%),
    radial-gradient(55% 70% at 8% -15%, color-mix(in srgb, var(--foreground) 20%, transparent) 0%, transparent 60%),
    var(--poc-hero);
}
[data-theme-poc] .poc-hero-cta > .ui-button { background-image: var(--poc-hero); }

/* BAND. Recessed: hairline insets top and bottom, a soft brand bloom at the
   top edge, and a fade toward the page at the bottom so it dissolves back into
   white instead of ending on a hard slab edge. The bloom is the darkest point
   under text, which is what --poc-band-deep tokenises for the audit. */
[data-theme-poc] .poc-band,
[data-theme-poc] .poc-band-strong {
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--primary) 22%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--primary) 22%, transparent);
}
[data-theme-poc] .poc-band {
  background-image:
    radial-gradient(90% 120% at 50% 0%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 70%),
    linear-gradient(180deg, var(--poc-band) 0%, color-mix(in srgb, var(--poc-band) 40%, var(--background)) 100%);
}
[data-theme-poc] .poc-band-strong {
  background-image:
    var(--poc-grain),
    radial-gradient(90% 120% at 50% 0%, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 70%),
    linear-gradient(180deg, var(--poc-band-strong) 0%, color-mix(in srgb, var(--poc-band-strong) 55%, var(--background)) 100%);
}

/* RAIL. Fades toward the page down its length and carries an inner edge on the
   content side, so it reads as a solid slab with a lit top rather than a
   coloured rectangle. */
[data-theme-poc] .poc-rail {
  background-image: linear-gradient(180deg,
    var(--sidebar) 0%,
    color-mix(in srgb, var(--sidebar) 82%, var(--background)) 100%);
  box-shadow: inset -1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent);
}

/* CARDS. The library ships --shadow-xs on Card, which is correct for a flat
   page and invisible once anything around it has depth. Inside this scope they
   get a brand-tinted two-layer shadow and a barely-there top wash. */
[data-theme-poc] .ui-card {
  background-image: linear-gradient(180deg,
    color-mix(in srgb, var(--primary) 3%, transparent) 0%, transparent 42%);
  /* contact -> mid -> ambient, each roughly tripling the blur before it */
  box-shadow:
    0 1px 1px var(--poc-shadow-amb),
    0 var(--p-1) var(--p-3) var(--poc-shadow-far),
    0 var(--p-5) var(--p-12) var(--poc-shadow-far);
  transition:
    box-shadow var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}
/* Only the cards that ALREADY opt into interactivity get the lift — adding
   hover motion to a static card is the other classic cheap tell. */
[data-theme-poc] .ui-card--interactive:hover {
  transform: translateY(calc(-1 * var(--motion-slide-sm)));
  box-shadow:
    0 1px 1px var(--poc-shadow-amb),
    0 var(--p-2) var(--p-5) var(--poc-shadow-far),
    0 var(--p-8) var(--p-16) var(--poc-shadow-key);
}
@media (prefers-reduced-motion: reduce) {
  /* The global block in tokens.scss collapses DURATIONS only, so a transform
     would still teleport. Suppress the movement itself and keep the shadow. */
  [data-theme-poc] .ui-card--interactive:hover { transform: none; }
}

/* TYPE. The most under-used lever in the whole exercise, and the cheapest.
   Display sizes at default tracking look like a document; pulled tight they
   look like a product. Numerals get tabular figures so columns of stats stop
   jittering between values — the sort of detail nobody consciously notices and
   everybody feels. */
[data-theme-poc] .poc-display {
  letter-spacing: var(--tracking-tight);
}
[data-theme-poc] .poc-stat {
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
}

/* Display numerals in the brand gradient. Uses the HERO ramp (--primary ->
   --foreground), not the mark ramp: the mark opens at L 0.78, which as text on
   white would not clear even the 3:1 large-text floor. */
[data-theme-poc] .poc-stat {
  background-image: linear-gradient(135deg, var(--primary) 0%, var(--poc-hero-far) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
`.trim();
