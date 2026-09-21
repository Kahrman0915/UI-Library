/** The root. Fills the height it is given — put it in a `100dvh` box. */
export type AppShellProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * The strip across the top: the account cell (as wide as the rail plus the sidebar), the
 * `TabBar` (children), and an optional trailing actions group. Aiden no longer sits here —
 * it is a `Fab` in the page's bottom-right corner (2026-09-19).
 */
export type AppShellTabStripProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  /**
   * The account cell: the DART Central mark (a ghost icon button home), then the user's
   * name and a chevron (a ghost `Button` with `className="ui-app-shell__account"`) as the
   * trigger of a `DropdownMenu` holding profile, settings, help and sign out. Named `logo`
   * for history — it held the app's mark until 2026-09-19. The cell is a fixed
   * `--app-rail-width + --sidebar-width` (304) so the tabs start over the page. It is a
   * two-column grid: the mark centers over the rail, the name lines up with the sidebar's
   * rows, and the shell draws the short upright rule between them. Pass exactly those two
   * children — no divider.
   */
  logo?: React.ReactNode;
  /** Optional trailing controls, after a divider. Empty in the shipped shell. */
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
