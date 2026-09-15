import type { DialogProps } from '../Dialog/Dialog.types';

/**
 * The "what's new" card — a title, a clip or image showing the feature, one
 * paragraph, and an action row.
 *
 * A thin preset of `Dialog`: same portal, focus trap, scroll lock, Escape and
 * focus restore, with three things settled for you rather than re-decided per
 * announcement — a wider panel so the media has room, `DialogMedia` already
 * wired between the header and the body, and outside-click dismissal ON.
 *
 * **Outside-click is the one behavioural carve-out.** `Dialog` defaults it off
 * because a dialog usually holds work a stray click must not discard. An
 * announcement holds nothing to lose, and a "what's new" card the user cannot
 * wave away reads as a trap. Pass `closeOnOutsideClick={false}` if a particular
 * announcement must be acknowledged.
 *
 * It is NOT the place for release notes at length — that is a page. This is one
 * feature, one sentence, one look at it.
 */
export type AnnouncementProps = Omit<DialogProps, 'children' | 'role'> & {
  /** The feature, named. Rendered into `{id}-title`, which names the dialog. */
  title: string;
  /**
   * The clip or image — a muted looping `<video>`, a `<img>`, an illustration.
   * Rendered into a {@link DialogMediaProps} region between the header and the
   * body, so it is full-bleed and inherits the panel's rounding.
   *
   * Omit it and the announcement is a plain text card; the media region is not
   * rendered at all rather than left as an empty box.
   */
  media?: React.ReactNode;
  /**
   * Ratio for the media box. Default `16 / 9`.
   *
   * **Keep it at `4 / 3` or wider.** The panel is capped at `85vh` and the media
   * never shrinks — it must not, or the ratio it exists to guarantee is a lie —
   * so a taller box pushes the sentence into the body's scroll. Measured: a
   * square clip on an 800px-high viewport cuts the copy off entirely.
   */
  mediaRatio?: number;
  /**
   * The one sentence under the media. Rendered as `{id}-description`, which the
   * panel references via `aria-describedby` — so this is the text a screen
   * reader announces after the title, and it should say what changed.
   */
  description?: string;
  /**
   * Anything richer than the sentence — a short list, a `Code` chip, a link.
   * Renders in the body under `description`. Most announcements need neither
   * this nor a second paragraph; if yours does, consider whether it wants to be
   * a page instead.
   */
  children?: React.ReactNode;
  /**
   * The quiet action, rendered first: "Learn more", usually a `Button` with
   * `style="outline"` or `style="link"` pointing at the docs.
   */
  secondaryAction?: React.ReactNode;
  /**
   * The acknowledgement, rendered last and closest to the pointer: "Got it".
   * Wire its `onClick` to the same setter as `onClose` — dismissing IS the
   * action, so this is never a submit.
   */
  primaryAction?: React.ReactNode;
  className?: string;
};
