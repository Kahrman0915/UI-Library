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

/**
 * The four mode-specific root props, flattened into a non-union shape.
 *
 * **Internal only** — the public API is the discriminated `AccordionProps` union
 * above. The root can't destructure these directly off `props`: `type` has to
 * stay an aliased discriminant of `props` for `type === 'single'` to narrow
 * `props.value` / `props.defaultValue`. So the root strips them from the DOM
 * spread in a second pass, using this type.
 */
export type AccordionRootValueProps = {
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: ((value: string) => void) | ((value: string[]) => void);
  collapsible?: boolean;
};

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
