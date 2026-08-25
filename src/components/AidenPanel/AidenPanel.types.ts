export type AidenPanelProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /** Seeds `${id}-title` on the header, which names the landmark. */
  id: string;
  /** Controlled. The panel never opens or closes itself. */
  open: boolean;
  /**
   * Asked for when the panel wants to close — its own X, or Escape pressed
   * while focus is inside it. Flipping `open` runs the slide-out.
   */
  onClose: () => void;
  /**
   * Renders the expand affordance in the header. The panel does NOT open the
   * full-screen surface itself — the consumer holds the
   * `'closed' | 'panel' | 'full'` state and swaps surfaces. See the
   * `AidenPanel` stories for the wired three-state flow.
   */
  onExpand?: () => void;
  /**
   * Accessible name for the `complementary` landmark. Defaults to the header
   * title when an `AidenPanelHeader` is rendered; pass this when composing a
   * custom header.
   */
  label?: string;
  children: React.ReactNode;
  className?: string;
};

export type AidenPanelHeaderProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> & {
  /** The panel's name — "Aiden", usually. Also names the landmark. */
  title: React.ReactNode;
  /** Small line under the title — model name, context, status. */
  description?: React.ReactNode;
  /** Leading slot — a `Mark` or `FeaturedIcon`. */
  icon?: React.ReactNode;
  /** Default `true`. The X asks the panel's `onClose`. */
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
};
