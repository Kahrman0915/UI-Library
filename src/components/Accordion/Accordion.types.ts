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

/** Heading rank the trigger's wrapper renders at. See `headingLevel`. */
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type AccordionTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> & {
  /**
   * Rank of the heading wrapping the button. Default `3`.
   *
   * The APG accordion pattern requires each trigger to sit inside a heading so
   * screen-reader users can navigate the panels by heading. Set this to whatever
   * keeps the page's outline sequential — an accordion under an `<h2>` section
   * wants `3` (the default); one under an `<h3>` wants `4`.
   */
  headingLevel?: AccordionHeadingLevel;
  className?: string;
  children?: React.ReactNode;
};

export type AccordionContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
