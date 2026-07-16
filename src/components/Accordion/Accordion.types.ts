type AccordionCommonProps = {
  id: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type AccordionSingleProps = AccordionCommonProps & {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** In single mode, whether an open item can be re-clicked to close everything. */
  collapsible?: boolean;
};

type AccordionMultipleProps = AccordionCommonProps & {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type AccordionProps = (
  | AccordionSingleProps
  | AccordionMultipleProps
) &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange' | 'children' | 'className' | 'id'
  >;

export type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type AccordionTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  className?: string;
  children?: React.ReactNode;
};

export type AccordionContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
