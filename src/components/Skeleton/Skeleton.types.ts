export type SkeletonShape = 'default' | 'circle' | 'text';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * `default` — rectangular with rounded corners (blocks, cards, buttons).
   * `circle` — perfect circle (avatars, dots).
   * `text` — text-line height with an aggressive border-radius (paragraphs).
   */
  shape?: SkeletonShape;
  /** CSS width. Number = px, string = passed through. */
  width?: number | string;
  /** CSS height. Number = px, string = passed through. */
  height?: number | string;
  className?: string;
};
