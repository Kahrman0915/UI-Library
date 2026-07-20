export type AspectRatioProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Width-to-height ratio. Pass the division expression, e.g. `16 / 9`, `4 / 3`,
   * or `1` for a square. Default `16 / 9`.
   */
  ratio?: number;
  className?: string;
  children?: React.ReactNode;
};
