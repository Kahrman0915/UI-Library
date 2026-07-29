import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type {
  CollapsibleContentProps,
  CollapsibleProps,
  CollapsibleTriggerProps,
} from './Collapsible.types';
import './Collapsible.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Context
// ═════════════════════════════════════════════════════════════════════════════

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
  disabled: boolean;
  triggerId: string;
  contentId: string;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

const useCollapsible = () => {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(
      'Collapsible subcomponents must be used inside <Collapsible>.',
    );
  }
  return ctx;
};

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    {
      id,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const controlled = openProp !== undefined;
    const [openState, setOpenState] = useState(defaultOpen);
    const open = controlled ? (openProp as boolean) : openState;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!controlled) setOpenState(next);
        onOpenChange?.(next);
      },
      [controlled, onOpenChange],
    );

    const toggle = useCallback(() => {
      if (!disabled) setOpen(!open);
    }, [open, setOpen, disabled]);

    const ctxValue = useMemo(
      () => ({
        open,
        toggle,
        disabled,
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
      }),
      [open, toggle, disabled, id],
    );

    return (
      <CollapsibleContext.Provider value={ctxValue}>
        <div
          {...rest}
          ref={ref}
          id={id}
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          className={`ui-collapsible${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);

Collapsible.displayName = 'Collapsible';

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — clones its child to toggle open state.
// ═════════════════════════════════════════════════════════════════════════════

const CollapsibleTrigger = ({ children }: CollapsibleTriggerProps) => {
  const ctx = useCollapsible();
  const child = Children.only(children);
  const childProps = child.props as {
    onClick?: (e: React.MouseEvent) => void;
  };

  return cloneElement(child, {
    id: ctx.triggerId,
    'aria-expanded': ctx.open,
    'aria-controls': ctx.contentId,
    'data-state': ctx.open ? 'open' : 'closed',
    'data-disabled': ctx.disabled ? '' : undefined,
    disabled: ctx.disabled,
    onClick: (e: React.MouseEvent) => {
      childProps.onClick?.(e);
      ctx.toggle();
    },
  } as Partial<typeof childProps> & Record<string, unknown>);
};

// ═════════════════════════════════════════════════════════════════════════════
// Content — always mounted. `inert` when closed so it leaves the a11y tree and
// the tab order, plus a grid-template-rows animation for the height.
//
// THREE layers, and all three are load-bearing (same structure as Accordion):
//   __content       the grid, 0fr → 1fr
//   __content-inner the clip context — overflow: hidden + min-height: 0, and
//                   NOTHING else. Padding here leaks into the grid row's
//                   min-content size, so a closed panel keeps a phantom gap.
//   __content-body  where padding and typography go, inside the clip. The
//                   consumer's ref, className AND ...rest all land here — one
//                   coherent target (they used to split across two nodes).
// ═════════════════════════════════════════════════════════════════════════════

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, ...rest }, ref) => {
    const ctx = useCollapsible();
    return (
      <div
        id={ctx.contentId}
        role="region"
        aria-labelledby={ctx.triggerId}
        data-state={ctx.open ? 'open' : 'closed'}
        // @ts-expect-error inert is valid HTML but React types are behind
        inert={ctx.open ? undefined : ''}
        className="ui-collapsible__content"
      >
        <div className="ui-collapsible__content-inner">
          <div
            {...rest}
            ref={ref}
            className={`ui-collapsible__content-body${className ? ' ' + className : ''}`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

CollapsibleContent.displayName = 'CollapsibleContent';

export default Collapsible;
export { CollapsibleTrigger, CollapsibleContent };
