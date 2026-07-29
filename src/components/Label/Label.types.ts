export type LabelSize = 'sm' | 'default' | 'lg';

export type LabelProps = Omit<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  'children'
> & {
  children: React.ReactNode;
  /** The id of the control this labels. Without it the label names nothing. */
  htmlFor?: string;
  /** Type scale. Match the control's own `size` so the pair line up. */
  size?: LabelSize;
  /** Renders the `*` indicator in `--error`. Visual only — also set
   *  `required` / `aria-required` on the control itself. */
  required?: boolean;
  /** Visual-only: dims the label. Does not disable the control. */
  disabled?: boolean;
  /**
   * Helper text rendered under the label. It is aria-hidden so it does NOT
   * join the control's accessible name — pass `descriptionId` and reference it
   * from the control via `aria-describedby` to expose it as a description.
   */
  description?: React.ReactNode;
  /** Id for the description span, for the control's `aria-describedby`. */
  descriptionId?: string;
  className?: string;
};
