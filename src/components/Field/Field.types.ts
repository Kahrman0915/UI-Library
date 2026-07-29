/** `horizontal` puts the label beside the control instead of above it. */
export type FieldOrientation = 'vertical' | 'horizontal';

/** Type treatment for a `FieldLegend` — heading-weight, or the same ramp as a label. */
export type FieldLegendVariant = 'legend' | 'label';

/**
 * The scaffolding around one form control: its label, description, error and
 * the layout holding them together.
 *
 * It doesn't render the control — you nest that inside. For a *set* of related
 * fields use `FieldSet` (with a `FieldLegend`) or `FieldGroup`.
 */
export type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `vertical`. See {@link FieldOrientation}. */
  orientation?: FieldOrientation;
  /** Marks the row invalid — styles the label and error region accordingly.
   *  You still set `aria-invalid` on the control itself. */
  invalid?: boolean;
  /** Dims the row. Does **not** disable the control — set that on the control. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * A real `<fieldset>` grouping related fields. Pair with `FieldLegend` so the
 * group has a name.
 *
 * `disabled` is Omitted and redefined so it drives our styling as well as the
 * native behaviour.
 */
export type FieldSetProps = Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'disabled'
> & {
  /** Natively disables every control inside, and dims the group. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/** The `<legend>` naming a `FieldSet`. */
export type FieldLegendProps = React.HTMLAttributes<HTMLLegendElement> & {
  /** Default `legend`. See {@link FieldLegendVariant}. */
  variant?: FieldLegendVariant;
  className?: string;
  children?: React.ReactNode;
};

/** Stacks related fields with consistent spacing. No semantics of its own —
 *  use `FieldSet` when the group needs an accessible name. */
export type FieldGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The column holding the control and its description, beside a horizontal label. */
export type FieldContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * A real `<label>` — set `htmlFor` to the control's id. Reuses the shared
 * `.ui-label__*` type ramp, so it matches a control's built-in label exactly.
 */
export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  /** Renders the `*` indicator in `--error`. */
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Label-styled text for a row whose control **can't** take a `<label>` — a
 * group of checkboxes, a custom widget. Use `FieldLabel` whenever there is a
 * single control to point at.
 */
export type FieldTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Renders the `*` indicator in `--error`. */
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/** Helper text under the label. Reference it from the control's `aria-describedby`. */
export type FieldDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Validation message for the row. Pass one via children, or several via `errors`. */
export type FieldErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional list of error messages. When provided, renders as a list. */
  errors?: React.ReactNode[];
  className?: string;
  children?: React.ReactNode;
};

/** Divider between field groups. Wraps `Separator`, so children become its label. */
export type FieldSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
