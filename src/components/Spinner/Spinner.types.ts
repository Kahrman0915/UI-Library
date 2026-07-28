export type SpinnerProps = React.SVGAttributes<SVGSVGElement> & {
  id: string;
  /** Icon size in px (maps to lucide's `size`). */
  size?: number;
  className?: string;
};
