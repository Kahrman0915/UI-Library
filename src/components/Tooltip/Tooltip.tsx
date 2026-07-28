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
import { useFloatingReposition } from '#/hooks/useFloatingReposition';
import { computePosition } from '#/utils/computePosition';
import type {
  TooltipAlign,
  TooltipContentProps,
  TooltipProps,
  TooltipSide,
  TooltipTriggerProps,
} from './Tooltip.types';
import './Tooltip.scss';

type TooltipState = 'closed' | 'open' | 'closing';

type TooltipContextValue = {
  state: TooltipState;
  open: boolean;
  contentId: string;
  disabled: boolean;
  side: TooltipSide;
  align: TooltipAlign;
  sideOffset: number;
  triggerNode: HTMLElement | null;
  setTriggerNode: (node: HTMLElement | null) => void;
  show: () => void;
  hide: () => void;
  finishClose: () => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

const useTooltipContext = () => {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error(
      'TooltipTrigger and TooltipContent must be used inside a <Tooltip>.',
    );
  }
  return ctx;
};

const Tooltip = ({
  id,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  delayDuration = 400,
  disabled = false,
}: TooltipProps) => {
  const [state, setState] = useState<TooltipState>('closed');
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimers();
    // Cancel any in-flight closing animation immediately by flipping back to
    // 'open'. Small visual jump on interruption is acceptable and rare.
    showTimer.current = window.setTimeout(() => setState('open'), delayDuration);
  }, [clearTimers, delayDuration, disabled]);

  const hide = useCallback(() => {
    clearTimers();
    hideTimer.current = window.setTimeout(() => {
      setState((prev) => (prev === 'open' ? 'closing' : prev));
    }, 100);
  }, [clearTimers]);

  // Called by TooltipContent's onAnimationEnd when the exit animation finishes.
  const finishClose = useCallback(() => {
    setState((prev) => (prev === 'closing' ? 'closed' : prev));
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Escape closes an open tooltip
  useEffect(() => {
    if (state === 'closed') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimers();
        setState((prev) => (prev === 'open' ? 'closing' : prev));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, clearTimers]);

  const value = useMemo<TooltipContextValue>(
    () => ({
      state,
      open: state !== 'closed',
      contentId: `${id}-content`,
      disabled,
      side,
      align,
      sideOffset,
      triggerNode,
      setTriggerNode,
      show,
      hide,
      finishClose,
    }),
    [
      state,
      id,
      disabled,
      side,
      align,
      sideOffset,
      triggerNode,
      show,
      hide,
      finishClose,
    ],
  );

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
};

const TooltipTrigger = ({ children }: TooltipTriggerProps) => {
  const { open, contentId, setTriggerNode, show, hide } = useTooltipContext();
  const child = Children.only(children);

  const childProps = child.props as {
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    'aria-describedby'?: string;
  };

  const originalRef = (
    child as React.ReactElement & { ref?: React.Ref<HTMLElement> }
  ).ref;

  const composedRef = (node: HTMLElement | null) => {
    setTriggerNode(node);
    if (typeof originalRef === 'function') originalRef(node);
    else if (originalRef)
      (
        originalRef as unknown as React.MutableRefObject<HTMLElement | null>
      ).current = node;
  };

  return cloneElement(child, {
    ref: composedRef,
    onMouseEnter: (e: React.MouseEvent) => {
      childProps.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      childProps.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent) => {
      childProps.onFocus?.(e);
      show();
    },
    onBlur: (e: React.FocusEvent) => {
      childProps.onBlur?.(e);
      hide();
    },
    'aria-describedby': open ? contentId : childProps['aria-describedby'],
  } as Partial<typeof childProps> & { ref: typeof composedRef });
};

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, style: styleProp, onAnimationEnd, ...rest }, ref) => {
    const {
      state,
      contentId,
      side,
      align,
      sideOffset,
      triggerNode,
      finishClose,
    } = useTooltipContext();
    const isOpen = state === 'open';
    const isClosing = state === 'closing';
    const isMountedInDom = state !== 'closed';

    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
      null,
    );
    const mounted = useMounted();

    const reposition = useCallback(() => {
      if (!triggerNode || !contentRef.current) return;
      const triggerRect = triggerNode.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setPosition(
        computePosition(triggerRect, contentRect, side, align, sideOffset),
      );
    }, [triggerNode, side, align, sideOffset]);

    useLayoutEffect(() => {
      if (!isOpen) return;
      reposition();
    }, [isOpen, reposition, children]);

    // Stay anchored while open. Deliberately keyed on `isOpen` rather than the
    // mounted state: during the exit animation the position is frozen so the
    // tooltip animates out from where it was resting.
    useFloatingReposition(isOpen, reposition, triggerNode);

    if (!isMountedInDom || !mounted) return null;

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
        id={contentId}
        role="tooltip"
        data-side={side}
        data-state={state}
        className={`ui-tooltip ui-tooltip--${side}${isClosing ? ' ui-tooltip--closing' : ''}${className ? ' ' + className : ''}`}
        style={{
          // Consumer style first; positioning must win (it IS the placement).
          ...styleProp,
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position ? 'visible' : 'hidden',
        }}
        onAnimationEnd={(e) => {
          onAnimationEnd?.(e);
          // Only unmount when the exit animation completes. Ignore in-anim end.
          if (isClosing && e.animationName.startsWith('ui-tooltip-out')) {
            finishClose();
          }
        }}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

TooltipContent.displayName = 'TooltipContent';

export default Tooltip;
export { TooltipTrigger, TooltipContent };
