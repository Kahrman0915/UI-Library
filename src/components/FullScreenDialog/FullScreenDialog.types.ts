import type {
  DialogProps,
  DialogHeaderProps,
  DialogBodyProps,
  DialogFooterProps,
} from '#components/Dialog/Dialog.types';

/**
 * How wide the body's content column is allowed to grow.
 *
 * A full-screen page without this is unusable on a large monitor: a feedback
 * form stretched across 2560px puts the label and its input a screen apart. The
 * panel still fills the viewport — only the content inside the body is capped.
 */
export type FullScreenDialogContentWidth = 'md' | 'lg' | 'xl' | 'full';

/**
 * Props for the full-screen page.
 *
 * Derived from `DialogProps` rather than redeclared, so the HTML attribute
 * passthrough and every shared prop stay in lockstep with Dialog. Three are
 * Omitted because this component fixes them:
 *
 * - `role` — always `dialog`. Size does not change the semantics, and the
 *   alternatives (`region`, `main`) carry no modality, which would leave the
 *   fully-occluded page behind reachable to a screen reader.
 * - `closeOnOutsideClick` — always `false`. There is no backdrop to click.
 * - `inline` — meaningless here. An in-flow panel at `width/height: 100%` fills
 *   its parent, not the viewport, so the component would silently stop being
 *   full-screen.
 *
 * `closeOnEscape` is Omitted too: this component takes Escape over itself so it
 * can tell "close the page" from "close the menu floating above the page".
 */
export type FullScreenDialogProps = Omit<
  DialogProps,
  'role' | 'closeOnOutsideClick' | 'closeOnEscape' | 'inline'
> & {
  /** Default `lg` — the same column width `Chat` uses for its transcript. */
  contentWidth?: FullScreenDialogContentWidth;
};

/**
 * Props for the page header.
 *
 * `id` and `onClose` are optional here but required in practice — both are
 * supplied by the parent through context, so the minimal correct usage is
 * `<FullScreenDialogHeader title="Feedback" />`. Pass them explicitly only to
 * override.
 */
export type FullScreenDialogHeaderProps = Omit<DialogHeaderProps, 'id'> & {
  id?: string;
};

export type FullScreenDialogBodyProps = DialogBodyProps & {
  /**
   * Hand the body over to an app shell. Strips the body's padding and its own
   * scrolling (`overflow: hidden`, flex column) so a full-height child — a
   * `ChatLayout`, a split view — owns the scroll instead. Without it the body
   * and the shell would both scroll, and the shell's stick-to-bottom logic
   * would watch the wrong container.
   */
  flush?: boolean;
};
export type FullScreenDialogFooterProps = DialogFooterProps;
