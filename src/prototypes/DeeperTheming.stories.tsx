import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ArrowRight,
  Calendar,
  ChartColumn,
  Check,
  FileText,
  Plus,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  Progress,
  Separator,
  StatusDot,
  Switch,
} from '../index';

/**
 * PROOF OF CONCEPT — deeper theming.  Round 4.
 *
 * THE QUESTION: eight sub-apps under one parent, like Office or the Apple
 * suite. Each has to stand on its own AND read as part of one ecosystem.
 * Today a `data-theme` scope reaches 9 of ~452 tokens and all nine are
 * `--primary`, so the apps read as "the same app with a different button".
 *
 * WHAT THE EARLIER ROUNDS SETTLED (kept here so the dead ends stay dead):
 *
 *  1. Tinting the PAGE cannot differentiate brands. Only ~10% of a primary's
 *     chroma survives into a surface pale enough to carry body text. Pushing
 *     the tint from 22% to 70% moved the closest pair from ΔE 0.004 to 0.014 —
 *     still three times under "tellable apart" — while dragging error-on-tint
 *     from 4.72 to 2.89. The page can be pushed into unreadable, not into
 *     carrying identity.
 *  2. Rotating to the COMPLEMENT does not help: a rigid rotation of the hue
 *     wheel preserves every pairwise distance, and three of eight complements
 *     landed on a semantic hue.
 *  3. Identity belongs in the MARK. Nothing sits on top of a mark, so it has no
 *     contrast constraint at all — the one surface where colour is free. Same
 *     pair, 0.010 as pages vs 0.128 as marks.
 *
 * ROUND 4, and the owner's call that shapes it: **in light mode the main
 * background stays WHITE.** That is not a compromise, it is the fix. It keeps
 * every semantic tint composited over the surface the system was designed
 * against, which deletes the entire class of failure round 1 found. The tint
 * moves to the surfaces that can actually afford it — the rail, section bands,
 * and the secondary/accent panels.
 *
 * Scope is deliberately narrowed to **db, dc and ec**. dc and ec are the
 * CLOSEST pair in the palette (37 degrees apart) and therefore the hardest
 * case; db sits well away from both, so it shows what the model looks like when
 * the hues are not fighting. Three brands is also the smallest set that shows a
 * FAMILY rather than a comparison — two things look like a before and after,
 * three start to look like a system.
 *
 * CONTAINMENT — unchanged and still the point. Every selector contains
 * `[data-theme-poc]`, an attribute that appears nowhere else in the repo, and
 * mode is stamped on the SAME element (`[data-theme-poc][data-mode='light']`)
 * so an inner dark block inside a light page cannot inherit the wrong rule.
 * Nothing outside this file is modified: no token, no component, no story.
 */

// ─────────────────────────────────────────────────────────────────────────────
// The POC stylesheet
// ─────────────────────────────────────────────────────────────────────────────

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
const POC_CSS = `
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

     The family guarantee survives intact, and is worth restating precisely:
     every mark uses identical lightness values, identical chroma values, and an
     identical hue ARC (-12, 0, +26 relative to the brand). Only the ANCHOR
     moves. So the marks are the same object rendered at different points on the
     wheel — which is exactly the relationship the reference set has.

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

/** Injected once. Every rule is scoped to `[data-theme-poc]`. */
function PocStyle() {
  return <style>{POC_CSS}</style>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colour measurement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `scripts/contrast-check.mjs` cannot see any of this — it brace-matches only
 * the two `[data-mode]` blocks, returns null for `color-mix`, and treats
 * unresolved as NOT a failure while still exiting 0. So the POC measures itself.
 */

let ctx: CanvasRenderingContext2D | null = null;
/**
 * Normalise ANY CSS colour string to bytes.
 *
 * Chrome serialises a color-mix result as `color(srgb …)` and a relative-colour
 * result as `oklch(…)`. Rather than write a parser per serialisation, hand the
 * string to a 1x1 canvas and read the pixel back. `globalCompositeOperation =
 * 'copy'` keeps source alpha instead of compositing onto what was there.
 */
function toRGBA(css: string): [number, number, number, number] | null {
  if (!ctx) {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    ctx = c.getContext('2d', { willReadFrequently: true });
  }
  if (!ctx || !css) return null;
  ctx.globalCompositeOperation = 'copy';
  // An invalid fillStyle is silently IGNORED and the previous value persists,
  // so reset to a known colour first.
  ctx.fillStyle = '#000000';
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2], d[3] / 255];
}

const srgbToLin = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

function luminance([r, g, b]: [number, number, number, number]) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

/** Composite a translucent colour over an opaque base. */
function over(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number, number] {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
    1,
  ];
}

function contrast(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
) {
  const f = luminance(fg[3] < 1 ? over(fg, bg) : fg);
  const b = luminance(bg);
  const [hi, lo] = f > b ? [f, b] : [b, f];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * OKLab — used for "are these two brands the same colour", which WCAG has no
 * opinion about. Contrast answers "can I read it", not "can I tell these apart".
 *   < 0.02  invisible except as a gradient
 *   < 0.05  effectively the same colour
 *   < 0.10  distinguishable side by side, not from memory
 *   >= 0.10 reads as a different colour
 */
function oklab([r, g, b]: [number, number, number, number]) {
  const R = srgbToLin(r);
  const G = srgbToLin(g);
  const B = srgbToLin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as const;
}

function deltaE(
  a: [number, number, number, number],
  b: [number, number, number, number],
) {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared data + UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Narrowed to two brands on purpose.
 *
 * dc and ec are the CLOSEST pair in the palette — 37 degrees apart as primaries,
 * and the pair that round 1 measured at ΔE 0.006 as tinted pages, i.e. the same
 * colour. They are the hardest case, so they are the honest test. db is the
 * control: far enough from both that it shows the model working when the hues
 * are not fighting each other.
 *
 * Labelled by CODE, never by product name — CLAUDE.md records that expanding
 * these codes was undone once already. The icons are illustrative.
 */
const APPS = [
  { brand: 'db', Icon: ChartColumn },
  { brand: 'dc', Icon: FileText },
  { brand: 'ec', Icon: Calendar },
] as const;
type Brand = (typeof APPS)[number]['brand'];
const BRANDS: Brand[] = ['db', 'dc', 'ec'];

const H2: CSSProperties = {
  margin: '0 0 var(--p-2)',
  fontSize: 'var(--text-lg)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--foreground)',
};
const P: CSSProperties = {
  margin: '0 0 var(--p-4)',
  fontSize: 'var(--text-sm)',
  lineHeight: 'var(--leading-6)',
  color: 'var(--muted-foreground)',
  maxWidth: 'var(--max-w-3xl)',
};
const PAGE: CSSProperties = {
  padding: 'var(--p-8)',
  display: 'grid',
  gap: 'var(--p-10)',
  maxWidth: 'var(--max-w-6xl)',
  margin: '0 auto',
};
const MONO: CSSProperties = {
  fontFamily: 'var(--font-family-mono)',
  fontSize: 'var(--text-xs)',
};

/** A themed scope, optionally with the POC layered on. */
function Scope({
  brand,
  poc,
  strength = 1,
  chromeOn = 1,
  mode,
  children,
}: {
  brand: Brand | '';
  poc?: boolean;
  strength?: number;
  chromeOn?: number;
  mode?: 'light' | 'dark';
  children: ReactNode;
}) {
  return (
    <div
      data-theme={brand || undefined}
      data-mode={mode}
      {...(poc ? { 'data-theme-poc': '' } : {})}
      style={
        poc
          ? ({ '--poc-str': strength, '--poc-chrome': chromeOn } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}

function Mark({ Icon, size = 40 }: { Icon: LucideIcon; size?: number }) {
  return (
    <span className="poc-mark" style={{ width: size, height: size }}>
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

/** Wraps each specimen so it reads as a device rather than a loose fragment. */
function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
      <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{label}</span>
      <div
        style={{
          border: 'var(--border-w-100) solid var(--border)',
          borderRadius: 'var(--rounded-lg)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Specimen 1 — a dashboard with a sidebar
// ─────────────────────────────────────────────────────────────────────────────

function DashboardPage({ brand, Icon }: { brand: Brand; Icon: LucideIcon }) {
  const [on, setOn] = useState(true);
  const nav = [
    { label: 'Overview', active: true },
    { label: 'Cohorts', active: false },
    { label: 'Exports', active: false },
    { label: 'Settings', active: false },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '200px minmax(0,1fr)',
        minHeight: 560,
        background: 'var(--background)',
      }}
    >
      {/* The rail is the brand surface. It uses its OWN foreground tokens
          throughout — --muted-foreground on a tinted rail measures 2.92. */}
      <aside
        className="poc-rail"
        style={{
          // backgroundColor, NOT the `background` shorthand. Inline styles beat
          // the stylesheet, and the shorthand resets background-image to none —
          // which silently deleted .poc-rail's gradient while the inset edge
          // from the same rule kept working, so the rule looked healthy.
          backgroundColor: 'var(--sidebar)',
          borderRight: 'var(--border-w-100) solid var(--sidebar-border)',
          padding: 'var(--p-4)',
          display: 'grid',
          alignContent: 'start',
          gap: 'var(--p-4)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2-5)' }}>
          <Mark Icon={Icon} size={32} />
          <strong style={{ ...MONO, fontSize: 'var(--text-sm)' }}>{brand}</strong>
        </div>
        <nav style={{ display: 'grid', gap: 'var(--p-0-5)' }}>
          {nav.map((n) => (
            <span
              key={n.label}
              style={{
                padding: 'var(--p-2) var(--p-2-5)',
                borderRadius: 'var(--rounded-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: n.active ? 'var(--font-medium)' : 'var(--font-normal)',
                background: n.active ? 'var(--sidebar-accent)' : undefined,
                color: n.active
                  ? 'var(--sidebar-accent-foreground)'
                  : 'var(--sidebar-foreground)',
              }}
            >
              {n.label}
            </span>
          ))}
        </nav>
      </aside>

      <div style={{ display: 'grid', alignContent: 'start' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--p-3)',
            padding: 'var(--p-4) var(--p-6)',
            borderBottom: 'var(--border-w-100) solid var(--border)',
            background: 'var(--card)',
          }}
        >
          <strong style={{ flex: 1, fontSize: 'var(--text-base)' }}>Overview</strong>
          <StatusDot status="online" label="Live" />
          <Button id={`${brand}-dash-cta`} label="New report" IconLeft={Plus} size="sm" />
        </header>

        <div style={{ padding: 'var(--p-6)', display: 'grid', gap: 'var(--p-5)' }}>
          <Alert
            id={`${brand}-dash-alert`}
            variant="info"
            title="Two sources are still syncing"
            description="Numbers may move until the last import finishes."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--p-4)',
            }}
          >
            <Card id={`${brand}-c1`}>
              <CardHeader id={`${brand}-c1`} title="Active accounts" description="Last 7 days" />
              <CardBody>
                <div
                  className="poc-stat"
                  style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}
                >
                  12,480
                </div>
                <Progress id={`${brand}-pr`} value={68} />
              </CardBody>
            </Card>
            <Card id={`${brand}-c2`}>
              <CardHeader id={`${brand}-c2`} title="Team" description="Owners of this space" />
              <CardBody>
                <AvatarGroup id={`${brand}-ag`} max={3}>
                  <Avatar id={`${brand}-a1`} fallback="KM" />
                  <Avatar id={`${brand}-a2`} fallback="JD" />
                  <Avatar id={`${brand}-a3`} fallback="AR" />
                  <Avatar id={`${brand}-a4`} fallback="TS" />
                </AvatarGroup>
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--p-2)',
                    marginTop: 'var(--p-3)',
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge id={`${brand}-b1`} variant="default" label="Pro" />
                  <Badge id={`${brand}-b2`} variant="outline" label="Beta" />
                </div>
              </CardBody>
            </Card>
          </div>

          <Input
            id={`${brand}-search`}
            label="Find a cohort"
            IconLeft={Search}
            placeholder="Search…"
          />

          <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap' }}>
            <Chip id={`${brand}-ch1`} label="Weekly" active />
            <Chip id={`${brand}-ch2`} label="Monthly" />
            <Chip id={`${brand}-ch3`} label="Quarterly" />
          </div>

          <ItemGroup id={`${brand}-list`}>
            <Item id={`${brand}-i1`} variant="outline">
              <ItemContent>
                <ItemTitle>Trial → paid</ItemTitle>
                <ItemDescription>Conversion fell 5pts after the pricing change</ItemDescription>
              </ItemContent>
            </Item>
            <Item id={`${brand}-i2`} variant="outline">
              <ItemContent>
                <ItemTitle>Legacy plan</ItemTitle>
                <ItemDescription>~400 seats lapsed in the same week</ItemDescription>
              </ItemContent>
            </Item>
          </ItemGroup>

          {/* The knockout set — Switch thumb, Avatar ring and the Slider thumb
              all use --background as a KNOCKOUT rather than as a page colour.
              Keeping the page white means they stay correct for free; a tinted
              page is exactly what breaks them, and is why adoption would need a
              separate --surface-knockout token. */}
          <div style={{ display: 'flex', gap: 'var(--p-6)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Switch id={`${brand}-sw`} label="Auto-refresh" checked={on} onCheckedChange={setOn} />
            <Avatar
              id={`${brand}-av`}
              fallback="KM"
              badge={<StatusDot status="online" label="Online" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Specimen 2 — a marketing page
// ─────────────────────────────────────────────────────────────────────────────

function MarketingPage({ brand, Icon }: { brand: Brand; Icon: LucideIcon }) {
  const features = [
    { Icon: Users, title: 'Shared cohorts', body: 'One definition, every team, no re-cutting.' },
    { Icon: Settings, title: 'Pipelines', body: 'Scheduled imports with replay and backfill.' },
    { Icon: FileText, title: 'Reporting', body: 'Exports that match what the dashboard shows.' },
  ];
  return (
    <div style={{ background: 'var(--background)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--p-3)',
          padding: 'var(--p-4) var(--p-6)',
          borderBottom: 'var(--border-w-100) solid var(--border)',
        }}
      >
        <Mark Icon={Icon} size={30} />
        <strong style={{ ...MONO, flex: 1, fontSize: 'var(--text-sm)' }}>{brand}</strong>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Pricing</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Docs</span>
        <Button id={`${brand}-mk-signin`} label="Sign in" style="ghost" size="sm" />
      </header>

      {/* HERO — the gradient, at the one moment the brand should be loudest. */}
      <section
        className="poc-hero"
        style={{
          padding: 'var(--p-12) var(--p-6)',
          display: 'grid',
          gap: 'var(--p-4)',
          justifyItems: 'center',
          textAlign: 'center',
          color: 'var(--primary-foreground)',
        }}
      >
        <Mark Icon={Icon} size={56} />
        <h1
          className="poc-display"
          style={{
            margin: 0,
            fontSize: 'var(--text-4xl)',
            lineHeight: 'var(--leading-10)',
            fontWeight: 'var(--font-semibold)',
            maxWidth: 'var(--max-w-2xl)',
          }}
        >
          Every number in one place
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-7)',
            maxWidth: 'var(--max-w-xl)',
            opacity: 0.92,
          }}
        >
          Bring imports, cohorts and reporting under a single definition your whole team shares.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', marginTop: 'var(--p-2)' }}>
          <Button id={`${brand}-mk-cta`} label="Start free" IconRight={ArrowRight} />
          <Button id={`${brand}-mk-cta2`} label="Book a demo" style="outline" />
        </div>
      </section>

      {/* WHITE section — the page's default state. */}
      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 'var(--p-2)' }}>
          <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
            Built for the whole pipeline
          </h2>
          <p style={{ ...P, margin: '0 auto' }}>From ingest to the number on the slide.</p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--p-4)',
          }}
        >
          {features.map((f) => (
            <Card id={`${brand}-f-${f.title}`} key={f.title}>
              <CardBody>
                <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                  <Mark Icon={f.Icon} size={36} />
                  <strong style={{ fontSize: 'var(--text-base)' }}>{f.title}</strong>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    {f.body}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* BAND — the tinted strip. On a white page this is where a large area of
          brand colour can live, because it reads as a deliberate break in the
          page rather than as the page itself. */}
      <section
        className="poc-band"
        style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}
      >
        <div style={{ textAlign: 'center', display: 'grid', gap: 'var(--p-2)' }}>
          <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
            Trusted where the numbers matter
          </h2>
          <p style={{ ...P, margin: '0 auto' }}>
            The tinted band is the same component set on a brand surface.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--p-4)',
            textAlign: 'center',
          }}
        >
          {[
            ['99.98%', 'Ingest uptime'],
            ['4.2 min', 'Median sync'],
            ['120+', 'Connectors'],
          ].map(([n, l]) => (
            <div key={l} style={{ display: 'grid', gap: 'var(--p-1)' }}>
              <span
                className="poc-stat"
                style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}
              >
                {n}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                {l}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['SOC 2', 'SSO', 'Audit log', 'Residency'].map((t) => (
            <Badge id={`${brand}-t-${t}`} key={t} variant="outline" label={t} />
          ))}
        </div>
      </section>

      {/* Pricing on white again, so the band reads as a break rather than a mode. */}
      <section style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-6)' }}>
        <h2
          className="poc-display"
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
          }}
        >
          Simple pricing
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--p-4)',
          }}
        >
          {[
            { name: 'Team', price: '$29', feats: ['5 seats', 'Daily sync', 'Email support'], hi: false },
            { name: 'Business', price: '$99', feats: ['25 seats', 'Hourly sync', 'SSO'], hi: true },
            { name: 'Enterprise', price: 'Custom', feats: ['Unlimited', 'Realtime', 'Residency'], hi: false },
          ].map((p) => (
            <Card id={`${brand}-p-${p.name}`} key={p.name} interactive>
              <CardBody>
                <div style={{ display: 'grid', gap: 'var(--p-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)' }}>
                    <strong style={{ flex: 1 }}>{p.name}</strong>
                    {p.hi && <Badge id={`${brand}-p-b-${p.name}`} variant="default" label="Popular" />}
                  </div>
                  <span
                    className="poc-stat"
                    style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-semibold)' }}
                  >
                    {p.price}
                  </span>
                  <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
                    {p.feats.map((f) => (
                      <span
                        key={f}
                        style={{
                          display: 'flex',
                          gap: 'var(--p-2)',
                          alignItems: 'center',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <Check size={16} aria-hidden="true" style={{ color: 'var(--primary-text)' }} />
                        {f}
                      </span>
                    ))}
                  </div>
                  <Button
                    id={`${brand}-p-cta-${p.name}`}
                    label="Choose"
                    style={p.hi ? 'default' : 'outline'}
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Closing CTA on the STRONG band — the loudest flat surface on the page. */}
      <section
        className="poc-band-strong"
        style={{ padding: 'var(--p-12) var(--p-6)', display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center' }}
      >
        <h2 className="poc-display" style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>
          Ready when you are
        </h2>
        <p style={{ ...P, margin: 0 }}>No card required for the first 30 days.</p>
        <span className="poc-hero-cta">
          <Button id={`${brand}-mk-final`} label="Start free" IconRight={ArrowRight} />
        </span>
      </section>

      <footer style={{ padding: 'var(--p-6)' }}>
        <Separator id={`${brand}-sep`} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--p-3)',
            marginTop: 'var(--p-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)',
          }}
        >
          <Mark Icon={Icon} size={22} />
          <span style={MONO}>{brand}</span>
          <span style={{ flex: 1 }} />
          <span>Part of one suite</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls shared by the two page stories
// ─────────────────────────────────────────────────────────────────────────────

function Controls({
  strength,
  setStrength,
  chromeOn,
  setChromeOn,
  mode,
  setMode,
  showChrome = true,
}: {
  strength: number;
  setStrength: (n: number) => void;
  chromeOn: number;
  setChromeOn: (n: number) => void;
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
  showChrome?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 'var(--p-5)', flexWrap: 'wrap', alignItems: 'center' }}>
      <Switch
        id="poc-on"
        label="Theming on"
        checked={strength === 1}
        onCheckedChange={(v) => setStrength(v ? 1 : 0)}
      />
      {showChrome && (
        <Switch
          id="poc-chrome"
          label="Tint the rail"
          checked={chromeOn === 1}
          onCheckedChange={(v) => setChromeOn(v ? 1 : 0)}
        />
      )}
      <Switch
        id="poc-mode"
        label="Dark mode"
        checked={mode === 'dark'}
        onCheckedChange={(v) => setMode(v ? 'dark' : 'light')}
      />
    </div>
  );
}

const meta: Meta = {
  title: 'Prototypes/Deeper Theming',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'A proof of concept for themes that reach past `--primary`. Scoped to two brands, `dc` ' +
        'and `ec` — the closest pair in the palette, and therefore the hardest case. In light ' +
        'mode the page stays white; the tint lives on the rail, on marketing bands, and on the ' +
        'secondary surfaces. It modifies nothing: every rule is scoped to a `data-theme-poc` ' +
        'attribute that exists nowhere else in the repo.',
      tags: ['poc', 'theming'],
    },
  },
};
export default meta;
type Story = StoryObj;

// ─────────────────────────────────────────────────────────────────────────────
// 1 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const Dashboard: Story = {
  render: function DashboardStory() {
    const [strength, setStrength] = useState(1);
    const [chromeOn, setChromeOn] = useState(1);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The same dashboard, two sub-brands</h2>
            <p style={P}>
              In light mode the content area is <strong>white in both</strong>. The brand lives in
              the rail, the mark, and the accent — the three places that can carry it without
              costing legibility. Turn <em>Tint the rail</em> off to see how much of the identity
              the rail alone is holding.
            </p>
            <Controls
              strength={strength}
              setStrength={setStrength}
              chromeOn={chromeOn}
              setChromeOn={setChromeOn}
              mode={mode}
              setMode={setMode}
            />
          </div>

          {APPS.map(({ brand, Icon }) => (
            <Frame key={brand} label={`data-theme="${brand}"`}>
              <Scope brand={brand} poc strength={strength} chromeOn={chromeOn} mode={mode}>
                <DashboardPage brand={brand} Icon={Icon} />
              </Scope>
            </Frame>
          ))}

          <div>
            <h2 style={H2}>What to look at</h2>
            <p style={P}>
              <strong>The rail deliberately stopped doing the work.</strong> Earlier rounds pushed
              it to 55% raw primary because it was the only surface with headroom to carry identity.
              The mark carries it now — 0.10+ separation at every gradient stop — so the rail was
              greyed back to a chroma of ~0.015 against the loud version&rsquo;s 0.103. It reads as
              grey that leans the brand&rsquo;s way, which is what expensive software does; a rail
              that shouts is the loudest tell of a cheap theme.
            </p>
            <p style={P}>
              Two things fell out of that, both measured after the change rather than predicted
              before it. <strong>The guard rail disappeared:</strong>{' '}
              <code style={MONO}>--muted-foreground</code> on the rail was 3.98 and failing, and now
              measures <strong>5.64</strong> — so the &ldquo;everything inside the rail must use{' '}
              <code style={MONO}>--sidebar-*</code> foregrounds&rdquo; constraint is simply gone. And{' '}
              <strong>the rail no longer differentiates the brands at all</strong> — separation
              across the three collapses to 0.003–0.014. That is the trade, and it is only
              affordable because the mark is holding identity by itself. Turn the marks off and this
              rail says nothing about which app you are in.
            </p>
            <p style={P}>
              Note the knockouts stay correct — the Switch thumb, the Avatar ring and the status dot
              punch through with <code style={MONO}>--background</code>. That is a direct dividend
              of keeping the page white; a tinted page is exactly what breaks them, and fixing it
              would need a separate <code style={MONO}>--surface-knockout</code> token that this POC
              cannot add.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 — Marketing
// ─────────────────────────────────────────────────────────────────────────────

export const Marketing: Story = {
  render: function MarketingStory() {
    const [strength, setStrength] = useState(1);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    return (
      <>
        <PocStyle />
        <div style={PAGE}>
          <div>
            <h2 style={H2}>The same marketing page, two sub-brands</h2>
            <p style={P}>
              A marketing page is where the earlier rounds were wrong in an interesting way. A
              product UI has to stay quiet, so its brand budget is tiny — but a marketing page{' '}
              <em>alternates</em>. White sections, then a full-bleed tinted band, then white again.
              The band can be far louder than any app surface because it is a deliberate break in
              the page rather than the page itself, and nothing has to stay readable across it for
              hours.
            </p>
            <Controls
              strength={strength}
              setStrength={setStrength}
              chromeOn={1}
              setChromeOn={() => {}}
              mode={mode}
              setMode={setMode}
              showChrome={false}
            />
          </div>

          {APPS.map(({ brand, Icon }) => (
            <Frame key={brand} label={`data-theme="${brand}"`}>
              <Scope brand={brand} poc strength={strength} mode={mode}>
                <MarketingPage brand={brand} Icon={Icon} />
              </Scope>
            </Frame>
          ))}

          <div>
            <h2 style={H2}>Three intensities, on purpose</h2>
            <p style={P}>
              <strong>Hero — the gradient.</strong> Provably AA-safe: every stop lies on the segment{' '}
              <code style={MONO}>--primary</code> → <code style={MONO}>--foreground</code>, and{' '}
              <code style={MONO}>--primary-foreground</code> is by construction the opposite pole to{' '}
              <code style={MONO}>--foreground</code>, so contrast against the label only ever
              increases. No per-brand tuning, no measurement needed.
              <br />
              <strong>Band — the tinted strip.</strong> Body copy still sits on it, so it is capped
              by <code style={MONO}>--muted-foreground</code>; see the Audit story for the measured
              ceiling.
              <br />
              <strong>White — the default.</strong> Most of the page, and the reason the band reads
              as an event.
            </p>
            <p style={P}>
              One honest caveat: an <code style={MONO}>Alert</code> dropped onto a band would hit
              round 1&rsquo;s bug again, because the semantic <code style={MONO}>-light</code> tints
              are <code style={MONO}>rgba()</code> composited over whatever is behind them. Keep
              alerts on white, or re-derive the tints. The Audit story measures both cases.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 — Marks
// ─────────────────────────────────────────────────────────────────────────────

export const Marks: Story = {
  render: function MarksStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [d, setD] = useState<Record<string, number[]>>({});

    /** Every unordered pair of the three brands. */
    const PAIRS: [Brand, Brand][] = [
      ['db', 'dc'],
      ['db', 'ec'],
      ['dc', 'ec'],
    ];
    const SURFACES: [string, string, string][] = [
      ['Marketing band', 'var(--poc-band)', 'large area, capped by the body text on it'],
      ['Sidebar rail', 'var(--sidebar)', 'own foreground tokens, so more headroom'],
      // All three stops, because a uniform hue arc should preserve the pairwise
      // gap at EVERY point of the gradient, not just at the anchor. If the arc
      // were per-brand these rows would diverge — that is the check.
      ['Mark — light stop', 'oklch(from var(--primary) 0.80 0.17 calc(h - 12))', 'the arc opens one neighbour back'],
      ['Mark — mid stop', 'oklch(from var(--primary) 0.63 0.21 h)', 'sits exactly on the brand hue'],
      ['Mark — dark stop', 'oklch(from var(--primary) 0.47 0.19 calc(h + 26))', 'and lands forward of it'],
    ];

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const read = (brand: Brand, css: string) => {
        const scope = host.querySelector<HTMLElement>(`[data-m="${brand}"]`);
        const probe = scope?.firstElementChild as HTMLElement | undefined;
        if (!probe) return null;
        probe.style.backgroundColor = '';
        probe.style.backgroundColor = css;
        return toRGBA(getComputedStyle(probe).backgroundColor);
      };
      const next: Record<string, number[]> = {};
      for (const [label, css] of SURFACES) {
        next[label] = PAIRS.map(([x, y]) => {
          const a = read(x, css);
          const b = read(y, css);
          return a && b ? deltaE(a, b) : NaN;
        });
      }
      setD(next);
    }, []);

    return (
      <>
        <PocStyle />
        <div
          ref={hostRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          {BRANDS.map((b) => (
            <span
              key={b}
              data-m={b}
              data-theme={b}
              data-theme-poc=""
              data-mode="light"
              style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}
            >
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>Where the identity actually lives</h2>
            <p style={P}>
              Nothing sits on top of a mark, so it carries no contrast constraint at all — the one
              surface in the UI where colour is free.
            </p>
            <p style={P}>
              <strong>The hue travels; it does not sit still.</strong> The first version held one hue
              and moved only lightness, which is why it read as a tinted chip. Each mark now moves
              through an <em>arc</em> — the light end one neighbour back, the dark end a good way
              forward — plus a brighter counter-rotated bloom in the top corner standing in for a
              second overlapping plane. So <code style={MONO}>dc</code> runs green-teal → teal →
              blue, <code style={MONO}>ec</code> runs sky → blue → indigo, and{' '}
              <code style={MONO}>db</code> runs blue → indigo → violet.
            </p>
            <p style={P}>
              The family guarantee survives, and is worth stating exactly: every mark uses{' '}
              <strong>identical lightness values, identical chroma values, and an identical hue arc</strong>{' '}
              (−12, 0, +26 relative to the brand). Only the anchor moves. The marks are the same
              object rendered at different points on the wheel — which is the relationship the
              reference set has. The mid stop stays exactly on the brand hue, so the dominant colour
              is still the brand&rsquo;s own; the arc is decoration around it, not a redefinition.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--p-8)', flexWrap: 'wrap' }}>
            {APPS.map(({ brand, Icon }) => (
              <div key={brand} style={{ display: 'grid', gap: 'var(--p-3)', justifyItems: 'center' }}>
                <Scope brand={brand} poc strength={1}>
                  <div style={{ display: 'flex', gap: 'var(--p-3)', alignItems: 'flex-end' }}>
                    <Mark Icon={Icon} size={88} />
                    <Mark Icon={Icon} size={48} />
                    <Mark Icon={Icon} size={28} />
                  </div>
                </Scope>
                <span style={{ ...MONO, color: 'var(--muted-foreground)' }}>{brand}</span>
              </div>
            ))}
          </div>

          <div>
            <h2 style={H2}>Every pair, per surface</h2>
            <p style={P}>
              OKLab ΔE between each pair of brands, measured live. Below <strong>0.05</strong> is
              &ldquo;effectively the same colour&rdquo;; <strong>0.10</strong> is where two things
              read as different colours. Green marks a cell that clears 0.10.
            </p>
            <table style={{ borderCollapse: 'collapse', fontSize: 'var(--text-sm)', width: '100%', maxWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Surface</th>
                  {PAIRS.map(([x, y]) => (
                    <th key={`${x}${y}`} style={{ ...MONO, textAlign: 'right', padding: 'var(--p-2)' }}>
                      {x}/{y}
                    </th>
                  ))}
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }} />
                </tr>
              </thead>
              <tbody>
                {SURFACES.map(([label, , note]) => (
                  <tr key={label} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                    <td style={{ padding: 'var(--p-2)' }}>{label}</td>
                    {(d[label] ?? PAIRS.map(() => NaN)).map((v, i) => (
                      <td
                        key={i}
                        style={{
                          ...MONO,
                          padding: 'var(--p-2)',
                          textAlign: 'right',
                          fontWeight: 'var(--font-semibold)',
                          color: v >= 0.1 ? 'var(--success)' : 'var(--muted-foreground)',
                        }}
                      >
                        {Number.isFinite(v) ? v.toFixed(3) : '—'}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: 'var(--p-2)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>The limit worth knowing</h2>
            <p style={P}>
              A uniform arc preserves the gap at every stop — the three mark rows above stay
              separated all the way along the gradient, which is precisely what a{' '}
              <em>per-brand</em> arc would not do. The one honest wrinkle: at the extremes the ramps
              do pass through each other&rsquo;s hue territory (dc&rsquo;s dark stop lands at 210°,
              ec&rsquo;s light stop at 209°). They never collide visually because they sit at
              opposite ends of the lightness range, and the reference set has the same overlap.
            </p>
            <p style={P}>
              The mark <em>amplifies</em> a hue difference; it cannot <em>create</em> one. dc and ec
              are 37 degrees apart, which is enough. Two brands 14 degrees apart stay similar at any
              saturation — and that is the useful half of the Office comparison, because{' '}
              <strong>Word and Outlook are both blue</strong> and nobody confuses them. The glyph
              carries the identity and the colour only supports it. Hue is a bounded resource; a
              silhouette is not.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4 — Audit
// ─────────────────────────────────────────────────────────────────────────────

type Pairing = { label: string; fg: string; bg: string; onBand?: boolean; note?: string };

const PAIRINGS: Pairing[] = [
  { label: 'foreground / background', fg: '--foreground', bg: '--background', note: 'white in light — unchanged' },
  { label: 'muted-foreground / background', fg: '--muted-foreground', bg: '--background' },
  { label: 'foreground / card', fg: '--foreground', bg: '--card' },
  { label: 'muted-foreground / muted', fg: '--muted-foreground', bg: '--muted', note: 'tightest in the system' },
  { label: 'muted-foreground / secondary', fg: '--muted-foreground', bg: '--secondary' },
  { label: 'accent-foreground / accent', fg: '--accent-foreground', bg: '--accent' },
  { label: 'primary-foreground / primary', fg: '--primary-foreground', bg: '--primary' },
  { label: 'sidebar-foreground / sidebar', fg: '--sidebar-foreground', bg: '--sidebar', note: 'the tinted rail' },
  { label: 'sidebar-accent-fg / sidebar-accent', fg: '--sidebar-accent-foreground', bg: '--sidebar-accent', note: 'the rail ceiling' },
  { label: 'muted-foreground / sidebar', fg: '--muted-foreground', bg: '--sidebar', note: 'now PASSES — was 3.98 at the loud rail' },
  { label: 'foreground / band', fg: '--foreground', bg: '--poc-band' },
  { label: 'muted-foreground / band', fg: '--muted-foreground', bg: '--poc-band', note: 'caps the band tint' },
  { label: 'muted-foreground / band DEEPEST', fg: '--muted-foreground', bg: '--poc-band-deep', note: 'the gradient bloom — worst point' },
  { label: 'muted-foreground / band-strong', fg: '--muted-foreground', bg: '--poc-band-strong' },
  { label: 'stat gradient (lightest stop) / band', fg: '--primary', bg: '--poc-band', note: 'large text — 3:1 floor' },
  { label: 'error / error-light', fg: '--error', bg: '--error-light', note: 'over the WHITE page' },
  { label: 'error / error-light ON BAND', fg: '--error', bg: '--error-light', onBand: true, note: 'the remaining hazard' },
  { label: 'info / info-light', fg: '--info', bg: '--info-light' },
  { label: 'border / background', fg: '--border', bg: '--background', note: '1.4.11 wants 3:1 — pre-existing' },
];

export const Audit: Story = {
  render: function AuditStory() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const [rows, setRows] = useState<Record<string, Record<Brand, number>>>({});

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const next: Record<string, Record<Brand, number>> = {};
      for (const brand of BRANDS) {
        const scope = host.querySelector<HTMLElement>(`[data-a="${brand}"]`);
        if (!scope) continue;
        const probe = scope.firstElementChild as HTMLElement;
        const read = (token: string) => {
          probe.style.backgroundColor = '';
          probe.style.backgroundColor = `var(${token})`;
          return toRGBA(getComputedStyle(probe).backgroundColor);
        };
        for (const p of PAIRINGS) {
          const fg = read(p.fg);
          const bg = read(p.bg);
          if (!fg || !bg) continue;
          // A translucent surface sits over whatever is behind it — which is the
          // whole point of the "ON BAND" row: same token, different backdrop.
          const behind = read(p.onBand ? '--poc-band' : '--background');
          const solid = bg[3] < 1 && behind ? over(bg, behind) : bg;
          next[p.label] ??= {} as Record<Brand, number>;
          next[p.label][brand] = contrast(fg, solid);
        }
      }
      setRows(next);
    }, [mode]);

    // WCAG 1.4.11 wants 3:1 for UI boundaries, and 1.4.3 allows 3:1 for large
    // text — the display numerals are --text-3xl, comfortably over the 24px
    // threshold, so they are held to 3 rather than 4.5.
    const floor = (label: string) =>
      label.startsWith('border') || label.startsWith('stat gradient') ? 3 : 4.5;

    return (
      <>
        <PocStyle />
        <div
          ref={hostRef}
          aria-hidden="true"
          style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}
        >
          {BRANDS.map((b) => (
            <span
              key={b}
              data-a={b}
              data-theme={b}
              data-theme-poc=""
              data-mode={mode}
              style={{ '--poc-str': 1, '--poc-chrome': 1 } as CSSProperties}
            >
              <span />
            </span>
          ))}
        </div>

        <div style={PAGE}>
          <div>
            <h2 style={H2}>Measured, not asserted</h2>
            <p style={P}>
              <code style={MONO}>scripts/contrast-check.mjs</code> cannot see any of this: it
              brace-matches only the two <code style={MONO}>[data-mode]</code> blocks, returns null
              for <code style={MONO}>color-mix</code>, and treats unresolved as <em>not</em> a
              failure while still exiting 0. So the POC measures itself, in this browser, at full
              strength.
            </p>
            <Switch
              id="audit-mode"
              label="Dark mode"
              checked={mode === 'dark'}
              onCheckedChange={(v) => setMode(v ? 'dark' : 'light')}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: 'var(--border-w-100) solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Pairing</th>
                  {BRANDS.map((b) => (
                    <th key={b} style={{ ...MONO, textAlign: 'right', padding: 'var(--p-2)' }}>
                      {b}
                    </th>
                  ))}
                  <th style={{ textAlign: 'left', padding: 'var(--p-2)' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {PAIRINGS.map((p) => {
                  const r = rows[p.label];
                  return (
                    <tr key={p.label} style={{ borderBottom: 'var(--border-w-50) solid var(--border)' }}>
                      <td style={{ padding: 'var(--p-2)' }}>{p.label}</td>
                      {BRANDS.map((b) => {
                        const v = r?.[b];
                        const bad = v != null && v < floor(p.label);
                        return (
                          <td
                            key={b}
                            style={{
                              ...MONO,
                              padding: 'var(--p-2)',
                              textAlign: 'right',
                              color: bad ? 'var(--error)' : 'var(--foreground)',
                              fontWeight: bad ? 'var(--font-semibold)' : 'var(--font-normal)',
                            }}
                          >
                            {v == null ? '—' : v.toFixed(2)}
                          </td>
                        );
                      })}
                      <td
                        style={{
                          padding: 'var(--p-2)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {p.note ?? ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={H2}>The two rows that matter</h2>
            <p style={P}>
              <strong>
                <code style={MONO}>muted-foreground / sidebar</code>
              </strong>{' '}
              now passes at <strong>5.64</strong>, and the row is kept because of what it used to
              say. At the loud 55% rail it measured 3.98 and failed, which forced a rule: every
              component inside the rail had to use the <code style={MONO}>--sidebar-*</code>{' '}
              foregrounds. Greying the rail dissolved that rule rather than satisfying it. Quieting
              a surface does not just make it calmer — it makes it less demanding of everything
              placed on it, which is a cost that never appears in a colour picker.
            </p>
            <p style={P}>
              <strong>
                <code style={MONO}>error / error-light ON BAND</code>
              </strong>{' '}
              is round 1&rsquo;s bug, reproduced deliberately. The same token passes on white and
              fails on the band, because the tint is <code style={MONO}>rgba()</code> and composites
              over whatever is behind it. Keeping the page white is what makes every other semantic
              row safe; the band is the one place the hazard survives.
            </p>
          </div>
        </div>
      </>
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5 — Recipe + what this does not prove
// ─────────────────────────────────────────────────────────────────────────────

export const Recipe: Story = {
  render: () => (
    <>
      <PocStyle />
      <div style={PAGE}>
        <div>
          <h2 style={H2}>The model, in three tiers</h2>
          <p style={P}>
            The original question had two halves that pull in opposite directions — each app should
            stand on its own, and the whole thing should feel like one ecosystem. They are not in
            conflict once you notice they live in <em>different tiers</em>.
          </p>
          <p style={P}>
            <strong>Tier 1 — the mark.</strong> Maximum chroma, a fraction of a percent of the
            pixels, no contrast constraint at all. This is where an app earns the right to stand on
            its own.
            <br />
            <strong>Tier 2 — the accent and the chrome.</strong>{' '}
            <code style={MONO}>--primary</code> on CTAs, selection and active nav; the rail; the
            marketing band. Medium chroma, medium area, real constraints.
            <br />
            <strong>Tier 3 — the page.</strong> Most of the pixels. Stays white, and stays{' '}
            <em>identical across every app</em>.
          </p>
          <p style={P}>
            Tier 3 does the ecosystem work <strong>by being the same</strong>, not by being themed.
            That is why the earlier rounds got worse the harder they pushed: every increment spent
            making the pages differ was an increment spent making the suite look less like a suite.
          </p>
        </div>

        <div>
          <h2 style={H2}>The whole stylesheet</h2>
          <p style={P}>
            Every selector contains <code style={MONO}>[data-theme-poc]</code>, an attribute that
            appears nowhere else in the repo. At <code style={MONO}>--poc-str: 0</code> every mix
            resolves to its literal base, so the recipe degrades to today exactly.
          </p>
          <pre
            style={{
              margin: 0,
              padding: 'var(--p-4)',
              background: 'var(--muted)',
              borderRadius: 'var(--rounded-md)',
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--text-code)',
              lineHeight: 'var(--leading-5)',
              color: 'var(--foreground)',
              overflowX: 'auto',
              maxHeight: 520,
            }}
          >
            {POC_CSS}
          </pre>
        </div>

        <div>
          <h2 style={H2}>What this does not prove</h2>
          <p style={P}>
            <strong>Portalled overlays escape the scope.</strong> Ten components — Dialog, Drawer,
            Popover, Tooltip, DropdownMenu, ContextMenu, Select, Combobox, HoverCard, Toaster —
            render into <code style={MONO}>document.body</code>, outside any themed subtree. That is
            pre-existing with today&rsquo;s scoping; the POC only exposes it.
            <br />
            <strong>Adoption needs raw neutral tokens.</strong> A custom property cannot reference
            itself, so the bases here are hardcoded literals. Real adoption needs a
            <code style={MONO}> --surface-* </code>layer with the semantic tokens derived from it.
            <br />
            <strong>The contrast gate would need rewriting</strong> — theme-aware, with a{' '}
            <code style={MONO}>var()</code> resolver and a <code style={MONO}>color-mix</code>{' '}
            evaluator. Until then it prints a green pass over all of this.
            <br />
            <strong>Only three brands are exercised.</strong> dc and ec are the hardest pair and db
            is the control, which makes them a good test and a poor sample. The other five are not
            re-verified here.
            <br />
            <strong>The depth layer is not free at scale.</strong> Every card carries two shadow
            layers and a gradient wash, every band two background layers plus insets. That is fine
            on these pages and unmeasured on a real one — gradients and large blurred shadows are
            paint-bound, and a long list of them is the usual cause of scroll jank.
            <br />
            <strong>Untested:</strong> forced-colors, <code style={MONO}>prefers-contrast</code>,
            print, nested POC scopes, and APCA — which weights light-text-on-light-tint very
            differently, and that is half of what this changes.
            <br />
            <strong>No designer or user validation.</strong> This shows what is possible, not what
            is wanted.
          </p>
        </div>
      </div>
    </>
  ),
};
