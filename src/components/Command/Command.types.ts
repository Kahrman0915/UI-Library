/** `error` tints the row red — for destructive commands like "Delete project". */
export type CommandItemVariant = 'default' | 'error';

/**
 * The command palette: a search field over a grouped, keyboard-driven list.
 *
 * The list is a `role="listbox"` driven by `aria-activedescendant` — focus stays
 * in the input the whole time, which is what lets you keep typing while the
 * highlight moves.
 *
 * Use `CommandDialog` for the app-wide ⌘K surface; use this bare root when the
 * palette lives inline in a page or panel.
 */
export type CommandProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Required. Seeds the input, list and item ids for the aria wiring. */
  id: string;
  /** Controlled search value. Omit for uncontrolled behavior. */
  value?: string;
  /** Uncontrolled initial search value. Ignored when `value` is supplied. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Optional custom filter. Given the raw search value + an item's search string,
   * return true if the item should be visible. Defaults to case-insensitive substring.
   */
  filter?: (search: string, itemValue: string) => boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * `Command` mounted in a modal — the ⌘K surface. You own the shortcut and the
 * `open` state; this renders the dialog around the palette.
 */
export type CommandDialogProps = {
  /** Required. Seeds the dialog and palette ids. */
  id: string;
  /** Controlled — the palette has no shortcut handler of its own. */
  open: boolean;
  /** Fires on Escape and on outside click. */
  onClose: () => void;
  /** Dialog title (visually hidden by default for the cmd-K pattern). */
  title?: string;
  /** Optional description read by screen readers. */
  description?: string;
  /**
   * Where the dialog opens. `top` = classic cmd-K style near the top of the viewport.
   * `center` = middle of the viewport.
   */
  placement?: 'top' | 'center';
  className?: string;
  children?: React.ReactNode;
};

/**
 * The search field. Its value belongs to the `Command` root, so `value`,
 * `defaultValue` and `onChange` are Omitted — set them there instead. `size` is
 * Omitted because the native attribute would collide.
 */
export type CommandInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size'
> & {
  className?: string;
};

/** Scrollable results region. Caps at 480px — deliberate panel geometry. */
export type CommandListProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

/** Shown when the search matches nothing. Renders only while the list is empty. */
export type CommandEmptyProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type CommandGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Heading shown above the group. Omit for an unlabeled group. */
  heading?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * One command. `onSelect` is redefined to receive the item's `value` rather than
 * an event, so the native `onSelect` is Omitted.
 */
export type CommandItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> & {
  /**
   * Search-matching key. If omitted, the item derives its value from its own
   * `textContent` at first render. Provide `value` for reliable filtering when
   * the item contains icons, shortcut chips, etc.
   */
  value?: string;
  /** Extra keywords to match against, in addition to `value`. Space-joined. */
  keywords?: string[];
  /** Filtered out of keyboard navigation and unselectable. */
  disabled?: boolean;
  /** Runs on Enter or click. Receives the item's `value`, not an event. */
  onSelect?: (value: string) => void;
  /** Default `default`. See {@link CommandItemVariant}. */
  variant?: CommandItemVariant;
  className?: string;
  children?: React.ReactNode;
};

/** Hairline between groups. Hidden automatically when filtering empties a group. */
export type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

/**
 * Right-aligned accelerator hint inside an item (e.g. `⌘K`). Purely visual — it
 * displays the shortcut, it does not bind it.
 */
export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};
