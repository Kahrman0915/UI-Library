/**
 * `full` (default) — the page uses the whole content window: tables, dashboards, queues.
 * `narrow` — a reading column capped at `--container-narrow` (896 → 1344 with the ladder's
 * width rule), centred: detail pages, single-column lists, card grids.
 * `form` — a tighter column capped at `--container-form` (736 → 1104), centred: a stack of
 * fields, and the option-card chooser that starts one. Narrow was tried on the forms first
 * and read too wide for a field stack.
 *
 * The cap is the padded box, so the column inside the page margin is 64 narrower at 1440
 * and 96 at 1920: narrow gives 832 → 1248, form gives 672 → 1008.
 *
 * Three, deliberately. Inside the app shell the content window is 1136 at 1440 and 1616 at
 * 1920, so any cap wider than that behaves like `full`; the old `default` (1152) and `wide`
 * (1280) did exactly that and were removed.
 */
export type PageContainerWidth = 'full' | 'narrow' | 'form';

export type PageContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `full`. See {@link PageContainerWidth}. */
  width?: PageContainerWidth;
  /** Element to render. Default `div`; use `main` when the container IS the page's main landmark. */
  as?: 'div' | 'main' | 'section' | 'article';
  children?: React.ReactNode;
  className?: string;
};
