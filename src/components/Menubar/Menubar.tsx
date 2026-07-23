import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import DropdownMenu, {
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import {
  MenubarContext,
  MenubarMenuContext,
  useMenubar,
  useMenubarMenu,
} from './Menubar.context';
import type {
  MenubarMenuProps,
  MenubarProps,
  MenubarTriggerProps,
} from './Menubar.types';
import './Menubar.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Root — the horizontal bar. Coordinates which menu is open, roving tabindex,
// and hover-to-switch across menus. Each menu is a controlled DropdownMenu, so
// all the menu-surface machinery (positioning, item nav, escape, outside-click)
// comes from DropdownMenu unchanged.
// ═════════════════════════════════════════════════════════════════════════════

const Menubar = forwardRef<HTMLDivElement, MenubarProps>(
  ({ id, className, children, ...rest }, ref) => {
    const [values, setValues] = useState<string[]>([]);
    const [openValue, setOpenValue] = useState<string | null>(null);
    const [focusedValue, setFocusedValue] = useState<string | null>(null);
    const nodesRef = useRef<Record<string, HTMLElement | null>>({});
    // Mirror the live state so keyboard handlers read fresh values.
    const stateRef = useRef({ values, openValue, focusedValue });
    stateRef.current = { values, openValue, focusedValue };

    const register = useCallback((value: string) => {
      setValues((v) => (v.includes(value) ? v : [...v, value]));
      return () => setValues((v) => v.filter((x) => x !== value));
    }, []);

    const setNode = useCallback((value: string, node: HTMLElement | null) => {
      nodesRef.current[value] = node;
    }, []);

    const moveFocus = useCallback((delta: number) => {
      const { values: vs, openValue: open, focusedValue: focused } =
        stateRef.current;
      if (!vs.length) return;
      const cur = Math.max(0, vs.indexOf(focused ?? vs[0]));
      const nextValue = vs[(cur + delta + vs.length) % vs.length];
      setFocusedValue(nextValue);
      nodesRef.current[nextValue]?.focus();
      if (open != null) setOpenValue(nextValue);
    }, []);

    const ctx = useMemo(
      () => ({
        id,
        values,
        openValue,
        setOpenValue,
        focusedValue,
        setFocusedValue,
        register,
        setNode,
        moveFocus,
      }),
      [id, values, openValue, focusedValue, register, setNode, moveFocus],
    );

    return (
      <MenubarContext.Provider value={ctx}>
        <div
          {...rest}
          ref={ref}
          id={id}
          role="menubar"
          className={`ui-menubar${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </MenubarContext.Provider>
    );
  },
);

Menubar.displayName = 'Menubar';

// ═════════════════════════════════════════════════════════════════════════════
// Menu — a controlled DropdownMenu keyed by `value`; provides that value to its
// trigger + content.
// ═════════════════════════════════════════════════════════════════════════════

const MenubarMenu = ({ value, children }: MenubarMenuProps) => {
  const bar = useMenubar();
  const { register, setOpenValue } = bar;

  useEffect(() => register(value), [register, value]);

  const menuCtx = useMemo(() => ({ value }), [value]);

  return (
    <MenubarMenuContext.Provider value={menuCtx}>
      <DropdownMenu
        id={`${bar.id}-${value}`}
        open={bar.openValue === value}
        onOpenChange={(open) => setOpenValue(open ? value : null)}
      >
        {children}
      </DropdownMenu>
    </MenubarMenuContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — a top-level bar button. DropdownMenuTrigger supplies open/aria/click
// and composes our key handler; we add hover-to-switch, roving-tabindex focus,
// and ArrowLeft/Right navigation between menus.
// ═════════════════════════════════════════════════════════════════════════════

const MenubarTrigger = forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  ({ className, children, ...rest }, ref) => {
    const bar = useMenubar();
    const { value } = useMenubarMenu();
    const isOpen = bar.openValue === value;
    const tabStop = (bar.focusedValue ?? bar.values[0]) === value;

    const composedRef = (node: HTMLButtonElement | null) => {
      bar.setNode(value, node);
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    return (
      <DropdownMenuTrigger>
        <button
          {...rest}
          ref={composedRef}
          type="button"
          role="menuitem"
          data-value={value}
          data-state={isOpen ? 'open' : 'closed'}
          tabIndex={tabStop ? 0 : -1}
          className={`ui-menubar__trigger${isOpen ? ' ui-menubar__trigger--open' : ''}${className ? ' ' + className : ''}`}
          onMouseEnter={() => {
            if (bar.openValue != null && bar.openValue !== value) {
              bar.setOpenValue(value);
            }
          }}
          onFocus={() => bar.setFocusedValue(value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              bar.moveFocus(1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              bar.moveFocus(-1);
            }
          }}
        >
          {children}
        </button>
      </DropdownMenuTrigger>
    );
  },
);

MenubarTrigger.displayName = 'MenubarTrigger';

export default Menubar;
export { MenubarMenu, MenubarTrigger };
// The menu surface is DropdownMenu's, re-exported under Menubar names — they
// read DropdownMenuContext, which each MenubarMenu's <DropdownMenu> provides.
export {
  DropdownMenuContent as MenubarContent,
  DropdownMenuItem as MenubarItem,
  DropdownMenuLabel as MenubarLabel,
  DropdownMenuSeparator as MenubarSeparator,
  DropdownMenuGroup as MenubarGroup,
  DropdownMenuCheckboxItem as MenubarCheckboxItem,
  DropdownMenuRadioGroup as MenubarRadioGroup,
  DropdownMenuRadioItem as MenubarRadioItem,
  DropdownMenuShortcut as MenubarShortcut,
} from '../DropdownMenu/DropdownMenu';
