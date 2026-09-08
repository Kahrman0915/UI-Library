/**
 * `full` (default) — the page uses the whole content window: tables, dashboards, queues.
 * `narrow` — a reading column capped at `--container-narrow` (896 → 1344 with the ladder's
 * width rule), centred: forms, detail pages, single-column lists.
 *
 * Two, deliberately. Inside the app shell the content window is 1136 at 1440 and 1616 at
 * 1920, so any cap wider than that behaves like `full`; the old `default` (1152) and `wide`
 * (1280) did exactly that and were removed.
 */
export type PageContainerWidth = 'full' | 'narrow';

export type PageContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `full`. See {@link PageContainerWidth}. */
  width?: PageContainerWidth;
  /** Element to render. Default `div`; use `main` when the container IS the page's main landmark. */
  as?: 'div' | 'main' | 'section' | 'article';
  children?: React.ReactNode;
  className?: string;
};
