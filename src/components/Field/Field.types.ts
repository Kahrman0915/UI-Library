export type FieldOrientation = 'vertical' | 'horizontal';

export type FieldLegendVariant = 'legend' | 'label';

export type FieldProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: FieldOrientation;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type FieldSetProps = Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'disabled'
> & {
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type FieldLegendProps = React.HTMLAttributes<HTMLLegendElement> & {
  variant?: FieldLegendVariant;
  className?: string;
  children?: React.ReactNode;
};

export type FieldGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type FieldContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type FieldTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type FieldDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type FieldErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional list of error messages. When provided, renders as a list. */
  errors?: React.ReactNode[];
  className?: string;
  children?: React.ReactNode;
};

export type FieldSeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
