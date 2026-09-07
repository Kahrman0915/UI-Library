/**
 * How wide the page's content column may grow. Reads the `--max-w-*` tokens:
 * `narrow` 896 · `default` 1152 · `wide` 1280 · `full` no cap. The column is centred and
 * fills the viewport below its cap, so "using the width" on a big monitor is a matter of
 * picking the cap, not of adding space.
 */
export type PageContainerWidth = 'narrow' | 'default' | 'wide' | 'full';

export type PageContainerProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  /** Default `default` (1152px). See {@link PageContainerWidth}. */
  width?: PageContainerWidth;
  /** The element to render. Default `div`; pass `main` when this is the page's main landmark and the shell does not already provide one. */
  as?: 'div' | 'main' | 'section';
  children?: React.ReactNode;
  className?: string;
};
