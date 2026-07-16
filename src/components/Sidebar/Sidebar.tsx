import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { PanelLeft } from 'lucide-react';
import Drawer from '#components/Drawer/Drawer';
import Skeleton from '#components/Skeleton/Skeleton';
import Tooltip, {
  TooltipContent,
  TooltipTrigger,
} from '#components/Tooltip/Tooltip';
import { useIsMobile } from '#/hooks/useIsMobile';
import {
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_MOBILE_BREAKPOINT,
  SIDEBAR_STORAGE_KEY,
} from './Sidebar.constants';
import type {
  SidebarContextValue,
  SidebarGroupActionProps,
  SidebarGroupLabelProps,
  SidebarInputProps,
  SidebarInsetProps,
  SidebarMenuActionProps,
  SidebarMenuBadgeProps,
  SidebarMenuButtonProps,
  SidebarMenuSkeletonProps,
  SidebarMenuSubButtonProps,
  SidebarProps,
  SidebarProviderProps,
  SidebarRailProps,
  SidebarSectionProps,
  SidebarTriggerProps,
} from './Sidebar.types';
import './Sidebar.scss';

// ═══════════════════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════════════════

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a <SidebarProvider>.');
  }
  return ctx;
};

// Merge our className / data-attrs / ref onto a single child element (the
// `asChild` escape hatch — e.g. render a nav <a> as a menu button).
const asSlot = (
  child: React.ReactNode,
  className: string,
  props: Record<string, unknown>,
  ref: React.Ref<unknown>,
): React.ReactElement | null => {
  if (!isValidElement(child)) return null;
  const el = child as React.ReactElement<Record<string, unknown>>;
  const childClass = el.props.className as string | undefined;
  return cloneElement(el, {
    ...props,
    ...el.props,
    className: `${className}${childClass ? ' ' + childClass : ''}`,
    ref,
  } as Record<string, unknown>);
};

// ═══════════════════════════════════════════════════════════════════════════
// Provider
// ═══════════════════════════════════════════════════════════════════════════

const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    { defaultOpen = true, open: openProp, onOpenChange, className, children, ...rest },
    ref,
  ) => {
    const isMobile = useIsMobile(SIDEBAR_MOBILE_BREAKPOINT);
    const [openMobile, setOpenMobile] = useState(false);

    const [internalOpen, setInternalOpen] = useState<boolean>(() => {
      if (typeof window === 'undefined') return defaultOpen;
      try {
        const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
        return stored !== null ? stored === 'true' : defaultOpen;
      } catch {
        return defaultOpen;
      }
    });

    const open = openProp ?? internalOpen;

    const setOpen = useCallback(
      (value: boolean) => {
        if (onOpenChange) onOpenChange(value);
        else setInternalOpen(value);
        try {
          window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
        } catch {
          /* storage unavailable — non-fatal */
        }
      },
      [onOpenChange],
    );

    const toggleSidebar = useCallback(() => {
      if (isMobile) setOpenMobile((v) => !v);
      else setOpen(!open);
    }, [isMobile, open, setOpen]);

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (
          e.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (e.metaKey || e.ctrlKey)
        ) {
          e.preventDefault();
          toggleSidebar();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [toggleSidebar]);

    const state = open ? 'expanded' : 'collapsed';

    const value = useMemo<SidebarContextValue>(
      () => ({
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, openMobile, isMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={value}>
        <div
          {...rest}
          ref={ref}
          className={`ui-sidebar-provider${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  },
);

SidebarProvider.displayName = 'SidebarProvider';

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar — static (collapsible=none) | mobile Drawer | collapsible desktop
// ═══════════════════════════════════════════════════════════════════════════

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    const drawerId = useId();

    if (collapsible === 'none') {
      return (
        <div
          {...rest}
          ref={ref}
          data-sidebar="sidebar"
          className={`ui-sidebar__inner ui-sidebar__inner--static${className ? ' ' + className : ''}`}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Drawer
          id={drawerId}
          open={openMobile}
          onClose={() => setOpenMobile(false)}
          side={side}
          className="ui-sidebar__drawer"
          style={{
            width: 'var(--sidebar-width-mobile)',
            maxWidth: 'var(--sidebar-width-mobile)',
          }}
        >
          <div
            ref={ref}
            data-sidebar="sidebar"
            data-mobile="true"
            className={`ui-sidebar__inner ui-sidebar__inner--mobile${className ? ' ' + className : ''}`}
          >
            {children}
          </div>
        </Drawer>
      );
    }

    return (
      <div
        {...rest}
        ref={ref}
        className="ui-sidebar-wrap"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
      >
        <div className="ui-sidebar__gap" aria-hidden="true" />
        <div className="ui-sidebar__container">
          <div
            data-sidebar="sidebar"
            className={`ui-sidebar__inner${className ? ' ' + className : ''}`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

Sidebar.displayName = 'Sidebar';

// ═══════════════════════════════════════════════════════════════════════════
// Trigger + Rail + Inset + Input
// ═══════════════════════════════════════════════════════════════════════════

const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, onClick, ...rest }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        aria-label="Toggle sidebar"
        className={`ui-sidebar__trigger${className ? ' ' + className : ''}`}
        onClick={(e) => {
          onClick?.(e);
          toggleSidebar();
        }}
      >
        <PanelLeft />
      </button>
    );
  },
);

SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarRail = forwardRef<HTMLButtonElement, SidebarRailProps>(
  ({ className, ...rest }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        aria-label="Toggle sidebar"
        tabIndex={-1}
        title="Toggle sidebar"
        className={`ui-sidebar__rail${className ? ' ' + className : ''}`}
        onClick={toggleSidebar}
      />
    );
  },
);

SidebarRail.displayName = 'SidebarRail';

const SidebarInset = forwardRef<HTMLElement, SidebarInsetProps>(
  ({ className, children, ...rest }, ref) => (
    <main
      {...rest}
      ref={ref}
      className={`ui-sidebar__inset${className ? ' ' + className : ''}`}
    >
      {children}
    </main>
  ),
);

SidebarInset.displayName = 'SidebarInset';

const SidebarInput = forwardRef<HTMLInputElement, SidebarInputProps>(
  ({ className, ...rest }, ref) => (
    <input
      {...rest}
      ref={ref}
      data-sidebar="input"
      className={`ui-sidebar__input${className ? ' ' + className : ''}`}
    />
  ),
);

SidebarInput.displayName = 'SidebarInput';

// ═══════════════════════════════════════════════════════════════════════════
// Structural sections
// ═══════════════════════════════════════════════════════════════════════════

const makeSection = (
  displayName: string,
  base: string,
  dataSidebar?: string,
) => {
  const Comp = forwardRef<HTMLDivElement, SidebarSectionProps>(
    ({ className, children, ...rest }, ref) => (
      <div
        {...rest}
        ref={ref}
        data-sidebar={dataSidebar}
        className={`${base}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    ),
  );
  Comp.displayName = displayName;
  return Comp;
};

const SidebarHeader = makeSection('SidebarHeader', 'ui-sidebar__header', 'header');
const SidebarFooter = makeSection('SidebarFooter', 'ui-sidebar__footer', 'footer');
const SidebarContent = makeSection('SidebarContent', 'ui-sidebar__content', 'content');
const SidebarGroup = makeSection('SidebarGroup', 'ui-sidebar__group', 'group');
const SidebarGroupContent = makeSection(
  'SidebarGroupContent',
  'ui-sidebar__group-content',
  'group-content',
);

const SidebarSeparator = forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      data-sidebar="separator"
      className={`ui-sidebar__separator${className ? ' ' + className : ''}`}
    />
  ),
);

SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarGroupLabel = forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, asChild, children, ...rest }, ref) => {
    const cls = `ui-sidebar__group-label${className ? ' ' + className : ''}`;
    if (asChild) {
      return asSlot(children, cls, { 'data-sidebar': 'group-label', ...rest }, ref);
    }
    return (
      <div {...rest} ref={ref} data-sidebar="group-label" className={cls}>
        {children}
      </div>
    );
  },
);

SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupAction = forwardRef<HTMLButtonElement, SidebarGroupActionProps>(
  ({ className, asChild, children, ...rest }, ref) => {
    const cls = `ui-sidebar__group-action${className ? ' ' + className : ''}`;
    if (asChild) {
      return asSlot(children, cls, { 'data-sidebar': 'group-action', ...rest }, ref);
    }
    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        data-sidebar="group-action"
        className={cls}
      >
        {children}
      </button>
    );
  },
);

SidebarGroupAction.displayName = 'SidebarGroupAction';

// ═══════════════════════════════════════════════════════════════════════════
// Menu
// ═══════════════════════════════════════════════════════════════════════════

const SidebarMenu = forwardRef<HTMLUListElement, SidebarSectionProps>(
  ({ className, children, ...rest }, ref) => (
    <ul
      {...(rest as React.HTMLAttributes<HTMLUListElement>)}
      ref={ref}
      data-sidebar="menu"
      className={`ui-sidebar__menu${className ? ' ' + className : ''}`}
    >
      {children}
    </ul>
  ),
);

SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarSectionProps>(
  ({ className, children, ...rest }, ref) => (
    <li
      {...(rest as React.LiHTMLAttributes<HTMLLIElement>)}
      ref={ref}
      data-sidebar="menu-item"
      className={`ui-sidebar__menu-item${className ? ' ' + className : ''}`}
    >
      {children}
    </li>
  ),
);

SidebarMenuItem.displayName = 'SidebarMenuItem';

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    {
      isActive = false,
      size = 'default',
      variant = 'default',
      tooltip,
      asChild,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const { state, isMobile } = useSidebar();
    const tooltipId = useId();

    const cls = `ui-sidebar__menu-button ui-sidebar__menu-button--sz-${size} ui-sidebar__menu-button--${variant}${isActive ? ' ui-sidebar__menu-button--active' : ''}${className ? ' ' + className : ''}`;
    const dataAttrs = {
      'data-sidebar': 'menu-button',
      'data-size': size,
      'data-active': isActive || undefined,
    };

    const button = asChild ? (
      asSlot(children, cls, { ...dataAttrs, ...rest }, ref)
    ) : (
      <button
        {...rest}
        {...dataAttrs}
        ref={ref}
        type="button"
        className={cls}
        onClick={onClick}
      >
        {children}
      </button>
    );

    if (!tooltip) return button;

    return (
      <Tooltip
        id={tooltipId}
        side="right"
        align="center"
        disabled={state !== 'collapsed' || isMobile}
      >
        <TooltipTrigger>{button as React.ReactElement}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  },
);

SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuAction = forwardRef<HTMLButtonElement, SidebarMenuActionProps>(
  ({ className, asChild, showOnHover, children, ...rest }, ref) => {
    const cls = `ui-sidebar__menu-action${showOnHover ? ' ui-sidebar__menu-action--hover' : ''}${className ? ' ' + className : ''}`;
    if (asChild) {
      return asSlot(children, cls, { 'data-sidebar': 'menu-action', ...rest }, ref);
    }
    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        data-sidebar="menu-action"
        className={cls}
      >
        {children}
      </button>
    );
  },
);

SidebarMenuAction.displayName = 'SidebarMenuAction';

const SidebarMenuBadge = forwardRef<HTMLDivElement, SidebarMenuBadgeProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      data-sidebar="menu-badge"
      className={`ui-sidebar__menu-badge${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

SidebarMenuBadge.displayName = 'SidebarMenuBadge';

const SidebarMenuSkeleton = forwardRef<HTMLDivElement, SidebarMenuSkeletonProps>(
  ({ className, showIcon = false, ...rest }, ref) => {
    const width = useMemo(
      () => `${Math.floor(Math.random() * 40) + 50}%`,
      [],
    );
    return (
      <div
        {...rest}
        ref={ref}
        data-sidebar="menu-skeleton"
        className={`ui-sidebar__menu-skeleton${className ? ' ' + className : ''}`}
      >
        {showIcon && (
          <Skeleton className="ui-sidebar__menu-skeleton-icon" />
        )}
        <Skeleton
          className="ui-sidebar__menu-skeleton-text"
          style={{ maxWidth: width }}
        />
      </div>
    );
  },
);

SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

const SidebarMenuSub = forwardRef<HTMLUListElement, SidebarSectionProps>(
  ({ className, children, ...rest }, ref) => (
    <ul
      {...(rest as React.HTMLAttributes<HTMLUListElement>)}
      ref={ref}
      data-sidebar="menu-sub"
      className={`ui-sidebar__menu-sub${className ? ' ' + className : ''}`}
    >
      {children}
    </ul>
  ),
);

SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = forwardRef<HTMLLIElement, SidebarSectionProps>(
  ({ className, children, ...rest }, ref) => (
    <li
      {...(rest as React.LiHTMLAttributes<HTMLLIElement>)}
      ref={ref}
      data-sidebar="menu-sub-item"
      className={`ui-sidebar__menu-sub-item${className ? ' ' + className : ''}`}
    >
      {children}
    </li>
  ),
);

SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = forwardRef<
  HTMLAnchorElement,
  SidebarMenuSubButtonProps
>(
  (
    { className, size = 'default', isActive = false, asChild, children, ...rest },
    ref,
  ) => {
    const cls = `ui-sidebar__menu-sub-button ui-sidebar__menu-sub-button--sz-${size}${isActive ? ' ui-sidebar__menu-sub-button--active' : ''}${className ? ' ' + className : ''}`;
    const dataAttrs = {
      'data-sidebar': 'menu-sub-button',
      'data-size': size,
      'data-active': isActive || undefined,
    };
    if (asChild) {
      return asSlot(children, cls, { ...dataAttrs, ...rest }, ref);
    }
    return (
      <a {...rest} {...dataAttrs} ref={ref} className={cls}>
        {children}
      </a>
    );
  },
);

SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export default Sidebar;
export {
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
};
