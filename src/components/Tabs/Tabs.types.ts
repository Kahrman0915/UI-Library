export type TabsOrientation = 'horizontal' | 'vertical';

export type TabsActivationMode = 'automatic' | 'manual';

export type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  className?: string;
  children?: React.ReactNode;
};

export type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type TabsTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'value'
> & {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  forceMount?: boolean;
  className?: string;
  children?: React.ReactNode;
};
