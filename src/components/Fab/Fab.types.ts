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
   * A small count/notification badge in the corner (e.g. unread replies).
   * Decorative — include the count in the button's `aria-label` for screen
   * readers (e.g. `aria-label="Ask Aiden — 2 new messages"`).
   */
  badge?: React.ReactNode;
  className?: string;
};
