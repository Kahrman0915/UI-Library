export type FabPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export type FabSize = 'default' | 'lg';

export type FabProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  id: string;
  /** The icon (or short content) shown in the button. */
  children: React.ReactNode;
  /** The fixed corner the FAB anchors to. Default `bottom-right`. */
  position?: FabPosition;
  /** `lg` (56px, default) or `default` (48px). */
  size?: FabSize;
  /** Expanding "sonar" rings behind the button — draws the eye to Aiden. */
  pulse?: boolean;
  /**
   * A one-time entrance when the button mounts (2026-09-19): each shape in the icon
   * twinkles in turn — shrinks, pops just past full size, settles — three times, about
   * 2.7s, then stops. Made for Aiden's multi-star sparkles: the stagger reads the icon's
   * `<svg>` children, so draw the icon as separate shapes (one `<path>` per star). A
   * single-path icon still pops, as one. Off under `prefers-reduced-motion`.
   */
  intro?: boolean;
  /**
   * A small count/notification badge in the corner (e.g. unread replies).
   * Decorative — include the count in the button's `aria-label` for screen
   * readers (e.g. `aria-label="Ask Aiden — 2 new messages"`).
   */
  badge?: React.ReactNode;
  className?: string;
};
