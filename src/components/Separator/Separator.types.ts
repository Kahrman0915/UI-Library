export type SeparatorOrientation = 'horizontal' | 'vertical';

export type SeparatorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  orientation?: SeparatorOrientation;
  /** When true, the separator is purely visual and has `role="none"` instead of `role="separator"`. */
  decorative?: boolean;
  /** Optional inline label. When present, forces horizontal orientation. */
  label?: React.ReactNode;
  className?: string;
};
