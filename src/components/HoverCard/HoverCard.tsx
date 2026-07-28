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
  HoverCardContentProps,
  HoverCardProps,
  HoverCardTriggerProps,
} from './HoverCard.types';
import './HoverCard.scss';
import '../../styles/overlay-entrance.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Context
// ═════════════════════════════════════════════════════════════════════════════

type HoverCardContextValue = {
  open: boolean;
  openWithDelay: () => void;
  closeWithDelay: () => void;
  cancelClose: () => void;
  triggerId: string;
  contentId: string;
  triggerNode: HTMLElement | null;
  setTriggerNode: (n: HTMLElement | null) => void;
};

const HoverCardContext = createContext<HoverCardContextValue | null>(null);

const useHoverCard = () => {
  const ctx = useContext(HoverCardContext);
  if (!ctx) {
    throw new Error(
      'HoverCard subcomponents must be used inside <HoverCard>.',
    );
  }
  return ctx;
};

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const HoverCard = ({
  id,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
}: HoverCardProps) => {
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

  // Delay timers — separate open and close so the user has a grace period to
  // move the cursor from trigger → content without the card flickering shut.
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const clearOpenTimer = () => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };
  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openWithDelay = useCallback(() => {
    clearCloseTimer();
    if (open) return;
    clearOpenTimer();
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      openTimer.current = null;
    }, openDelay);
  }, [open, openDelay, setOpen]);

  const closeWithDelay = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, closeDelay);
  }, [closeDelay, setOpen]);

  const cancelClose = useCallback(() => {
    clearCloseTimer();
  }, []);

  // Clean up on unmount.
  useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [],
  );

  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);

  const value = useMemo<HoverCardContextValue>(
    () => ({
      open,
      openWithDelay,
      closeWithDelay,
      cancelClose,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      triggerNode,
      setTriggerNode,
    }),
    [open, openWithDelay, closeWithDelay, cancelClose, id, triggerNode],
  );

  return (
    <HoverCardContext.Provider value={value}>
      {children}
    </HoverCardContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — clones its child to attach hover + focus handlers.
// ═════════════════════════════════════════════════════════════════════════════

const HoverCardTrigger = ({ children }: HoverCardTriggerProps) => {
  const ctx = useHoverCard();
  const child = Children.only(children);
  const childProps = child.props as {
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
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
    'aria-describedby': ctx.open ? ctx.contentId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      childProps.onMouseEnter?.(e);
      ctx.openWithDelay();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      childProps.onMouseLeave?.(e);
      ctx.closeWithDelay();
    },
    onFocus: (e: React.FocusEvent) => {
      childProps.onFocus?.(e);
      ctx.openWithDelay();
    },
    onBlur: (e: React.FocusEvent) => {
      childProps.onBlur?.(e);
      ctx.closeWithDelay();
    },
  } as Partial<typeof childProps> & { ref: typeof composedRef });
};

// ═════════════════════════════════════════════════════════════════════════════
// Content
// ═════════════════════════════════════════════════════════════════════════════

const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  (
    {
      children,
      side = 'bottom',
      align = 'center',
      sideOffset = 8,
      className,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const ctx = useHoverCard();
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

    // Escape closes.
    useEffect(() => {
      if (!ctx.open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ctx.closeWithDelay();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [ctx.open, ctx.closeWithDelay]);

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
        role="tooltip"
        data-side={side}
        className={`ui-hover-card__content ui-overlay-enter${className ? ' ' + className : ''}`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position ? 'visible' : 'hidden',
        }}
        onMouseEnter={(e) => {
          onMouseEnter?.(e);
          ctx.cancelClose();
        }}
        onMouseLeave={(e) => {
          onMouseLeave?.(e);
          ctx.closeWithDelay();
        }}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

HoverCardContent.displayName = 'HoverCardContent';

export default HoverCard;
export { HoverCardTrigger, HoverCardContent };
