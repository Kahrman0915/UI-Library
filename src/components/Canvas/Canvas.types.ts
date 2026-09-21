/**
 * The Builder's edit surface — a 32px grid the placed widgets sit on.
 *
 * **It paints a background, not 86 elements.** Figma has no repeating fill, so
 * `Canvas/Ground` there is 51 vertical and 35 horizontal rectangles; in CSS the
 * same thing is one `background-image` that tiles, costs no DOM and resizes for
 * free. The output is identical — 1px lines at a 32px pitch, `--canvas-line` at
 * `--o-20`.
 *
 * **Transparent by design.** The grid sits ON whatever surface the page already
 * has; the canvas does not paint its own ground, which is why it can be dropped
 * into `AppShellMain` without a second background appearing under the first.
 */
export type CanvasProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Default `true`. Turn it off for the Builder's preview state — the same
   * surface with the grid gone, so nothing has to be swapped out to show the
   * user what they are about to publish.
   */
  grid?: boolean;
  className?: string;
};

/**
 * One widget placed on the canvas, with its edit-mode handles.
 *
 * The handles deliberately sit OUTSIDE the box, overlapping its top corners
 * (Figma places them at `-8`), so they never eat into the widget's own content
 * box — a grip that stole 20px would change the thing it is a handle for.
 *
 * `Canvas` and `CanvasItem` carry no drag behaviour. Placement, collision and
 * persistence are the application's: the library ships the surface and the
 * affordances, not a layout engine.
 */
export type CanvasItemProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Shows the drag handle at the leading top corner. */
  grip?: boolean;
  /** The trailing top-corner control — typically a `DropdownMenu` trigger. */
  menu?: React.ReactNode;
  /** Accessible name for the grip. Default `Drag to move`. */
  gripLabel?: string;
  /** Marks the widget as the selected one. */
  selected?: boolean;
  className?: string;
};
