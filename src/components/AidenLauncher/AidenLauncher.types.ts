export type AidenLauncherProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSubmit' | 'title'
> & {
  /** Seeds the composer's child ids. */
  id: string;
  /** The greeting headline — "Ask Aiden", "How can I help?". */
  title: React.ReactNode;
  /** Supporting line under the title. */
  description?: React.ReactNode;
  /** Brand-mark slot above the title — a `Mark`, a `FeaturedIcon`. */
  icon?: React.ReactNode;
  /** Composer placeholder. Default `Ask anything…`. */
  placeholder?: string;
  /**
   * One-shot prompt pills under the composer. Clicking one SUBMITS it —
   * a suggestion on a launcher is a shortcut, not a draft.
   */
  suggestions?: string[];
  /**
   * The doorway's whole contract: called with the first prompt, and then the
   * CONSUMER navigates — into the panel, the full screen, a route. The
   * launcher never routes and never renders a reply; it is the step BEFORE
   * the conversation exists.
   */
  onSubmit: (value: string) => void;
  disabled?: boolean;
  /**
   * Uncontrolled by default (the launcher owns its draft — it is one-shot).
   * Pass both to control it, e.g. to clear after navigation.
   */
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};
