export type ProgressSize = 'sm' | 'default' | 'lg';

export type ProgressVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: ProgressSize;
  variant?: ProgressVariant;
  /** Shortcut — renders a `<ProgressLabel>` in the header row above the track. */
  label?: React.ReactNode;
  /** Shortcut — renders a `<ProgressValue>` in the header row above the track. */
  showValue?: boolean;
  /** Format the auto-rendered value. Default: `${percent}%`. */
  valueFormatter?: (percent: number, value: number, max: number) => React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export type ProgressLabelProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ProgressValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ProgressTrackProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type ProgressIndicatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};
