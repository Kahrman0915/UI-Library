/** Keycap dimensions. Match the surrounding type. */
export type KbdSize = 'sm' | 'default' | 'lg';

/**
 * A keycap for a keyboard shortcut. Purely presentational — it displays the
 * accelerator, it does not bind it. One `Kbd` per key; join chords yourself.
 */
export type KbdProps = React.HTMLAttributes<HTMLElement> & {
  /** Default `default`. See {@link KbdSize}. */
  size?: KbdSize;
  className?: string;
  children?: React.ReactNode;
};
