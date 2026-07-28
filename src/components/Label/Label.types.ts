export type LabelSize = 'sm' | 'default' | 'lg';

export type LabelProps = Omit<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  'children'
> & {
  children: React.ReactNode;
  htmlFor?: string;
  size?: LabelSize;
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
