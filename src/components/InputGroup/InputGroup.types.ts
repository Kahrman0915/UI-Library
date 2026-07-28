/**
 * Where an addon sits relative to the control.
 * - `inline-start` / `inline-end` — beside the input, inside the same border
 *   (a currency symbol, a unit, a small icon button). Mirrors under RTL.
 * - `block-start` / `block-end` — a **full-width row** above or below the
 *   input, still inside the border. Use for toolbars or hint rows, e.g. the
 *   chat-composer pattern.
 */
export type InputGroupAddonAlign =
  | 'inline-start'
  | 'inline-end'
  | 'block-start'
  | 'block-end';

export type InputGroupSize = 'sm' | 'default' | 'lg';

/** `icon-*` sizes are square, for a glyph with no label. */
export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm';

export type InputGroupButtonVariant =
  | 'default'
  | 'outline'
  | 'ghost'
  | 'destructive';

/**
 * A bordered field that can host addons on any edge. Reuses `.ui-input-wrap`,
 * so hover / focus-within / error states match Input and Textarea.
 *
 * It renders no label or error text of its own — wrap it in a `Field`, or
 * supply your own `<Label>` and wire `aria-describedby` yourself.
 */
export type InputGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: InputGroupSize;
  /** Disables every control inside the group (input, textarea, buttons) via
   *  context. A child's own `disabled` still wins. */
  disabled?: boolean;
  /** Paints the error border. Does not render a message — supply your own. */
  error?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/** The borderless `<input>` that sits inside the group's shared border. */
export type InputGroupInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  className?: string;
};

/** The borderless `<textarea>` variant. */
export type InputGroupTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> & {
  className?: string;
};

/**
 * Container for anything flanking the control. Placement is CSS `order`, so
 * DOM order and visual order can differ — author addons in the order you want
 * them *read*, and let `align` handle where they appear.
 */
export type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `inline-start`. See {@link InputGroupAddonAlign}. */
  align?: InputGroupAddonAlign;
  className?: string;
  children?: React.ReactNode;
};

/** Muted inline text inside an addon — a currency symbol, unit, or hint. */
export type InputGroupTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Compact button sized to sit inside the field. Defaults to `type="button"`
 * so it never accidentally submits a surrounding form.
 */
export type InputGroupButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: InputGroupButtonSize;
  variant?: InputGroupButtonVariant;
  className?: string;
  children?: React.ReactNode;
};
