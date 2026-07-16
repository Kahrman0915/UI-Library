export type InputGroupAddonAlign =
  | 'inline-start'
  | 'inline-end'
  | 'block-start'
  | 'block-end';

export type InputGroupSize = 'sm' | 'default' | 'lg';

export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm';

export type InputGroupButtonVariant =
  | 'default'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: InputGroupSize;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type InputGroupInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  className?: string;
};

export type InputGroupTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> & {
  className?: string;
};

export type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: InputGroupAddonAlign;
  className?: string;
  children?: React.ReactNode;
};

export type InputGroupTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type InputGroupButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: InputGroupButtonSize;
  variant?: InputGroupButtonVariant;
  className?: string;
  children?: React.ReactNode;
};
