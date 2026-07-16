export type CommandItemVariant = 'default' | 'error';

export type CommandProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  /** Controlled search value. Omit for uncontrolled behavior. */
  value?: string;
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

export type CommandDialogProps = {
  id: string;
  open: boolean;
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

export type CommandInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size'
> & {
  className?: string;
};

export type CommandListProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

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
  disabled?: boolean;
  onSelect?: (value: string) => void;
  variant?: CommandItemVariant;
  className?: string;
  children?: React.ReactNode;
};

export type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};
