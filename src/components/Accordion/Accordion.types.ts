type AccordionCommonProps = {
  /** Required. Seeds each item's `{id}-{value}-trigger` / `-content` pair. */
  id: string;
  /** Disables every item in the accordion. */
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type AccordionSingleProps = AccordionCommonProps & {
  /** One item open at a time — opening another closes the current one. */
  type: 'single';
  /** Controlled — the open item's `value`. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial open item. Ignored when `value` is supplied. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** In single mode, whether an open item can be re-clicked to close everything. */
  collapsible?: boolean;
};

type AccordionMultipleProps = AccordionCommonProps & {
  /** Any number of items open at once. */
  type: 'multiple';
  /** Controlled — the open items' values. Pair with `onValueChange`. */
  value?: string[];
  /** Uncontrolled initial open items. Ignored when `value` is supplied. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

/**
 * A vertical stack of disclosure sections, discriminated on `type`: `single`
 * keeps one open (add `collapsible` to allow none), `multiple` allows any.
 *
 * Height animates with `grid-template-rows: 0fr → 1fr` — no measurement, no
 * ResizeObserver, no JavaScript in the open/close path.
 *
 * `defaultValue` / `onChange` are Omitted from the DOM attributes because the
 * value-based versions above replace them, and their shape changes with `type`.
 */
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

/** One section: an `AccordionTrigger` and an `AccordionContent`. */
export type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  /** This item's identity, reported by the root's `onValueChange`. Must be
   *  unique in the accordion. */
  value: string;
  /** Disables just this item. The root's `disabled` overrides all of them. */
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
