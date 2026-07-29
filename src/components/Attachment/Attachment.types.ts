/**
 * Where the file is in its lifecycle. `uploading` and `processing` run the
 * shimmer; `error` tints the row.
 */
export type AttachmentState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'error'
  | 'done';

/** Row density. `xs` suits a chip-like list under a composer. */
export type AttachmentSize = 'xs' | 'sm' | 'default';

/** `horizontal` is a list row; `vertical` is a tile for a grid of files. */
export type AttachmentOrientation = 'horizontal' | 'vertical';

/** `icon` shows a file-type glyph on a muted tile; `image` clips a thumbnail. */
export type AttachmentMediaVariant = 'icon' | 'image';

/**
 * A file attachment — its type or thumbnail, name, size and actions.
 *
 * The parallel family to `Item`, specialised for files: it adds the upload
 * lifecycle (`state`) and the tile orientation that `Item` has no need for.
 */
export type AttachmentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `idle`. See {@link AttachmentState}. */
  state?: AttachmentState;
  /** Default `default`. See {@link AttachmentSize}. */
  size?: AttachmentSize;
  /** Default `horizontal`. See {@link AttachmentOrientation}. */
  orientation?: AttachmentOrientation;
  className?: string;
  children?: React.ReactNode;
};

/** Leading slot — a file-type icon or a thumbnail. */
export type AttachmentMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `icon`. See {@link AttachmentMediaVariant}. */
  variant?: AttachmentMediaVariant;
  className?: string;
  children?: React.ReactNode;
};

/** The middle column: filename and metadata. Takes the remaining width. */
export type AttachmentContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** The filename. Truncates rather than wrapping. */
export type AttachmentTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Metadata line — size, type, progress or an error message. */
export type AttachmentDescriptionProps =
  React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
    children?: React.ReactNode;
  };

/** Trailing slot for one or more `AttachmentAction`s. */
export type AttachmentActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * A small icon button on the row — remove, retry, download. Uses the shared
 * `.ui-icon-button` shell, so it gets the WCAG 2.5.8 hit-target expansion.
 * Icon-only, so give it an `aria-label`.
 */
export type AttachmentActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children?: React.ReactNode;
};

/**
 * Makes the whole row activate — opening a preview, or downloading. Renders an
 * `<a>` when `href` is given, otherwise a `<button>`, which is why the props
 * are an intersection of both attribute sets with the conflicts Omitted.
 */
export type AttachmentTriggerProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'type'
> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href' | 'target' | 'type'> & {
    /** Renders an `<a>` instead of a `<button>`. */
    href?: string;
    className?: string;
    children?: React.ReactNode;
  };

/**
 * Stacks several attachments. Add `className="ui-stagger"` to have them rise in
 * as they're added.
 */
export type AttachmentGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
