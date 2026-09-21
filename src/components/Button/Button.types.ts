import type { Size } from '#/types/GlobalTypes';

/**
 * Button props.
 *
 * **`variant` and `style` are two independent axes — this is the most
 * confusable pair in the library:**
 * - `variant` = *which color family* (default/theme, error, info, success,
 *   warning, aiden).
 * - `style` = *how much emphasis* within that family (solid → secondary →
 *   outline → ghost → link).
 *
 * So `variant="error" style="outline"` is a red outline button. The native CSS
 * `style` attribute is Omitted to make room for this prop — use `className`
 * for one-off styling.
 */
export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'style' | 'onClick'
> & {
  /** Required. Seeds child ids (e.g. `{id}-spinner`) for aria wiring. */
  id: string;
  /** Button text. Omit only for icon-only buttons — then `aria-label` is required. */
  label?: string;
  /**
   * Click handler. Note the narrowed signature: it receives **no event**, so
   * `preventDefault()` / modifier keys aren't reachable. Reach for a plain
   * `<button>` if you need the event.
   */
  onClick?: () => void;
  /** Color family. `default` IS the current theme's primary — there is no "brand". */
  variant?: ButtonVariant;
  /** Emphasis rung within the variant. NOT the CSS style attribute. */
  style?: ButtonStyle;
  /** `xsmall` | `small` | `default` | `large`. Note: Button/Chip use this
   *  vocabulary; most other components use `sm`/`default`/`lg`. */
  size?: Size;
  /** Defaults to `button` — set `submit` to submit a surrounding form. */
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  /** Swaps the label for a Spinner and disables the button. */
  isLoading?: boolean;
  /** Icon before the label. Must be a zero-prop component (`() => JSX`). */
  IconLeft?: React.FC;
  /** Icon after the label. Must be a zero-prop component. */
  IconRight?: React.FC;
  /**
   * A count riding on the button — how many filters are applied, how many items
   * are selected. Sits after the `label` and before any `IconRight`, so a
   * trailing chevron stays last.
   *
   * **It is not a `Badge`.** `Badge` renders a `div`, and a div inside a
   * `<button>` is flow content in a phrasing context — invalid markup the
   * browser silently un-nests. This is a `span` that takes its color from
   * `currentColor`, so it adapts to every variant and style with no per-variant
   * rules: a 15% tint of the label color, whatever that label color is.
   *
   * It is decorative-by-omission: the count is visible text inside the button,
   * so it already forms part of the accessible name ("Filter 3"). If that reads
   * badly, pass an explicit `aria-label`.
   */
  count?: number | string;
  /** Square, label-less button. Pair with `IconCenter` + `aria-label`. */
  iconOnly?: boolean;
  /** The glyph for an `iconOnly` button. */
  IconCenter?: React.FC;
  /** Required whenever there's no visible `label`, or the button is unnamed. */
  'aria-label'?: string;
  className?: string;
};

/**
 * Color family. `default` follows the active `data-theme`; `aiden` is the AI
 * surface; `neutral` is slate in every theme.
 *
 * **Reach for `neutral` for chrome** — a toolbar's Filter and Sort, a viewer
 * bar's Share, controls that sit beside the page's themed CTA and should not
 * compete with it or claim to be about the brand. `default`'s `ghost` has always
 * been neutral, but ghost has no border, and chrome controls are bordered in
 * every design that uses them; before `neutral` the only bordered option was
 * `default` + `outline`, which reads `--primary-border` and therefore themes.
 *
 * It takes the neutral tokens that already exist — `--primary-main` for the
 * solid (never remapped by a `data-theme`), `--border`, `--muted-foreground`,
 * `--secondary` — rather than a parallel derived family.
 */
export type ButtonVariant =
  | 'default'
  | 'neutral'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
  | 'aiden';

/**
 * Emphasis ladder, strongest → quietest. `secondary` is a filled tint (uses
 * `-soft`), `outline` is transparent + border — keep them distinct.
 * In the `default` variant, `ghost` is deliberately neutral slate so a quiet
 * companion action never competes with the themed CTA.
 */
export type ButtonStyle =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';

/** Currently identical to `ButtonStyle`; kept so the aiden surface can diverge. */
export type ButtonAidenStyle =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link';

/** Maps each variant to the styles it allows. Reference type — not a prop. */
export type ButtonStyleByVariant = {
  aiden: ButtonAidenStyle;
  default: ButtonStyle;
  error: ButtonStyle;
  info: ButtonStyle;
  success: ButtonStyle;
  warning: ButtonStyle;
};
