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
import { Check } from 'lucide-react';
import { useMounted } from '#/hooks/useMounted';
import { computePosition } from '#/utils/computePosition';
import type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuShortcutProps,
  DropdownMenuTriggerProps,
} from './DropdownMenu.types';
import './DropdownMenu.scss';
import '../../styles/overlay-entrance.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Context
// ═════════════════════════════════════════════════════════════════════════════

type DropdownMenuContextValue = {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerId: string;
  contentId: string;
  triggerNode: HTMLElement | null;
  setTriggerNode: (n: HTMLElement | null) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

const useDropdownMenu = () => {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(
      'DropdownMenu subcomponents must be used inside <DropdownMenu>.',
    );
  }
  return ctx;
};

type RadioGroupContextValue = {
  value: string | undefined;
  setValue: (v: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// ═════════════════════════════════════════════════════════════════════════════
// Positioning
// ═════════════════════════════════════════════════════════════════════════════

const ITEM_SELECTOR =
  '[role="menuitem"]:not([data-disabled]), [role="menuitemcheckbox"]:not([data-disabled]), [role="menuitemradio"]:not([data-disabled])';

const getItems = (root: HTMLElement | null): HTMLElement[] =>
  root ? Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)) : [];

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenu = ({
  id,
  children,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
}: DropdownMenuProps) => {
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

  const value = useMemo<DropdownMenuContextValue>(
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
    <DropdownMenuContext.Provider value={value}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuTrigger = ({ children }: DropdownMenuTriggerProps) => {
  const ctx = useDropdownMenu();
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
    onKeyDown: (e: React.KeyboardEvent) => {
      childProps.onKeyDown?.(e);
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!ctx.open) ctx.toggle();
      }
    },
    'aria-expanded': ctx.open,
    'aria-haspopup': 'menu',
    'aria-controls': ctx.contentId,
  } as Partial<typeof childProps> & { ref: typeof composedRef });
};

// ═════════════════════════════════════════════════════════════════════════════
// Content
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  (
    {
      children,
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useDropdownMenu();
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

    // On open, focus the menu container itself (not the first item) so
    // nothing looks "selected" until the user navigates with the keyboard.
    // Arrow-down/up from here still lands on first/last item via handleKeyDown.
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
            (
              ref as unknown as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
        }}
        id={ctx.contentId}
        role="menu"
        tabIndex={-1}
        aria-labelledby={ctx.triggerId}
        data-side={side}
        className={`ui-dropdown-menu__content ui-overlay-enter${className ? ' ' + className : ''}`}
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

DropdownMenuContent.displayName = 'DropdownMenuContent';

// ═════════════════════════════════════════════════════════════════════════════
// Item
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, onClick, disabled, className, ...rest }, ref) => {
    const ctx = useDropdownMenu();
    return (
      <div
        {...rest}
        ref={ref}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        className={`ui-dropdown-menu__item${className ? ' ' + className : ''}`}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(e);
          ctx.close();
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
            ctx.close();
          }
        }}
      >
        {children}
      </div>
    );
  },
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

// ═════════════════════════════════════════════════════════════════════════════
// Label
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ui-dropdown-menu__label${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// ═════════════════════════════════════════════════════════════════════════════
// Separator
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...rest }, ref) => {
  return (
    <div
      {...rest}
      ref={ref}
      role="separator"
      className={`ui-dropdown-menu__separator${className ? ' ' + className : ''}`}
    />
  );
});

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// ═════════════════════════════════════════════════════════════════════════════
// Group
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuGroup = forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  ({ children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        role="group"
        className={`ui-dropdown-menu__group${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

DropdownMenuGroup.displayName = 'DropdownMenuGroup';

// ═════════════════════════════════════════════════════════════════════════════
// CheckboxItem
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuCheckboxItem = forwardRef<
  HTMLDivElement,
  DropdownMenuCheckboxItemProps
>(
  (
    { children, checked = false, onCheckedChange, disabled, className, ...rest },
    ref,
  ) => {
    const ctx = useDropdownMenu();
    const activate = (e: React.SyntheticEvent) => {
      if (disabled) return;
      onCheckedChange?.(!checked);
      // Note: don't close on checkbox toggle — consumers may want the menu to
      // stay open for multi-select. Close by clicking outside or pressing Escape.
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
        className={`ui-dropdown-menu__item ui-dropdown-menu__item--indicator${className ? ' ' + className : ''}`}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') activate(e);
        }}
      >
        <span
          className="ui-dropdown-menu__item-indicator"
          aria-hidden="true"
        >
          {checked && <Check />}
        </span>
        {children}
      </div>
    );
    void ctx;
  },
);

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// ═════════════════════════════════════════════════════════════════════════════
// RadioGroup + RadioItem
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuRadioGroup = forwardRef<
  HTMLDivElement,
  DropdownMenuRadioGroupProps
>(({ children, value, onValueChange, className, ...rest }, ref) => {
  const ctxValue = useMemo<RadioGroupContextValue>(
    () => ({
      value,
      setValue: (v: string) => onValueChange?.(v),
    }),
    [value, onValueChange],
  );
  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <div
        {...rest}
        ref={ref}
        role="group"
        className={`ui-dropdown-menu__group${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';

const DropdownMenuRadioItem = forwardRef<
  HTMLDivElement,
  DropdownMenuRadioItemProps
>(({ children, value, disabled, className, ...rest }, ref) => {
  const radioCtx = useContext(RadioGroupContext);
  const menuCtx = useDropdownMenu();
  const selected = radioCtx?.value === value;

  const activate = (e: React.SyntheticEvent) => {
    if (disabled) return;
    radioCtx?.setValue(value);
    e.preventDefault();
    menuCtx.close();
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
      className={`ui-dropdown-menu__item ui-dropdown-menu__item--indicator${className ? ' ' + className : ''}`}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') activate(e);
      }}
    >
      <span className="ui-dropdown-menu__item-indicator" aria-hidden="true">
        {selected && <span className="ui-dropdown-menu__radio-dot" />}
      </span>
      {children}
    </div>
  );
});

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// ═════════════════════════════════════════════════════════════════════════════
// Shortcut
// ═════════════════════════════════════════════════════════════════════════════

const DropdownMenuShortcut = forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(({ children, className, ...rest }, ref) => {
  return (
    <span
      {...rest}
      ref={ref}
      className={`ui-dropdown-menu__shortcut${className ? ' ' + className : ''}`}
    >
      {children}
    </span>
  );
});

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export default DropdownMenu;
export {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
};
