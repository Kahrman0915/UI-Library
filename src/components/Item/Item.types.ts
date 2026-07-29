/**
 * - `default` — transparent; hover tints the background.
 * - `outline` — bordered card; hover strengthens the border.
 * - `muted` — filled `--secondary` surface.
 */
export type ItemVariant = 'default' | 'outline' | 'muted';

/** Row density. `xs` for a compact picker, `default` for a settings list. */
export type ItemSize = 'xs' | 'sm' | 'default';

/**
 * - `default` — unboxed; the child sits inline.
 * - `icon` — boxed muted tile sized for a lucide icon.
 * - `image` — boxed tile that clips a thumbnail to the corner radius.
 */
export type ItemMediaVariant = 'default' | 'icon' | 'image';

/**
 * A generic list row: media, a title and description, actions on the trailing
 * edge. The building block for settings lists, pickers and result lists.
 *
 * **The element it renders depends on what you pass** — `<a>` with `href`,
 * `<button>` with `onClick`, otherwise a `<div>`. `onClick` is Omitted from the
 * base attributes so its presence can drive that choice.
 *
 * The parallel family to `Attachment`, which is the file-specific version.
 */
export type ItemProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'onClick'
> & {
  /** Default `default`. See {@link ItemVariant}. */
  variant?: ItemVariant;
  /** Default `default`. See {@link ItemSize}. */
  size?: ItemSize;
  /** If given, renders as `<a href=...>`. */
  href?: string;
  /** Rel + target passthrough when `href` is set. */
  target?: string;
  rel?: string;
  /** If given without href, renders as `<button>`. */
  onClick?: (e: React.MouseEvent) => void;
  /** Only meaningful on the interactive forms. Dims the row and blocks input. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Wraps a set of rows as a `role="list"`. Add `className="ui-stagger"` to have
 * the rows rise in on mount.
 */
export type ItemGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Hairline between rows inside an `ItemGroup`. */
export type ItemSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/** Leading slot — an icon, avatar or thumbnail. See {@link ItemMediaVariant}. */
export type ItemMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ItemMediaVariant;
  className?: string;
  children?: React.ReactNode;
};

/** The middle column: title and description. Takes the remaining width. */
export type ItemContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The row's primary line. */
export type ItemTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Secondary line under the title, in muted text. */
export type ItemDescriptionProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Trailing slot — buttons, a menu, a chevron. */
export type ItemActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Optional full-width band above the row body. */
export type ItemHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Optional full-width band below the row body. */
export type ItemFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
