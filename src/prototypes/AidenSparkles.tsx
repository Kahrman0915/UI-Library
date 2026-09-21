import { useId } from 'react';

/**
 * Aiden's glyph — filled sparkles, supplied by the owner (not lucide).
 *
 * **Why this lives in `prototypes/` and is NOT exported from `src/index.ts`.**
 * The library is deliberately product-agnostic — brands are two-letter codes and
 * no product name appears in it — and this is DART Central's assistant mark, not
 * design-system art. `Fab` takes whatever icon you hand it; that contract is the
 * library's, and the glyph is the product's. Exporting it would put one app's
 * branding in a shared package.
 *
 * It was extracted at the FOURTH call site (owner, 2026-09-20). Three identical
 * copies had already drifted into `AppShell`, `DartCentralHome` and `AidenPanel`
 * stories — verified byte-identical before merging — and the launcher would have
 * been a fourth. Same threshold at which `.ui-icon-button` was extracted.
 *
 * One `<path>` per star, which is what lets `Fab`'s `intro` twinkle them in turn.
 */
export const AidenSparkles = ({
  size = 24,
  gradient = false,
}: {
  /** Rendered box in px. The gradient scales with it. */
  size?: number;
  /**
   * Fill with Aiden's own gradient instead of `currentColor`. OFF by default,
   * and that default is load-bearing: on the `Fab` the glyph sits ON the
   * gradient and has to stay `--primary-foreground`, so a gradient-on-gradient
   * there would erase it.
   */
  gradient?: boolean;
}) => {
  const gid = `aiden-sparkles-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={gradient ? `url(#${gid})` : 'currentColor'}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/*
        `userSpaceOnUse` is what makes the three stars share ONE ramp across the
        24×24 box. The default (objectBoundingBox) scales the gradient to each
        path's own bounds, so every star would carry its own violet-to-blue and
        the glyph would read as three tiny rainbows instead of one object.
      */}
      {gradient && (
        <defs>
          <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="var(--aiden-gradient-start)" />
            <stop offset="50%" stopColor="var(--aiden-gradient-mid)" />
            <stop offset="100%" stopColor="var(--aiden-gradient-end)" />
          </linearGradient>
        </defs>
      )}
      <path d="M14.4 3.419a.639.639 0 0 1 1.2 0l.61 1.668a9.59 9.59 0 0 0 5.703 5.703l1.668.61a.639.639 0 0 1 0 1.2l-1.668.61a9.59 9.59 0 0 0-5.703 5.703l-.61 1.668a.639.639 0 0 1-1.2 0l-.61-1.668a9.59 9.59 0 0 0-5.703-5.703l-1.668-.61a.639.639 0 0 1 0-1.2l1.668-.61a9.59 9.59 0 0 0 5.703-5.703z" />
      <path d="M8 16.675a.266.266 0 0 1 .5 0l.254.694a4 4 0 0 0 2.376 2.377l.695.254a.266.266 0 0 1 0 .5l-.695.254a4 4 0 0 0-2.376 2.377l-.254.694a.266.266 0 0 1-.5 0l-.254-.694a4 4 0 0 0-2.376-2.377l-.695-.254a.266.266 0 0 1 0-.5l.695-.254a4 4 0 0 0 2.376-2.377z" />
      <path d="M4.2.21a.32.32 0 0 1 .6 0l.305.833a4.8 4.8 0 0 0 2.852 2.852l.833.305a.32.32 0 0 1 0 .6l-.833.305a4.8 4.8 0 0 0-2.852 2.852L4.8 8.79a.32.32 0 0 1-.6 0l-.305-.833a4.8 4.8 0 0 0-2.852-2.852L.21 4.8a.32.32 0 0 1 0-.6l.833-.305a4.8 4.8 0 0 0 2.852-2.852z" />
    </svg>
  );
};

export default AidenSparkles;
