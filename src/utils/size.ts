import type { Size, CanonicalSize } from '#/types/GlobalTypes';

/**
 * Maps the abbreviated size vocabulary onto Button/Chip's spelled-out one.
 *
 * The library grew two spellings: 23 components take `sm` / `default` / `lg`
 * (some with `xs`), while Button and Chip take `xsmall` / `small` / `default` /
 * `large`. Renaming Button's would break every consumer already passing
 * `size="small"`, so instead both spellings are accepted and normalized here to
 * the canonical one the SCSS is written against.
 *
 * **The canonical spelling is what reaches the class name** — `ui-button--sz-small`
 * is unchanged whichever spelling you pass, so the preview HTML and the Figma
 * mapping (which key off those exact strings) keep working untouched.
 *
 * The abbreviations are the direction of travel; the spelled-out forms are kept
 * for back-compat and can be dropped at a major version.
 */
const ALIASES: Record<string, CanonicalSize> = {
  xs: 'xsmall',
  sm: 'small',
  lg: 'large',
};

export const normalizeSize = (size: Size): CanonicalSize =>
  ALIASES[size] ?? (size as CanonicalSize);
