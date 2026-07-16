export type Mode = 'light' | 'dark';

export type ModeTogglerVariant = 'default' | 'outline' | 'ghost';

export type ModeTogglerSize = 'sm' | 'default' | 'lg';

export type ModeTogglerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'type'
> & {
  id: string;
  variant?: ModeTogglerVariant;
  size?: ModeTogglerSize;
  /** Controlled mode. Omit for uncontrolled (component reads/writes `data-mode`). */
  mode?: Mode;
  /** Initial mode when uncontrolled. Omit to derive from `data-mode` → localStorage → system. */
  defaultMode?: Mode;
  onModeChange?: (mode: Mode) => void;
  /**
   * localStorage key for persistence. Set to `null` to disable persistence.
   * Defaults to `'ui-mode'`.
   */
  storageKey?: string | null;
  /** Skip the View Transitions circular reveal and flip instantly. */
  disableAnimation?: boolean;
  className?: string;
};
