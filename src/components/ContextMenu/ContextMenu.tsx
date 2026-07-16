import {
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
import { Check, ChevronRight } from 'lucide-react';
import { useMounted } from '#/hooks/useMounted';
import { computePosition } from '#/utils/computePosition';
import {
  ContextMenuRootContext,
  ContextMenuSubContext,
  RadioGroupContext,
} from './ContextMenu.context';
import type {
  ContextMenuCheckboxItemProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuLabelProps,
  ContextMenuProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuSeparatorProps,
  ContextMenuShortcutProps,
  ContextMenuSubContentProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuTriggerProps,
} from './ContextMenu.types';
import './ContextMenu.scss';

const useRoot = () => {
  const ctx = useContext(ContextMenuRootContext);
  if (!ctx) {
    throw new Error(
      'ContextMenu subcomponents must be used inside <ContextMenu>.',
    );
  }
  return ctx;
};

const useSub = () => useContext(ContextMenuSubContext);

const ITEM_SELECTOR =
  '[role="menuitem"]:not([data-disabled]), [role="menuitemcheckbox"]:not([data-disabled]), [role="menuitemradio"]:not([data-disabled])';

const getItems = (root: HTMLElement | null): HTMLElement[] =>
  root ? Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)) : [];

// Clamp a menu position so it stays inside the viewport.
const clampToViewport = (
  x: number,
  y: number,
  width: number,
  height: number,
): { top: number; left: number } => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const padding = 4;
  let left = x;
  let top = y;
  if (left + width + padding > vw) left = Math.max(padding, vw - width - padding);
  if (top + height + padding > vh) top = Math.max(padding, vh - height - padding);
  return { top, left };
};

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenu = ({
  id,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  longPressDelay = 500,
}: ContextMenuProps) => {
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

  const [pointerPosition, setPointerPosition] =
    useState<{ x: number; y: number } | null>(null);

  const openAt = useCallback(
    (x: number, y: number) => {
      setPointerPosition({ x, y });
      setOpen(true);
    },
    [setOpen],
  );
  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const value = useMemo(
    () => ({
      rootId: id,
      open,
      pointerPosition,
      openAt,
      close,
      longPressDelay,
    }),
    [id, open, pointerPosition, openAt, close, longPressDelay],
  );

  return (
    <ContextMenuRootContext.Provider value={value}>
      {children}
    </ContextMenuRootContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — captures `oncontextmenu` and long-press
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ disabled = false, className, children, ...rest }, ref) => {
    const ctx = useRoot();
    const longPressTimer = useRef<number | null>(null);
    const longPressPos = useRef<{ x: number; y: number } | null>(null);
    const longPressFired = useRef(false);

    const cancelLongPress = () => {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    useEffect(() => () => cancelLongPress(), []);

    return (
      <div
        {...rest}
        ref={ref}
        data-disabled={disabled ? '' : undefined}
        className={`ui-context-menu__trigger${className ? ' ' + className : ''}`}
        onContextMenu={(e) => {
          if (disabled) return;
          e.preventDefault();
          ctx.openAt(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (disabled) return;
          longPressFired.current = false;
          const t = e.touches[0];
          if (!t) return;
          longPressPos.current = { x: t.clientX, y: t.clientY };
          cancelLongPress();
          longPressTimer.current = window.setTimeout(() => {
            longPressFired.current = true;
            const pos = longPressPos.current;
            if (pos) ctx.openAt(pos.x, pos.y);
          }, ctx.longPressDelay);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          const start = longPressPos.current;
          if (!t || !start) return;
          if (
            Math.abs(t.clientX - start.x) > 10 ||
            Math.abs(t.clientY - start.y) > 10
          )
            cancelLongPress();
        }}
        onTouchEnd={(e) => {
          cancelLongPress();
          // If the long-press already opened, swallow the ensuing click so
          // callers don't see a phantom tap on their content.
          if (longPressFired.current) {
            e.preventDefault();
            longPressFired.current = false;
          }
        }}
      >
        {children}
      </div>
    );
  },
);

ContextMenuTrigger.displayName = 'ContextMenuTrigger';

// ═════════════════════════════════════════════════════════════════════════════
// Content — portal at pointer position
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, className, ...rest }, ref) => {
    const ctx = useRoot();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const mounted = useMounted();

    useLayoutEffect(() => {
      if (!ctx.open || !ctx.pointerPosition || !contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      setPosition(
        clampToViewport(
          ctx.pointerPosition.x,
          ctx.pointerPosition.y,
          rect.width,
          rect.height,
        ),
      );
    }, [ctx.open, ctx.pointerPosition, children]);

    // Focus the container on open.
    useEffect(() => {
      if (!ctx.open) return;
      const raf = requestAnimationFrame(() => contentRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }, [ctx.open]);

    // Outside click closes.
    useEffect(() => {
      if (!ctx.open) return;
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        if (contentRef.current?.contains(target)) return;
        ctx.close();
      };
      // Also close on right-click outside (browser's own contextmenu on body).
      const onContextMenu = (e: MouseEvent) => {
        const target = e.target as Node;
        if (contentRef.current?.contains(target)) return;
        // Let the outer contextmenu handler (a nested trigger) re-open at the
        // new location; we just close this instance.
        ctx.close();
      };
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('contextmenu', onContextMenu, true);
      return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('contextmenu', onContextMenu, true);
      };
    }, [ctx.open, ctx.close]);

    // Escape closes.
    useEffect(() => {
      if (!ctx.open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ctx.close();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [ctx.open, ctx.close]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const items = getItems(contentRef.current);
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const current = active ? items.indexOf(active) : -1;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = current < 0 ? 0 : (current + 1) % items.length;
        items[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = current <= 0 ? items.length - 1 : current - 1;
        items[next]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    };

    if (!ctx.open || !mounted) return null;

    return createPortal(
      <div
        {...rest}
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        role="menu"
        tabIndex={-1}
        className={`ui-context-menu__content${className ? ' ' + className : ''}`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position ? 'visible' : 'hidden',
        }}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

ContextMenuContent.displayName = 'ContextMenuContent';

// ═════════════════════════════════════════════════════════════════════════════
// Item
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(
  (
    {
      children,
      onClick,
      onKeyDown,
      disabled,
      variant = 'default',
      closeOnSelect = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useRoot();
    const activate = (e: React.SyntheticEvent) => {
      if (disabled) return;
      (onClick as ((e: React.SyntheticEvent) => void) | undefined)?.(e);
      if (closeOnSelect) ctx.close();
    };
    return (
      <div
        {...rest}
        ref={ref}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        data-variant={variant}
        className={`ui-context-menu__item ui-context-menu__item--${variant}${className ? ' ' + className : ''}`}
        onClick={activate}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate(e);
          }
        }}
      >
        {children}
      </div>
    );
  },
);

ContextMenuItem.displayName = 'ContextMenuItem';

// ═════════════════════════════════════════════════════════════════════════════
// CheckboxItem
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  ContextMenuCheckboxItemProps
>(
  (
    { children, checked = false, onCheckedChange, disabled, className, ...rest },
    ref,
  ) => {
    const activate = (e: React.SyntheticEvent) => {
      if (disabled) return;
      onCheckedChange?.(!checked);
      e.preventDefault();
    };
    return (
      <div
        {...rest}
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        data-state={checked ? 'checked' : 'unchecked'}
        tabIndex={-1}
        className={`ui-context-menu__item ui-context-menu__item--indicator${className ? ' ' + className : ''}`}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') activate(e);
        }}
      >
        <span
          className="ui-context-menu__item-indicator"
          aria-hidden="true"
        >
          {checked && <Check />}
        </span>
        {children}
      </div>
    );
  },
);

ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

// ═════════════════════════════════════════════════════════════════════════════
// RadioGroup + RadioItem
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuRadioGroup = forwardRef<
  HTMLDivElement,
  ContextMenuRadioGroupProps
>(({ children, value, onValueChange, className, ...rest }, ref) => {
  const ctxValue = useMemo(
    () => ({ value, setValue: (v: string) => onValueChange?.(v) }),
    [value, onValueChange],
  );
  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <div
        {...rest}
        ref={ref}
        role="group"
        className={`ui-context-menu__group${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

ContextMenuRadioGroup.displayName = 'ContextMenuRadioGroup';

const ContextMenuRadioItem = forwardRef<
  HTMLDivElement,
  ContextMenuRadioItemProps
>(({ children, value, disabled, className, ...rest }, ref) => {
  const rootCtx = useRoot();
  const radioCtx = useContext(RadioGroupContext);
  const selected = radioCtx?.value === value;

  const activate = (e: React.SyntheticEvent) => {
    if (disabled) return;
    radioCtx?.setValue(value);
    e.preventDefault();
    rootCtx.close();
  };

  return (
    <div
      {...rest}
      ref={ref}
      role="menuitemradio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      data-state={selected ? 'checked' : 'unchecked'}
      tabIndex={-1}
      className={`ui-context-menu__item ui-context-menu__item--indicator${className ? ' ' + className : ''}`}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') activate(e);
      }}
    >
      <span className="ui-context-menu__item-indicator" aria-hidden="true">
        {selected && <span className="ui-context-menu__radio-dot" />}
      </span>
      {children}
    </div>
  );
});

ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

// ═════════════════════════════════════════════════════════════════════════════
// Label, Separator, Group, Shortcut
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-context-menu__label${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ContextMenuLabel.displayName = 'ContextMenuLabel';

const ContextMenuSeparator = forwardRef<
  HTMLDivElement,
  ContextMenuSeparatorProps
>(({ className, ...rest }, ref) => (
  <div
    {...rest}
    ref={ref}
    role="separator"
    className={`ui-context-menu__separator${className ? ' ' + className : ''}`}
  />
));

ContextMenuSeparator.displayName = 'ContextMenuSeparator';

const ContextMenuGroup = forwardRef<HTMLDivElement, ContextMenuGroupProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="group"
      className={`ui-context-menu__group${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ContextMenuGroup.displayName = 'ContextMenuGroup';

const ContextMenuShortcut = forwardRef<
  HTMLSpanElement,
  ContextMenuShortcutProps
>(({ children, className, ...rest }, ref) => (
  <span
    {...rest}
    ref={ref}
    className={`ui-context-menu__shortcut${className ? ' ' + className : ''}`}
  >
    {children}
  </span>
));

ContextMenuShortcut.displayName = 'ContextMenuShortcut';

// ═════════════════════════════════════════════════════════════════════════════
// Sub — nested menu wrapper
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuSub = ({
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  openDelay = 200,
}: ContextMenuSubProps) => {
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

  const openTimer = useRef<number | null>(null);
  const cancelOpen = useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  }, []);
  const openWithDelay = useCallback(() => {
    cancelOpen();
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      openTimer.current = null;
    }, openDelay);
  }, [cancelOpen, openDelay, setOpen]);

  useEffect(() => () => cancelOpen(), [cancelOpen]);

  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openWithDelay,
      cancelOpen,
      triggerNode,
      setTriggerNode,
    }),
    [open, setOpen, openWithDelay, cancelOpen, triggerNode],
  );

  return (
    <ContextMenuSubContext.Provider value={value}>
      {children}
    </ContextMenuSubContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SubTrigger — item that reveals a submenu on hover / ArrowRight
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuSubTrigger = forwardRef<
  HTMLDivElement,
  ContextMenuSubTriggerProps
>(({ disabled = false, className, children, onKeyDown, ...rest }, ref) => {
  const sub = useSub();
  if (!sub)
    throw new Error(
      'ContextMenuSubTrigger must be used inside <ContextMenuSub>.',
    );

  const composedRef = (node: HTMLDivElement | null) => {
    sub.setTriggerNode(node);
    if (typeof ref === 'function') ref(node);
    else if (ref)
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      {...rest}
      ref={composedRef}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={sub.open}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      data-state={sub.open ? 'open' : 'closed'}
      className={`ui-context-menu__item ui-context-menu__sub-trigger${className ? ' ' + className : ''}`}
      onMouseEnter={() => {
        if (!disabled) sub.openWithDelay();
      }}
      onMouseLeave={() => sub.cancelOpen()}
      onClick={() => {
        if (!disabled) sub.setOpen(!sub.open);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (disabled) return;
        if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sub.setOpen(true);
        }
      }}
    >
      <span className="ui-context-menu__sub-trigger-label">{children}</span>
      <span className="ui-context-menu__sub-trigger-chevron" aria-hidden="true">
        <ChevronRight />
      </span>
    </div>
  );
});

ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

// ═════════════════════════════════════════════════════════════════════════════
// SubContent — portalled floating menu anchored to SubTrigger
// ═════════════════════════════════════════════════════════════════════════════

const ContextMenuSubContent = forwardRef<
  HTMLDivElement,
  ContextMenuSubContentProps
>(
  (
    {
      children,
      side = 'right',
      align = 'start',
      sideOffset = 4,
      className,
      ...rest
    },
    ref,
  ) => {
    const sub = useSub();
    if (!sub)
      throw new Error(
        'ContextMenuSubContent must be used inside <ContextMenuSub>.',
      );
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const mounted = useMounted();

    useLayoutEffect(() => {
      if (!sub.open || !sub.triggerNode || !contentRef.current) return;
      const triggerRect = sub.triggerNode.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setPosition(
        computePosition(triggerRect, contentRect, side, align, sideOffset),
      );
    }, [sub.open, sub.triggerNode, side, align, sideOffset, children]);

    useEffect(() => {
      if (!sub.open) return;
      const raf = requestAnimationFrame(() => contentRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }, [sub.open]);

    // ArrowLeft in sub returns focus to parent trigger.
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const items = getItems(contentRef.current);
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const current = active ? items.indexOf(active) : -1;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = current < 0 ? 0 : (current + 1) % items.length;
        items[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = current <= 0 ? items.length - 1 : current - 1;
        items[next]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        sub.setOpen(false);
        sub.triggerNode?.focus();
      }
    };

    if (!sub.open || !mounted) return null;

    return createPortal(
      <div
        {...rest}
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        role="menu"
        tabIndex={-1}
        data-side={side}
        className={`ui-context-menu__content ui-context-menu__sub-content${className ? ' ' + className : ''}`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position ? 'visible' : 'hidden',
        }}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => sub.cancelOpen()}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

ContextMenuSubContent.displayName = 'ContextMenuSubContent';

export default ContextMenu;
export {
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
