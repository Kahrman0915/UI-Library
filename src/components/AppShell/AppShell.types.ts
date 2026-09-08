/** The root. Fills the height it is given — put it in a `100dvh` box. */
export type AppShellProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * The strip across the top: a logo cell the width of the rail, the `TabBar` (children),
 * and a trailing actions group — the one place the Aiden entry point sits in the chrome.
 */
export type AppShellTabStripProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** The application mark, in the square cell above the rail. */
  logo?: React.ReactNode;
  /** Trailing controls: all-apps, "Ask Aiden". */
  actions?: React.ReactNode;
  /** The `TabBar`. */
  children?: React.ReactNode;
  className?: string;
};

/** `AppShellBody` (the row under the strip) and `AppShellWorkspace` (sidebar + main). */
export type AppShellRegionProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

/** The scrolling content column — the Main Content region a page's `PageContainer` fills. */
export type AppShellMainProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
};
