export type KbdSize = 'sm' | 'default' | 'lg';

export type KbdProps = React.HTMLAttributes<HTMLElement> & {
  size?: KbdSize;
  className?: string;
  children?: React.ReactNode;
};
