import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '#/hooks/useMounted';
import { computePosition } from '#/utils/computePosition';
import type {
  PopoverCloseProps,
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from './Popover.types';
import './Popover.scss';
import '../../styles/overlay-entrance.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Context
// ═════════════════════════════════════════════════════════════════════════════

type PopoverContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerId: string;
  contentId: string;
  triggerNode: HTMLElement | null;
  setTriggerNode: (n: HTMLElement | null) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopover = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(
      'Popover subcomponents must be used inside <Popover>.',
    );
  }
  return ctx;
};

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const Popover = ({
  id,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: PopoverProps) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? (openProp as boolean) : openState;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setOpenState(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);

  const value = useMemo<PopoverContextValue>(
    () => ({
      open,
      toggle,
      close,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      triggerNode,
      setTriggerNode,
    }),
    [open, toggle, close, id, triggerNode],
  );

  return (
    <PopoverContext.Provider value={value}>
      {children}
    </PopoverContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger
// ═════════════════════════════════════════════════════════════════════════════

const PopoverTrigger = ({ children }: PopoverTriggerProps) => {
  const ctx = usePopover();
  const child = Children.only(children);
  const childProps = child.props as {
    onClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
  };
  const originalRef = (
    child as React.ReactElement & { ref?: React.Ref<HTMLElement> }
  ).ref;

  const composedRef = (node: HTMLElement | null) => {
    ctx.setTriggerNode(node);
    if (typeof originalRef === 'function') originalRef(node);
    else if (originalRef)
      (
        originalRef as unknown as React.MutableRefObject<HTMLElement | null>
      ).current = node;
  };

  return cloneElement(child, {
    ref: composedRef,
    id: ctx.triggerId,
    onClick: (e: React.MouseEvent) => {
      childProps.onClick?.(e);
      ctx.toggle();
    },
    'aria-expanded': ctx.open,
    'aria-haspopup': 'dialog',
    'aria-controls': ctx.contentId,
  } as Partial<typeof childProps> & { ref: typeof composedRef });
};

// ═════════════════════════════════════════════════════════════════════════════
// Content
// ═════════════════════════════════════════════════════════════════════════════

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      children,
      side = 'bottom',
      align = 'center',
      sideOffset = 4,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = usePopover();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
      null,
    );
    const mounted = useMounted();

    useLayoutEffect(() => {
      if (!ctx.open || !ctx.triggerNode || !contentRef.current) return;
      const triggerRect = ctx.triggerNode.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setPosition(
        computePosition(triggerRect, contentRect, side, align, sideOffset),
      );
    }, [ctx.open, ctx.triggerNode, side, align, sideOffset, children]);

    // Focus the content on open so keyboard navigation continues from here.
    useEffect(() => {
      if (!ctx.open) return;
      const raf = requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }, [ctx.open]);

    // Outside click closes
    useEffect(() => {
      if (!ctx.open) return;
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current?.contains(target) ||
          ctx.triggerNode?.contains(target)
        )
          return;
        ctx.close();
      };
      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [ctx.open, ctx.triggerNode, ctx.close]);

    // Escape closes + restores focus to trigger
    useEffect(() => {
      if (!ctx.open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ctx.close();
          ctx.triggerNode?.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [ctx.open, ctx.triggerNode, ctx.close]);

    if (!ctx.open || !mounted) return null;

    return createPortal(
      <div
        {...rest}
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref)
            (
              ref as unknown as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
        }}
        id={ctx.contentId}
        role="dialog"
        tabIndex={-1}
        aria-labelledby={ctx.triggerId}
        data-side={side}
        className={`ui-popover__content ui-overlay-enter${className ? ' ' + className : ''}`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position ? 'visible' : 'hidden',
        }}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

PopoverContent.displayName = 'PopoverContent';

// ═════════════════════════════════════════════════════════════════════════════
// Close — clones its child button to add an onClick that closes the popover.
// ═════════════════════════════════════════════════════════════════════════════

const PopoverClose = ({ children }: PopoverCloseProps) => {
  const ctx = usePopover();
  const child = Children.only(children);
  const childProps = child.props as {
    onClick?: (e: React.MouseEvent) => void;
  };
  return cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      childProps.onClick?.(e);
      ctx.close();
    },
  } as Partial<typeof childProps>);
};

export default Popover;
export { PopoverTrigger, PopoverContent, PopoverClose };
