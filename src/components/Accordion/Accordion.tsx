import {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AccordionItemContext,
  AccordionRootContext,
} from './Accordion.context';
import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionRootValueProps,
  AccordionTriggerProps,
} from './Accordion.types';
import './Accordion.scss';

const useAccordionRoot = () => {
  const ctx = useContext(AccordionRootContext);
  if (!ctx) {
    throw new Error('AccordionItem must be used inside <Accordion>.');
  }
  return ctx;
};

const useAccordionItem = () => {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(
      'AccordionTrigger / AccordionContent must be used inside <AccordionItem>.',
    );
  }
  return ctx;
};

// ═════════════════════════════════════════════════════════════════════════════
// Root — handles single | multiple selection modes.
// ═════════════════════════════════════════════════════════════════════════════

const Accordion = forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {
  const {
    id,
    disabled = false,
    className,
    children,
    type,
    ...restProps
  } = props;

  // `value` / `defaultValue` / `onValueChange` / `collapsible` are read off
  // `props` below rather than destructured above, because `type` has to stay an
  // aliased discriminant of `props` for the narrowing to work. Strip them here
  // so they don't ride `...rest` onto the DOM — React warns on `collapsible`,
  // and `value`/`defaultValue` would land as real attributes.
  const {
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    collapsible: _collapsible,
    ...rest
  } = restProps as typeof restProps & AccordionRootValueProps;

  const rootRef = useRef<HTMLDivElement | null>(null);

  const composedRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref)
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  // Uncontrolled state — always allocated, only used when the caller doesn't
  // provide `value`. Shape matches the `type`.
  const [singleInternal, setSingleInternal] = useState<string | undefined>(
    type === 'single' ? props.defaultValue : undefined,
  );
  const [multipleInternal, setMultipleInternal] = useState<string[]>(
    type === 'multiple' ? (props.defaultValue ?? []) : [],
  );

  // Extracted so the useCallback deps track the VALUES, not the whole `props`
  // object — `props` is fresh every render, which made these callbacks (and
  // therefore the context memo) new objects each time, re-rendering every item.
  const valueProp = props.value;
  const onValueChangeProp =
    'onValueChange' in props ? props.onValueChange : undefined;
  const collapsibleProp = 'collapsible' in props ? props.collapsible : false;

  const isOpen = useCallback(
    (itemValue: string): boolean => {
      if (type === 'single') {
        const current = valueProp !== undefined ? valueProp : singleInternal;
        return current === itemValue;
      }
      const current =
        valueProp !== undefined ? (valueProp as string[]) : multipleInternal;
      return current.includes(itemValue);
    },
    [type, valueProp, singleInternal, multipleInternal],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        const controlled = valueProp !== undefined;
        const current = controlled ? valueProp : singleInternal;
        let next: string | undefined;
        if (current === itemValue) {
          next = collapsibleProp ? undefined : itemValue;
          if (!collapsibleProp) return; // no-op — item stays open, no callback
        } else {
          next = itemValue;
        }
        if (!controlled) setSingleInternal(next);
        if (next !== undefined) {
          (onValueChangeProp as ((v: string) => void) | undefined)?.(next);
        }
      } else {
        const controlled = valueProp !== undefined;
        const current = controlled
          ? (valueProp as string[])
          : multipleInternal;
        const next = current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue];
        if (!controlled) setMultipleInternal(next);
        (onValueChangeProp as ((v: string[]) => void) | undefined)?.(next);
      }
    },
    [
      type,
      valueProp,
      onValueChangeProp,
      collapsibleProp,
      singleInternal,
      multipleInternal,
    ],
  );

  const ctxValue = useMemo(
    () => ({ rootId: id, isOpen, toggle, disabled }),
    [id, isOpen, toggle, disabled],
  );

  // Roving arrow-key focus over enabled triggers.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key !== 'ArrowDown' &&
      e.key !== 'ArrowUp' &&
      e.key !== 'Home' &&
      e.key !== 'End'
    )
      return;
    const triggers = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-ui-accordion-trigger]:not([disabled])',
      ) ?? [],
    );
    if (triggers.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    const current = active ? triggers.indexOf(active as HTMLButtonElement) : -1;
    let nextIndex = current;
    if (e.key === 'ArrowDown') {
      nextIndex = current < 0 ? 0 : (current + 1) % triggers.length;
    } else if (e.key === 'ArrowUp') {
      nextIndex = current <= 0 ? triggers.length - 1 : current - 1;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = triggers.length - 1;
    }
    if (nextIndex !== current) {
      e.preventDefault();
      triggers[nextIndex]?.focus();
    }
  };

  return (
    <AccordionRootContext.Provider value={ctxValue}>
      <div
        {...rest}
        ref={composedRef}
        id={id}
        data-type={type}
        className={`ui-accordion${className ? ' ' + className : ''}`}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </AccordionRootContext.Provider>
  );
});

Accordion.displayName = 'Accordion';

// ═════════════════════════════════════════════════════════════════════════════
// Item — wires per-item context (open/disabled/ids) into Trigger/Content.
// ═════════════════════════════════════════════════════════════════════════════

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  (
    { value, disabled: itemDisabled = false, className, children, ...rest },
    ref,
  ) => {
    const root = useAccordionRoot();
    const disabled = root.disabled || itemDisabled;
    const open = root.isOpen(value);

    const ctxValue = useMemo(
      () => ({
        value,
        open,
        disabled,
        triggerId: `${root.rootId}-${value}-trigger`,
        contentId: `${root.rootId}-${value}-content`,
      }),
      [value, open, disabled, root.rootId],
    );

    return (
      <AccordionItemContext.Provider value={ctxValue}>
        <div
          {...rest}
          ref={ref}
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          className={`ui-accordion__item${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);

AccordionItem.displayName = 'AccordionItem';

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — full-width button with a rotating chevron.
// ═════════════════════════════════════════════════════════════════════════════

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, onClick, children, headingLevel = 3, ...rest }, ref) => {
    const root = useAccordionRoot();
    const item = useAccordionItem();
    // APG requires the trigger to sit inside a heading, so the panels are
    // reachable by screen-reader heading navigation. The rank is a prop because
    // only the consumer knows where the accordion sits in the page outline.
    const Heading = `h${headingLevel}` as const;

    return (
      <Heading className="ui-accordion__header">
      <button
        {...rest}
        ref={ref}
        id={item.triggerId}
        type="button"
        aria-expanded={item.open}
        aria-controls={item.contentId}
        data-state={item.open ? 'open' : 'closed'}
        data-ui-accordion-trigger=""
        disabled={item.disabled}
        className={`ui-accordion__trigger${className ? ' ' + className : ''}`}
        onClick={(e) => {
          onClick?.(e);
          if (!item.disabled) root.toggle(item.value);
        }}
      >
        <span className="ui-accordion__trigger-label">{children}</span>
        <span className="ui-accordion__trigger-chevron" aria-hidden="true">
          <ChevronDown />
        </span>
      </button>
      </Heading>
    );
  },
);

AccordionTrigger.displayName = 'AccordionTrigger';

// ═════════════════════════════════════════════════════════════════════════════
// Content — always mounted, animated via grid-template-rows, inert when closed.
// ═════════════════════════════════════════════════════════════════════════════

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...rest }, ref) => {
    const item = useAccordionItem();
    return (
      <div
        ref={ref}
        id={item.contentId}
        role="region"
        aria-labelledby={item.triggerId}
        data-state={item.open ? 'open' : 'closed'}
        // @ts-expect-error inert is valid HTML but React types are behind
        inert={item.open ? undefined : ''}
        className="ui-accordion__content"
      >
        {/*
          Two-layer clip so grid-template-rows: 0fr fully collapses:
          - `-inner` owns overflow:hidden and min-height:0 (clip context)
          - `-body` owns the padding + typography (padding here would
            otherwise count toward the grid row's min-content-size and
            leak a gap when the row is 0fr)
        */}
        <div className="ui-accordion__content-inner">
          <div
            {...rest}
            className={`ui-accordion__content-body${className ? ' ' + className : ''}`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

AccordionContent.displayName = 'AccordionContent';

export default Accordion;
export { AccordionItem, AccordionTrigger, AccordionContent };
